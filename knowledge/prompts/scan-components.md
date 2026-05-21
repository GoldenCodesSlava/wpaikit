# Scan Components

Scan existing SCSS and Twig files to build a components registry at `.wpaikit/components-registry.md`.
This registry is used by `/figma-to-block` and other generation commands to reuse existing components instead of duplicating them.

## Arguments

No arguments.

## Requirements

- Run from `wp-content/themes/boilerplate/`
- `frontend/src/css/main.scss` (or equivalent entry file) must exist
- `views/` directory must exist

## Context to load

Before starting, read:
1. `knowledge/skills/scan-components/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Find entry file
- Locate main SCSS entry (`frontend/src/css/main.scss`, `main.scss`, `index.scss`, or `app.scss`)
- Parse all `@import` / `@use` / `@forward` lines to get the full list of imported SCSS files

### Phase 2 — Scan SCSS
- For each imported SCSS file, extract BEM root classes and their modifiers and elements

### Phase 3 — Scan Twig
- Scan `views/components/` and `views/partials/` for Twig files
- Extract include path and params from the header comment of each file

### Phase 4 — Write registry
- Write `.wpaikit/components-registry.md`

### Phase 5 — Report

## Constraints

- Never modify any SCSS or Twig files
- Never modify `design-system.json`
- Read-only scan — only writes `.wpaikit/components-registry.md`
