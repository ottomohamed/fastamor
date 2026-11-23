// api/render.js — server-side HTML for crawlers and first paint.
// Serves the SPA shell with real content, meta tags and JSON-LD injected for
// /article/:slug, /destination/:slug and /blog. Unknown slugs return HTTP 404
// (fixes "Soft 404" in Search Console). React then boots and takes over.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://www.fastamor.com';
const DEFAULT_IMAGE = 'https://i.ibb.co/x8sSqTDj/1978.png';

let templateCache = null;
async function getTemplate(req) {
  if (templateCache) return templateCache;
  // 1) generated at build time by scripts/write-template.mjs
  try {
    const mod = await import('./_lib/template.generated.js');
    if (mod.default) return (templateCache = mod.default);
  } catch {}
  // 2) bundled dist file
  for (const p of [path.join(process.cwd(), 'dist/app.html'), path.join(process.cwd(), 'dist/index.html')]) {
    try {
      const html = await readFile(p, 'utf8');
      if (html.includes('/assets/')) return (templateCache = html);
    } catch {}
  }
  // 3) the static shell from our own deployment
  const r = await fetch(`https://${req.headers.host}/app.html`);
  return (templateCache = await r.text());
}

async function rest(table, query) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = s => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Allow-list HTML sanitizer: rebuilds tags without attributes (except safe links/images).
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td']);
function sanitize(html) {
  return String(html ?? '')
    .replace(/<(script|style|iframe|object|embed|noscript|svg|math|template)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (m, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return '';
      if (m.startsWith('</')) return t === 'br' || t === 'img' ? '' : `</${t}>`;
      if (t === 'a') {
        const href = /href\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] || '';
        return /^https?:\/\//i.test(href) || href.startsWith('/')
          ? `<a href="${esc(href)}" rel="nofollow noopener">`
          : '<a>';
      }
      if (t === 'img') {
        const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] || '';
        const alt = /alt\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] || '';
        return /^https:\/\//i.test(src) ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : '';
      }
      return `<${t}>`;
    });
}

function pick(row, field, lang) {
  return row[`${field}_${lang}`] || row[`${field}_en`] || row[`${field}_ar`] || '';
}

