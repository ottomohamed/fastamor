// api/migrate-images.js — one-off copy of externally hosted images (temporary
// lh3.googleusercontent.com links) into Fastamor's own private Vercel Blob store,
// served from https://www.fastamor.com/media/<hash>.<ext> by api/media.js.
//
// Safety:
// - Runs only on Vercel *preview* deployments, which are behind Vercel
//   Authentication; on production it returns 404.
// - Read-only towards the database: it returns a mapping { oldUrl: newUrl }.
//   The URL rewrite in the database is applied separately as reviewed SQL.
//
// Usage (preview): GET /api/migrate-images?offset=0&limit=15  -> repeat with next offset.
import { put, head } from '@vercel/blob';
import { blobAuth } from './blob-auth.js';
import { createHash } from 'node:crypto';

const MIGRATE_HOSTS = /^(lh3\.googleusercontent\.com|i\.ibb\.co)$/i;

async function rest(table, select) {
  const r = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
    headers: { apikey: process.env.VITE_SUPABASE_KEY, Authorization: `Bearer ${process.env.VITE_SUPABASE_KEY}` },
  });
  return r.ok ? r.json() : [];
}

async function collectUrls() {
  const set = new Set();
  const add = u => {
    try { if (u && MIGRATE_HOSTS.test(new URL(u).hostname)) set.add(u); } catch {}
  };
  const arts = await rest('articles', 'featured_image,body_en,body_ar,body_fr,body_es');
  for (const a of arts) {
    add(a.featured_image);
    for (const f of ['body_en', 'body_ar', 'body_fr', 'body_es'])
      for (const m of String(a[f] || '').matchAll(/src="(https?:\/\/[^"]+)"/g)) add(m[1].replace(/&amp;/g, '&'));
  }
  for (const d of await rest('destinations', 'image_url')) add(d.image_url);
  return [...set].sort();
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

export async function migrateImages(req, res) {
  if (process.env.VERCEL_ENV !== 'preview') return res.status(404).end();
  const auth = blobAuth(req);
  if (!auth) return res.status(500).json({ error: 'Blob store not connected', hasStoreId: !!process.env.BLOB_STORE_ID, hasOidcHeader: !!req.headers['x-vercel-oidc-token'] });

  const all = await collectUrls();
  const offset = Math.max(0, parseInt(req.query.offset || '0', 10));
  const limit = Math.min(25, Math.max(1, parseInt(req.query.limit || '15', 10)));
  const batch = all.slice(offset, offset + limit);
  const mapping = {};
  const failed = {};

  await Promise.all(batch.map(async url => {
    const id = createHash('sha1').update(url).digest('hex').slice(0, 20);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 FastamorMediaMigration' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const type = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
      if (!type.startsWith('image/')) throw new Error(`not an image: ${type}`);
      const pathname = `media/${id}.${EXT[type] || 'jpg'}`;
      try {
        await head(pathname, auth); // already copied
      } catch {
        const buf = Buffer.from(await r.arrayBuffer());
        await put(pathname, buf, { access: 'private', contentType: type, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 31536000, ...auth });
      }
      // Served by api/media.js from our own domain.
      mapping[url] = `https://www.fastamor.com/${pathname}`;
    } catch (e) {
      failed[url] = String(e.message || e);
    }
  }));

  return res.status(200).json({
    total: all.length, offset, limit, next: offset + limit < all.length ? offset + limit : null,
    copied: Object.keys(mapping).length, failed, mapping,
  });
}
