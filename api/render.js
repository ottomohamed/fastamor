// api/render.js — server-side HTML for crawlers and first paint.
// Serves the SPA shell with real content, meta tags and JSON-LD injected for
// /article/:slug, /destination/:slug and /blog. Unknown slugs return HTTP 404
// (fixes "Soft 404" in Search Console). React then boots and takes over.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://www.fastamor.com';
const DEFAULT_IMAGE = 'https://www.fastamor.com/media/6172d55e66bb86428408.png';

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

import { LANGS, MIN_BODY, isLang, urlFor, articleLangs, destinationLangs } from './_lib/i18n.js';
// ---------- trip kit for articles (same links as the SPA's TripKit) ----------
let destMap = null;
async function articleDest(slug) {
  if (!destMap) {
    try { destMap = JSON.parse(await readFile(path.join(process.cwd(), 'api/_data/article-dest.json'), 'utf8')); }
    catch { destMap = {}; }
  }
  return destMap[slug] || null;
}
const KIT = {
  en: { t: d => d ? `Plan your trip to ${d}` : 'Before you travel', hotel: 'Hotels', esim: 'Mobile data (eSIM)', transfer: 'Airport transfer', tours: 'Tours & tickets', car: 'Car hire', note: 'Partner links: Fastamor may earn a commission, at no extra cost to you.' },
  ar: { t: d => d ? `خطط لرحلتك إلى ${d}` : 'قبل أن تسافر', hotel: 'فنادق', esim: 'إنترنت الهاتف (eSIM)', transfer: 'النقل من المطار', tours: 'جولات وتذاكر', car: 'كراء سيارة', note: 'روابط شركاء: قد يحصل فاستامور على عمولة دون أي تكلفة إضافية عليك.' },
  fr: { t: d => d ? `Préparez votre voyage : ${d}` : 'Avant de partir', hotel: 'Hôtels', esim: 'Données mobiles (eSIM)', transfer: 'Transfert aéroport', tours: 'Visites & billets', car: 'Location de voiture', note: 'Liens partenaires : Fastamor peut percevoir une commission, sans surcoût pour vous.' },
  es: { t: d => d ? `Planifica tu viaje: ${d}` : 'Antes de viajar', hotel: 'Hoteles', esim: 'Datos móviles (eSIM)', transfer: 'Traslado aeropuerto', tours: 'Tours y entradas', car: 'Alquiler de coche', note: 'Enlaces de socios: Fastamor puede recibir una comisión, sin coste adicional para ti.' },
};
async function tripKitHtml(slug, lang) {
  const d = await articleDest(slug);
  const k = KIT[lang] || KIT.en;
  const sub = item => `art-${slug}_tripkit-${item}_${lang}`.slice(0, 60);
  const go = (partner, item) => `/go/${partner}?s=${encodeURIComponent(sub(item))}`;
  const a = (href, label) => `<li><a href="${esc(href)}" rel="sponsored nofollow noopener" target="_blank">${esc(label)}</a></li>`;
  const links = d
    ? a(`https://www.stay22.com/allez/roam?aid=fastamor&campaign=${encodeURIComponent(sub('hotel'))}&address=${encodeURIComponent(d.city)}`, k.hotel) +
      a(go('yesim', 'esim'), k.esim) + a(go('kiwitaxi', 'transfer'), k.transfer) + a(go('klook', 'tours'), k.tours)
    : a(go('yesim', 'esim'), k.esim) + a(go('kiwitaxi', 'transfer'), k.transfer) + `<li><a href="${urlFor('/car', lang)}">${esc(k.car)}</a></li>`;
  const name = d ? (d.name[lang] || d.name.en) : '';
  return `<aside><h2>${esc(k.t(name))}</h2><ul>${links}</ul><p>${esc(k.note)}</p></aside>`;
}


