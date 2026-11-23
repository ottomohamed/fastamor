// api/car-page.js — "Fastamor Car": car rental comparison hub.
//   /car (English), /ar/car, /fr/car, /es/car
// Server-rendered static page; the rental search forms are Travelpayouts widgets
// (each one renders itself where its <script> tag is placed).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LANGS, isLang, urlFor } from './_lib/i18n.js';

const SITE = 'https://www.fastamor.com';
const IMAGE = 'https://i.ibb.co/x8sSqTDj/1978.png';
const TRS = process.env.TRAVELPAYOUTS_TRS || '514622';
const MARKER = process.env.TRAVELPAYOUTS_MARKER || process.env.TP_MARKER || '709105';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let contentCache = null;
async function getContent() {
  if (contentCache) return contentCache;
  return (contentCache = JSON.parse(await readFile(path.join(process.cwd(), 'api/_data/car.json'), 'utf8')));
}
let templateCache = null;
async function getTemplate(req) {
  if (templateCache) return templateCache;
  try {
    const mod = await import('./_lib/template.generated.js');
    if (mod.default) return (templateCache = mod.default);
  } catch {}
  const r = await fetch(`https://${req.headers.host}/app.html`);
  return (templateCache = await r.text());
}

// Travelpayouts widgets (campaign_id / promo_id from the account's widget builder).
const WL = { en: 'en', ar: 'ar', fr: 'fr', es: 'es' };
const BRAND = { bg: '%2314204A', button: '%23F2A93B' };
const WIDGETS = {
  economy: l => ({ campaign_id: 10, promo_id: 4480, locale: WL[l], powered_by: 'true', border_radius: 12, plain: 'true', show_logo: 'true',
    color_background: BRAND.bg, color_button: BRAND.button, color_text: '%23ffffff', color_input_text: '%23000000', color_button_text: '%2314204A' }),
  qeeq: l => ({ campaign_id: 172, promo_id: 4850, locale: WL[l], powered_by: 'true' }),
  autoeurope: l => ({ campaign_id: 143, promo_id: 4362, locale: WL[l], powered_by: 'true', border_radius: 12, plain: 'true', show_logo: 'true',
    color_background: BRAND.bg, color_button: BRAND.button }),
  getrentacar: l => ({ campaign_id: 222, promo_id: 8813, locale: l === 'en' ? 'en-US' : WL[l], powered_by: 'true' }),
  localrent: l => ({ campaign_id: 87, promo_id: 4322, lang: WL[l], powered_by: 'true', width: 100, background: 'light', logo: 'true', header: 'true', border: 'true', footer: 'true' }),
  bikes: l => ({ campaign_id: 57, promo_id: 5472, locale: WL[l], powered_by: 'true', border_radius: 12, plain: 'true', color_background: '%23ffffff', color_button: '%233550C8' }),
};
function widget(key, lang) {
  const p = WIDGETS[key](lang);
  // Colour values are already URL-encoded (%23 = #); keep them as-is.
  const qs = [`trs=${TRS}`, `shmarker=${MARKER}`, ...Object.entries(p).map(([k, v]) => `${k}=${v}`)].join('&');
  return `<script async src="https://tpemd.com/content?${qs}" charset="utf-8"></script>`;
}

const CSS = `<style>
.fc{font-family:Cairo,Inter,system-ui,sans-serif;color:#14204A;line-height:1.65}
.fc-hero{background:#14204A;color:#fff;padding:52px 20px 120px}
.fc-wrap{max-width:1040px;margin:0 auto}
.fc nav a{color:#c9d3ff;text-decoration:none;font-weight:700;margin-inline-end:14px;font-size:14px}
.fc-brand{display:flex;align-items:baseline;gap:12px;margin:26px 0 8px}
.fc-brand h1{font-size:clamp(2.6rem,7vw,4.8rem);line-height:1;margin:0;font-weight:800;letter-spacing:-.02em}
.fc-plate{display:inline-block;background:#F2A93B;color:#14204A;font-weight:800;border-radius:8px;padding:2px 10px;font-size:14px;transform:translateY(-6px)}
.fc-lead{max-width:640px;font-size:18px;color:rgba(255,255,255,.8);margin:12px 0 0}
.fc-main{max-width:1040px;margin:-84px auto 0;padding:0 20px 72px}
.fc-card{background:#fff;border-radius:22px;box-shadow:0 30px 80px -30px rgba(20,32,74,.45);padding:22px}
.fc-card h2{margin:0 0 4px;font-size:22px;font-weight:800}.fc-note{color:#5b6488;font-size:14px;margin:0 0 16px}
.fc-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.fc-tabs button{border:2px solid #E1E4F0;background:#fff;color:#14204A;border-radius:999px;padding:8px 14px;font:700 14px Cairo,Inter,sans-serif;cursor:pointer}
.fc-tabs button[aria-selected=true]{background:#3550C8;border-color:#3550C8;color:#fff}
.fc-tabs button:focus-visible{outline:3px solid #F2A93B;outline-offset:2px}
.fc-panel{min-height:120px}.fc-panel[hidden]{display:none}
.fc-sec{margin-top:52px}.fc-sec h2{font-size:24px;font-weight:800;margin:0 0 14px}
.fc-air{display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:0;list-style:none}
.fc-air li{border:1px solid #E1E4F0;background:#fff;border-radius:10px;padding:8px 12px;font-weight:700;font-size:14px}
.fc-guide{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px 32px}
.fc-guide h3{margin:0 0 4px;font-size:17px;font-weight:800}.fc-guide p{margin:0;color:#353d5c}
.fc details{border-bottom:1px solid #E1E4F0;padding:12px 0}.fc summary{font-weight:800;cursor:pointer}
.fc details p{margin:8px 0 0;color:#353d5c}
.fc-ask{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:#EEF0F8;border-radius:18px;padding:22px}
.fc-ask p{margin:0;max-width:560px}.fc-btn{background:#F2A93B;color:#14204A;font-weight:800;border-radius:14px;padding:12px 20px;text-decoration:none}
.fc-links{display:flex;flex-wrap:wrap;gap:8px}.fc-links a{border:1px solid #E1E4F0;border-radius:999px;padding:6px 12px;color:#14204A;text-decoration:none;font-size:14px;background:#fff}
.fc-disc{font-size:13px;color:#6b7280;margin-top:36px}
</style>`;

