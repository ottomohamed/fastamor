// src/lib/convertLinks.ts
// Auto-converts any travel URL to Travelpayouts affiliate link

const CACHE = new Map<string, string>();

export async function toAffiliateLink(url: string): Promise<string> {
  if (!url || url.includes('tpx.gr') || url.includes('tp.st')) return url;
  if (CACHE.has(url)) return CACHE.get(url)!;

  try {
    const res = await fetch('/api/affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [url] }),
    });
    const data = await res.json();
    const affiliate = data.links?.[0]?.affiliate || url;
    CACHE.set(url, affiliate);
    return affiliate;
  } catch {
    return url;
  }
}

export async function convertLinksInText(text: string): Promise<string> {
  const urlRegex = /https?:\/\/[^\s\)\"]+/g;
  const urls = text.match(urlRegex) || [];
  if (!urls.length) return text;

  let result = text;
  for (const url of urls) {
    const affiliate = await toAffiliateLink(url);
    if (affiliate !== url) result = result.replace(url, affiliate);
  }
  return result;
}
