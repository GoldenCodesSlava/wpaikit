# Research: Competitors and References

Use in stage 2 of /generate-design, after the brief and before foundations. The goal is evidence for positioning, copy, and visual direction, not a template to copy. Skip parts the designer already supplied (their own references, an approved positioning, final copy) and say what was skipped.

## Competitor messaging

1. **Find 3–5 competitors.** Use the designer's list first. Otherwise search for "{service} {city/country}", "best {category} {country}", and "{brand} alternatives" in the market language. Drop directories, aggregators, and marketplaces. For local markets (Moldova, Romania), local results and map listings are more useful than global rankings.
2. **Capture** the homepage and one service, pricing, or product page each. Use WebFetch; use the browser for JS-rendered sites. Record URL and capture date.
3. **Extract observations into a fixed schema**, paraphrased in your own words:
   - H1 pattern: outcome, feature, audience, or price-led
   - value themes and proof types (numbers, logos, reviews, certificates, guarantees)
   - CTA verbs and friction (call, book, quote, buy)
   - objection handling (price, trust, time, risk)
   - tone placement on the four axes in knowledge/design/rules/copy-and-tone.md
   - section order and languages offered
4. **Synthesize a messaging matrix:** table stakes (themes everyone claims), white space (themes nobody claims), and the client's provable differentiators. Propose up to 3 positioning options with one example headline each.

Store observations, not sentences. Quote at most one short headline per competitor, labelled with its URL. Generated copy must not reuse distinctive competitor phrases (see the overlap check in copy-and-tone.md). Traffic and keyword data need an authorized SEO tool; without one, state that the analysis is qualitative.

## Visual references

### Sources, in order

1. **Designer-supplied references and anti-references.**
2. **Category leaders and the strongest competitors** found above. Look at their live pages or screenshots.
3. **Refero Styles** (`https://styles.refero.design`). Each entry is an extracted design system: named colors with hex, font plus a suggested substitute, type scale, spacing base, radii, components, do/don't notes.
   - Discover entries through curated collections such as `/design-styles/fintech-websites`, `/design-styles/editorial-websites`, `/design-styles/ecommerce-websites`, `/design-styles/minimal-websites`, `/design-styles/agency-websites`, `/design-styles/website-font-pairings`. The full list is in `/sitemaps/collections.xml`.
   - Read single entry pages on the designer's behalf only. The site's robots.txt disallows AI crawlers: never crawl it in bulk.
   - If the official Refero MCP is connected, prefer it for search by industry or visual direction.
   - The catalog leans toward SaaS and tech. For local service businesses, rely more on sources 1 and 2.
4. **Established design systems** (Material, GOV.UK, Carbon, Polaris…) when the brief calls for that character. Use `search_design_system` when the library is connected to the Figma file.

### Selection

Review 8–10 candidates. Keep 3–5 that differ from each other in a way that matters for this brief, for example one safe, one editorial, one bold. Score each on:

- fit with the brief and the three brand-voice words
- palette contrast that can pass WCAG
- fonts that are available in Figma, directly or through a substitute (knowledge/design/rules/typography-and-fonts.md)
- whether the look is the category reflex (knowledge/design/rules/anti-slop.md)

Present a table:

| Reference | Why it fits | Palette | Fonts → Figma-available substitute | Borrow (2–3 traits) | Avoid (1 trait) |
|---|---|---|---|---|---|

References describe real brands. Use them for direction, never as a clone: do not copy logos, signature illustrations, copy, or a complete page layout.

## Combining references: one spine, a few accents

Mixing systems works only when one of them owns the grammar.

- **Spine (exactly one reference):** spacing base and rhythm, radius system, surface model (shadows or borders), density, grid, button and input shapes.
- **Accents (from one or two others):** palette, a typographic move, image treatment, one or two signature patterns.
- **Never mix grammars.** Do not take shadows from one and borders from another, pill buttons from one and sharp cards from another, without an explicit rule recorded in the Design Direction.

The choice of spine and accents is part of gate A. The foundations in stage 3 then express it as tokens and locks.

## Pattern inspiration (21st.dev and similar)

Component galleries such as `https://21st.dev` (React/shadcn) are a source of interesting solutions, not of components to assemble.

- Look at them when a section needs an unusual pattern: pricing, comparison, process, gallery.
- Take one or two patterns per project at most.
- Translate each one into the spine's grammar: tokens, radii, type, icons.
- Record the source URL in the handoff.

A pattern that only works with its original styling does not fit this project. Pages are readable as markdown by appending `.md`. Code retrieval through the 21st MCP is paid and not needed for Figma work.
