// Language-prefixed URLs: English is unprefixed, other languages use /ar, /fr, /es.
export const LANGS = ['en', 'ar', 'fr', 'es'] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(x: unknown): x is Lang {
  return typeof x === 'string' && (LANGS as readonly string[]).includes(x);
}

/** '/article/x' + 'ar' -> '/ar/article/x'; English stays unprefixed. */
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Language implied by the current URL. */
export function langFromPath(pathname: string): Lang {
  const seg = pathname.split('/')[1];
  return isLang(seg) && seg !== 'en' ? seg : 'en';
}
