---
name: figma-to-block
description: Use when generating a WordPress ACF block (PHP class + Twig template + ACF JSON) from a Figma block frame. Requires .wpaikit/design-system.json and must run from the theme root.
metadata:
  short-description: Generate PHP + Twig + ACF JSON for a WordPress block from Figma
---

# Figma to Block

## Phase 1 — Setup

### 1.1 Read design-system.json
Read `.wpaikit/design-system.json`.

Extract:
- `COLORS` — `{ hex: variableName }` (skip deprecated)
- `TYPOGRAPHY` — `{ key: styleName }` (skip deprecated)
- `SPACING` — `{ px: variableName }` (skip deprecated)
- `RADIUS` — `{ px: variableName }` (skip deprecated)

Build Tailwind lookup tables:
- `spacing px → Tailwind class` using the scale: `4→1, 8→2, 12→3, 16→4, 20→5, 24→6, 32→8, 48→12, 64→16, 80→20, 96→24`
- `radius px → Tailwind class`: `4→sm, 6→md, 8→lg, 12→xl, 16→2xl, 9999→full`
- `typography styleName → Tailwind class`: `Heading/4xl→text-4xl, Heading/3xl→text-3xl, Heading/2xl→text-2xl, Heading/xl→text-xl, Heading/lg→text-lg, Body/lg→text-lg, Body/base→text-base, Body/sm→text-sm, Label/sm→text-sm`
- `color variableName → Tailwind class`: `Colors/brand/primary→brand-primary, Colors/brand/accent→brand-accent, Colors/text/primary→text-primary`, etc. (follow `Colors/{group}/{name}` → `{group}-{name}` pattern)

### 1.2 Load components registry

If `.wpaikit/components-registry.md` exists → read it and store as `REGISTRY`.

Use `REGISTRY` throughout Phase 3 and Phase 5:
- If a Figma layer maps to a component that exists in `REGISTRY` → use `{% include %}` in Twig instead of generating new markup
- If a BEM class exists in `REGISTRY` → extend with a modifier instead of creating a new block

If registry does not exist → continue without it, but note in Phase 6 report: "Run /scan-components to enable component reuse."

### 1.3 Verify theme root
Check that cwd contains `blocks/`, `views/`, `acf-json/` directories.

If not → stop: "Run this command from `wp-content/themes/boilerplate/`"

### 1.3 Derive block name
From the Figma frame name (e.g. `HeroBlock`):
- `BLOCK_NAME_PASCAL` = `HeroBlock`
- `BLOCK_NAME_KEBAB` = `hero-block`
- `BLOCK_NAME_SNAKE` = `hero_block`

## Phase 2 — Read design

Call `get_design_context` on the desktop frame node ID.

If mobile URL provided → call `get_design_context` on the mobile frame node ID.

Store:
- `DESKTOP` — full layer tree with properties
- `MOBILE` — full layer tree (or `null`)

## Phase 3 — Analyze

### 3.1 Map layers → ACF fields

Walk `DESKTOP` layer tree. For each named layer (skip `Decoration/*`):

| Layer name | ACF field type | Twig variable |
|---|---|---|
| `Heading` | `text` | `{{ heading }}` |
| `Subheading` | `text` | `{{ subheading }}` |
| `Description` | `textarea` | `{{ description }}` |
| `Label` | `text` | `{{ label }}` |
| `CTA Button` | `link` | `{{ cta.title }}` / `{{ cta.url\|raw }}` |
| `Image` | `image` | `{{ image.url\|raw }}` |
| `Background Image` | `image` | `{{ background_image.url\|raw }}` |
| `Items` (contains repeated `Item`) | `repeater` | `{% for item in items %}` |
| `Item > Heading` | sub-field `text` | `{{ item.heading }}` |
| `Item > Description` | sub-field `textarea` | `{{ item.description }}` |
| `Item > Image` | sub-field `image` | `{{ item.image.url\|raw }}` |
| `Item > CTA Button` | sub-field `link` | `{{ item.cta.title }}` |
| `Icon` | `image` | `{{ icon.url\|raw }}` |

If a layer name is unrecognised but contains text → default to `text` field.
If a layer name is unrecognised and contains an image/rectangle with image fill → default to `image` field.

### 3.2 Categorize fields by ACF tab

After mapping all layers to fields, assign each field to a tab:

