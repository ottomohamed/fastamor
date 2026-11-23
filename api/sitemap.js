// api/sitemap.js — dynamic sitemap with one entry per published language version
// and xhtml:link hreflang alternates.
import { LANGS, urlFor, articleLangs, destinationLangs } from './_lib/i18n.js';
import { getRoutes, routeLangs } from './route-page.js';

const SITE = 'https://www.fastamor.com';
// Slugs that 301-redirect elsewhere (see vercel.json) must not be listed.
const REDIRECTED = new Set(['dubai-uae', 'france-paris', 'traveler-health-guide-avoiding-diseases', 'customs-guide-travel']);

async function fetchRows(table, select, filter = '') {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/rest/v1/${table}?select=${select}${filter}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const esc = s => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const day = d => (d ? new Date(d).toISOString().slice(0, 10) : undefined);

// One <url> per language version, each listing all versions (incl. itself) + x-default.
function group(path, langs, defaultLang, extra) {
  const alts =
    langs.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(SITE + urlFor(path, l))}"/>`).join('') +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE + urlFor(path, defaultLang))}"/>`;
  return langs.map(l => ({ loc: SITE + urlFor(path, l), alts, ...extra }));
}

export default async function handler(req, res) {
  const bodies = LANGS.map(l => `title_${l},body_${l}`).join(',');
  const articles =
    (await fetchRows('articles', `slug,published_at,updated_at,${bodies}`, '&status=eq.published&order=published_at.desc&limit=2000')) || [];
  const destinations =
    (await fetchRows('destinations', 'slug,name_en,name_ar,description_en,description_ar', '&limit=1000')) || [];

  const urls = [
    ...group('/', LANGS, 'en', { changefreq: 'daily', priority: '1.0' }),
    ...group('/blog', LANGS, 'en', { changefreq: 'daily', priority: '0.8' }),
  ];
  urls.push(...group('/flights', LANGS, 'en', { changefreq: 'weekly', priority: '0.8' }));
  urls.push(...group('/car', LANGS, 'en', { changefreq: 'weekly', priority: '0.9' }));
  try {
    const routes = await getRoutes();
    for (const [slug, r] of Object.entries(routes)) {
      const langs = routeLangs(r);
      if (langs.length) urls.push(...group(`/flights/${slug}`, langs, langs.includes('en') ? 'en' : langs[0], { changefreq: 'daily', priority: '0.9' }));
    }
  } catch {}
  for (const d of destinations) {
    if (!d.slug || REDIRECTED.has(d.slug)) continue;
    const langs = destinationLangs(d);
    if (langs.length) urls.push(...group(`/destination/${encodeURIComponent(d.slug)}`, langs, langs.includes('en') ? 'en' : langs[0], { changefreq: 'weekly', priority: '0.8' }));
  }
  for (const a of articles) {
    if (!a.slug || REDIRECTED.has(a.slug)) continue;
    const langs = articleLangs(a);
    if (langs.length)
      urls.push(...group(`/article/${encodeURIComponent(a.slug)}`, langs, langs.includes('en') ? 'en' : langs[0], { lastmod: day(a.updated_at || a.published_at), changefreq: 'monthly', priority: '0.7' }));
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.map(u => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${u.alts}</url>`).join('\n') +
    '\n</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
