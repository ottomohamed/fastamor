// api/affiliate.js
// Converts any travel URL to a Travelpayouts affiliate link

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '709105';
const TRS = process.env.TRAVELPAYOUTS_TRS || '514622';

// ---------------------------------------------------------------------------
// GET /go/:partner?s=<subid>[&to=<url on the partner's site>]
//   (rewritten to /api/affiliate?p=:partner)
// Asks the Travelpayouts Links API for a partner link carrying our SubID, so each
// click is attributed to the page/feature that produced it (Reports -> group by
// SubID). Links are cached in memory and the 302 at the edge; if the API is
// unavailable we fall back to the plain short link, so the user never hits an error.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const PARTNERS = JSON.parse(readFileSync(path.join(process.cwd(), 'api/_data/partners.json'), 'utf8'));

const linkCache = new Map();

async function partnerLink(partner, subid, to) {
  const p = PARTNERS[partner];
  const key = `${partner}|${subid}|${to || ''}`;
  if (linkCache.has(key)) return linkCache.get(key);
  let url = p.short;
  if (TOKEN && (subid || to)) {
    const r = await fetch('https://api.travelpayouts.com/links/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': TOKEN },
      body: JSON.stringify({ trs: Number(TRS), marker: Number(MARKER), shorten: true,
        links: [{ url: to || p.url, ...(subid ? { sub_id: subid } : {}) }] }),
    });
    const data = await r.json().catch(() => null);
    const l = data?.result?.links?.[0];
    if (l?.code === 'success' && l.partner_url) url = l.partner_url;
  }
  linkCache.set(key, url);
  return url;
}

async function go(req, res) {
  const partner = String(req.query.p || '').toLowerCase();
  if (!Object.hasOwn(PARTNERS, partner)) return res.status(404).end();
  const subid = String(req.query.s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60);
  // Deep links are only allowed on the partner's own domain.
  let to = '';
  if (req.query.to) {
    try {
      const u = new URL(String(req.query.to));
      const base = new URL(PARTNERS[partner].url).hostname.replace(/^www\./, '');
      if (u.protocol === 'https:' && (u.hostname === base || u.hostname.endsWith('.' + base))) to = u.toString();
    } catch {}
  }
  let target = PARTNERS[partner].short;
  try { target = await partnerLink(partner, subid, to); } catch {}
  if (req.query.debug === '1' && process.env.VERCEL_ENV === 'preview') return res.json({ partner, subid, to, target });
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.redirect(302, target);
}

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query.p) return go(req, res);
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
