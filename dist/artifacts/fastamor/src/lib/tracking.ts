// Simple referral & click tracking mechanism
export function initTracking() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || params.get('subid');
  if (ref) {
    localStorage.setItem('sj_ref', ref);
  }
  
  if (!localStorage.getItem('py_clicks')) localStorage.setItem('py_clicks', '0');
  if (!localStorage.getItem('py_searches')) localStorage.setItem('py_searches', '0');
}

export function getActiveRef() {
  return localStorage.getItem('sj_ref') || "";
}

export function trackClick(url?: string) {
  const current = parseInt(localStorage.getItem('py_clicks') || '0', 10);
  localStorage.setItem('py_clicks', (current + 1).toString());
  
  if (url) {
    const ref = getActiveRef();
    const finalUrl = ref ? `${url}${url.includes('?') ? '&' : '?'}subid=${encodeURIComponent(ref)}` : url;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }
  return true;
}

export function trackSearch() {
  const current = parseInt(localStorage.getItem('py_searches') || '0', 10);
  localStorage.setItem('py_searches', (current + 1).toString());
}

export function getStats() {
  const clicks = parseInt(localStorage.getItem('py_clicks') || '0', 10);
  const searches = parseInt(localStorage.getItem('py_searches') || '0', 10);
  const conversion = clicks > 0 ? ((searches / clicks) * 100).toFixed(2) : '0.00';
  const revenue = (clicks * 0.02 * 5).toFixed(2); // Mock calculation
  
  return { clicks, searches, conversion, revenue, activeRef: getActiveRef() || 'Direct' };
}
