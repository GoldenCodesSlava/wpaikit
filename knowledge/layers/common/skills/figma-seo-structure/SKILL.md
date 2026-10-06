---
name: figma-seo-structure
description: Use when auditing a Figma page for structural SEO — page type, landing structure, internal linking, E-E-A-T trust signals, local SEO, Schema.org, and layout states. Produces a prioritized report and, after user approval, builds the missing blocks directly in Figma (reusing the file's own components and tokens) and adds SEO annotations for developers.
metadata:
  short-description: Audit a Figma page for structural SEO, build missing blocks, annotate for devs
---

# Figma SEO Structure

## Purpose

Audit a Figma page for **structural SEO** and fix it in the design:

- which blocks the page needs and which are missing or weak;
- how the page links to other pages (landings, entities, breadcrumbs, pagination);
- trust signals (E-E-A-T), local signals (NAP, map, hours);
- which Schema.org markup applies and what visible content it needs;
- how every repeating block behaves with 0 / 1 / 2 / 3 / 4 / many items.

After the user approves the plan, missing blocks are **built in Figma** from the file's own
components and tokens, and every relevant block gets an **SEO annotation** for developers.

### How it differs from `/figma-seo-texts`

| | `/figma-seo-structure` | `/figma-seo-texts` |
|---|---|---|
| Scope | Structure: blocks, links, schema, trust, local, layout states | Copy: meta, H1, editorial text |
| Figma | Writes (after approval) | Read-only |
| Order | Run first | Run after structure is approved |

The skill is **project-agnostic**: never hardcode a client, file key, node ID, brand, color, or font.
Everything visual is discovered from the file at runtime.

---

## Phase 1 — Brief

Ask the following questions. Wait for all answers before proceeding.

```
1. Figma URL of the page frame (required argument — skip if already given)

2. Niche + primary market (country, city)
   Example: dermatology clinic — Chișinău, Moldova | furniture store — Bucharest, Romania | SaaS — remote
   Note: local intent matters — a physical location enables the Local SEO checks

3. Main target query for this page
   Example: "dermatologist Chișinău", "buy sofa Bucharest"
   [auto] — propose from niche + page type (confirm in Phase 3)

4. Mode:
   [audit] — report only, nothing is written to Figma
   [build] — audit → approve plan → build in Figma (default)

5. Where to build:
   [copy]     — duplicate the page frame next to the original and build there (default)
   [in-place] — edit the original frame
```

`--lang` controls the language of the report and annotations (default: language of the conversation).
Texts placed into Figma follow the language already used in the design.

Store answers as:
- `FIGMA_URL` — plus `FILE_KEY` and `NODE_ID` parsed from it
- `NICHE`
- `MARKET` — `{ country, city, hasPhysicalLocation }`
- `TARGET_QUERY` — string or `auto`
- `MODE` — `audit` / `build`
- `TARGET` — `copy` / `in-place`
- `REPORT_LANG`

---

## Phase 2 — Discover the file (read-only)

**Load the `figma-use` skill before any `use_figma` call. This is mandatory.**
In this phase use only `get_metadata`, `get_screenshot`, and read-only `use_figma` scripts
(scripts that return data and never create, modify, or delete nodes).

### 2.1 Project caches

If present, read and prefer them over re-deriving tokens:
- `.wpaikit/design-system.json` — colors, typography, spacing, radii, `_patterns`
- `.wpaikit/components-registry.md` — existing coded components (reuse names/patterns)
- `.wpaikit/project.md` — project type, routes, CPTs, URL patterns

### 2.2 Page structure

- `get_metadata` on `NODE_ID` → section list (order, names, sizes, auto-layout direction).
- `get_screenshot` of the full frame → visual reference for the audit.
- Record the page's content container width and the section gap.

### 2.3 Style inventory

Collect from the file itself (return values from a read-only script):

```
STYLE_INVENTORY
  fonts:      family + styles actually used (heading / body / label)
  colors:     brand, accent, text, muted, surface, border (as used, or bound variables)
  radii:      cards, buttons, inputs, images
  buttons:    primary / secondary / link — node IDs of instances or components
  cards:      service / product / person / article patterns — node IDs
  icons:      arrow, phone, email, pin, clock, star, check — node IDs
  imagery:    nodes with IMAGE fills that can be cloned as placeholders
```

### 2.4 Reusable blocks

Search the current page and other pages for blocks worth reusing:
header, hero, footer, breadcrumbs, pagination, CTA banner, reviews slider, FAQ, contacts/map,
service/product/person cards, tabs/chips.

Record `REUSABLE_SOURCES` — `{ role, nodeId, pageName }` — **for this session only**.
Return node IDs from scripts; never persist them into kit files.

### 2.5 Annotation categories

Read existing annotation categories. If an `SEO` category exists, remember its ID for Phase 7;
otherwise it will be created in Phase 7 (not now — this phase is read-only).

---

## Phase 3 — Classify the page type

Detect from structure + frame name, then confirm with the user:

| Type | Signals |
|---|---|
| `listing` | Grid of repeating people / product / service cards, filters/chips, pagination |
| `category landing` | Listing scoped to one specialization/category + intro/SEO text |
| `single entity` | One specialist / product / service: photo, details, price, CTA |
| `service page` | Service description, prices, process, specialists, FAQ |
| `article` | Long-form text, author, date, TOC |
| `about` | Company story, team, values, credentials |
| `contacts` | Address, phone, map, form, hours |
| `home` | Hero + mix of teasers for many sections |

```
Page type: listing (specialists)
Target query: "dermatologist Chișinău"  ← auto-proposed

[confirm] [change type] [change query]
```

Wait for confirmation. Store `PAGE_TYPE`, final `TARGET_QUERY`.

---

## Phase 4 — Audit against the checklist

Evaluate every applicable item as:
- ✅ present · ⚠️ weak · ❌ missing
- one-line reason
- priority: **P1** (blocks indexing / ranking / trust) · **P2** (clear gain) · **P3** (nice to have)

Skip items that do not apply to `PAGE_TYPE` (e.g. pagination on a contacts page).

### 4.1 Search intent & landing structure

- Exactly one H1, matching `TARGET_QUERY`; logical H2/H3 hierarchy.
- **Listings:** filters/chips must be **links to indexable landing pages**
  (e.g. `/specialists/dermatologists/`), not JS filters with `?filter=`.
  Sorting/view params canonicalize to the base URL.
- Each landing needs its own H1, intro, SEO text, FAQ.
- Pagination present and crawlable (real links, not only "Load more").

### 4.2 Internal linking

- Cards link to entity pages: photo, name as text anchor, "Profile" / "More".
- Cross-links between entities and what they relate to:
  specialist ↔ services, product ↔ category, service ↔ specialists who perform it.
  Counts like "N specialists" are links.
- "Other / related" block on single pages (same category first).
- Breadcrumbs on every non-home page.

### 4.3 E-E-A-T / trust

Critical for YMYL niches (medical, beauty, finance, legal).

- Author/expert profile: role, experience, education, certificates/licences, languages.
- Reviews: aggregate rating + individual reviews (date, author, which service).
- Real photos, credentials, brands/partners.

### 4.4 Local SEO

Only if `MARKET.hasPhysicalLocation`.

- Address, phone (`tel:`), email, opening hours, map embed, "Get directions".
- NAP identical to the Google Business Profile and the footer.

### 4.5 Content blocks

- Unique SEO text for the page's query. "Read more" content must be in the HTML on load
  (collapsed visually, not loaded on click).
- FAQ: 3–4 real questions, direct answer in the first sentence.

**Be honest about rich results:**
- Since Aug 2023 Google shows FAQ rich results only for authoritative government/health sites.
  `FAQPage` markup is optional and mainly helps AI answers / People Also Ask.
- HowTo rich results are deprecated.
- Never promise rich snippets that won't appear.

### 4.6 Schema.org (JSON-LD)

Recommend per page type. Markup must match visible content.

| Page type | Schema |
|---|---|
| listing / category landing | `ItemList`, `BreadcrumbList` |
| person / specialist | `Person` (`jobTitle`, `image`, `worksFor`, `alumniOf`, `hasCredential` → `EducationalOccupationalCredential`, `knowsLanguage`, `makesOffer`), `AggregateRating` + `Review` nested in the entity |
| business / location / contacts | `LocalBusiness` subtype (`MedicalBusiness`, `BeautySalon`, `Store`, …) with `address`, `geo`, `telephone`, `openingHoursSpecification`, `sameAs` |
| product / service | `Product` / `Service` + `Offer` |
| article | `Article` + `author` (`Person`), `BreadcrumbList` |

### 4.7 Layout states

Every repeating block must define what happens with 0 / 1 / 2 / 3 / 4 / many items.

```
Example (category cards):
  0     → hide block (never render an empty section)
  1     → full-width card
  2     → 2 columns
  3     → 2 + 1 (last card full-width) or 3 columns
  4     → 2 × 2
  5+    → tabs / sidebar / slider
```

Missing states for a repeating block = ⚠️ P2.

---

## Phase 5 — Report + plan (stop and wait)

Output a compact report:

```
=== SEO structure audit: {Frame name} ===
Page type: {PAGE_TYPE} · Target query: {TARGET_QUERY}

P1  ❌ Filters are not landing pages → make chips links + create 1 example landing
P1  ❌ No internal links to services → add "Popular procedures" block using existing service cards
P1  ❌ No breadcrumbs → add breadcrumbs above H1
P2  ⚠️ FAQ: 5 questions, generic → trim to 4, rewrite for intent (no rich-snippet promise)
P2  ❌ No local block → add contacts + map
P2  ⚠️ Cards: no layout states → build "Layout states" section
P3  ⚠️ No partner/brand logos → add trust strip
✅  One H1 · pagination present · real photos

Schema: ItemList, BreadcrumbList, MedicalBusiness

Plan (will build in Figma):
  1. …
  2. …
Build target: copy of "{Frame name}" (original untouched)

Proceed? [yes] [edit plan] [audit only]
```

Also write the report to `seo-structure-{page-slug}.md` in the current working directory
(`page-slug` = kebab-case frame name, same convention as `seo-texts-{slug}.md`).

### File format

```md
# SEO Structure: {Frame Name}

**Page type:** {PAGE_TYPE}
**Target query:** {TARGET_QUERY}
**Niche:** {NICHE}
**Market:** {MARKET.city}, {MARKET.country}
**Generated:** {DATE}

## Audit

| # | Area | Item | Status | Priority | Reason / fix |
|---|---|---|---|---|---|
| 1 | Landing structure | Filters are landing pages | ❌ | P1 | Chips are JS filters → link to /{section}/{category}/ |

## Schema.org

{type list + short JSON-LD example per type}

## Layout states

{rules per repeating block}

## Build plan

1. …

## Placeholder data to replace

(filled in Phase 8)
```

- `[audit only]` or `MODE = audit` → skip to Phase 8 (report without build).
- `[edit plan]` → show numbered plan, apply edits, show again.
- Never proceed to Phase 6 without an explicit `yes`.

---

## Phase 6 — Build in Figma (only after approval)

Re-read the `figma-use` skill guidance if it is not already loaded in this session.

### 6.1 Target

- `TARGET = copy` → duplicate the page frame, place it next to the original
  (same parent, offset right by frame width + gap), name it `{Frame name} — SEO`.
  All changes go to the copy.
- `TARGET = in-place` → work on the original frame.

### 6.2 Rules

- **Incremental:** one block per `use_figma` call, `get_screenshot` after each, fix before moving on.
- **Reuse before creating:** clone existing header/hero/footer/CTA/cards/sliders/icons/maps/images
  from `REUSABLE_SOURCES`. Build new blocks only from `STYLE_INVENTORY` tokens
  (fonts, colors, radii, spacing). Never introduce a new visual language.
- **Vertical auto-layout pages:** insert new sections at the correct index; width matches the
  page's content container.
- **Auto-layout fills:** frames created via `figma.createAutoLayout()` get a default white fill —
  set `fills: []` on every structural wrapper, otherwise white boxes appear on tinted cards.
- **Text wrapping:** after appending, set `textAutoResize = 'HEIGHT'` + `layoutSizingHorizontal = 'FILL'`.
- **Equal heights in card rows:** cards FILL vertically + a growing spacer; author/actions aligned
  to the bottom.
- **Overflow:** check narrow cards for long names, tags, prices; prefer fewer tags over wrapping
  to uneven heights.
- **User edits:** never modify nodes the user edited manually (names/photos changed since creation).
  If a planned change touches them — ask.
- **Placeholder data** (names, numbers, prices, hours, reviews, certificates) must be plausible and
  collected into `PLACEHOLDERS` for the final report.

### 6.3 Extra frames

- **Layout states:** build a `Layout states` section next to the page for every block whose layout
  depends on item count (0 / 1 / 2 / 3 / 4 / many).
- **Example landing:** for `listing` pages, build **one example landing page**
  (one specialization/category) next to the page to demonstrate the pattern —
  own H1, intro, filtered list, SEO text, FAQ, breadcrumbs.

---

## Phase 7 — SEO annotations

- Reuse the `SEO` annotation category from Phase 2, or create it:
  `figma.annotations.addAnnotationCategoryAsync({ label: 'SEO', color: 'green' })`.
- Add a `labelMarkdown` annotation on each relevant block:
  - what must be a link and to where (URL pattern);
  - canonical rules (sorting/filter params → base URL);
  - Schema type + required fields, with a short JSON-LD example;
  - NAP consistency (matches footer + Google Business Profile);
  - "Read more" content must be in the HTML on load;
  - honest FAQ note (no rich-snippet promise);
  - layout-state rule for repeating blocks.
- **Replace, don't duplicate:** if a node already has an SEO-category annotation, update it.

Example annotation:

````md
**SEO — Breadcrumbs**
- Every item except the last is a link: `Home › {Section} › {Category}`
- Schema: `BreadcrumbList`
```json
{ "@type": "BreadcrumbList", "itemListElement": [
  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
  { "@type": "ListItem", "position": 2, "name": "{Section}", "item": "https://example.com/{section}/" }
]}
```
````

---

## Phase 8 — Final report

```
=== SEO structure built ===
Pages: {links to frames — SEO copy, example landing, layout states}
Added blocks: breadcrumbs, popular services, contacts + map, …
Annotations: N (category SEO)
Replace before launch: hours, prices, reviews, certificates, …
Report: seo-structure-{slug}.md

Next: /figma-seo-texts <url>  → copy for editorial blocks
      /figma-to-block <url>   → implementation
```

Append `PLACEHOLDERS` to the "Placeholder data to replace" section of `seo-structure-{slug}.md`.

In `audit` mode, show the Phase 5 report path and the same "Next" lines (no build section).

---

## Boundaries

- Audit is read-only; nothing is built before explicit approval.
- Load the `figma-use` skill before any `use_figma` call.
- Never edit original frames unless `[in-place]` was chosen; never delete user content.
- Never modify nodes the user edited manually without asking.
- Reuse existing components and styles; never introduce a new visual language.
- Never hardcode project-specific IDs, brands, colors, or fonts into the kit files.
- Never promise rich results that Google no longer shows (FAQ for non-authoritative sites, HowTo).
- Never invent facts presented as real — all placeholder data is flagged.
- Only writes: Figma (after approval) and `seo-structure-{slug}.md`.
