// api/media.js — serves images from the private Blob store at /media/<file>,
// cached for a year at the edge and in browsers (file names are content hashes).
import { get } from '@vercel/blob';
import { blobAuth } from './_lib/blob-auth.js';

export default async function handler(req, res) {
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
