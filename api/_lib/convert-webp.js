// Preview-only tool: makes a WebP copy (max 1600px wide) of every PNG/JPG in the
// private "media/" folder, and copies the site logo from i.ibb.co into the store.
// Usage on a preview deployment: /api/media?convert=1&offset=0&limit=6
import { list, get, put, head } from '@vercel/blob';
import { createHash } from 'node:crypto';
import { blobAuth } from './blob-auth.js';

export const LOGO_SOURCE = 'https://i.ibb.co/x8sSqTDj/1978.png';

async function readBlob(pathname, auth) {
  const r = await get(pathname, { access: 'private', ...auth });
  return Buffer.from(await new Response(r.stream).arrayBuffer());
}

export async function convertWebp(req, res) {
  if (process.env.VERCEL_ENV !== 'preview') return res.status(404).end();
  const auth = blobAuth(req);
  if (!auth) return res.status(500).json({ error: 'Blob store not connected' });
  const sharp = (await import('sharp')).default;

  // 1) Logo (once)
  const logoId = createHash('sha1').update(LOGO_SOURCE).digest('hex').slice(0, 20);
  let logo = 'exists';
  try { await head(`media/${logoId}.png`, auth); } catch {
    const r = await fetch(LOGO_SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 FastamorMediaMigration' } });
    if (!r.ok) logo = `failed HTTP ${r.status}`;
    else {
      const buf = Buffer.from(await r.arrayBuffer());
      const png = await sharp(buf).resize({ width: 512, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toBuffer();
      await put(`media/${logoId}.png`, png, { access: 'private', contentType: 'image/png', addRandomSuffix: false, allowOverwrite: true, ...auth });
      logo = `copied ${buf.length} -> ${png.length} bytes`;
    }
  }

  // 2) WebP copies
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: 'media/', cursor, limit: 1000, ...auth });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const have = new Set(blobs.map(b => b.pathname));
  const sources = blobs.filter(b => /\.(png|jpg)$/.test(b.pathname) && !b.pathname.startsWith(`media/${logoId}`))
    .sort((a, b) => a.pathname.localeCompare(b.pathname));

  const offset = Math.max(0, parseInt(req.query.offset || '0', 10));
  const limit = Math.min(10, Math.max(1, parseInt(req.query.limit || '6', 10)));
  const batch = sources.slice(offset, offset + limit);
  const done = [], failed = {};
  let before = 0, after = 0;
  for (const b of batch) {
    const target = b.pathname.replace(/\.(png|jpg)$/, '.webp');
    try {
      if (have.has(target)) { done.push(`${target} (exists)`); continue; }
      const buf = await readBlob(b.pathname, auth);
      const webp = await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toBuffer();
      await put(target, webp, { access: 'private', contentType: 'image/webp', addRandomSuffix: false, allowOverwrite: true, ...auth });
      before += buf.length; after += webp.length;
      done.push(target);
    } catch (e) { failed[b.pathname] = String(e.message || e); }
  }
  return res.status(200).json({
    logo: `/media/${logoId}.png (${logo})`, total: sources.length, offset, next: offset + limit < sources.length ? offset + limit : null,
    converted: done.length, failed, bytes_before: before, bytes_after: after,
  });
}
