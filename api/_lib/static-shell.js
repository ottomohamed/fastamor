// Turns the SPA template into a lean shell for fully server-rendered pages
// (/car, /flights/*): React never starts there, so the app bundle, its CSS and the
// Drive loader are dead weight. Keeps the self-hosted Cairo font.
export function staticShell(template) {
  return template
    .replace(/<script type="module"[^>]*><\/script>\s*/g, '')
    .replace(/<link rel="modulepreload"[^>]*>\s*/g, '')
    .replace(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]*"[^>]*>\s*/g, '')
    .replace(/<script>\s*\/\/ Travelpayouts Drive[\s\S]*?<\/script>\s*/g, '');
}