// Localrent is left out: its widget is fixed to Georgia and not relevant for Morocco.
const TAB_ORDER = ['economy', 'qeeq', 'autoeurope', 'getrentacar', 'bikes'];

async function render(lang, template) {
  const all = await getContent();
  const c = all[lang];
  const p = '/car';
  const url = SITE + urlFor(p, lang);
  const routes = ['paris-casablanca', 'paris-nador', 'brussels-nador', 'paris-marrakech', 'paris-agadir', 'barcelona-tangier', 'paris-oujda', 'amsterdam-nador'];
  const routeName = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' → ');

  const tabs =
    `<div class="fc-tabs" role="tablist">` +
    TAB_ORDER.map((k, i) => `<button role="tab" id="t-${k}" aria-controls="p-${k}" aria-selected="${i === 0}" data-k="${k}">${esc(c.providers[k].split(':')[0])}</button>`).join('') +
    `</div>` +
    TAB_ORDER.map((k, i) =>
      `<div class="fc-panel" role="tabpanel" id="p-${k}" aria-labelledby="t-${k}"${i === 0 ? '' : ' hidden'}>` +
      `<p class="fc-note">${esc(c.providers[k])}</p>` +
      // First panel loads immediately; the others load when their tab is opened.
      (i === 0 ? widget(k, lang) : `<template>${widget(k, lang)}</template>`) +
      `</div>`).join('');

  const tabScript = `<script>(function(){var b=document.querySelectorAll('.fc-tabs button');b.forEach(function(x){x.addEventListener('click',function(){b.forEach(function(y){y.setAttribute('aria-selected',y===x);document.getElementById('p-'+y.dataset.k).hidden=y!==x});var p=document.getElementById('p-'+x.dataset.k),t=p.querySelector('template');if(t){var s=document.createElement('script');var src=t.innerHTML.match(/src="([^"]+)"/);if(src){s.async=true;s.src=src[1].replace(/&amp;/g,'&');s.charset='utf-8';p.appendChild(s)}t.remove()}})})})();</script>`;

  const body =
    `<div class="fc">` +
    `<header class="fc-hero"><div class="fc-wrap"><nav><a href="${urlFor('/', lang)}">Fastamor</a><a href="${urlFor('/flights', lang)}">${esc(c.flights)}</a>` +
    LANGS.filter(l => l !== lang).map(l => `<a href="${urlFor(p, l)}" hreflang="${l}">${l.toUpperCase()}</a>`).join('') + `</nav>` +
    `<div class="fc-brand"><h1>${esc(c.h1)}</h1><span class="fc-plate">CAR</span></div><p class="fc-lead">${esc(c.lead)}</p></div></header>` +
    `<main class="fc-main"><section class="fc-card" aria-labelledby="cmp"><h2 id="cmp">${esc(c.compare)}</h2><p class="fc-note">${esc(c.compareNote)}</p>${tabs}</section>` +
    `<section class="fc-sec"><h2>${esc(c.airportsTitle)}</h2><ul class="fc-air">${c.airports.map(a => `<li>${esc(a)}</li>`).join('')}</ul></section>` +
    `<section class="fc-sec"><h2>${esc(c.guideTitle)}</h2><div class="fc-guide">${c.guide.map(([h, t]) => `<div><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('')}</div></section>` +
    `<section class="fc-sec"><div class="fc-ask"><p><strong>${esc(c.assistant)}.</strong> ${esc(c.assistantText)}</p><a class="fc-btn" href="${urlFor('/', lang)}">${esc(c.assistant)}</a></div></section>` +
    `<section class="fc-sec"><h2>FAQ</h2>${c.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>` +
    `<section class="fc-sec"><h2>${esc(c.flights)}</h2><div class="fc-links">${routes.map(s => `<a href="${urlFor(`/flights/${s}`, lang)}">${esc(routeName(s))}</a>`).join('')}</div></section>` +
    `<p class="fc-disc">${esc(c.disclosure)}</p></main></div>` + tabScript;

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fastamor', item: SITE + urlFor('/', lang) },
      { '@type': 'ListItem', position: 2, name: 'Fastamor Car', item: url } ] },
  ];
  const head = [
    `<title>${esc(c.title)}</title>`,
    `<meta name="description" content="${esc(c.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE + urlFor(p, l)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE + p}" />`,
    `<meta property="og:title" content="${esc(c.title)}" />`,
    `<meta property="og:description" content="${esc(c.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:image" content="${IMAGE}" />`,
    ...jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
    CSS,
  ].join('\n    ');

  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:(title|description|type|image)"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<body class="bg-[#FFFDF7] m-0 p-0">', '<body class="m-0 p-0" style="background:#F7F8FC">')
    .replace('<div id="root"></div>', `<div id="root" data-static="1">${body}</div>`);
}

export default async function handler(req, res) {
  const lang = isLang(req.query.lang) ? req.query.lang : 'en';
  try {
    const template = await getTemplate(req);
    const html = await render(lang, template);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (e) {
    console.error('[car-page]', e);
    return res.status(500).send('Error');
  }
}
