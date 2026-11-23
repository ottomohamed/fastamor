// Fastamor Click Tracking
export function initTracking() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || params.get('subid');
  if (ref) localStorage.setItem('sj_ref', ref);
  if (!localStorage.getItem('py_clicks')) localStorage.setItem('py_clicks', '0');
  if (!localStorage.getItem('py_searches')) localStorage.setItem('py_searches', '0');
}

export function getActiveRef() {
  return localStorage.getItem('sj_ref') || "";
}

/** Adds the visitor's referral sub-id (if any) to an affiliate URL. */
export function withSubid(url: string): string {
  const ref = getActiveRef();
  return ref ? `${url}${url.includes('?') ? '&' : '?'}subid=${encodeURIComponent(ref)}` : url;
}

/** Counts an outbound affiliate click. Does NOT navigate: use it in onClick of a real <a href>. */
export function trackClick(_url?: string) {
  const current = parseInt(localStorage.getItem('py_clicks') || '0', 10);
  localStorage.setItem('py_clicks', (current + 1).toString());
  return true;
}

/** For buttons (not links): counts the click and opens the affiliate URL once, in a new tab. */
export function openTracked(url: string, subid = 'app') {
  trackClick(url);
  window.open(aff(url, subid), '_blank', 'noopener');
}

export function trackSearch() {
  const current = parseInt(localStorage.getItem('py_searches') || '0', 10);
  localStorage.setItem('py_searches', (current + 1).toString());
}

export function getStats() {
  const clicks = parseInt(localStorage.getItem('py_clicks') || '0', 10);
  const searches = parseInt(localStorage.getItem('py_searches') || '0', 10);
  const conversion = clicks > 0 ? ((searches / clicks) * 100).toFixed(2) : '0.00';
  return { clicks, searches, conversion, activeRef: getActiveRef() || 'Direct' };
}

// ---------------------------------------------------------------------------
// SubIDs: every outbound partner link carries "<page>_<feature>_<lang>"
// (e.g. "art-italy-travel-guide_sidebar-tours_en") so Travelpayouts reports can
// be grouped by SubID and we can see which page / feature earns.

/** Travelpayouts short links we use -> partner key served by /go/:partner. */
const SHORT_TO_PARTNER: Record<string, string> = {
  'https://aviasales.tpx.gr/yQxrYmk7': 'aviasales',
  'https://klook.tpx.gr/vRUzaJbI': 'klook',
  'https://tiqets.tpx.gr/ot4HK9Pf': 'tiqets',
  'https://wegotrip.tpx.gr/DyN0pkVH': 'wegotrip',
  'https://tpx.gr/n6krgEY3': 'welcomepickups',
  'https://kiwitaxi.tpx.gr/Y6yrFeYN': 'kiwitaxi',
  'https://intui.tpx.gr/kguAoKIU': 'intui',
  'https://gettransfer.tpx.gr/9poAnD5l': 'gettransfer',
  'https://economybookings.tpx.gr/ONZ6dOjM': 'economybookings',
  'https://qeeq.tpx.gr/pTbTtERj': 'qeeq',
  'https://localrent.tpx.gr/qr92Puo9': 'localrent',
  'https://yesim.tpx.gr/9gzdax7m': 'yesim',
  'https://airhelp.tpx.gr/baeI5YIf': 'airhelp',
  'https://compensair.tpx.gr/MGUDRrY2': 'compensair',
};

/** Builds a SubID: lowercase, [a-z0-9_-], max 60 chars. */
export function sid(...parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join('_').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 60);
}

/** Link to our /go redirect for a partner, optionally deep-linking a page on the partner's site. */
export function goUrl(partner: string, subid: string, to?: string): string {
  const q = new URLSearchParams({ s: subid });
  if (to) q.set('to', to);
  return `/go/${partner}?${q.toString()}`;
}

/** Adds a SubID to any outbound partner URL we know how to tag; other URLs are returned unchanged. */
export function aff(url: string, subid: string): string {
  if (!url) return url;
  const partner = SHORT_TO_PARTNER[url.replace(/\/$/, '')];
  if (partner) return goUrl(partner, subid);
  // Aviasales deep links carry our marker directly: marker=709105 -> 709105.<subid>
  try {
    const u = new URL(url);
    const m = u.searchParams.get('marker');
    if (m && /^\d+$/.test(m) && /aviasales|jetradar|tp\.media/.test(u.hostname)) {
      u.searchParams.set('marker', `${m}.${subid}`);
      return u.toString();
    }
  } catch { /* relative or invalid URL */ }
  return url;
}

/** Hotel search until a hotel affiliate program is approved (non-affiliate, but genuinely useful). */
export function hotelSearchUrl(city?: string): string {
  return city ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}` : 'https://www.booking.com/';
}
