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
export function openTracked(url: string) {
  trackClick(url);
  window.open(withSubid(url), '_blank', 'noopener');
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
