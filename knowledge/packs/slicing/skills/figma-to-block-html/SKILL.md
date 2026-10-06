---
name: figma-to-block-html
description: Use when slicing a Figma block frame into static front-end code — semantic HTML, a BEM SCSS partial with Tailwind @apply, and a vanilla JS module for interactive blocks. No CMS or backend integration.
metadata:
  short-description: Generate HTML + SCSS + JS for a block from a Figma frame
---

# Figma to Block (HTML)

## Phase 1 — Setup

### 1.1 Load tokens

If `.wpaikit/design-system.json` exists → read it (format: `knowledge/shared/contracts/design-system.md`).
Otherwise → read Figma Variables and Text Styles of the file through the Figma MCP and tell the user:
"Tokens read from Figma Variables — run /figma-design-system (Design pack) to cache them."

Extract (skip deprecated):
- `COLORS` — `{ hex: variableName }`
- `TYPOGRAPHY` — `{ key: styleName }`
- `SPACING` — `{ px: variableName }`
- `RADIUS` — `{ px: variableName }`

Build Tailwind lookup tables:
- `spacing px → Tailwind class` using the scale: `4→1, 8→2, 12→3, 16→4, 20→5, 24→6, 32→8, 48→12, 64→16, 80→20, 96→24`
- `radius px → Tailwind class`: `4→sm, 6→md, 8→lg, 12→xl, 16→2xl, 9999→full`
- `typography styleName → Tailwind class`: `Heading/4xl→text-4xl, Heading/3xl→text-3xl, Heading/2xl→text-2xl, Heading/xl→text-xl, Heading/lg→text-lg, Body/lg→text-lg, Body/base→text-base, Body/sm→text-sm, Label/sm→text-sm`
- `color variableName → Tailwind class`: `Colors/{group}/{name}` → `{group}-{name}`

Check `tailwind.config.js` (or `tailwind.config.ts`). If it is missing → stop and ask whether to
create it from the tokens before slicing.

### 1.2 Load components registry

If `.wpaikit/components-registry.md` exists → read it as `REGISTRY`:
- A Figma layer that matches a registered component → reuse its markup and classes
- A BEM class that already exists → extend with a modifier instead of creating a new block

If it does not exist → continue; note in the report.

### 1.3 Resolve paths

Resolve output paths following `knowledge/slicing/rules/structure.md`
(`.wpaikit/project.md` → existing conventions → defaults). Store:
- `BLOCK_HTML_DIR`, `SCSS_BLOCKS_DIR`, `SCSS_ENTRY`, `JS_BLOCKS_DIR`, `JS_ENTRY`, `ASSETS_DIR`

If `.wpaikit/project.md` exists, also read `NAMING_CONVENTIONS` and `TECH_STACK`
(a JS framework listed there changes the JS output style).

### 1.4 Derive block name

From the Figma frame name (e.g. `HeroBlock`):
- `BLOCK_PASCAL` = `HeroBlock`
- `BLOCK_KEBAB` = `hero-block`

## Phase 2 — Read design

Call `get_design_context` on the desktop frame node ID and `get_screenshot` for a visual reference.
If a mobile URL is provided → do the same for the mobile frame.

Store `DESKTOP`, `MOBILE` (or `null`), `SCREENSHOTS`.

## Phase 3 — Analyze

### 3.1 Map layers → content model and HTML

Walk the `DESKTOP` layer tree. Layer names follow `knowledge/shared/rules/figma-blocks.md`.
For each named layer (skip `Decoration/*` for content, keep it as decorative markup):

| Layer name | Content field | HTML |
|---|---|---|
| `Heading` | `heading` (text) | `<h2>` (or `<h1>` for the first hero block) |
| `Subheading` | `subheading` (text) | `<p class="…__subheading">` |
| `Description` | `description` (rich text) | `<p>` / `<div>` for multiple paragraphs |
| `Label` | `label` (text) | `<span>` |
| `CTA Button` | `cta` (link) | `<a class="btn …" href="#">` |
| `Image` / `Background Image` | `image` (image) | `<img>` / CSS background via modifier |
| `Icon` | `icon` (image) | inline SVG or `<img>` from `assets/icons/` |
| `Items` with repeated `Item` | `items[]` (list) | `<ul>` / `<div>` with one child per item |
| `Item > …` | sub-fields of `items[]` | markup inside each item |

Unrecognised layer with text → text field. Unrecognised layer with an image fill → image field.
Use the real text from the design as content. Render every `Item` that exists in the frame.

### 3.2 Map Figma properties → Tailwind classes

For each structural frame with Auto Layout:

- Layout: `HORIZONTAL` → `flex flex-row`, `VERTICAL` → `flex flex-col`, `WRAP` → `flex-wrap`
- Spacing: `itemSpacing` → `gap-{n}`; symmetric padding → `py-{n} px-{n}`; otherwise per side
- Colors: fill → `bg-{color}`; text fill → `text-{color}`
- Typography: Text Style → Tailwind class
- Radius: `cornerRadius` → `rounded-{size}`
- Columns: horizontal layout of equal-width children → `grid grid-cols-{n}`

### 3.3 Build responsive pairs

**If MOBILE exists:** mobile value = base class, desktop value = inside `@screen md`.

**If MOBILE is null — smart defaults:**