const UI = {
  en: { flights: 'Flights to Morocco', blog: 'Blog', home: 'Home', guides: 'Travel guides', dests: 'Popular destinations', latest: 'Latest travel guides', attractions: 'Top attractions',
        homeTitle: 'Fastamor: AI travel assistant for flights, hotels & car hire',
        homeDesc: 'Fastamor is your personal AI travel assistant: compare cheap flights, hotels, tours and transfers, and read practical travel guides.',
        homeH1: 'Fastamor — your AI travel concierge',
        homeP: 'Plan your trip in a conversation: Fastamor finds flights, hotels, tours and airport transfers and links you to the best offers.',
        blogTitle: 'Travel Blog — Guides, Tips & Itineraries', blogDesc: 'Travel guides, destination tips and itineraries from Fastamor, your AI travel concierge.', blogH1: 'Fastamor Travel Blog',
        guide: 'Travel Guide', nf: 'Page not found', nfP: 'Browse our travel guides' },
  ar: { flights: 'رحلات إلى المغرب', blog: 'المدونة', home: 'الرئيسية', guides: 'أدلة السفر', dests: 'وجهات مميزة', latest: 'أحدث أدلة السفر', attractions: 'أبرز المعالم',
        homeTitle: 'فاستامور: مساعد السفر الذكي للطيران والفنادق وكراء السيارات',
        homeDesc: 'فاستامور مساعدك الشخصي للسفر بالذكاء الاصطناعي: قارن أسعار الطيران والفنادق والجولات والنقل من المطار، واقرأ أدلة سفر عملية.',
        homeH1: 'فاستامور — مساعد السفر الذكي',
        homeP: 'خطط لرحلتك بمحادثة بسيطة: يبحث فاستامور عن الرحلات والفنادق والجولات والنقل من المطار ويوجهك إلى أفضل العروض.',
        blogTitle: 'مدونة السفر — أدلة ونصائح وبرامج رحلات', blogDesc: 'أدلة سفر ونصائح للوجهات وبرامج رحلات من فاستامور، مساعد السفر الذكي.', blogH1: 'مدونة فاستامور للسفر',
        guide: 'دليل السفر', nf: 'الصفحة غير موجودة', nfP: 'تصفح أدلة السفر' },
  fr: { flights: 'Vols vers le Maroc', blog: 'Blog', home: 'Accueil', guides: 'Guides de voyage', dests: 'Destinations populaires', latest: 'Derniers guides de voyage', attractions: 'Incontournables',
        homeTitle: 'Fastamor : assistant de voyage IA, vols, hôtels et voitures',
        homeDesc: 'Fastamor est votre assistant de voyage IA : comparez vols pas chers, hôtels, activités et transferts, et lisez des guides pratiques.',
        homeH1: 'Fastamor — votre assistant de voyage IA',
        homeP: 'Planifiez votre voyage en conversant : Fastamor trouve vols, hôtels, activités et transferts aéroport et vous oriente vers les meilleures offres.',
        blogTitle: 'Blog voyage — Guides, conseils et itinéraires', blogDesc: 'Guides de voyage, conseils et itinéraires par Fastamor, votre assistant de voyage IA.', blogH1: 'Le blog voyage Fastamor',
        guide: 'Guide de voyage', nf: 'Page introuvable', nfP: 'Voir nos guides de voyage' },
  es: { flights: 'Vuelos a Marruecos', blog: 'Blog', home: 'Inicio', guides: 'Guías de viaje', dests: 'Destinos populares', latest: 'Últimas guías de viaje', attractions: 'Imprescindibles',
        homeTitle: 'Fastamor: asistente de viajes con IA, vuelos, hoteles y coches',
        homeDesc: 'Fastamor es tu asistente de viajes con IA: compara vuelos baratos, hoteles, actividades y traslados, y lee guías prácticas.',
        homeH1: 'Fastamor — tu asistente de viajes con IA',
        homeP: 'Planifica tu viaje conversando: Fastamor encuentra vuelos, hoteles, actividades y traslados y te lleva a las mejores ofertas.',
        blogTitle: 'Blog de viajes — Guías, consejos e itinerarios', blogDesc: 'Guías de viaje, consejos e itinerarios de Fastamor, tu asistente de viajes con IA.', blogH1: 'El blog de viajes de Fastamor',
        guide: 'Guía de viaje', nf: 'Página no encontrada', nfP: 'Ver nuestras guías de viaje' },
};

