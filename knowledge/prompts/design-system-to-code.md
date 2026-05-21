# Design System to Code

Translate the design system into code: Twig component files, SCSS partials, and updated `tailwind.config.js`.

## Arguments

No arguments. All data comes from `.wpaikit/design-system.json`.

## Requirements

- `.wpaikit/design-system.json` must exist with a `components` section
- Run from `wp-content/themes/boilerplate/`

## Context to load

Before starting, read:
1. `knowledge/rules/figma-to-code.md` — universal rules (**mandatory, read first**)
2. `knowledge/rules/boilerplate/architecture.md` — file paths
3. `knowledge/rules/boilerplate/twig.md` — Twig autoescape rules
4. `knowledge/rules/boilerplate/frontend.md` — SCSS conventions
5. `knowledge/skills/design-system-to-code/SKILL.md` — full generation procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Setup
Read `.wpaikit/design-system.json`. Verify theme root. Check existing files.

### Phase 2 — Read component styles from Figma
For each component in `components`, call `get_design_context` on `figmaComponentId` to get exact variant styles.

### Phase 3 — Generate Twig + SCSS per component
For each confirmed component → write Twig file + SCSS partial.

### Phase 4 — Update tailwind.config.js
Map design tokens from `design-system.json` → Tailwind theme values.

### Phase 5 — Update main.scss
Import all new SCSS partials.

### Phase 6 — Report

## Constraints

- Follow `knowledge/rules/figma-to-code.md` at all times — no Tailwind utilities in Twig
- Do not overwrite existing files without confirmation
- Do not modify `_patterns` or token sections of `design-system.json`
