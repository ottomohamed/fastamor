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

// الحل: استخدام <a> مؤقت بدل window.open لتجاوز Popup Blocker
export function trackClick(url?: string) {
  const current = parseInt(localStorage.getItem('py_clicks') || '0', 10);
  localStorage.setItem('py_clicks', (current + 1).toString());

  if (url) {
    const ref = getActiveRef();
    const finalUrl = ref ? `${url}${url.includes('?') ? '&' : '?'}subid=${encodeURIComponent(ref)}` : url;
    
    // استخدام <a> مؤقت - يتجاوز Popup Blocker دائماً
    const a = document.createElement('a');
    a.href = finalUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
  return { clicks, searches, conversion, activeRef: getActiveRef() || 'Direct' };
}
