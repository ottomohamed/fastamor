# Fastamor article upgrades: 2026-11-23

Companion notes for `20261123_article_upgrades.sql`. I fetched all 28 published articles from the preview deployment. The current bodies run from about 60 to 900 words, and most are 100–150 words of emoji bullet lists.

The SQL rewrites `title_en`, `title_ar`, `excerpt_en`, `excerpt_ar`, `body_en` and `body_ar` for 10 slugs, inside one `begin; … commit;`. All text values are dollar-quoted (`$body$…$body$`). I checked the file by running it against a throwaway local PostgreSQL 16 instance with a stub `articles` table. All 10 updates applied without errors. I never connected to the project database.

**`updated_at`:** I couldn't confirm the column exists. `api/sitemap.js` falls back when it is missing, and the JSON-LD `dateModified` currently always equals `datePublished`. So the `updated_at = now()` statement is commented out at the end of the file. Run it after checking the column exists, because the sitemap `lastmod` and the JSON-LD `dateModified` read it.

## The 10 chosen articles

Word counts are visible words in the body, HTML tags stripped. Arabic words run shorter because articles and prepositions attach to the word, so a lower count covers the same ground.

| # | Slug | Why it was chosen | EN words | AR words |
|---|------|-------------------|---------:|---------:|
| 1 | morocco-magic-of-the-east | The core destination for the audience. Diaspora and visitor searches ("Morocco travel guide", "دليل السفر إلى المغرب") are both large. | 1,522 | 1,262 |
| 2 | moroccan-cuisine-maghreb-table | Evergreen food queries with strong Arabic and French-diaspora interest. Links naturally to Morocco trips and to the customs article (bringing food home). | 1,301 | 1,055 |
| 3 | spain-mediterranean-treasure | The closest European destination and the ferry route used by the diaspora. Andalusian and Islamic heritage fits the audience well. Covers Schengen visa questions. | 1,390 | 1,172 |
| 4 | portugal-travel-guide | Fast-growing demand, short flights from Casablanca, Al-Gharb heritage. The current article is only about 60 words. | 1,341 | 1,151 |
| 5 | italy-travel-guide | Large Moroccan community in Italy and many direct routes. Sicily's Arab heritage is a distinctive angle. | 1,322 | 1,082 |
| 6 | uae-luxury-hotels | Strong Arabic-language demand for "where to stay in Dubai". Reframed from a thin list of hotels into a guide to areas and booking, which ranks better. Famous landmark hotels are named only as landmarks. | 1,411 | 1,184 |
| 7 | travel-health-guide | The keeper of the health duplicate pair (see below). Practical, evergreen, high-intent queries such as vaccines, insurance and the Schengen insurance requirement. | 1,474 | 1,303 |
| 8 | customs-regulations-guide | The keeper of the customs duplicate pair. Very relevant to the diaspora: EU meat and dairy ban, cash declaration, drones in Morocco, travelling by car. | 1,441 | 1,271 |
| 9 | travel-preparation-guide | Checklist queries ("before you travel checklist") with Schengen and UK visa timing for Moroccan passport holders. | 1,293 | 1,136 |
| 10 | ultimate-guide-airport-transfer-services | Ties directly to Fastamor's transfers product. Localised for Casablanca and Marrakech plus the main airports in Europe and the UAE. | 1,338 | 1,165 |

**Totals:** about 13,800 English words and about 11,800 Arabic words.

Every body uses only `h2`, `h3`, `p`, `ul`, `ol`, `li`, `strong`, `table`, `thead`, `tbody`, `tr`, `th` and `td`. There is no `h1`, no inline styles, no scripts, no images and no links. Each body includes:
- best-time and budget sections, with every price range labelled approximate
- how to get there from Morocco and from European cities
- visa and entry rules at a general level, with a pointer to official sources
- practical tips
- an FAQ with 5 questions
- a closing call to action for the Fastamor AI assistant

The only hotels named are famous landmarks (Burj Al Arab, Atlantis The Palm, Emirates Palace). No restaurants are recommended.

### New titles and meta descriptions

| Slug | title_en (chars) | title_ar (chars) | excerpt_en (chars) | excerpt_ar (chars) |
|------|---:|---:|---:|---:|
| morocco-magic-of-the-east | 61 | 64 | 157 | 152 |
| moroccan-cuisine-maghreb-table | 62 | 60 | 158 | 150 |
| spain-mediterranean-treasure | 63 | 64 | 159 | 147 |
| portugal-travel-guide | 60 | 62 | 155 | 149 |
| italy-travel-guide | 63 | 61 | 155 | 154 |
| uae-luxury-hotels | 63 | 63 | 158 | 150 |
| travel-health-guide | 61 | 58 | 157 | 153 |
| customs-regulations-guide | 64 | 64 | 156 | 159 |
| travel-preparation-guide | 63 | 64 | 153 | 152 |
| ultimate-guide-airport-transfer-services | 65 | 62 | 157 | 150 |