function render(template, { title, description, url, image, lang = 'en', type = 'website', jsonLd, body, status }) {
  const fullTitle = title.length <= 50 ? `${title} | Fastamor` : title;
  const desc = text(description).slice(0, 160);
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:image" content="${esc(image || DEFAULT_IMAGE)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    status === 404 ? `<meta name="robots" content="noindex" />` : '',
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n    ');

  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:(title|description|type|image)"[^>]*>/g, '')
    .replace(/<meta name="twitter:card"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const shellNav = `<nav><a href="/">Fastamor</a> · <a href="/blog">Blog</a></nav>`;

async function articlePage(slug) {
  const rows = await rest('articles', `select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
  const a = rows?.[0];
  if (!a) return null;
  const lang = a.body_en ? 'en' : 'ar';
  const title = pick(a, 'title', lang);
  const excerpt = pick(a, 'excerpt', lang);
  const url = `${SITE}/article/${encodeURIComponent(a.slug)}`;
  return {
    title, description: excerpt || text(pick(a, 'body', lang)), url, image: a.featured_image, lang, type: 'article',
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Article', headline: title, description: text(excerpt).slice(0, 300),
      image: a.featured_image || DEFAULT_IMAGE, datePublished: a.published_at, dateModified: a.updated_at || a.published_at,
      mainEntityOfPage: url, author: { '@type': 'Organization', name: 'Fastamor' },
      publisher: { '@type': 'Organization', name: 'Fastamor', logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE } },
    },
    body: `${shellNav}<article><h1>${esc(title)}</h1>${excerpt ? `<p>${esc(text(excerpt))}</p>` : ''}${sanitize(pick(a, 'body', lang))}</article>`,
  };
}

async function destinationPage(slug) {
  const rows = await rest('destinations', `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const d = rows?.[0];
  if (!d) return null;
  const lang = d.description_en ? 'en' : 'ar';
  const name = pick(d, 'name', lang);
  const country = pick(d, 'country', lang);
  const desc = pick(d, 'description', lang);
  const attractions = d[`popular_attractions_${lang}`] || [];
  const arts = (await rest('articles', `select=slug,title_en,title_ar&destination_id=eq.${encodeURIComponent(d.id)}&status=eq.published&limit=12`)) || [];
  const url = `${SITE}/destination/${encodeURIComponent(d.slug)}`;
  const title = lang === 'ar' ? `${name}، ${country} — دليل السفر` : `${name}, ${country} — Travel Guide`;
  return {
    title, description: desc, url, image: d.image_url, lang,
    jsonLd: { '@context': 'https://schema.org', '@type': 'TouristDestination', name, description: text(desc).slice(0, 300), image: d.image_url || DEFAULT_IMAGE, url },
    body:
      `${shellNav}<main><h1>${esc(title)}</h1>${sanitize(desc)}` +
      (Array.isArray(attractions) && attractions.length ? `<h2>${lang === 'ar' ? 'أبرز المعالم' : 'Top attractions'}</h2><ul>${attractions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '') +
      (arts.length ? `<h2>${lang === 'ar' ? 'مقالات' : 'Guides'}</h2><ul>${arts.map(x => `<li><a href="/article/${esc(x.slug)}">${esc(x.title_en || x.title_ar)}</a></li>`).join('')}</ul>` : '') +
      `</main>`,
  };
}

async function homePage() {
  const arts = (await rest('articles', 'select=slug,title_en,title_ar&status=eq.published&order=published_at.desc&limit=12')) || [];
  const dests = (await rest('destinations', 'select=slug,name_en,name_ar&limit=100')) || [];
  return {
    title: 'AI Travel Concierge — Cheap Flights, Hotels & Travel Guides',
    description: 'Fastamor is your personal AI travel assistant: compare cheap flights, hotels, tours and transfers, and read practical travel guides.',
    url: `${SITE}/`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Fastamor', url: `${SITE}/` },
    body:
      `${shellNav}<main><h1>Fastamor — your AI travel concierge</h1>` +
      `<p>Plan your trip in a conversation: Fastamor finds flights, hotels, tours and airport transfers and links you to the best offers.</p>` +
      `<h2>Popular destinations</h2><ul>` +
      dests.filter(d => !['dubai-uae', 'france-paris'].includes(d.slug)).map(d => `<li><a href="/destination/${esc(d.slug)}">${esc(d.name_en || d.name_ar)}</a></li>`).join('') +
      `</ul><h2>Latest travel guides</h2><ul>` +
      arts.map(a => `<li><a href="/article/${esc(a.slug)}">${esc(a.title_en || a.title_ar)}</a></li>`).join('') +
      `</ul></main>`,
  };
}

async function blogPage() {
  const arts = (await rest('articles', 'select=slug,title_en,title_ar,excerpt_en,excerpt_ar&status=eq.published&order=published_at.desc&limit=100')) || [];
  const dests = (await rest('destinations', 'select=slug,name_en,name_ar&limit=100')) || [];
  return {
    title: 'Travel Blog — Guides, Tips & Itineraries',
    description: 'Travel guides, destination tips and itineraries from Fastamor, your AI travel concierge.',
    url: `${SITE}/blog`,
    body:
      `${shellNav}<main><h1>Fastamor Travel Blog</h1><ul>` +
      arts.map(a => `<li><a href="/article/${esc(a.slug)}">${esc(a.title_en || a.title_ar)}</a> — ${esc(text(a.excerpt_en || a.excerpt_ar).slice(0, 140))}</li>`).join('') +
      `</ul><h2>Destinations</h2><ul>` +
      dests.filter(d => !['dubai-uae', 'france-paris'].includes(d.slug)).map(d => `<li><a href="/destination/${esc(d.slug)}">${esc(d.name_en || d.name_ar)}</a></li>`).join('') +
      `</ul></main>`,
  };
}

export default async function handler(req, res) {
  const type = String(req.query.type || '');
  const slug = String(req.query.slug || '').slice(0, 200);
  let template;
  try {
    template = await getTemplate(req);
  } catch {
    return res.status(500).send('Template unavailable');
  }

  let page = null;
  if (type === 'article' && slug) page = await articlePage(slug);
  else if (type === 'destination' && slug) page = await destinationPage(slug);
  else if (type === 'blog') page = await blogPage();
  else if (type === 'home') page = await homePage();

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!page) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(404).send(
      render(template, {
        title: 'Page not found', description: 'This page does not exist.', url: `${SITE}/`, status: 404,
        body: `${shellNav}<main><h1>404 — Page not found</h1><p><a href="/blog">Browse our travel guides</a></p></main>`,
      })
    );
  }
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
  return res.status(200).send(render(template, page));
}