function render(template, { title, description, url, image, lang = 'en', type = 'website', jsonLd, body, status, alternates }) {
  // Always carry the brand: append it when it fits in ~60 chars, unless already present.
  const fullTitle = /fastamor|فاستامور/i.test(title) ? title : (title.length <= 49 ? `${title} | Fastamor` : title);
  const desc = text(description).slice(0, 160);
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    ...(alternates || []).map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`),
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:locale" content="${{ en: 'en_US', ar: 'ar_AR', fr: 'fr_FR', es: 'es_ES' }[lang]}" />`,
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
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function alternatesFor(path, langs, defaultLang) {
  const list = langs.map(l => ({ hreflang: l, href: `${SITE}${urlFor(path, l)}` }));
  list.push({ hreflang: 'x-default', href: `${SITE}${urlFor(path, defaultLang)}` });
  return list;
}

const nav = lang =>
  `<nav><a href="${urlFor('/', lang)}">Fastamor</a> · <a href="${urlFor('/blog', lang)}">${UI[lang].blog}</a> · <a href="${urlFor('/flights', lang)}">${UI[lang].flights}</a> · <a href="${urlFor('/car', lang)}">Fastamor Car</a> · ` +
  LANGS.filter(l => l !== lang).map(l => `<a href="${urlFor('/', l)}" hreflang="${l}">${l.toUpperCase()}</a>`).join(' ') +
  `</nav>`;

const redirect = to => ({ redirect: to });

async function articlePage(slug, lang) {
  const rows = await rest('articles', `select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
  const a = rows?.[0];
  if (!a) return null;
  const langs = articleLangs(a);
  if (!langs.length) return null;
  const defaultLang = langs.includes('en') ? 'en' : langs[0];
  const path = `/article/${encodeURIComponent(a.slug)}`;
  if (!langs.includes(lang)) return redirect(urlFor(path, defaultLang));
  const title = a[`title_${lang}`];
  const excerpt = a[`excerpt_${lang}`] || '';
  const url = `${SITE}${urlFor(path, lang)}`;
  return {
    title, description: excerpt || text(a[`body_${lang}`]), url, image: a.featured_image, lang, type: 'article',
    alternates: alternatesFor(path, langs, defaultLang),
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Article', headline: title, inLanguage: lang, description: text(excerpt).slice(0, 300),
      image: a.featured_image || DEFAULT_IMAGE, datePublished: a.published_at, dateModified: a.updated_at || a.published_at,
      mainEntityOfPage: url, author: { '@type': 'Organization', name: 'Fastamor' },
      publisher: { '@type': 'Organization', name: 'Fastamor', logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE } },
    },
    body: `${nav(lang)}<article><h1>${esc(title)}</h1>${excerpt ? `<p>${esc(text(excerpt))}</p>` : ''}${sanitize(a[`body_${lang}`])}${await tripKitHtml(a.slug || slug, lang)}</article>`,
  };
}

async function destinationPage(slug, lang) {
  const rows = await rest('destinations', `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const d = rows?.[0];
  if (!d) return null;
  const langs = destinationLangs(d);
  if (!langs.length) return null;
  const defaultLang = langs.includes('en') ? 'en' : langs[0];
  const path = `/destination/${encodeURIComponent(d.slug)}`;
  if (!langs.includes(lang)) return redirect(urlFor(path, defaultLang));
  const name = d[`name_${lang}`];
  const country = d[`country_${lang}`] || '';
  const desc = d[`description_${lang}`];
  const attractions = d[`popular_attractions_${lang}`] || [];
  const arts = (await rest('articles', `select=slug,title_${lang}&destination_id=eq.${encodeURIComponent(d.id)}&status=eq.published&limit=12`)) || [];
  const url = `${SITE}${urlFor(path, lang)}`;
  const title = lang === 'ar' ? `${name}${country ? `، ${country}` : ''} — ${UI.ar.guide}` : `${name}${country ? `, ${country}` : ''} — ${UI.en.guide}`;
  return {
    title, description: desc, url, image: d.image_url, lang, alternates: alternatesFor(path, langs, defaultLang),
    jsonLd: { '@context': 'https://schema.org', '@type': 'TouristDestination', name, description: text(desc).slice(0, 300), image: d.image_url || DEFAULT_IMAGE, url },
    body:
      `${nav(lang)}<main><h1>${esc(title)}</h1>${sanitize(desc)}` +
      (Array.isArray(attractions) && attractions.length ? `<h2>${UI[lang].attractions}</h2><ul>${attractions.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '') +
      (arts.filter(x => x[`title_${lang}`]).length
        ? `<h2>${UI[lang].guides}</h2><ul>${arts.filter(x => x[`title_${lang}`]).map(x => `<li><a href="${urlFor(`/article/${esc(x.slug)}`, lang)}">${esc(x[`title_${lang}`])}</a></li>`).join('')}</ul>`
        : '') +
      `</main>`,
  };
}

// Articles that have a publishable version in `lang` (titles only for listing).
async function listArticles(lang, limit) {
  const rows = (await rest('articles', `select=slug,title_${lang},excerpt_${lang},body_${lang}&status=eq.published&order=published_at.desc&limit=${limit}`)) || [];
  return rows.filter(a => (a[`body_${lang}`] || '').length >= MIN_BODY && a[`title_${lang}`]);
}
async function listDestinations(lang) {
  const dl = lang === 'ar' ? 'ar' : 'en';
  const rows = (await rest('destinations', `select=slug,name_${dl}&limit=100`)) || [];
  return { dl, rows: rows.filter(d => d[`name_${dl}`] && !['dubai-uae', 'france-paris'].includes(d.slug)) };
}

async function homePage(lang) {
  const t = UI[lang];
  const arts = (await listArticles(lang, 60)).slice(0, 12);
  const { dl, rows: dests } = await listDestinations(lang);
  return {
    title: t.homeTitle, description: t.homeDesc, url: `${SITE}${urlFor('/', lang)}`, lang,
    alternates: alternatesFor('/', LANGS, 'en'),
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Fastamor', url: `${SITE}${urlFor('/', lang)}`, inLanguage: lang },
    body:
      `${nav(lang)}<main><h1>${esc(t.homeH1)}</h1><p>${esc(t.homeP)}</p>` +
      `<h2>${t.dests}</h2><ul>${dests.map(d => `<li><a href="${urlFor(`/destination/${esc(d.slug)}`, dl)}">${esc(d[`name_${dl}`])}</a></li>`).join('')}</ul>` +
      (arts.length ? `<h2>${t.latest}</h2><ul>${arts.map(a => `<li><a href="${urlFor(`/article/${esc(a.slug)}`, lang)}">${esc(a[`title_${lang}`])}</a></li>`).join('')}</ul>` : '') +
      `</main>`,
  };
}

async function blogPage(lang) {
  const t = UI[lang];
  const arts = await listArticles(lang, 200);
  const { dl, rows: dests } = await listDestinations(lang);
  return {
    title: t.blogTitle, description: t.blogDesc, url: `${SITE}${urlFor('/blog', lang)}`, lang,
    alternates: alternatesFor('/blog', LANGS, 'en'),
    body:
      `${nav(lang)}<main><h1>${esc(t.blogH1)}</h1><ul>` +
      arts.map(a => `<li><a href="${urlFor(`/article/${esc(a.slug)}`, lang)}">${esc(a[`title_${lang}`])}</a> — ${esc(text(a[`excerpt_${lang}`]).slice(0, 140))}</li>`).join('') +
      `</ul><h2>${t.dests}</h2><ul>` +
      dests.map(d => `<li><a href="${urlFor(`/destination/${esc(d.slug)}`, dl)}">${esc(d[`name_${dl}`])}</a></li>`).join('') +
      `</ul></main>`,
  };
}

export default async function handler(req, res) {
  const type = String(req.query.type || '');
  const slug = String(req.query.slug || '').slice(0, 200);
  const lang = isLang(req.query.lang) ? req.query.lang : 'en';
  let template;
  try {
    template = await getTemplate(req);
  } catch {
    return res.status(500).send('Template unavailable');
  }

  let page = null;
  if (type === 'article' && slug) page = await articlePage(slug, lang);
  else if (type === 'destination' && slug) page = await destinationPage(slug, lang);
  else if (type === 'blog') page = await blogPage(lang);
  else if (type === 'home') page = await homePage(lang);

  if (page?.redirect) {
    res.setHeader('Cache-Control', 's-maxage=600');
    res.setHeader('Location', page.redirect);
    return res.status(301).end();
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!page) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(404).send(
      render(template, {
        title: UI[lang].nf, description: UI[lang].nf, url: `${SITE}${urlFor('/', lang)}`, status: 404, lang,
        body: `${nav(lang)}<main><h1>404 — ${esc(UI[lang].nf)}</h1><p><a href="${urlFor('/blog', lang)}">${esc(UI[lang].nfP)}</a></p></main>`,
      })
    );
  }
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
  return res.status(200).send(render(template, page));
}
