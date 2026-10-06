---
name: figma-seo-texts
description: Use when generating multilingual SEO texts from a Figma page design. Analyzes the page structure, identifies editorial blocks vs dynamic data blocks (product cards, category grids, testimonials), and generates SEO-optimized copy for all editorial blocks in the requested languages.
metadata:
  short-description: Generate multilingual SEO texts from a Figma page design
---

# Figma SEO Texts

## Purpose

Analyze a Figma page and generate SEO-optimized texts for all editorial blocks in one or more languages.

**All texts in Figma are placeholders** — none are kept as-is. Everything is replaced with real, SEO-optimized copy.

**Dynamic data blocks are skipped** — product cards, category grids, testimonials, and any block whose content comes from the client's database are never touched.

---

## Phase 1 — Collect brief

Ask the following questions before starting. Wait for all answers before proceeding.

```
1. Figma URL of the page to analyze

2. Languages + country for each
   Example: ru (Moldova), ro (Moldova), en (United Kingdom)
   Note: country matters for SEO — French for France ≠ French for Belgium

3. Site niche
   Example: furniture store, dental clinic, IT outsourcing, wedding photography

4. Primary market: country + city (if local business)
   Example: Chișinău, Moldova | London, UK | Remote (no specific city)

5. What to generate:
   [meta]   — <title> + <meta description> only
   [copy]   — H1 + body text for each editorial block
   [all]    — meta + copy (recommended)

6. Keywords:
   [auto]   — AI generates based on niche + market
   [manual] — paste your keyword list

   (If [manual] chosen → ask user to paste keywords now)

7. Tone of voice:
   [sales]        — persuasive, conversion-focused
   [informational] — clear, factual, educational
   [expert]       — authoritative, professional, industry-level
```

Store answers as:
- `FIGMA_URL`
- `LANGUAGES` — list of `{ lang, country }` pairs
- `NICHE`
- `MARKET` — `{ country, city }`
- `OUTPUT_MODE` — `meta` / `copy` / `all`
- `KEYWORDS` — list (auto-generated or user-provided)
- `TONE`

---

## Phase 2 — Analyze Figma page

Call `get_design_context` on the Figma frame from `FIGMA_URL`.

### 2.1 Build page block map

Walk the layer tree. For each top-level section/frame, record:
- Position index (order on page)
- Layer name
- Visual description (what kind of block is it)
- Texts found (all text layers within the block)

Build `BLOCK_MAP`:
```
1. Hero section
   Texts: ["Заголовок", "Подзаголовок", "Кнопка"]

2. Features section
   Texts: ["Наши преимущества", "Feature 1 title", "Feature 1 desc", ...]

3. Product grid
   Texts: ["Название товара", "9 999 lei", "В корзину", ...]

4. Category grid
   Texts: ["Категория 1", "Категория 2", ...]

5. About section
   Texts: ["О нас", "Мы работаем с 2010..."]

6. Testimonials
   Texts: ["Иван Иванов", "5 звёзд", "Отличный магазин!"]

7. CTA section
   Texts: ["Готовы начать?", "Свяжитесь с нами"]

8. Footer
   Texts: ["© 2024", "Политика конфиденциальности", ...]
```

### 2.2 Auto-classify blocks

Mark each block as `editorial` or `dynamic`:

**Mark as `dynamic` (skip):**
- Repeating grid of identical card structures → product cards, category cards
- Contains price patterns (`999`, `lei`, `$`, `€`, `MDL`)
- Contains rating/star elements
- Contains "Add to cart" / "Buy" type CTAs repeated per card
- Contains person names + avatar/photo → testimonials
- Contains pagination elements

**Mark as `editorial` (generate):**
- Hero / banner sections
- Feature / benefit lists (non-repeating or editorial in nature)
- About / story sections
- Single CTA sections
- FAQ sections
- Contact sections

**Ambiguous blocks:**
- If unsure → mark as `editorial` and flag for user confirmation in Phase 3

**Always skip regardless of content:**
- Footer nav links (menu items, legal links) — client-managed
- Cookie banners
- Any block explicitly named "dynamic", "data", "db", "cms" in the layer name

---

## Phase 3 — Confirm block list

Show the classification and wait for user confirmation before generating:

```
=== Page Block Classification ===

Will generate SEO texts for:
  ✓ [1] Hero section
  ✓ [2] Features section
  ✓ [5] About section
  ✓ [7] CTA section

Will skip (dynamic data — client provides content):
  ✗ [3] Product grid       ← repeating cards with prices
  ✗ [4] Category grid      ← repeating category cards
  ✗ [6] Testimonials       ← person names + reviews
  ✗ [8] Footer             ← navigation + legal links

Languages: ru (Moldova), ro (Moldova), en (United Kingdom)
Output: meta + copy
Tone: sales

Proceed? [yes] [edit list]
```

