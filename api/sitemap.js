// api/sitemap.js — dynamic sitemap built from published content in Supabase.
const SITE = 'https://www.fastamor.com';
// Slugs that 301-redirect elsewhere (see vercel.json) must not be listed.
const REDIRECTED = new Set(['dubai-uae', 'france-paris']);

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

export default async function handler(req, res) {
  // Try with updated_at first; fall back if the column does not exist.
  const articles =
    (await fetchRows('articles', 'slug,published_at,updated_at', '&status=eq.published&order=published_at.desc&limit=5000')) ||
    (await fetchRows('articles', 'slug,published_at', '&status=eq.published&limit=5000')) || [];
  const destinations =
    (await fetchRows('destinations', 'slug,updated_at', '&limit=1000')) ||
    (await fetchRows('destinations', 'slug', '&limit=1000')) || [];

  const urls = [
    { loc: `${SITE}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE}/blog`, changefreq: 'daily', priority: '0.8' },
    ...destinations.filter(d => d.slug && !REDIRECTED.has(d.slug)).map(d => ({
      loc: `${SITE}/destination/${encodeURIComponent(d.slug)}`, lastmod: day(d.updated_at), changefreq: 'weekly', priority: '0.8',
    })),
    ...articles.filter(a => a.slug).map(a => ({
      loc: `${SITE}/article/${encodeURIComponent(a.slug)}`, lastmod: day(a.updated_at || a.published_at), changefreq: 'monthly', priority: '0.7',
    })),
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u =>
      `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    ).join('\n') +
    '\n</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