| Tab | Field types | Created when |
|---|---|---|
| **Settings** | `true_false`, `text` (is_active, block_custom_id) | Always — these two fields are always added |
| **Content** | `text`, `textarea`, `wysiwyg`, `link` | Only if block has at least one content field |
| **Media** | `image`, `video`, `file` | Only if block has at least one media field |
| **Appearance** | `select`, `radio`, `color_picker`, `button_group` | Only if block has at least one appearance field |
| **[Repeater label]** | `repeater` + its sub-fields | One tab per repeater, named after the repeater (e.g. `Items`) |

Tab order: Settings → Content → Media → Appearance → Repeater tabs (alphabetical if multiple).

Store this categorization as `FIELD_TABS` for use in Phase 4 display and Phase 5.4 ACF JSON generation.

### 3.2 Map Figma properties → Tailwind classes

For each structural frame with Auto Layout, extract:

**Layout:**
- `layoutMode: HORIZONTAL` → `flex flex-row`
- `layoutMode: VERTICAL` → `flex flex-col`
- `layoutWrap: WRAP` → `flex-wrap`

**Spacing (use lookup table):**
- `itemSpacing` → `gap-{n}`
- `paddingTop == paddingBottom && paddingLeft == paddingRight` → `py-{n} px-{n}`
- Otherwise → `pt-{n} pr-{n} pb-{n} pl-{n}`

**Colors (use lookup table):**
- Fill → `bg-{color}` or `text-{color}` depending on layer type
- Text fill → `text-{color}`

**Typography (use lookup table):**
- Text Style name → Tailwind class

**Radius (use lookup table):**
- `cornerRadius` → `rounded-{size}`

**Width/columns:**
- Frame with percentage width children in horizontal layout → detect column count → `grid grid-cols-{n}`

### 3.3 Build responsive class pairs

**If MOBILE exists:**
- Mobile value = base class (no prefix)
- Desktop value = `md:` prefixed class
- Example: mobile `flex-col`, desktop `flex-row` → `flex-col md:flex-row`
- Example: mobile `gap-4`, desktop `gap-8` → `gap-4 md:gap-8`
- Example: mobile `text-2xl`, desktop `text-4xl` → `text-2xl md:text-4xl`

**If MOBILE is null — apply smart defaults:**

| Desktop | Mobile default |
|---|---|
| `flex-row` | `flex-col` |
| `gap-{n}` where n≥8 | `gap-{n/2}` |
| `py-{n}` where n≥12 | `py-{n/2}` |
| `px-{n}` where n≥16 | `px-4` |
| `text-4xl` or larger | step down one size |
| `grid-cols-{n}` where n≥2 | `grid-cols-1` |
| `text-4xl` | `text-2xl` |
| `text-3xl` | `text-xl` |
| `text-2xl` | `text-xl` |

Always combine: `{mobile-class} md:{desktop-class}`

## Phase 4 — Interactive field confirmation

Show the proposed ACF field structure and Twig structure preview. Let the user edit fields before generating.

### Display format

```
=== Block: HeroBlock ===

ACF Tabs & Fields:
  [Settings]
    is_active          true_false   (always present)
    block_custom_id    text         (always present)

  [Content]
    #  Name              Type       Twig variable
    1  heading           text       {{ heading }}
    2  description       textarea   {{ description }}
    3  cta               link       {{ cta.title }} / {{ cta.url|raw }}

  [Media]
    4  background_image  image      {{ background_image.url|raw }}

  [Items]  ← repeater tab
    -  title             text       {{ item.title }}
    -  image             image      {{ item.image.url|raw }}

Container: yes (default) — inner content wrapped in <div class="hero-block__inner container">
           no             — full-width block (e.g. edge-to-edge hero image, map)

Edit fields or type [done] to generate:
```

### Accepted commands

| Command | Action |
|---|---|
| `rename 2 body_text` | Rename field #2 to `body_text` |
| `type 2 wysiwyg` | Change type of field #2 to `wysiwyg` |
| `add logo_image image` | Add new field at the end |
| `remove 3` | Remove field #3 |
| `move 3 1` | Move field #3 to position #1 |
| `container no` | Set container: no (full-width block) |
| `container yes` | Set container: yes (default) |
| `done` | Proceed to generation |
| `cancel` | Abort |

After each command → re-display the updated field list.
After `done` → proceed to Phase 5.

Store `CONTAINER = true` (default) or `false` based on user input.

## Phase 5 — Generate files

Write three files. Use the boilerplate `ExampleBlock` as the structural reference.

**After writing each file** — run the per-file validation loop from `knowledge/rules/figma-to-code.md` Rule 10.
Fix all violations before moving to the next file.

### 5.1 PHP class

Path: `blocks/{BLOCK_NAME_PASCAL}/{BLOCK_NAME_PASCAL}.php`