`api/render.js` appends " | Fastamor" (11 characters) to `<title>`, so the rendered titles will be about 70–76 characters. If you want the full title to show in search results, drop the suffix for articles or shorten titles to about 50 characters.

## Duplicate pairs and redirect recommendations

| Keep (canonical) | 301-redirect | Reason |
|---|---|---|
| `/article/travel-health-guide` | `/article/traveler-health-guide-avoiding-diseases` | Same topic and near-identical headings. The keeper has a shorter, cleaner, keyword-led slug and is the older URL (Apr 2026 vs Jun 2026). The redirected article's content is covered and expanded in the rewrite. |
| `/article/customs-regulations-guide` | `/article/customs-guide-travel` | Same topic (declarations, prohibited items, special cases). "Customs regulations" is the stronger query phrase. The rewrite absorbs the checklist from the redirected article. |

After the redirects are live, set the redirected rows to a non-published status so they drop out of `/api/sitemap` and `/blog`. Otherwise the sitemap would list URLs that redirect. One option is a rule in `vercel.json` placed **before** the `/article/:slug` rewrite:

```json
"redirects": [
  { "source": "/article/traveler-health-guide-avoiding-diseases", "destination": "/article/travel-health-guide", "permanent": true },
  { "source": "/article/customs-guide-travel", "destination": "/article/customs-regulations-guide", "permanent": true }
]
```

### Partial overlaps to watch (no redirect yet)
- **`travel-preparation-guide` / `travel-faqs-guide` / `travel-essentials-guide`:** generic planning content with overlapping intent. Keep `travel-essentials-guide` as a packing-list article. Consider merging `travel-faqs-guide` into `travel-preparation-guide` later and redirecting it.
- **`italy-travel-guide` / `vatican-city-guide` / `italian-cuisine-art`:** distinct intents. Keep all three and link between them once internal links are supported in the article body.

## Other findings worth acting on
1. **`comprehensive-global-travel-guide-2026` is a quality and trust risk.** It cites studies and figures that look fabricated (a "NomadList 2026 study", "47% growth" for Albania, "CheapAir 2026" stats, VPN savings of "30–70%", specific Michelin lunch prices). It also contains a pasted Python snippet and a doubled-apostrophe bug ("that''s"). Content like this can drag down the whole site under Google's helpful-content signals. I recommend unpublishing it or rewriting it from scratch with verifiable content. I did not include it in the 10.
2. **The Arabic versions are not separately indexable.** Server-rendered pages only output English (`lang="en"`, an English body, and only an `x-default` hreflang). Unless an Arabic URL exists, such as `/ar/article/<slug>` or `?lang=ar`, with `hreflang="ar"` and `hreflang="en"` alternates, Google will never see the Arabic content. This is probably the single biggest SEO lever after content depth.
3. **The preview deployment sends `x-robots-tag: noindex`.** That is expected for Vercel previews. Make sure the production domain (www.fastamor.com) does not send it, and check in Search Console's URL Inspection.
4. Several current bodies contain inline images, ad placeholders ("Advertisement Space") or plain text without HTML structure. The rewrites replace these with clean HTML. If you want images back, add them after the update, with descriptive `alt` text.
5. Because the rewrites use only the tags allowed in the brief, there are no internal links. Once the body renderer allows `<a>`, add links between related guides, for example Morocco ↔ Moroccan cuisine ↔ customs, and Spain ↔ airport transfers.

## 5 best new article ideas for next month

| # | Working title | Target query (EN / AR) | Why |
|---|---|---|---|
| 1 | Morocco to Spain by Ferry: Routes, Ports, Booking and Summer Tips | "ferry Morocco to Spain" / "باخرة من المغرب إلى إسبانيا" | Huge seasonal diaspora demand (the summer Marhaba operation). Very practical and fits the audience exactly. |
| 2 | Schengen Visa for Moroccans: Documents, Timing and Common Mistakes | "Schengen visa from Morocco" / "تأشيرة شنغن من المغرب" | High-volume Arabic and French query with strong intent. Keep it general and link to official consulate and provider sources. |
| 3 | Istanbul Travel Guide for Arab and Muslim Travellers | "Istanbul travel guide" / "دليل السفر إلى إسطنبول" | Turkey is a top destination for the audience and currently has no article on the site. |
| 4 | Umrah from Morocco and Europe: Planning, Seasons and Budget | "Umrah from Morocco" / "العمرة من المغرب" | Strong Arabic-language demand all year. Health and entry requirements must point readers to official Saudi sources. |
| 5 | Ramadan Travel Guide: Where to Go and How to Plan in 2027 | "travel during Ramadan" / "السفر في رمضان" | Ramadan 2027 is expected to begin around early February 2027, so publishing in December–January catches the planning window. Confirm dates nearer the time. |
