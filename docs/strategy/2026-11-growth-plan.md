# Fastamor: 6-month SEO and acquisition plan (Dec 2026 to May 2027)

Written 23 Nov 2026. Starting point: 0 clicks, 12 impressions and 2 indexed pages in Google Search Console over the last 3 months. There are 27 short articles and 22 destination pages.

**How to read this:**
- I have no search-volume data from a keyword tool. Demand is described qualitatively, based on the shape of the SERPs I checked and on cited market facts. Before building anything, check every topic in Google Search Console, Google Keyword Planner or Ahrefs/Semrush. Then reorder by real data.
- "Competition" is my judgement from the live SERP (who ranks, how strong they are, how editorial the results are). It is not a tool score.
- Facts about routes, visas and ferries change often. Every claim below links to its source. Check it again before it goes on a page.

---

## 0. Why the audience bet is sound (and the timing that matters)

- **Diaspora flows are large and seasonal.** Marhaba 2026 (10 June to 15 September) handled [4,137,594 Moroccans living abroad (MRE), +1.8% on 2025](https://fr.le360.ma/societe/marhaba-2026-plus-de-41-millions-de-mre-accueillis_PHLNCNXZWFG3DMJEWYOQBNIMNA/). Peak days saw nearly 80,000 arrivals and over 87,000 departures. The Marhaba set-up covered Tanger Ville, Tanger Med, Nador and Al Hoceima, plus European ports including Algeciras, Motril, Almería, Sète, Marseille and Genoa. In 2025, [3.2 million travellers and 739,000 vehicles passed through Moroccan ports](https://fr.hespress.com/444468-444468.html) during Marhaba, so the sea route is a mass-market product.
- **Diaspora size in the main source markets.** INSEE counted [about 902,300 Moroccan nationals in France in 2024, the second-largest immigrant group](https://h24info.ma/?p=952821). [Spain has more than 820,000 Moroccans](https://snrtnews.com/fr/article/lespagne-compte-plus-de-823000-marocains). There are also large communities in Belgium, the Netherlands and Italy ([Bladi on Belgium](https://www.bladi.net/marocains-belgique-seulement-etrangers,122376.html), [Italian Labour Ministry report 2025](https://lavoro.gov.it/documenti-e-norme/studi-e-statistiche/la-communaute-marocaine-en-italie-2025)).
- **Inbound tourism is at a record.** Morocco had [about 19.8 million visitors in 2025, +14%](https://www.moroccoworldnews.com/2026/01/274018/new-record-morocco-welcomes-nearly-20-million-tourists-in-2025/).
- **New routes create fresh, low-competition queries.** Examples:
  - Ryanair announced [17 new winter 2026 routes from Rabat (7), Marrakech (5) and Agadir (5)](https://fr.le360.ma/economie/ryanair-renforce-son-programme-hivernal-au-maroc-avec-17-nouvelles-lignes_GRFSDUS75NBQXJSZN2P5XRWAEM/).
  - Royal Air Maroc added [Casablanca–Lille, Bilbao, Alicante, Palma and Verona in 2026](https://www.moroccoworldnews.com/2025/12/271882/royal-air-maroc-announces-new-direct-routes-to-europe-africa-and-the-americas-in-2026/).
  - RAM also opened [Barcelona, Madrid and Frankfurt from Tangier and Nador in July 2026](https://ulysse.com/news/?p=47849).
  - Transavia flies [Paris-Orly–Dakhla 3x weekly and Orly–Ouarzazate 3x weekly](https://www.air-journal.fr/2026-07-21-transavia-muscle-ses-lignes-paris-ouarzazate-et-paris-dakhla-5276401.html).
- **The calendar for this plan:**
  - Dec to early Jan: Christmas and winter-sun demand (Canaries, Marrakech, Agadir, Dakhla).
  - Feb to Mar 2027: Ramadan and Umrah. Ramadan 2027 is expected to start around 8 Feb (astronomical estimate; the date depends on moon sighting).
  - Late Mar: Easter and Semana Santa. Easter Sunday 2027 is 28 March.
  - **Mar to May: people research and book summer trips home (flights and ferries).** This is the window that pays off, so ferry and diaspora route pages must be indexed by early March.

---

## 1. Fix this first: technical blockers in the current codebase (weeks 1 to 3)

The low indexation is very likely mostly technical, not a content problem. From the repo:

| Problem | Evidence in the repo | Fix |
|---|---|---|
| **No language URLs.** fr and es content cannot be indexed at all. Each article or destination has one URL, and `render.js` serves only `en`, falling back to `ar`. | `src/pages/FastamorMain.tsx` holds `lang` in React state. `api/render.js` uses `const lang = a.body_en ? 'en' : 'ar'`. | Add the `/{lang}/...` prefix for every indexable page (see section 3). Server-render each language version. Add a self-referencing canonical per language. |
| **The homepage is an empty SPA shell for crawlers.** | `index.html` has `<div id="root"></div>`. The `/((?!api/).*)` rewrite sends every non-listed URL to the shell. | Server-render `/`, `/{lang}/` and every new template through `api/render.js` (or prerender at build time). Return a real 404 for unknown paths instead of a 200 shell. |
| **The hreflang is incomplete.** There is an `x-default` with no language alternates, and it is the same on every page through the template. | `index.html`: `<link rel="alternate" hreflang="x-default" href="https://www.fastamor.com/">` | Remove it from the static template. Generate the full sets per page (section 3.5). |
| **The sitemap has no language alternates or route pages.** | `api/sitemap.js` | Split into sitemap index → `sitemap-{lang}.xml`. Add `xhtml:link` alternates. Include only pages that pass the quality gate (section 3.4). |
| **Duplicate destinations** | dubai / dubai-uae, paris / france-paris | 301 redirects (section 4). |

Also do these, all free:
- Verify the domain property in GSC and submit the sitemap index.
- Add Bing Webmaster Tools and IndexNow.
- Use URL Inspection → "Request indexing" for the roughly 20 most important new URLs each week.
- Link every new page from at least one hub page that is already indexed. Orphan pages on a new domain often stay "Discovered – currently not indexed".

Audit the 27 short articles. Merge the thin ones into the route and guide pages below, with 301 redirects, rather than keeping 27 weak URLs.

---

## 2. Target topics (44, ranked by priority)

**Legend:**
- **P1** = build in months 1 to 3. **P2** = months 3 to 6.
- **Competition**: Low / Med / High, with the reason.
- **Converts to**: the Travelpayouts product (Aviasales flights, hotels, tours/activities, transfers, eSIM, insurance). Check in your Travelpayouts dashboard that each brand is active for your account.
- **Ferries need a separate program.** Travelpayouts' [API/data-feed brand list shows no ferry brand](https://support.travelpayouts.com/hc/en-us/articles/20384016664594-Brands-that-provide-access-to-APIs-and-data-feeds-for-Travelpayouts-partners). Ferryscanner runs its [own affiliate program (Tapfiliate, revenue share "up to 63%", 30-day cookie)](https://www.ferryscanner.com/en/affiliate-program). Direct Ferries has an [agent program](https://directferries.com/affiliate.htm). The repo already has `src/lib/ferryBooking.ts` and `ferryPorts.ts`, so wire the ferry pages to one of these programs.

### A. Diaspora and tourist flights Europe → Morocco (French)

The main SERP (`vol pas cher Paris Marrakech`) is held by [easyJet](https://www.easyjet.com/fr/vols-pas-chers/marrakech/paris-charles-de-gaulle), [TAP](https://www.flytap.com/fr_fr/vols-de-paris-a-marrakech), [Kayak](https://www.kayak.fr/vols/Paris-PAR/Marrakech-RAK), [momondo](https://www.momondo.fr/vols/paris/marrakech), [liligo](https://www.liligo.fr/vols/itineraires/paris/marrakech), [Jetcost](https://www.jetcost.com/vols/paris/marrakech/PAR-RAK), [lastminute](https://www.fr.lastminute.com/vol/paris-marrakech) and [Bourse des Vols](https://www.bourse-des-vols.com/depart-paris/maroc/vol-paris-marrakech.php). Do not expect to rank for the head terms within 6 months. Build these pages anyway as hubs, and aim at their long tail (direct flights, a specific airport, a specific month, a diaspora need).

| # | Pri | Lang | Target query | Intent | Competition | Page type | Converts to |
|---|---|---|---|---|---|---|---|
| 1 | P1 | fr | vol pas cher Paris Marrakech (+ "vol direct Orly Marrakech", "Paris Marrakech en mars") | Transactional | **High.** Airlines and big metasearch engines hold the SERP (see above). | Route page | Aviasales |
| 2 | P1 | fr | vol Paris Casablanca pas cher / vol direct | Transactional | **High.** RAM, OTAs and metasearch. | Route page | Aviasales |
| 3 | P1 | fr | vol Paris Agadir | Transactional | **Med-High.** Same players, but fewer editorial pages. | Route page | Aviasales + hotels |
| 4 | P1 | fr | vol Paris Tanger | Transactional | **Med.** Diaspora-heavy; tourist OTAs put less work into it. | Route page | Aviasales |
| 5 | P1 | fr | vol Paris Nador / vol Paris Oujda | Transactional | **Med-Low.** Almost only diaspora demand (Rif, Oriental). Mostly templated OTA pages with no local know-how. | Route page | Aviasales |
| 6 | P1 | fr | vol direct Paris Dakhla | Transactional | **Low-Med.** Niche. Orly–Dakhla is 3x weekly ([Air Journal](https://www.air-journal.fr/2026-07-21-transavia-muscle-ses-lignes-paris-ouarzazate-et-paris-dakhla-5276401.html)). | Route page + kitesurf guide | Aviasales + hotels |
| 7 | P1 | fr | vol Paris Ouarzazate | Transactional | **Low-Med.** Small route that links to desert-trip intent. | Route page | Aviasales + desert tours |
| 8 | P1 | fr | vol Lille Casablanca | Transactional | **Low.** New RAM route in July 2026 ([MWN](https://www.moroccoworldnews.com/2025/12/271882/royal-air-maroc-announces-new-direct-routes-to-europe-africa-and-the-americas-in-2026/)), so few pages exist yet. | Route page | Aviasales |
| 9 | P2 | fr | vol Bruxelles Nador / Bruxelles Tanger | Transactional | **Med.** Belgian diaspora; Belgian OTAs compete. | Route page | Aviasales |
| 10 | P2 | fr | vol Marseille Oujda / Lyon Marrakech | Transactional | **Med-Low.** Regional French airports are less contested. | Route page | Aviasales |
| 11 | P1 | fr | quand acheter billet Maroc moins cher / meilleur mois vol Maroc | Commercial research | **Med.** Mostly generic tips. **Original monthly price data from the Aviasales Data API is a real differentiator.** | Data guide (monthly price chart per route) | Aviasales |
| 12 | P2 | fr | franchise bagage vol Maroc (RAM, Ryanair, Transavia, Air Arabia) | Informational | **Med.** Airline help pages and bloggers. A comparison table across airlines adds value. | Guide | Aviasales |

### B. Spain ↔ Morocco flights (Spanish and Arabic)

| # | Pri | Lang | Target query | Intent | Competition | Page type | Converts to |
|---|---|---|---|---|---|---|---|
| 13 | P1 | es | vuelos baratos Madrid Tánger | Transactional | **Med-High.** Metasearch engines and airlines. | Route page | Aviasales |
| 14 | P1 | es | vuelos Barcelona Nador / Barcelona Tánger | Transactional | **Med-Low.** RAM added Tangier and Nador to Barcelona and Madrid in July 2026 ([Ulysse](https://ulysse.com/news/?p=47849)). | Route page | Aviasales |
| 15 | P1 | es | vuelos Madrid Dakhla | Transactional | **Low.** Ryanair opened Madrid and Lanzarote to Dakhla ([Le Matin](https://lematin.ma/economie/ryanair-lance-deux-nouvelles-liaisons-directes-dakhla-madrid-et-lanzarote/251221)). | Route page | Aviasales + hotels |
| 16 | P2 | es | vuelos Bilbao Casablanca / Alicante Casablanca / Palma Casablanca | Transactional | **Low.** New RAM 2026 routes. | Route page | Aviasales |
| 17 | P1 | ar | رحلات رخيصة من مدريد إلى طنجة | Transactional | **Med.** The SERP is mostly airline brand pages ([Air Arabia](https://flights.airarabia.com/ar/flights-from-madrid-to-tangier), [RAM](https://www.royalairmaroc.com/ar/رحلات-من-إلى-طنجة-مدريد), [Trip.com](https://sa.trip.com/flights/airport-mad-tng/)). There is almost no independent Arabic editorial content. | Route page (ar) | Aviasales |

### C. Arabic diaspora route queries

The Arabic SERP for `رحلات رخيصة من باريس إلى الدار البيضاء` is almost entirely [RAM](https://www.royalairmaroc.com/ar/رحلات-من-إلى-الدار-البيضاء-فرنسا) and [Air Arabia](https://flights.airarabia.com/ar-ma/flights-to-france) brand pages. **This is the most winnable gap in the plan.** Good Arabic route pages from a neutral comparison site face few editorial competitors.

| # | Pri | Lang | Target query | Intent | Competition | Page type | Converts to |
|---|---|---|---|---|---|---|---|
| 18 | P1 | ar | رحلات رخيصة من باريس إلى الدار البيضاء | Transactional | **Med.** Brand pages only (see above). | Route page | Aviasales |
| 19 | P1 | ar | رحلات من باريس إلى مراكش / أكادير / طنجة | Transactional | **Med.** Same SERP pattern. | Route pages | Aviasales |
| 20 | P1 | ar | رحلات من بروكسل إلى الناظور | Transactional | **Low-Med.** | Route page | Aviasales |
| 21 | P2 | ar | أرخص وقت لشراء تذاكر الطيران إلى المغرب في الصيف | Commercial research | **Low-Med.** | Data guide | Aviasales |

### D. Ferries Spain/France ↔ Morocco (the Marhaba cluster)

The ferry SERPs are held by ferry OTAs ([AFerry](https://www.aferry.com/fr-fr/tarifa-tangier/), [Ferryscanner](https://www.ferryscanner.com/fr/lignes-et-billets-de-ferry/ferry-tanger-tous-les-ports-tarifa), [Netferry](https://fr.netferry.com/ferry/de/tarifa/tanger-ville), [OpenFerry](https://openferry.com/ar/routes/algeciras-tangier-ville)) and by the operators ([Baleària](https://www.balearia.com/fr/routes-horaires/bateau-tarifa-tanger-ville), [DFDS](https://www.dfds.com/en-gb/passenger-ferries/ferry-crossings/spain-morocco/algeciras-tanger-med)).

Fastamor's angle is to be the **trip planner for the whole journey home by car**: drive, port choice, ferry, overnight stops, Marhaba services. That is something OTAs do not offer. Example fact to use: on Algeciras–Tanger Med, Baleària ran 8 daily crossings in summer 2026, and on Tarifa–Tanger Ville 5 daily fast-ferry rotations. Indicative family-plus-car prices were about €434 and €525 ([AFerry](https://www.aferry.com/en-gb/ferry-deals/nypmtm/balearia-2026-morocco-routes-open/)).

| # | Pri | Lang | Target query | Intent | Competition | Page type | Converts to |
|---|---|---|---|---|---|---|---|
| 22 | P1 | fr | ferry Algeciras Tanger Med prix voiture | Transactional | **Med-High.** Ferry OTAs and operators. | Ferry route page | Ferry affiliate + hotels in Algeciras |
| 23 | P1 | es | ferry Tarifa Tánger horarios y precios | Transactional | **High.** Operators rank well in Spanish. | Ferry route page | Ferry affiliate |
| 24 | P1 | ar | باخرة الجزيرة الخضراء طنجة المتوسط ثمن التذكرة | Transactional | **Med.** Few native Arabic pages ([OpenFerry ar](https://openferry.com/ar/routes/algeciras-tangier-ville) is translated). | Ferry route page | Ferry affiliate |
| 25 | P1 | fr + ar | Opération Marhaba 2027 : dates, conseils, ports | Informational | **Med.** News sites cover the daily figures. An **evergreen, yearly-updated checklist on one stable URL** is less common. | Guide (same URL each year) | Ferry + hotels + insurance |
| 26 | P1 | fr | voiture ou avion pour aller au Maroc l'été (coût famille) | Comparison | **Low-Med.** Mostly forum threads. A calculator is linkable. | Interactive guide | Aviasales + ferry |
| 27 | P2 | fr | ferry Sète Tanger Med / Marseille Tanger Med | Transactional | **Med.** | Ferry route page | Ferry affiliate |
| 28 | P2 | es | ferry Almería Nador / Motril Tánger Med | Transactional | **Med-Low.** | Ferry route page | Ferry affiliate |
| 29 | P2 | fr | route Paris → Algésiras en voiture : étapes, péages, hôtels | Planning | **Low-Med.** Forums and blogs. | Guide | Hotels (stopovers) |

### E. Domestic Morocco

Sensitivity note for Dakhla: [the EU-Morocco air agreement excludes Western Sahara, and the topic is politically contested](https://www.afrik.com/sahara-occidental-exclus-de-l-accord-aerien-ue-maroc-les-vols-vers-dakhla-prosperent-en-marge-du-droit-europeen). Keep the pages strictly practical (flights, kitesurf, hotels) and neutral in tone.

| # | Pri | Lang | Target query | Intent | Competition | Page type | Converts to |
|---|---|---|---|---|---|---|---|
| 30 | P1 | fr + en | comment aller à Merzouga depuis Marrakech / Fès | Informational | **Med.** [Rome2rio](https://www.rome2rio.com/s/Marrakesh/Merzouga) plus tour-operator blogs. | Guide | Desert tours + transfers |
| 31 | P2 | en | Marrakech to Merzouga 3-day desert tour | Transactional | **High.** Tour operators, Viator and GetYourGuide. | Guide + tours widget | Tours |
| 32 | P1 | fr + en | how to get to Chefchaouen from Tangier / Fès (bus CTM) | Informational | **Med.** Rome2rio and [Omio (sells CTM)](https://www.omio.fr/bus/tanger/chefchaouen-9id99). | Guide | Omio buses (in Travelpayouts) + hotels |
| 33 | P1 | fr + es | que faire à Dakhla / kitesurf Dakhla hébergement | Commercial research | **Med.** Kite schools and camps. | Destination page (existing `dakhla`) | Hotels + flights |
| 34 | P1 | en + fr | Marrakech airport to medina taxi price / transfer | Transactional | **Med.** Transfer companies and forums. | Guide | Transfers |
| 35 | P2 | fr + en | eSIM Maroc / carte SIM aéroport Marrakech | Transactional | **Med-High.** [Airalo](https://www.airalo.com/fr/blog/ou-acheter-une-carte-sim-marrakech) and Holafly publish a lot of content. | Guide | eSIM (if active in Travelpayouts) |
| 36 | P2 | fr | vols directs depuis Rabat / Nador / Oujda (airport hub pages) | Navigational / research | **Low-Med.** Driven by news of new routes, e.g. Ryanair Rabat +7 ([Bladi](https://www.bladi.net/ryanair-ouvre-nouvelles-lignes-maroc-rabat-decroche,122960.html)). | Airport hub page | Aviasales |

### F. Outbound from Morocco (Arabic-first)

| # | Pri | Lang | Target query | Intent | Competition | Page type | Converts to |
|---|---|---|---|---|---|---|---|
| 37 | P1 | ar | رحلات رخيصة من الدار البيضاء إلى إسطنبول | Transactional | **Med.** | Route page + `istanbul` destination | Aviasales + hotels |
| 38 | P1 | fr + ar | visa Turquie pour Marocains 2026 (e-Visa) | Informational | **Med-High.** Visa sites. The facts: e-Visa is conditional on a valid Schengen/UK/US/IE visa or residence permit; otherwise a sticker visa ([guide](https://myturkeyadventure.com/s/turkey-visa-for-morocco); check against [evisa.gov.tr](https://www.evisa.gov.tr)). | Guide → Istanbul route page | Flights + hotels + insurance |
| 39 | P1 | ar | السفر إلى دبي من المغرب: التأشيرة والتكلفة | Informational / commercial | **Med.** | Guide + CMN–DXB route page | Aviasales + hotels + tours |
| 40 | P2 | ar | رحلات من الدار البيضاء إلى القاهرة | Transactional | **Med-Low.** | Route page + `egypt` hub | Aviasales + hotels |
| 41 | P2 | ar + fr | عمرة من المغرب بدون وكالة: التأشيرة الإلكترونية والطيران والفندق | Informational | **Med-High, and sensitive** (religious, legal). Moroccans can use licensed agencies or the Saudi e-Visa route ([Démarches Maroc](https://www.demarchesmaroc.com/visa-omra-marocains/); check on official Saudi portals). Do not sell or imply Umrah packages. Cover flights, hotels near the Haram and insurance only, and link to official sources. | Logistics guide | Flights CMN/RAK → JED/MED + hotels + insurance |
| 42 | P2 | fr + ar | pays sans visa pour les Marocains 2026 / وجهات بدون تأشيرة للمغاربة | Informational | **High.** [Démarches Maroc](https://www.demarchesmaroc.com/?p=5005) and [Wego Arabic](https://rahhal.wego.com/blog/%D8%AF%D9%88%D9%84-%D8%A8%D8%AF%D9%88%D9%86-%D9%81%D9%8A%D8%B2%D8%A7-%D9%84%D9%84%D9%85%D8%BA%D8%A7%D8%B1%D8%A8%D8%A9-%D9%83%D9%84-%D9%85%D8%A7-%D8%AA%D8%B1%D9%8A%D8%AF-%D9%85%D8%B9%D8%B1%D9%81/). Hard to rank, but very linkable when kept current. | Hub guide | Flights |
| 43 | P2 | fr | visa Thaïlande Marocains 2026 | Informational (news-driven) | **Low-Med.** Fresh change: TelQuel headline of 16 Sept 2026 says [Moroccans now need a visa](https://telquel.ma/instant-t/2026/09/16/thailande-les-marocains-desormais-soumis-a-lobligation-de-visa_2007853/). I could not open the article, so check it before publishing. | News guide | Flights + insurance |
| 44 | P2 | fr + ar | Casablanca Marrakech vers Istanbul/Dubaï : escale ou direct ? | Comparison | **Low.** | Guide | Aviasales |

**Build order:**
1. Months 1 to 2: Arabic route pages (#17–20).
2. Months 1 to 2: French diaspora routes to secondary airports (#4–8).
3. By early March: ferry and Marhaba pages (#22–29).
4. Ongoing: domestic guides that feed the existing destination pages.
5. Last: the high-competition head terms (#1–2). They work mainly as internal hubs.

---

## 3. Programmatic route landing pages: URL structure and template

### 3.1 URL structure

```
/{lang}/                                  language home (ar, fr, en, es)
/{lang}/flights/                          flights hub (links all route pages)
/{lang}/flights/{origin}-{destination}/   e.g. /fr/flights/paris-marrakech/
/{lang}/flights/from-{airport-city}/      airport hub, e.g. /fr/flights/from-rabat/
/{lang}/ferry/                            ferry hub
/{lang}/ferry/{port}-{port}/              e.g. /ar/ferry/algeciras-tanger-med/
/{lang}/destination/{slug}/               existing destinations, moved under lang
/{lang}/guide/{slug}/                     long-form guides (Marhaba, Merzouga, visas)
```

- **Use lowercase ASCII city slugs that are identical in every language** (`paris-marrakech`). A shared route key keeps hreflang mapping trivial. It also avoids percent-encoded Arabic URLs that break when shared on WhatsApp. Localize the title, H1, body and breadcrumbs, not the slug.
- The trade-off: localized path words (`/fr/vols/...`, `/es/vuelos/...`) give a small relevance and click-through signal. If you want them, do it now, before indexation, and never change it afterwards. My recommendation is to keep `/flights/` for simplicity.
- **Use city slugs, not airport codes**, because people search by city. Handle airports inside the page (Paris = CDG + ORY + BVA).
- **Each direction is its own URL** (`paris-marrakech` and `marrakech-paris`), because the queries are directional. Launch the reverse direction only when it has a different angle. For example, Morocco → Europe pages are for residents of Morocco: prices in MAD and a Schengen-visa reminder. Otherwise leave the reverse URL out until it has that.
- Redirect the old `/destination/:slug` and `/article/:slug` URLs with a 301 to `/{lang}/...`, using the language the content is currently rendered in (mostly `en`).

### 3.2 Page template (server-rendered HTML; the widget enhances it)

Above the fold:
1. H1 in the page language, for example "Vol pas cher Paris → Marrakech : prix, compagnies, vols directs".
2. **Live price widget** (Travelpayouts/Aviasales search form, prefilled with origin and destination).
3. A **server-rendered "lowest prices found" block**: the cheapest fares from the [Aviasales Data API](https://support.travelpayouts.com/hc/en-us/articles/20384016664594-Brands-that-provide-access-to-APIs-and-data-feeds-for-Travelpayouts-partners), with the date the fare was found. Label it plainly, for example "prices found by travellers in the last N days; may have changed". These are cached fares, not live inventory.

Core data blocks (each one is unique to the route):

| Block | Source | Notes |
|---|---|---|
| Cheapest month / price by month (12-month bar chart) | Aviasales Data API, aggregated and stored in Supabase | This is **original data**. Over time it becomes the reason people link to Fastamor. |
| Airlines on the route, direct vs. 1 stop | API airline codes plus a manually checked list from official announcements (RAM, Ryanair, Transavia, easyJet, Air Arabia) | Show the "last verified" date. |
| Typical flight time and distance | Computed from coordinates, cross-checked with schedules | |
| Airports at each end | Static data: CDG/ORY/BVA → RAK; access to the city centre, transfer prices | Links to the transfer widget. |
| Best time to go / weather | Static climate data per destination | Links to the destination page. |
| Diaspora block (only where relevant) | Editorial | Baggage allowances, peak-price weeks (Eid, July), ferry alternative with a link to the ferry page. |
| Hotels at the destination | Hotel widget | 3 to 5 picks plus a link to the destination page. |
| Related routes | Internal links | Same destination from other cities; same origin to other cities; the reverse route. |
| FAQ (4 to 6 real questions) | Editorial, using GSC queries once they appear | Example: "Y a-t-il des vols directs Paris–Nador ?", "Quel aéroport à Paris pour Marrakech ?" |

Structured data:
- Use `BreadcrumbList`, and `FAQPage` only for FAQs that are visible on the page (FAQ rich results are now limited, so treat it as semantics, not a traffic lever).
- **Do not mark up `Offer`/`Flight` prices from cached data.** Stale price markup is a quality risk.

### 3.3 Avoiding thin or duplicate content

Google's spam policies name **scaled content abuse**: "many pages are generated for the primary purpose of manipulating search rankings and not helping users". They also name **thin affiliation**, meaning affiliate pages that add no original value ([Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)). A route-page system is exactly what those policies look at, so apply these rules:

1. **Start small.** Launch about 25 to 40 routes with real demand (the table above), not every possible pair. Add routes only when GSC impressions or API demand data justify them.
2. **Quality gate before `index`.** A page is indexable only if all of these are true:
   - The API returned fares for the route in the last 30 days.
   - At least 5 of the data blocks are filled with route-specific values.
   - There are **at least 200 words of route-specific editorial** in that language, written or edited by a person. An AI draft is fine if a person checks it.
   - Otherwise the page is `noindex` and left out of the sitemap.
3. **No template spinning.** If two pages would differ only by city name, they should not both exist.
4. **Translate properly.** Translations must be full and human-reviewed. Do not ship an English page with a translated H1. [Google treats localized pages with untranslated main content as duplicates](https://developers.google.com/search/docs/specialty/international/localized-versions).
5. **Keep it fresh.** Refresh prices daily. Re-verify the airline list monthly. Show "updated on" on the page.
6. **One intent per URL.** "Paris Marrakech" and "Orly Marrakech" belong on the same page (airport section). Do not create a separate URL per airport.

### 3.4 Arabic specifics

- Use Modern Standard Arabic with Maghrebi terms that people actually search ("مغاربة العالم", city names in common Moroccan spelling: الناظور, وجدة, طنجة المتوسط).
- Set `dir="rtl"` on the page (already done in `render.js`). Show prices in EUR for Europe-origin routes and MAD for Morocco-origin routes.

### 3.5 hreflang across ar / fr / en / es

Based on [Google's localized-versions documentation](https://developers.google.com/search/docs/specialty/international/localized-versions):

- Use **language-only codes**: `ar`, `fr`, `en`, `es`. Add region codes (for example `fr-BE`) only if the content really differs by country. You cannot use a region code alone.
- **Every version lists itself and every other version, with return links on both sides.** If a return link is missing, Google may ignore the annotations.
- `x-default` points to the `en` version (or to a language-picker page). Never point it at the bare SPA shell.
- **List only alternates that exist and pass the quality gate.** If `/es/flights/paris-nador/` does not exist, leave it out of the set for that route.
- Each language version has a **self-referencing canonical**. Never canonicalize `/fr/...` to `/en/...`.
- Put it in **one** place: the XML sitemap with `xhtml:link` is easiest to generate from Supabase. Optionally mirror it in the `<head>` from `render.js`, but the two must stay identical.
- No automatic redirects by IP or `Accept-Language`. Offer a language banner instead, so Googlebot (which crawls mostly from the US) can reach every version.

---

## 4. Merging duplicate destination pages

| Current | Action | Reason |
|---|---|---|
| `dubai` + `dubai-uae` | Keep **`dubai`**. Move any unique content from `dubai-uae` into it, then add a **301** `dubai-uae → dubai`. | Same intent and same city. Two URLs split signals. |
| `paris` + `france-paris` | Keep **`paris`**. Add a **301** `france-paris → paris`. | Same city. Do not create a France hub yet; there are no other French city pages. |
| `morocco` | Make it a **country hub**: overview, entry rules, how to get around (train, CTM bus, internal flights), best season by region, and cards linking to the city pages (marrakech, essaouira, dakhla, tangier) plus the Merzouga and Chefchaouen guides and the main route pages. | The hub targets "voyage Maroc"-type queries. The cities target city queries. Each page has a different intent, so there is no overlap. |
| `spain` | Country hub linking mallorca, ibiza, menorca, tenerife, gran-canaria and lanzarote. Consider a "Canary Islands" section, because winter-sun queries are often searched that way. | Same logic. |
| `turkey` | Country hub → `istanbul`, plus the Turkey e-Visa guide (#38). | Keep it light until there are more Turkish cities. |
| `egypt` | Keep it as the hub. Put a Cairo section inside it. Split out `cairo` only once there is enough Cairo-specific content and GSC demand. | Avoid a thin city page. |
| `maldives`, `cyprus` | Keep them as single destination pages (the country is the destination). | Not duplicates. |

How to implement:
- Use **real 301 `redirects`** in `vercel.json`, not `rewrites`.
- Remove the old slugs from `api/sitemap.js`, then update internal links and the `articles → destination` relations.
- Each hub links down to its cities, and each city links back up with breadcrumbs: `Accueil › Maroc › Marrakech`.
- Write each city page's H1 and title to target the city ("Marrakech : guide de voyage…"), and the hub's to target the country.

---

## 5. Backlinks and distribution (15 opportunities, no paid links)

General rule: earn links with **original data and useful tools** (the monthly price barometer, the car-vs-plane calculator, the Marhaba checklist). Many forum and social links are `nofollow`. Their value is referral traffic and brand searches, which is still what a new domain needs.

| # | Outlet / channel | Type | Honest pitch angle |
|---|---|---|---|
| 1 | [Bladi.net](https://www.bladi.net/) | Diaspora news (FR) | It already covers new routes for MRE readers ([example](https://www.bladi.net/ryanair-ouvre-nouvelles-lignes-maroc-rabat-decroche,122960.html)). Offer a **monthly "baromètre des prix MRE"**: cheapest month and week to fly Paris/Brussels/Madrid → Casablanca/Nador/Tanger, from aggregated fare data, free to cite. |
| 2 | [Yabiladi](https://www.yabiladi.com/) (news + [voyage forum](https://www.yabiladi.com/forum/list/46/)) | Diaspora media + forum | News desk: a data story before Marhaba ("family of 4 with car: ferry vs. plane, summer 2027 costs"). Forum: answer ferry and route questions properly from a clearly identified brand account, and link only when it directly answers the question. |
| 3 | [Le360](https://fr.le360.ma/) / [Médias24](https://medias24.com/) | Moroccan national press (FR) | They report new routes ([Le360](https://fr.le360.ma/economie/ryanair-renforce-son-programme-hivernal-au-maroc-avec-17-nouvelles-lignes_GRFSDUS75NBQXJSZN2P5XRWAEM/), [Médias24](https://medias24.com/2026/07/20/transavia-renforce-ses-liaisons-entre-paris-ouarzazate-et-dakhla-1726135/)). Offer a "new-route fare tracker": how fares changed after Ryanair or RAM opened a route. |
| 4 | [Hespress (AR)](https://www.hespress.com/) / [Hespress FR](https://fr.hespress.com/) | National press (AR/FR) | Arabic data story for readers in Morocco: "أرخص الوجهات من الدار البيضاء هذا الشتاء" (Istanbul, Cairo, Dubai price index), with methodology. |
| 5 | [Le Courrier de l'Atlas](https://www.lecourrierdelatlas.com/) | Maghreb diaspora magazine (France) | Contributor piece or expert quote: "How to save on the summer trip home": booking windows, alternative airports, ferry ports. |
| 6 | [Morocco World News](https://www.moroccoworldnews.com/) | English news | Data for English-language stories on tourism records (they cover arrivals). Check their contributor policy before pitching an op-ed. |
| 7 | Reddit: r/Morocco, r/travel, r/solotravel | Community | Answer "how do I get to Merzouga/Chefchaouen" questions in full, inside the thread. Link a guide only where the subreddit rules allow. Never drop affiliate links. |
| 8 | Facebook groups for MRE, Marhaba ferry and "Marocains de Belgique/Espagne" | Community | Ask the admins for permission to post the free Marhaba checklist and calculator as a pinned resource. Offer to update it every year. |
| 9 | [Routard forum, Maroc section](https://www.routard.com/forums/t/billet-pas-chers-pour-le-maroc/6659) | French travel forum | Same approach as Reddit: useful answers, and a profile link. |
| 10 | Dakhla kite schools and camps (local businesses) | Niche partners | Offer to list them on the Dakhla guide with an honest description, and ask them to link to the "getting to Dakhla" flights page (Orly, Madrid, Lanzarote) as a resource for their customers. Do not trade links for money. |
| 11 | Moroccan travel micro-creators on YouTube/TikTok (10k–100k followers), found through [HypeAuditor](https://hypeauditor.com/top-youtube-travel-morocco/) / [Modash](https://www.modash.io/find-influencers/youtube/morocco) | Creators | Revenue share through Travelpayouts sub-IDs, plus a custom route page for their audience. Creators must disclose it as an ad or affiliate link, as required by Moroccan and EU advertising rules. |
| 12 | Diaspora family road-trip vloggers (Paris/Brussels → Tanger Med by car) | Creators | Give them a co-branded route plan (stops, tolls, port timings) to link in the video description. It is useful to their viewers whether or not anyone books. |
| 13 | Morocco travel bloggers (FR/EN) | Blogs | An **embeddable "best month to fly to Marrakech/Agadir" chart** that updates itself, with a plain credit link. Do not use keyword-stuffed anchor text. |
| 14 | AI tool directories (Product Hunt, There's An AI For That, Futurepedia and similar) | Directories | A real launch: "multilingual AI travel concierge (ar/fr/en/es) for Maghreb travellers". These directories exist for AI-tool launches. Expect modest, one-off referral traffic. |
| 15 | Moroccan student associations in France, Spain and Belgium | Communities and university sites | A free guide for students going home for Eid or summer (cheap dates, baggage, ferry vs. plane). Associations often list useful resources. |

Avoid PBNs, paid guest posts that hide the payment, link exchanges at scale, and directory blasts. They are risky for a brand-new domain and violate [Google's link-spam policy](https://developers.google.com/search/docs/essentials/spam-policies).

---

## 6. Month-by-month plan and KPIs

These are ranges for a brand-new domain with almost no links. **They are estimates, not forecasts from data.** Actual results depend most on how quickly the technical fixes in section 1 ship and on Google's crawl budget for the site.

"Affiliate clicks" means outbound clicks to Travelpayouts and ferry partners, tracked through `src/lib/tracking.ts` and the Travelpayouts sub-IDs. It includes social and referral traffic, not just SEO.

| Month | Main work | Indexed pages (GSC) | Impressions / month | Clicks / month | Affiliate clicks / month | Rationale |
|---|---|---|---|---|---|---|
| **M1: Dec 2026** | Section 1 technical fixes; 301 merges; first 15 route pages (Arabic plus French secondary airports); GSC/Bing set-up | 20–60 | 100–600 | 0–15 | 0–20 | Google first has to recrawl and re-evaluate a site it has mostly ignored. Indexation lags publication by weeks. |
| **M2: Jan 2027** | +15 routes; Merzouga, Chefchaouen and Marrakech-transfer guides; monthly price data collection starts; first outreach (Bladi, Yabiladi, forums) | 60–150 | 500–2,500 | 5–50 | 10–50 | Long-tail impressions arrive before clicks. Rankings are still on pages 2 to 5. |
| **M3: Feb 2027** | Ferry pages (#22–28); Marhaba 2027 guide; car-vs-plane calculator; Turkey/Dubai/Umrah guides for Ramadan | 120–300 | 1,500–6,000 | 20–120 | 20–100 | Arabic and low-competition route pages start ranking on page 1 for exact long-tail queries. |
| **M4: Mar 2027** | First "baromètre MRE" data story pitched to press; creator sub-ID partnerships; review GSC queries → add FAQ answers and new routes | 180–400 | 3,000–12,000 | 50–250 | 40–180 | Diaspora summer-trip research begins. One press mention can move brand searches and crawl rate. |
| **M5: Apr 2027** | Refresh price data on all pages; expand the reverse-direction (Morocco → Europe) routes that show demand; Spanish Semana Santa content | 220–480 | 5,000–20,000 | 100–450 | 70–300 | Seasonal demand plus gradual trust signals. |
| **M6: May 2027** | Marhaba push (ferry pages, checklist, Facebook-group distribution); second data story; prune or merge pages with 0 impressions after 90 days | 260–550 | 8,000–35,000 | 150–800 | 100–500 | Pre-Marhaba ferry and flight demand peaks in late spring. The ranges stay wide because a new domain is volatile. |

**Signals worth more than any single number:**
- The share of submitted URLs that are indexed should be above 70% by M3. If it is lower, the problem is quality or technical, not content volume.
- Non-brand queries with 10+ impressions per page.
- Affiliate click-through rate on route pages (clicks ÷ sessions). Aim for 8–15%. Below 5%, the widget placement or the intent match is wrong.

**Pivot triggers:**
- If indexation stays below 50% at M3, stop publishing new pages. Fix rendering and quality first.
- If Arabic pages beat French pages on clicks, shift production toward Arabic.
- If ferry pages get impressions but no affiliate clicks, check that the ferry program is wired up and that the CTA is above the fold.

---

## 7. Open questions to settle before building

1. Which Travelpayouts brands are active on the account (hotels, tours, transfers, eSIM, insurance)? The "converts to" column assumes the usual set.
2. Will ferries use Ferryscanner (direct program) or Direct Ferries? Pick one and wire it into `ferryBooking.ts`.
3. Who reviews the Arabic, French and Spanish copy? The quality gate in section 3.3 depends on a human pass in each language.
4. Run every target query in this document through a keyword tool and through GSC after M2. Reorder the backlog by actual impressions.
