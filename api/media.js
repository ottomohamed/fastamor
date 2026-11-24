// api/media.js — serves images from the private Blob store at /media/<file>,
// cached for a year at the edge and in browsers (file names are content hashes).
import { get } from '@vercel/blob';
import { blobAuth } from './_lib/blob-auth.js';
import { migrateImages } from './_lib/migrate-images.js';
import { convertWebp } from './_lib/convert-webp.js';

export default async function handler(req, res) {
  if (req.query.migrate === '1') return migrateImages(req, res); // preview-only tool
  // TEMP (preview only): raw article body for the content rewrite. Removed before merge.
  if (req.query.dump && process.env.VERCEL_ENV === 'preview') {
    const slug = String(req.query.dump).replace(/[^a-z0-9-]/g, '');
    const r = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/articles?select=slug,category,title_en,excerpt_en,body_en,title_ar,excerpt_ar,body_ar,title_fr,excerpt_fr,body_fr,title_es,excerpt_es,body_es&slug=eq.${slug}`,
      { headers: { apikey: process.env.VITE_SUPABASE_KEY, Authorization: `Bearer ${process.env.VITE_SUPABASE_KEY}` } });
    return res.status(200).json(await r.json());
  }
  if (req.query.convert === '1') return convertWebp(req, res);   // preview-only tool
  const file = String(req.query.file || '');
  if (!/^[a-f0-9]{20}\.(jpg|png|webp|gif|avif)$/.test(file)) return res.status(404).end();
  const auth = blobAuth(req);
  if (!auth) return res.status(500).end();
  try {
    const result = await get(`media/${file}`, { access: 'private', ...auth });
    if (!result || !result.stream) return res.status(404).end();
    const type = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' }[file.split('.').pop()];
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    const buf = Buffer.from(await new Response(result.stream).arrayBuffer());
    return res.status(200).send(buf);
  } catch (e) {
    console.error('[media]', e?.message);
    return res.status(404).end();
  }
}
