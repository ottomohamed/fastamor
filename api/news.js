// api/news.js — travel news proxy so the NewsAPI key never reaches the browser.
import { applyCors } from './_lib/guard.js';

let cache = { at: 0, data: null };
const TTL_MS = 30 * 60 * 1000;

export default async function handler(req, res) {
  if (applyCors(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') return res.status(405).end();

  const key = process.env.NEWSAPI_KEY;
  if (!key) return res.status(200).json({ articles: [] });

  if (cache.data && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(cache.data);
  }

  try {
    const q = encodeURIComponent('flights Morocco OR ferries Morocco OR سياحة المغرب');
    const r = await fetch(
      `https://newsapi.org/v2/everything?q=${q}&language=ar&sortBy=publishedAt&pageSize=3`,
      { headers: { 'X-Api-Key': key } }
    );
    const data = await r.json();
    const out = {
      articles: (data.articles || []).map(a => ({
        title: a.title, description: a.description, url: a.url,
        urlToImage: a.urlToImage, source: { name: a.source?.name }, publishedAt: a.publishedAt,
      })),
    };
    cache = { at: Date.now(), data: out };
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(out);
  } catch {
    return res.status(200).json({ articles: [] });
  }
}
