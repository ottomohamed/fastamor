// api/route-page.js — server-rendered flight route landing pages:
//   /flights/:route           (English)   e.g. /flights/paris-casablanca
//   /:lang/flights/:route     (ar|fr|es)
//   /flights, /:lang/flights  (route hub)
// Editorial text comes from api/_data/routes.json; fares come live from the
// Travelpayouts (Aviasales) data API and are cached at the edge.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LANGS, isLang, urlFor } from './_lib/i18n.js';

const SITE = 'https://www.fastamor.com';
const DEFAULT_IMAGE = 'https://i.ibb.co/x8sSqTDj/1978.png';
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.TRAVELPAYOUTS_MARKER || process.env.TP_MARKER || '709105';
const FARE_TTL_MS = 6 * 60 * 60 * 1000;

let routesCache = null;
async function getRoutes() {
  if (routesCache) return routesCache;
  try {
    const raw = await readFile(path.join(process.cwd(), 'api/_data/routes.json'), 'utf8');
    return (routesCache = JSON.parse(raw));
  } catch {
    return {};
  }
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

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- fares ----------
const fareCache = new Map();
async function tp(params) {
  if (!TOKEN) return [];
  const qs = new URLSearchParams({ currency: 'eur', sorting: 'price', one_way: 'true', limit: '30', ...params, token: TOKEN });
  try {
    const r = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`);
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j.data) ? j.data : [];
  } catch {
    return [];
  }
}
function nextMonths(n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i, 1));
    out.push(m.toISOString().slice(0, 7));
  }
  return out;
}
async function getFares(origin, destination) {
  const key = `${origin}-${destination}`;
  const hit = fareCache.get(key);
  if (hit && Date.now() - hit.at < FARE_TTL_MS) return hit.data;
  const months = nextMonths(6);
  const [cheapest, ...perMonth] = await Promise.all([
    tp({ origin, destination, limit: '10' }),
    ...months.map(m => tp({ origin, destination, departure_at: m, limit: '1' })),
  ]);
  const data = {
    fetchedAt: new Date().toISOString(),
    cheapest: cheapest.filter(f => f.price && f.departure_at).slice(0, 8),
    byMonth: months.map((m, i) => ({ month: m, fare: perMonth[i][0] || null })),
  };
  fareCache.set(key, { at: Date.now(), data });
  return data;
}

const bookUrl = (f, o, d) =>
  f?.link ? `https://www.aviasales.com${f.link}${f.link.includes('?') ? '&' : '?'}marker=${MARKER}` : `https://www.aviasales.com/search/${o}${d}1?marker=${MARKER}`;

// ---------- i18n ----------
const T = {
  en: { car: 'Rent a car on arrival', carText: 'Compare car rental at the destination airport with Fastamor Car.', fares: 'Latest fares found', date: 'Departure', airline: 'Airline', stops: 'Stops', price: 'From', direct: 'Direct', book: 'See deal',
        months: 'Cheapest fare by month', none: 'No fares found for this month', tips: 'Practical tips', faq: 'Frequently asked questions',
        cta: 'Search flights', note: 'Fares are the lowest one-way prices found by Aviasales users in the last days, in EUR. They change often and are not guaranteed.',
        updated: 'Updated', hub: 'Flights to Morocco: route guides', hubDesc: 'Route guides with the latest fares for flights between Europe and Morocco.',
        ask: 'Plan this trip with the Fastamor AI assistant', home: 'Home', routes: 'Flight routes', other: 'Other routes' },
  ar: { car: 'اكترِ سيارة عند الوصول', carText: 'قارن أسعار كراء السيارات في مطار الوصول مع فاستامور كار.', fares: 'أحدث الأسعار التي وُجدت', date: 'تاريخ المغادرة', airline: 'شركة الطيران', stops: 'التوقفات', price: 'ابتداءً من', direct: 'مباشرة', book: 'عرض الرحلة',
        months: 'أرخص سعر حسب الشهر', none: 'لا توجد أسعار لهذا الشهر', tips: 'نصائح عملية', faq: 'الأسئلة الشائعة',
        cta: 'ابحث عن رحلات', note: 'الأسعار هي أقل أسعار الذهاب فقط التي وجدها مستخدمو Aviasales في الأيام الأخيرة باليورو، وهي تتغير باستمرار وغير مضمونة.',
        updated: 'آخر تحديث', hub: 'رحلات إلى المغرب: أدلة الخطوط', hubDesc: 'أدلة خطوط الطيران بين أوروبا والمغرب مع أحدث الأسعار.',
        ask: 'خطط لهذه الرحلة مع مساعد فاستامور الذكي', home: 'الرئيسية', routes: 'خطوط الطيران', other: 'خطوط أخرى' },
  fr: { car: 'Louer une voiture à l’arrivée', carText: 'Comparez la location de voiture à l’aéroport d’arrivée avec Fastamor Car.', fares: 'Derniers prix trouvés', date: 'Départ', airline: 'Compagnie', stops: 'Escales', price: 'À partir de', direct: 'Direct', book: 'Voir l’offre',
        months: 'Prix le plus bas par mois', none: 'Aucun prix trouvé pour ce mois', tips: 'Conseils pratiques', faq: 'Questions fréquentes',
        cta: 'Rechercher des vols', note: 'Prix aller simple les plus bas trouvés par les utilisateurs d’Aviasales ces derniers jours, en EUR. Ils changent souvent et ne sont pas garantis.',
        updated: 'Mis à jour', hub: 'Vols vers le Maroc : guides des lignes', hubDesc: 'Guides des lignes aériennes entre l’Europe et le Maroc avec les derniers prix.',
        ask: 'Préparez ce voyage avec l’assistant IA Fastamor', home: 'Accueil', routes: 'Lignes aériennes', other: 'Autres lignes' },
  es: { car: 'Alquila un coche al llegar', carText: 'Compara el alquiler de coches en el aeropuerto de llegada con Fastamor Car.', fares: 'Últimas tarifas encontradas', date: 'Salida', airline: 'Aerolínea', stops: 'Escalas', price: 'Desde', direct: 'Directo', book: 'Ver oferta',
        months: 'Tarifa más baja por mes', none: 'No hay tarifas para este mes', tips: 'Consejos prácticos', faq: 'Preguntas frecuentes',
        cta: 'Buscar vuelos', note: 'Tarifas de solo ida más bajas encontradas por usuarios de Aviasales en los últimos días, en EUR. Cambian a menudo y no están garantizadas.',
        updated: 'Actualizado', hub: 'Vuelos a Marruecos: guías de rutas', hubDesc: 'Guías de rutas entre Europa y Marruecos con las últimas tarifas.',
        ask: 'Planifica este viaje con el asistente IA de Fastamor', home: 'Inicio', routes: 'Rutas de vuelo', other: 'Otras rutas' },
};
const AIRLINES = { AT: 'Royal Air Maroc', '3O': 'Air Arabia Maroc', TO: 'Transavia France', HV: 'Transavia', FR: 'Ryanair', U2: 'easyJet', EC: 'easyJet Europe',
  VY: 'Vueling', IB: 'Iberia', I2: 'Iberia Express', UX: 'Air Europa', V7: 'Volotea', AF: 'Air France', KL: 'KLM', SN: 'Brussels Airlines', TB: 'TUI fly Belgium',
  OR: 'TUI fly Netherlands', X3: 'TUI fly', EW: 'Eurowings', LH: 'Lufthansa', W6: 'Wizz Air', W4: 'Wizz Air Malta', BJ: 'Nouvelair', TU: 'Tunisair', AH: 'Air Algérie',
  TP: 'TAP Air Portugal', AZ: 'ITA Airways', LX: 'Swiss', TK: 'Turkish Airlines', PC: 'Pegasus', BY: 'TUI Airways', LS: 'Jet2', DY: 'Norwegian' };
const airline = c => AIRLINES[c] || c || '';
const LOCALE = { en: 'en-GB', ar: 'ar-MA', fr: 'fr-FR', es: 'es-ES' };
const fmtDate = (iso, lang) => { try { return new Date(iso).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso.slice(0, 10); } };
const fmtMonth = (ym, lang) => { try { return new Date(`${ym}-01T00:00:00Z`).toLocaleDateString(LOCALE[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch { return ym; } };
const eur = (n, lang) => { try { return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n); } catch { return `${n} €`; } };

const CSS = `<style>
.rp{max-width:860px;margin:0 auto;padding:24px 18px 64px;font-family:Inter,Cairo,system-ui,sans-serif;color:#1b1c19;line-height:1.65}
.rp nav{font-size:14px;margin-bottom:18px}.rp nav a{color:#00685f;text-decoration:none;margin-inline-end:10px}
.rp h1{font-size:30px;line-height:1.25;margin:8px 0 12px;font-weight:900}.rp h2{font-size:21px;margin:34px 0 12px;font-weight:800}
.rp p{margin:0 0 12px}.rp table{width:100%;border-collapse:collapse;font-size:15px;background:#fff;border-radius:12px;overflow:hidden}
.rp th,.rp td{padding:10px 12px;border-bottom:1px solid #eee;text-align:start}.rp th{background:#f5f2e9;font-weight:700}
.rp .cta{display:inline-block;background:#0d9488;color:#fff;padding:12px 22px;border-radius:999px;font-weight:800;text-decoration:none;margin:6px 0}
.rp .btn{color:#0d9488;font-weight:700;text-decoration:none}.rp .note{font-size:13px;color:#6b7280}
.rp ul{padding-inline-start:20px}.rp details{background:#fff;border:1px solid #eee;border-radius:10px;padding:10px 14px;margin:8px 0}
.rp summary{font-weight:700;cursor:pointer}.rp .grid{display:flex;flex-wrap:wrap;gap:8px}.rp .grid a{background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:6px 12px;text-decoration:none;color:#1b1c19;font-size:14px}
</style>`;

function shell(template, { lang, title, description, url, alternates, jsonLd, body, robots }) {
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    ...(alternates || []).map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`),
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:image" content="${DEFAULT_IMAGE}" />`,
    robots ? `<meta name="robots" content="${robots}" />` : '',
    ...(jsonLd || []).map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
    CSS,
  ].join('\n    ');
  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:(title|description|type|image)"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root" data-static="1">${body}</div>`);
}

const routeLangs = r => LANGS.filter(l => r.content?.[l]?.title && (r.content[l].intro || []).join(' ').length > 400);
const alts = (p, langs) => [
  ...langs.map(l => ({ hreflang: l, href: SITE + urlFor(p, l) })),
  { hreflang: 'x-default', href: SITE + urlFor(p, langs.includes('en') ? 'en' : langs[0]) },
];

async function routePage(slug, lang, template) {
  const routes = await getRoutes();
  const r = routes[slug];
  if (!r) return null;
  const langs = routeLangs(r);
  if (!langs.length) return null;
  const p = `/flights/${slug}`;
  if (!langs.includes(lang)) return { redirect: urlFor(p, langs.includes('en') ? 'en' : langs[0]) };

  const t = T[lang];
  const c = r.content[lang];
  const o = r.origin, d = r.destination;
  const fares = await getFares(o, d);
  const hasFares = fares.cheapest.length > 0;
  const url = SITE + urlFor(p, lang);
  const searchUrl = bookUrl(null, o, d);

  const faresTable = hasFares
    ? `<table><thead><tr><th>${t.date}</th><th>${t.airline}</th><th>${t.stops}</th><th>${t.price}</th><th></th></tr></thead><tbody>` +
      fares.cheapest.map(f =>
        `<tr><td>${esc(fmtDate(f.departure_at, lang))}</td><td>${esc(airline(f.airline))}</td><td>${f.transfers ? esc(f.transfers) : t.direct}</td>` +
        `<td><strong>${esc(eur(f.price, lang))}</strong></td><td><a class="btn" rel="nofollow sponsored noopener" target="_blank" href="${esc(bookUrl(f, o, d))}">${t.book}</a></td></tr>`
      ).join('') + `</tbody></table>`
    : '';
  const monthRows = fares.byMonth.filter(m => m.fare);
  const monthsTable = monthRows.length
    ? `<table><tbody>` + fares.byMonth.map(m =>
        `<tr><td>${esc(fmtMonth(m.month, lang))}</td><td>${m.fare ? `<strong>${esc(eur(m.fare.price, lang))}</strong>` : `<span class="note">${t.none}</span>`}</td>` +
        `<td>${m.fare ? `<a class="btn" rel="nofollow sponsored noopener" target="_blank" href="${esc(bookUrl(m.fare, o, d))}">${t.book}</a>` : ''}</td></tr>`).join('') + `</tbody></table>`
    : '';

  const others = Object.entries(routes).filter(([s, x]) => s !== slug && routeLangs(x).includes(lang)).slice(0, 12);

  const body =
    `<div class="rp"><nav><a href="${urlFor('/', lang)}">Fastamor</a><a href="${urlFor('/flights', lang)}">${t.routes}</a>` +
    LANGS.filter(l => l !== lang && langs.includes(l)).map(l => `<a href="${urlFor(p, l)}" hreflang="${l}">${l.toUpperCase()}</a>`).join('') + `</nav>` +
    `<h1>${esc(c.title)}</h1>` + c.intro.map(x => `<p>${esc(x)}</p>`).join('') +
    `<p><a class="cta" rel="nofollow sponsored noopener" target="_blank" href="${esc(searchUrl)}">${t.cta} ${esc(r.originName[lang] || r.originName.en)} → ${esc(r.destinationName[lang] || r.destinationName.en)}</a></p>` +
    (hasFares ? `<h2>${t.fares}</h2>${faresTable}<p class="note">${t.note} ${t.updated}: ${esc(fmtDate(fares.fetchedAt, lang))}</p>` : '') +
    (monthsTable ? `<h2>${t.months}</h2>${monthsTable}` : '') +
    `<h2>${t.car}</h2><p>${t.carText}</p><p><a class="cta" href="${urlFor('/car', lang)}">Fastamor Car</a></p>` +
    (c.tips?.length ? `<h2>${t.tips}</h2><ul>${c.tips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '') +
    (c.faq?.length ? `<h2>${t.faq}</h2>${c.faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}` : '') +
    `<p><a class="cta" href="${urlFor('/', lang)}">${t.ask}</a></p>` +
    (others.length ? `<h2>${t.other}</h2><div class="grid">${others.map(([s, x]) => `<a href="${urlFor(`/flights/${s}`, lang)}">${esc(x.originName[lang] || x.originName.en)} → ${esc(x.destinationName[lang] || x.destinationName.en)}</a>`).join('')}</div>` : '') +
    `</div>`;

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fastamor', item: SITE + urlFor('/', lang) },
      { '@type': 'ListItem', position: 2, name: t.routes, item: SITE + urlFor('/flights', lang) },
      { '@type': 'ListItem', position: 3, name: c.title, item: url } ] },
    ...(c.faq?.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: c.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ];

  return {
    html: shell(template, {
      lang, title: c.title, description: c.description, url, alternates: alts(p, langs), jsonLd, body,
      // Without live fares the page is thin: keep it out of the index until data returns.
      robots: hasFares ? '' : 'noindex, follow',
    }),
  };
}

async function hubPage(lang, template) {
  const routes = await getRoutes();
  const t = T[lang];
  const list = Object.entries(routes).filter(([, r]) => routeLangs(r).includes(lang));
  const url = SITE + urlFor('/flights', lang);
  const body =
    `<div class="rp"><nav><a href="${urlFor('/', lang)}">Fastamor</a>` +
    LANGS.filter(l => l !== lang).map(l => `<a href="${urlFor('/flights', l)}" hreflang="${l}">${l.toUpperCase()}</a>`).join('') + `</nav>` +
    `<h1>${esc(t.hub)}</h1><p>${esc(t.hubDesc)}</p><div class="grid">` +
    list.map(([s, r]) => `<a href="${urlFor(`/flights/${s}`, lang)}">${esc(r.originName[lang] || r.originName.en)} → ${esc(r.destinationName[lang] || r.destinationName.en)}</a>`).join('') +
    `</div></div>`;
  return { html: shell(template, { lang, title: `${t.hub} | Fastamor`, description: t.hubDesc, url, alternates: alts('/flights', LANGS), body }) };
}

export default async function handler(req, res) {
  const lang = isLang(req.query.lang) ? req.query.lang : 'en';
  const slug = String(req.query.route || '').toLowerCase().slice(0, 80);
  let template;
  try { template = await getTemplate(req); } catch { return res.status(500).send('Template unavailable'); }

  const page = slug ? await routePage(slug, lang, template) : await hubPage(lang, template);
  if (page?.redirect) {
    res.setHeader('Location', page.redirect);
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(301).end();
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!page) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(404).send(template.replace('</head>', '<meta name="robots" content="noindex" /></head>')
      .replace('<div id="root"></div>', `<div id="root"><main style="padding:40px;font-family:system-ui"><h1>404</h1><p><a href="${urlFor('/flights', lang)}">${T[lang].routes}</a></p></main></div>`));
  }
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).send(page.html);
}

export { getRoutes, routeLangs };
