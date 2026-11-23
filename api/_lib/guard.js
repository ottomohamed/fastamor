// Shared request guards for the serverless API.

const ALLOWED_ORIGINS = [
  'https://www.fastamor.com',
  'https://fastamor.com',
  'https://fastamor.vercel.app',
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin requests from the browser may omit Origin
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Vercel preview deployments of this project
  if (/^https:\/\/fastamor-[a-z0-9-]+-ottomohameds-projects\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

/**
 * Applies CORS for our own origins only and handles preflight.
 * Returns true if the request was fully handled (caller should return).
 */
export function applyCors(req, res, methods = 'POST, OPTIONS') {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(isAllowedOrigin(origin) ? 200 : 403).end();
    return true;
  }
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return true;
  }
  return false;
}

// Best-effort in-memory rate limiter (per warm serverless instance).
const buckets = new Map();
export function rateLimited(req, { limit = 20, windowMs = 60_000 } = {}) {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.start > windowMs) {
    buckets.set(ip, { start: now, count: 1 });
    return false;
  }
  b.count += 1;
  if (buckets.size > 5000) buckets.clear();
  return b.count > limit;
}

/**
 * Verifies a Supabase access token (Authorization: Bearer <jwt>) and returns the user, or null.
 */
export async function getSupabaseUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_KEY;
  if (!token || !url || !anon) return null;
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anon },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