```php
<?php

declare(strict_types=1);

namespace Boilerplate\Theme\Blocks;

use Timber\Timber;

class {BLOCK_NAME_PASCAL} extends \Boilerplate\Theme\Blocks\Block
{
    public function render(array $block, string $content, bool $is_preview): void
    {
        $context = \Timber\Timber::context();

        // ACF fields
        $context['heading']          = get_field('heading') ?: '';
        $context['description']      = get_field('description') ?: '';
        $context['cta']              = get_field('cta') ?: null;
        $context['background_image'] = get_field('background_image') ?: null;

        // image fields: pass as Timber\Image for url/alt access
        if ($context['background_image']) {
            $context['background_image'] = new \Timber\Image($context['background_image']);
        }

        Timber::render('views/blocks/{BLOCK_NAME_PASCAL}/{BLOCK_NAME_PASCAL}.twig', $context);
    }
}
```

Rules:
- `declare(strict_types=1)` first
- Namespace `Boilerplate\Theme\Blocks`
- Extend `Block` base class
- `get_field()` for every ACF field
- String fields default to `''`, link/image/repeater default to `null`
- Wrap image field values in `new \Timber\Image()`
- Repeater: `get_field('items') ?: []`
- Pass `$context` to `Timber::render()`

### 5.2 Twig template

Path: `views/blocks/{BLOCK_NAME_PASCAL}/{BLOCK_NAME_PASCAL}.twig`

Follow `knowledge/rules/figma-to-code.md` — BEM class names only, no Tailwind utilities in Twig.

Rules:
- Plain text: `{{ heading }}` (no `|raw`)
- Pre-sanitized URL: `{{ cta.url|raw }}`
- Image URL: `{{ image.url|raw }}`
- HTML content (wysiwyg): `{{ content|raw }}`
- Wrap optional fields in `{% if field %}...{% endif %}`
- Repeater: `{% for item in items %}...{% endfor %}`
- No PHP logic in Twig
- Use `{% include 'views/components/button.twig' with {...} only %}` for design system components

File header:
```twig
{#
  Block: {BLOCK_NAME_PASCAL}
  ACF fields: heading, description, cta, ...
  Generated by /figma-to-block
#}
```

Structure uses BEM: `.{block-name-kebab}`, `.{block-name-kebab}__element`.

#### Container structure (CONTAINER = true — default)

Wrap inner content in `<div class="{block-name-kebab}__inner container">`.
The `container` class is a Tailwind layout primitive — allowed in Twig as a structural exception.

```twig
<section class="hero-block">
  <div class="hero-block__inner container">
    <div class="hero-block__content">
      <h1 class="hero-block__heading">{{ heading }}</h1>
      <p class="hero-block__description">{{ description }}</p>
    </div>
  </div>
</section>
```

#### Full-width structure (CONTAINER = false)

No `__inner` wrapper. Content fills full width.

```twig
<section class="hero-block">
  <div class="hero-block__content">
    <h1 class="hero-block__heading">{{ heading }}</h1>
    <p class="hero-block__description">{{ description }}</p>
  </div>
</section>
```

### 5.3 SCSS partial

Path: `frontend/src/blocks/_{BLOCK_NAME_KEBAB}.scss`

Follow `knowledge/rules/figma-to-code.md` — all Tailwind via `@apply`, mobile-first responsive.

File header:
```scss
// Block: {BLOCK_NAME_PASCAL}
// Generated by /figma-to-block
```

Use the Tailwind class pairs built in Phase 3. Mobile = base classes, desktop = inside `@screen md { }`.

#### CONTAINER = true (default)

`section` gets only vertical padding and background. Horizontal padding is handled by Tailwind's `container`.
Do NOT add `px-*` to the section or `__inner` element.

```scss
.hero-block {
  @apply py-8 bg-canvas;

  @screen md {
    @apply py-24;
  }

  &__inner { }  // intentionally empty — Tailwind container handles width and centering

  &__content {
    @apply flex flex-col gap-4;

    @screen md {
      @apply flex-row gap-12;
    }
  }

  &__heading {
    @apply text-2xl font-bold text-primary;

    @screen md {
      @apply text-4xl;
    }
  }
}
```

#### CONTAINER = false

`section` controls all spacing including horizontal.

```scss
.hero-block {
  @apply flex flex-col gap-4 py-8 px-4;

  @screen md {
    @apply flex-row gap-12 py-24 px-16;
  }

  &__heading {
    @apply text-2xl font-bold text-primary;

    @screen md {
      @apply text-4xl;
    }
  }
}
```

