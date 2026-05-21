# Setup Fonts

Audit fonts against the design system, remove unused ones, convert to woff/woff2, and generate `@font-face` declarations.

## Arguments

No arguments. Reads `.wpaikit/design-system.json` and scans `frontend/src/fonts/`.

## Requirements

- `.wpaikit/design-system.json` must exist with a `typography` section
- `fonttools` + `brotli` must be installed: `pip install fonttools brotli`
- Run from `wp-content/themes/boilerplate/`

## Context to load

Before starting, read:
1. `knowledge/skills/setup-fonts/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Audit
- Extract needed font families and weights from `design-system.json`
- Scan `frontend/src/fonts/` for all font files
- Show audit table: needed vs found, what to remove, what's missing

### Phase 2 — Clean (with confirmation)
- Remove font files not needed by the design system

### Phase 3 — Convert
- Convert kept fonts to woff2 + woff using `fonttools`
- Skip if already in the target format

### Phase 4 — Generate @font-face
- Write `frontend/src/fonts/_fonts.scss`
- Add `@import` to `main.scss`

### Phase 5 — Report

## Constraints

- Never delete files without user confirmation
- Never delete woff2/woff files that were just converted
- Do not modify `design-system.json`
