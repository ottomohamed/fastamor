// Shared language helpers for server-rendered pages and the sitemap.
export const LANGS = ['en', 'ar', 'fr', 'es'];
export const MIN_BODY = 1500; // chars: below this a language version is too thin to publish
export const isLang = l => LANGS.includes(l);
export const urlFor = (p, lang) => (lang === 'en' ? p : p === '/' ? `/${lang}` : `/${lang}${p}`);
export function articleLangs(a) {
  return LANGS.filter(l => (a[`body_${l}`] || '').length >= MIN_BODY && a[`title_${l}`]);
}
export function destinationLangs(d) {
  return ['en', 'ar'].filter(l => d[`name_${l}`] && d[`description_${l}`]);
}