After writing the file, add an import line to `frontend/src/main.scss`:
```scss
@import 'blocks/hero-block';
```

If `main.scss` does not exist, check for `frontend/src/index.scss` or `frontend/src/app.scss`.

### 5.4 ACF JSON field group

Path: `acf-json/group_{BLOCK_NAME_SNAKE}.json`

Generate a valid ACF local JSON field group:
- `key`: `group_{BLOCK_NAME_SNAKE}`
- `title`: block name with spaces (e.g. `Hero Block`)
- `location`: rule matching the block name
- `fields`: tabs first, then the fields belonging to that tab (flat array — ACF reads tabs positionally)

Field key format: `field_{BLOCK_NAME_SNAKE}_{field_name}` (e.g. `field_hero_block_heading`)
Tab key format: `field_{BLOCK_NAME_SNAKE}_tab_{tab_name_snake}` (e.g. `field_hero_block_tab_settings`)

**`instructions` field — plain text only. Never use HTML tags (`<b>`, `<br>`, `<p>`, etc.) in any `instructions` value.**

**Tab fields — `new_tab_group` must always be `false` (or omitted). Never set it to `true` on any tab.**

For `link` type fields: set `return_format: array`.
For `image` type fields: set `return_format: id`.
For `repeater` type: nest sub-fields inside `sub_fields` (no inner tabs — flat list).

#### Tab structure in fields array

ACF tabs are `type: "tab"` entries placed directly before their fields in the flat `fields` array.
Always generate tabs in this order: **Settings → Content → Media → Appearance → [Repeater tabs]**.
Omit any tab (except Settings) if it has no fields.

```json
"fields": [
  {
    "key": "field_hero_block_tab_settings",
    "label": "Settings",
    "name": "",
    "type": "tab",
    "placement": "top",
    "endpoint": 0
  },
  {
    "key": "field_hero_block_is_active",
    "label": "Is Active",
    "name": "is_active",
    "type": "true_false",
    "default_value": 1,
    "ui": 1
  },
  {
    "key": "field_hero_block_block_custom_id",
    "label": "Block Custom ID",
    "name": "block_custom_id",
    "type": "text",
    "placeholder": "#my-section",
    "instructions": "Optional HTML id for anchor links"
  },
  {
    "key": "field_hero_block_tab_content",
    "label": "Content",
    "name": "",
    "type": "tab",
    "placement": "top",
    "endpoint": 0
  },
  {
    "key": "field_hero_block_heading",
    "label": "Heading",
    "name": "heading",
    "type": "text"
  },
  {
    "key": "field_hero_block_tab_media",
    "label": "Media",
    "name": "",
    "type": "tab",
    "placement": "top",
    "endpoint": 0
  },
  {
    "key": "field_hero_block_background_image",
    "label": "Background Image",
    "name": "background_image",
    "type": "image",
    "return_format": "id"
  },
  {
    "key": "field_hero_block_tab_items",
    "label": "Items",
    "name": "",
    "type": "tab",
    "placement": "top",
    "endpoint": 0
  },
  {
    "key": "field_hero_block_items",
    "label": "Items",
    "name": "items",
    "type": "repeater",
    "sub_fields": [
      {
        "key": "field_hero_block_items_title",
        "label": "Title",
        "name": "title",
        "type": "text"
      }
    ]
  }
]
```

**Rules:**
- `endpoint: 0` on all tabs except the last one in the group (set `endpoint: 1` on the final tab to close it)
- Settings tab always present with `is_active` + `block_custom_id`
- Repeater field sits inside its own tab — the tab contains only that repeater entry

## Phase 6 — Report

```
=== Block generated: HeroBlock ===

Files written:
  blocks/HeroBlock/HeroBlock.php
  views/blocks/HeroBlock/HeroBlock.twig
  frontend/src/blocks/_hero-block.scss  (imported in main.scss)
  acf-json/group_hero_block.json

ACF fields: N
Responsive: desktop + mobile (from Figma) / desktop + smart defaults

Next steps:
  1. Run `composer phpstan` to check the PHP class
  2. Open WordPress admin → Custom Fields → sync JSON
  3. Run `npm run build` to verify SCSS compiles
```

## Boundaries

- Never generate queries or data logic in Twig
- Never call `esc_html()` before passing plain text to PHP context
- Always use `declare(strict_types=1)`
- Always generate responsive SCSS via @apply, never inline Tailwind in Twig
- Always add SCSS partial import to main.scss
- Do not proceed past Phase 4 without `done` from user
- Do not overwrite existing files without asking: if a file already exists → prompt `[overwrite / skip / cancel]`
