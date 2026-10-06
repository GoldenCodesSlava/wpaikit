# Validate Code

Scan all SCSS and Twig files and validate each against project coding rules.
Report violations per file, then offer to fix them.

## Arguments

No arguments.

## Requirements

- Run from `wp-content/themes/boilerplate/`
- `frontend/src/css/main.scss` (or equivalent) must exist
- `views/` directory must exist

## Context to load

Before starting, read:
1. `knowledge/skills/validate-code/SKILL.md` — full procedure
2. `knowledge/rules/figma-to-code.md` — validation checklists (Rule 10)
3. `frontend/tailwind.config.js` — to check color token coverage

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Collect files
- Read `main.scss` imports → get all SCSS partials
- Scan `views/components/`, `views/blocks/`, `views/partials/` → get all Twig files
- Scan `blocks/` → get all PHP block class files

### Phase 2 — Validate
- Run each file through its checklist from `figma-to-code.md` Rule 10
- Collect all violations per file

### Phase 3 — Report
- Show violations grouped by file
- Show clean files separately

### Phase 4 — Fix
- Ask user: fix all automatically? [yes / pick / no]
- Apply fixes, re-validate each fixed file before moving to the next

## Constraints

- Never modify files that have no violations
- For unknown hex colors: ask user before adding to tailwind.config.js and design-system.json
- Re-validate every fixed file before proceeding to the next
