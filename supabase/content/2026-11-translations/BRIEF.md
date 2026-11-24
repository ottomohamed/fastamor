# Translation brief: Fastamor articles

Fastamor (www.fastamor.com) is a global AI travel assistant with a travel blog in four languages: English (en), Arabic (ar), French (fr) and Spanish (es). Your job is to produce missing language versions of published articles as SQL files. You have no database access and must not try to get any. Do not run git.

## Getting the source text

Load the fetch tool with ToolSearch, query `select:mcp__Vercel__web_fetch_vercel_url`. Then call it on:

    https://fastamor-roi3cltqa-ottomohameds-projects.vercel.app/api/media?dump=<slug>

It returns JSON: `[{slug, category, tags, title_en, excerpt_en, body_en, title_ar, excerpt_ar, body_ar, title_fr, ..., body_es}]`. The `body_*` fields hold the exact HTML stored in the database.

Your assignment names the **source language** to translate from. Use that one.

## Writing rules (every target language)

### Natural writing
- Write like a professional travel editor who is a native speaker of the target language.
- It must not read as a literal translation. Adapt the idioms and sentence rhythm.
- French: standard international French, "vous", correct typographic spacing (e.g. "Visa :", « guillemets » optional).
- Spanish: neutral international Spanish that works in Spain and Latin America; use "tú" and avoid regionalisms.
- English: British English, plain and clear.

### Audience
The audience is global for the target language:
- French: France, Belgium, Switzerland, Quebec, North and West Africa.
- Spanish: Spain and Latin America.
- English: worldwide.

Where the source assumes Moroccan or Arab readers (e.g. "flights from Casablanca", "Moroccan passport holders", "Riyadh"), generalise in a way that suits the target audience:
- "Getting there" covers several regions of origin.
- Visa rules are explained by system (e.g. Schengen, visa waivers), with "check the official government website".

Morocco or the Gulf can stay as one example among several where genuinely useful.

### Facts
- Keep every fact.
- Never invent statistics, prices, airlines, routes or dates.
- Keep approximate figures approximate ("about", "environ", "aproximadamente").
- If something in the source looks wrong or outdated, soften it ("check current rules") rather than guess.

### HTML and structure
- Keep exactly the same HTML structure and tag types as the source: `<p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <th>, <td>`, plus `<a>` / `<img>` only if the source has them, copied with identical attributes.
- No inline styles, no scripts, no new links.
- Keep the FAQ section (translate it, adapting the questions to the global audience).
- Keep the closing paragraph that invites the reader to plan the trip with the Fastamor AI assistant. It can help "find flights from your city" and plan an itinerary; never claim it books anything.
- Body length should be within ±15% of the source.

### Title and excerpt
- **Title:** at most 60 characters, natural for search in that language (e.g. "Guide de voyage en Italie : Rome, Florence, Venise", "Guía de viaje de Italia: Roma, Florencia y Venecia"). Do not put "Fastamor" in the title.
- **Excerpt:** at most 155 characters, one or two sentences, no quotes.

### Style
- No hype words ("joyau caché", "impresionante", "breathtaking").
- No em dashes.
- Short paragraphs.

## Output

Write one file per slug and target language:

    /home/claude/fastamor/supabase/content/2026-11-translations/<lang>/<slug>.sql

containing exactly:

    update articles set
      title_<lang> = $t$<title>$t$,
      excerpt_<lang> = $e$<excerpt>$e$,
      body_<lang> = $b$<body html>$b$,
      updated_at = now()
    where slug = '<slug>' and status = 'published';

The text must not contain `$t$`, `$e$` or `$b$`.

## Arabic sources with styled boxes (AR→EN only)
Many Arabic-only articles are built from decorative `<div style="...">` boxes with emoji icons and `<h4>` headings, and their `body_en` is only a short stub (overwrite it). For the English version produce **clean semantic HTML** instead: `<h2>` for main sections, `<h3>` for sub-sections, `<p>`, `<ul>/<li>`, `<strong>`, tables where useful. Drop the decorative wrapper divs, inline styles and icon-only spans. **Keep every `<img>` exactly as in the source** (same `src`, `loading`, `decoding`; translate only `alt`; remove its `style` attribute). Add a short FAQ (3–5 questions) and the closing Fastamor paragraph if the source has none. In this case the tag-count check is replaced by: same sections in the same order, every image kept, nothing dropped.

## Self-check before finishing

For each file:
1. Tags are balanced, and the tag counts match the source (same number of `<h2>`, `<h3>`, `<li>`, `<tr>`).
2. Title is ≤ 60 characters and excerpt is ≤ 155 characters.
3. Body length ratio against the source.
4. No leftover source-language sentences.

You can check with a small Python script (allowed).

Your final message is a short table: slug | title | length source → target | h2/h3/li counts match (yes/no) | notes (facts you generalised or were unsure about).
