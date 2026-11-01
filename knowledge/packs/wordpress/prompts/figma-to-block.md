# Figma to Block

Generate a WordPress ACF block from a Figma frame. Produces an ACF Blocks v3 block: block.json, PHP class, Twig template, ACF JSON field group (plus the SCSS partial).

## Arguments

```
/figma-to-block <desktop-url>
/figma-to-block <desktop-url> <mobile-url>
```

- `desktop-url` — required. URL of a single block frame (e.g. `HeroBlock` from `Dev Ready` page)
- `mobile-url` — optional. URL of the same block's mobile variant

Responsive classes are always generated. If `mobile-url` is provided → use exact mobile values. If not → apply smart responsive defaults.

## Requirements

- `.wpaikit/design-system.json` must exist
- Run from the WordPress theme root: `wp-content/themes/boilerplate/`

## Context to load

Before starting, read:
1. `knowledge/wordpress/rules/figma-to-code.md` — universal rules for all Figma-to-code generation (**mandatory**)
2. `knowledge/wordpress/rules/boilerplate/architecture.md` — file paths and structure
3. `knowledge/wordpress/rules/boilerplate/php.md` — PHP class conventions and the ACF Blocks v3 contract (block.json, `AbstractBlock`, Twig helpers)
4. `knowledge/wordpress/rules/boilerplate/twig.md` — Twig autoescape and sanitization rules
5. `knowledge/wordpress/rules/boilerplate/frontend.md` — SCSS and style conventions
6. `knowledge/shared/rules/figma-blocks.md` — layer naming → ACF field mapping
7. `knowledge/wordpress/skills/figma-to-block/SKILL.md` — full generation procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Setup
- Read `.wpaikit/design-system.json`
- Verify cwd is the theme root (contains `blocks/`, `views/`, `acf-json/`)
- Parse URLs → extract node IDs

### Phase 2 — Read design
- `get_design_context` on desktop frame
- If mobile URL → `get_design_context` on mobile frame

### Phase 3 — Analyze
- Map layer tree → ACF fields
- Map Figma properties → Tailwind classes
- Build responsive class pairs

### Phase 4 — Interactive field confirmation
Show proposed fields. Let user edit interactively before generating.

### Phase 5 — Generate files
Write `block.json`, the PHP class, the Twig template, the ACF JSON group and the SCSS partial to the theme directory (ACF Blocks v3).

### Phase 6 — Report

## Constraints

- `declare(strict_types=1)` on every PHP file
- Never call `esc_html()` before passing plain text to Twig (autoescape handles it)
- Use `{{ url|raw }}` for pre-sanitized URLs
- No queries or logic in Twig — keep it in the PHP class
- ACF Blocks v3: metadata in `block.json`, no `acf_register_block_type()`, no `mode`/`jsx`; root element through `block_wrapper_attributes()`
- Always generate responsive classes even without a mobile frame
