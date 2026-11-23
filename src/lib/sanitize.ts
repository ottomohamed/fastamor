import DOMPurify from 'dompurify';

/** Sanitize CMS HTML before rendering with dangerouslySetInnerHTML. */
export function safeHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html || '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
  });
}