| Desktop | Mobile default |
|---|---|
| `flex-row` | `flex-col` |
| `gap-{n}` where n≥8 | `gap-{n/2}` |
| `py-{n}` where n≥12 | `py-{n/2}` |
| `px-{n}` where n≥16 | `px-4` |
| `grid-cols-{n}` where n≥2 | `grid-cols-1` |
| `text-4xl` | `text-2xl` |
| `text-3xl` | `text-xl` |
| `text-2xl` | `text-xl` |

### 3.4 Detect behaviour

Mark the block as interactive when the design or layer names show: slider/carousel (arrows, dots,
overflowing items), tabs, accordion (expand icons, `Item/Open` variants), modal trigger, menu toggle.
Store `BEHAVIOUR` (or `none`).

## Phase 4 — Interactive confirmation

```
=== Block: HeroBlock ===

Content model:
  #  Field             Type    Element
  1  heading           text    h1.hero-block__heading
  2  description       rich    p.hero-block__description
  3  cta               link    a.btn.btn--primary
  4  background_image  image   img.hero-block__background
  [items]  list → ul.hero-block__items
     -  title          text    h3.hero-block__item-title

Container:  yes (default) | no (full-width)
Behaviour:  none | accordion | slider | tabs | modal
Files:
  src/blocks/hero-block/hero-block.html
  src/scss/blocks/_hero-block.scss   (+ import in src/scss/main.scss)

Edit or type [done] to generate:
```

| Command | Action |
|---|---|
| `rename 2 body_text` | Rename field #2 |
| `tag 1 h2` | Change the HTML element of field #1 |
| `add badge text` | Add a field |
| `remove 3` | Remove field #3 |
| `container no` / `container yes` | Full-width / contained block |
| `behaviour accordion` / `behaviour none` | Set interactivity |
| `done` | Generate |
| `cancel` | Abort |

Re-display after each command. Do not proceed without `done`.

## Phase 5 — Generate files

**After writing each file** run the validation loop from `knowledge/slicing/rules/markup.md` Rule 11
and fix all violations before the next file. If a file exists → ask `[overwrite / skip / cancel]`.

### 5.1 HTML

Path: `{BLOCK_HTML_DIR}/{BLOCK_KEBAB}/{BLOCK_KEBAB}.html`

```html
<!--
  Block: HeroBlock
  Content fields: heading, description, cta (link), background_image (image)
  Generated by /figma-to-block-html
-->
<section class="hero-block">
  <div class="hero-block__inner container">
    <div class="hero-block__content">
      <h1 class="hero-block__heading">Build faster websites</h1>
      <p class="hero-block__description">…</p>
      <a class="btn btn--primary btn--lg hero-block__cta" href="#">Get started</a>
    </div>
  </div>
</section>
```

- BEM classes only (`container` on `__inner` is the single exception)
- Interactive elements get `data-*` hooks and initial ARIA state
- Images: `src` from `ASSETS_DIR`, `alt`, `width`, `height`, `loading="lazy"` (not for the hero image)

### 5.2 SCSS partial

Path: `{SCSS_BLOCKS_DIR}/_{BLOCK_KEBAB}.scss`

```scss
// Block: HeroBlock
// Generated by /figma-to-block-html

.hero-block {
  @apply py-8 bg-canvas;

  @screen md {
    @apply py-24;
  }

  &__inner { }  // intentionally empty — container handles width and centering

  &__content {
    @apply flex flex-col gap-4;

    @screen md {
      @apply flex-row gap-12;
    }
  }
}
```

Container = no → the section controls horizontal padding as well.
Add the import to `SCSS_ENTRY`.

### 5.3 JS module (only if `BEHAVIOUR` ≠ none)

Path: `{JS_BLOCKS_DIR}/{BLOCK_KEBAB}.js`

```js
// Block: FaqBlock — accordion behaviour
// Generated by /figma-to-block-html

export function initFaqBlock() {
  document.querySelectorAll('.faq-block').forEach((root) => {
    root.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-block__item')
        const open = item.classList.toggle('faq-block__item--open')
        trigger.setAttribute('aria-expanded', String(open))
      })
    })
  })
}
```

Add the import and the init call to `JS_ENTRY`.

### 5.4 Assets

Export images and icons used by the block from Figma into `ASSETS_DIR`
(`images/{block-kebab}-{name}.webp`, `icons/{name}.svg`). Reuse files that already exist.

## Phase 6 — Update project knowledge base

If `.wpaikit/project.md` exists → add or update the block row in `## Components & Blocks`:

```
| HeroBlock | block | `src/blocks/hero-block/hero-block.html`, `src/scss/blocks/_hero-block.scss` |
```

If it does not exist → skip and suggest `/scan-project` in the report.

## Phase 7 — Report

```
=== Block sliced: HeroBlock ===

Files written:
  src/blocks/hero-block/hero-block.html
  src/scss/blocks/_hero-block.scss      (imported in src/scss/main.scss)
  src/js/blocks/hero-block.js           (only for interactive blocks)
  src/assets/images/hero-block-background.webp

Content fields: N
Responsive: desktop + mobile (from Figma) / desktop + smart defaults
Tokens: design-system.json / Figma Variables

Next steps:
  1. Run the project build to verify SCSS compiles
  2. Open the HTML in the browser and compare with the Figma screenshot
```

## Boundaries

- No CMS, template engine or backend code — static HTML only
- Never put Tailwind utilities in HTML (except `container`)
- Never hardcode hex colors or raw px
- Always add SCSS (and JS) imports to the entry files
- Do not proceed past Phase 4 without `done`
- Do not overwrite existing files without asking