If user responds `[edit list]`:
- Show numbered list of all blocks
- Ask which numbers to toggle (add/remove from generation list)
- Show updated classification and ask again

---

## Phase 4 — Generate keywords (if [auto] selected)

If `KEYWORDS = auto`:

Generate 10–15 primary keywords based on:
- `NICHE` — what the business does
- `MARKET.country` + `MARKET.city` — local search intent
- `LANGUAGES` — one keyword set per language (not a translation — proper localization)

Format:
```
Keywords (ru, Moldova):
  диваны Кишинёв, купить мебель Молдова, мебельный магазин Кишинёв,
  диваны на заказ, мягкая мебель цены, ...

Keywords (ro, Moldova):
  canapele Chișinău, mobilă Moldova, magazin mobilă, ...

Keywords (en, United Kingdom):
  buy sofa UK, furniture store London, custom sofa order, ...
```

Show to user for review:
```
Auto-generated keywords — review and confirm:
[keyword list per language]

[confirm] [edit] [replace with my own]
```

Wait for confirmation before proceeding to Phase 5.

---

## Phase 5 — Generate SEO texts

For each language in `LANGUAGES`, generate texts for all `✓ editorial` blocks.

### Generation rules

**Hero block:**
- H1: primary keyword naturally embedded, 5–10 words, action-oriented
- Subtitle: secondary benefit, 1–2 sentences, supports H1
- CTA button: 2–4 words, imperative verb

**Features / Benefits block:**
- Section heading: keyword-relevant, not generic ("Why us" is banned → use specific benefit)
- Each feature: short title (3–5 words) + description (1–2 sentences, 15–25 words)

**About section:**
- Heading: brand-relevant, trust-building
- Body: 2–3 paragraphs, 40–60 words each. Include: founding context, unique value, market focus

**CTA section:**
- Heading: urgency or benefit-driven
- Supporting text: 1 sentence maximum
- Button: action verb + outcome ("Get a free quote", "See catalogue")

**Meta tags (if OUTPUT_MODE includes meta):**
- `<title>`: primary keyword + brand name, 50–60 characters max
- `<meta description>`: primary keyword + benefit + CTA, 140–160 characters max

### SEO constraints (apply to all languages)

- Primary keyword appears in: H1, meta title, meta description, first 100 words of About
- No keyword stuffing — each keyword used max 2× per block
- No AI copywriting clichés: "elevate", "seamless", "unleash", "next-gen", "game-changer"
- No generic phrases: "We are the best", "Quality you can trust"
- Numbers and specifics are better than vague claims: "500+ models" beats "huge selection"
- Each language version is independently localized — not a word-for-word translation

---

## Phase 6 — Write output file

Write `seo-texts-{page-slug}.md` to the current working directory.

Derive `page-slug` from the Figma frame name (kebab-case).

### File format

```md
# SEO Texts: {Frame Name}

**Niche:** {NICHE}
**Market:** {MARKET.city}, {MARKET.country}
**Tone:** {TONE}
**Generated:** {DATE}

---

## {Language code} ({Country})

### Meta

| Tag | Content |
|---|---|
| title | {meta title} |
| description | {meta description} |

### Keywords used
{comma-separated list}

### [1] Hero

| Element | Text |
|---|---|
| H1 | {h1} |
| Subtitle | {subtitle} |
| CTA | {cta button text} |

### [2] Features

**Section heading:** {heading}

| Feature | Title | Description |
|---|---|---|
| 1 | {title} | {description} |
| 2 | {title} | {description} |
| 3 | {title} | {description} |

### [5] About

**Heading:** {heading}

{paragraph 1}

{paragraph 2}

### [7] CTA

| Element | Text |
|---|---|
| Heading | {heading} |
| Supporting text | {text} |
| Button | {button text} |

---

## {Next language}

[same structure]
```

---

## Phase 7 — Report

```
=== SEO Texts Generated ===

Page: {Frame Name}
Blocks: N editorial (N skipped as dynamic)
Languages: {list}

Output file:
  seo-texts-{slug}.md

Blocks generated:
  ✓ Hero
  ✓ Features
  ✓ About
  ✓ CTA
  ✓ Meta tags (all languages)

Skipped:
  ✗ Product grid (dynamic)
  ✗ Category grid (dynamic)
  ✗ Testimonials (dynamic)
  ✗ Footer (navigation)

Next steps:
  1. Review texts in seo-texts-{slug}.md
  2. Hand off to copywriter for final polish (optional)
  3. Paste into CMS or pass to developer for implementation
```

---

## Boundaries

- Read-only from Figma — never modify any Figma layer or text
- Never generate texts for dynamic data blocks (product cards, category grids, testimonials)
- Never keep original Figma placeholder texts — all editorial copy is freshly generated
- Never translate mechanically — each language version is independently localized
- Only writes the `seo-texts-{slug}.md` output file
- Never proceed past Phase 3 without user confirmation of the block list
- Never proceed past Phase 4 without user confirmation of keywords
