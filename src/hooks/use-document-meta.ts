import { useEffect } from 'react';

const SITE = 'https://www.fastamor.com';
const DEFAULT_IMAGE = 'https://i.ibb.co/x8sSqTDj/1978.png';

type Meta = {
  title?: string;
  description?: string;
  image?: string | null;
  path?: string;
  lang?: string;
  type?: 'website' | 'article';
};

function setTag(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

const strip = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** Per-page title, description, Open Graph and canonical tags. */
export function useDocumentMeta({ title, description, image, path, lang, type = 'website' }: Meta) {
  useEffect(() => {
    if (!title) return;
    const fullTitle = title.length <= 50 ? `${title} | Fastamor` : title;
    const desc = strip(description || '').slice(0, 160);
    const url = `${SITE}${path || window.location.pathname}`;
    document.title = fullTitle;
    if (desc) {
      setTag('name', 'description', desc);
      setTag('property', 'og:description', desc);
      setTag('name', 'twitter:description', desc);
    }
    setTag('property', 'og:title', fullTitle);
    setTag('name', 'twitter:title', fullTitle);
    setTag('property', 'og:type', type);
    setTag('property', 'og:url', url);
    setTag('property', 'og:image', image || DEFAULT_IMAGE);
    setTag('name', 'twitter:card', 'summary_large_image');
    setCanonical(url);
    if (lang) document.documentElement.lang = lang;
  }, [title, description, image, path, lang, type]);
}
