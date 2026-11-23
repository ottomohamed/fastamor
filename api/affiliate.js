// api/affiliate.js
// Converts any travel URL to a Travelpayouts affiliate link

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '709105';
const TRS = process.env.TRAVELPAYOUTS_TRS || '514622';

// ---------------------------------------------------------------------------
// GET /go/:host/:code?s=<subid>  (rewritten to /api/affiliate?host=&code=&s=)
// Resolves a Travelpayouts short link (https://<host>.tpx.gr/<code>) to its long
// tp.media form and stamps the SubID into the marker ("709105.<subid>", the
// format Travelpayouts documents), so every click is attributed to a page/feature.
// Resolutions are cached in memory and the 302 is cached at the edge for a day.
const resolved = new Map();
const SAFE = /^[a-z0-9-]{1,40}$/;
const CODE = /^[A-Za-z0-9]{4,20}$/;

async function resolveShort(host, code) {
  const key = `${host}/${code}`;
  if (resolved.has(key)) return resolved.get(key);
  // Follow only the short-link hop(s) and stop at Travelpayouts' own click
  // redirector (tp.media / *.travelpayouts.com). That hop records the click and
  // creates a fresh click id per visitor, so we must never go past it or cache
  // anything beyond it.
  let url = host === '_' ? `https://tpx.gr/${code}` : `https://${host}.tpx.gr/${code}`;
  const chain = [url];
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 FastamorGo' } });
    const loc = r.headers.get('location');
    if (!loc) break;
    url = new URL(loc, url).toString();
    chain.push(url);
    const h = new URL(url).hostname;
    if (!/(^|\.)tpx\.gr$|(^|\.)tp\.st$/.test(h)) break; // left the shortener
  }
  const h = new URL(url).hostname;
  const ok = /(^|\.)(tp\.media|travelpayouts\.com|tp\.click)$/.test(h);
  const out = { url: ok ? url : null, chain };
  if (ok) resolved.set(key, out);
  return out;
}

function stampSubid(url, subid) {
  if (!subid) return url;
  try {
    const u = new URL(url);
    const m = u.searchParams.get('marker');
    if (m && /^\d+$/.test(m)) { u.searchParams.set('marker', `${m}.${subid}`); return u.toString(); }
  } catch {}
  return url;
}

async function go(req, res) {
  const host = String(req.query.host || '');
  const code = String(req.query.code || '');
  const subid = String(req.query.s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60);
  if (!(SAFE.test(host) || host === '_') || !CODE.test(code)) return res.status(404).end();
  const short = host === '_' ? `https://tpx.gr/${code}` : `https://${host}.tpx.gr/${code}`;
  let target = short;
  let chain = [];
  try {
    const r = await resolveShort(host, code);
    chain = r.chain;
    if (r.url) target = stampSubid(r.url, subid);
  } catch {}
  if (req.query.debug === '1' && process.env.VERCEL_ENV === 'preview') return res.json({ short, target, chain });
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  return res.redirect(302, target);
}

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query.host) return go(req, res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { urls } = req.body;
  if (!urls?.length) return res.status(400).json({ error: 'urls array required' });

  try {
    const response = await fetch('https://api.travelpayouts.com/links/v1/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        trs: Number(TRS),
        marker: Number(MARKER),
        shorten: true,
        links: urls.slice(0, 10).map(url => ({ url })),
      }),
    });

    const data = await response.json();

    if (data.code === 'success') {
      const converted = data.result.links.map(l => ({
        original: l.url,
        affiliate: l.code === 'success' ? l.partner_url : l.url,
        success: l.code === 'success',
      }));
      return res.json({ success: true, links: converted });
    }

    return res.json({ success: false, error: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
