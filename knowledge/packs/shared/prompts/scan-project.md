# Scan Project

Scan the current project and build a machine-readable knowledge base at `.wpaikit/project.md`.

Works for any project type: WordPress, Next.js, React, Laravel, Vue, or Generic.

## Arguments

No arguments.

## Requirements

- Run from the project root (where `package.json`, `composer.json`, or `wp-config.php` lives)
- For WordPress themes: run from `wp-content/themes/{theme-name}/`

## Context to load

Before starting, read:
1. `knowledge/shared/skills/scan-project/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Detect project type
- Check for `wp-config.php`, `package.json`, `composer.json`, `.vue` files
- Assign `PROJECT_TYPE`: WordPress / Next.js / React / Laravel / Vue / Generic

### Phase 2 — Read tech stack
- Parse `package.json` and `composer.json` for dependencies and versions

### Phase 3 — Map key directories
- Based on project type, check which standard directories exist
- Record those that are present

### Phase 4 — Scan components and blocks
- WordPress: scan `blocks/`, `views/components/`, `views/partials/`
- React/Next: scan `src/components/` or `components/`
- Laravel: scan `resources/views/components/`
- Generic: scan any `components/`, `templates/`, `views/` found

### Phase 5 — Check design system files
- Look for `.wpaikit/design-system.json`, `tailwind.config.js`, SCSS variables, etc.

### Phase 6 — Detect naming conventions
- Infer PascalCase/kebab-case/BEM patterns from existing files

### Phase 7 — Find entry points
- Locate main SCSS, JS/TS, PHP, template, and config entry files

### Phase 8 — Write project.md
- Write `.wpaikit/project.md` (create `.wpaikit/` if needed)

### Phase 9 — Report

## Constraints

- Never modify any source files
- Never print secrets, DB credentials, or API keys
- Only writes `.wpaikit/project.md`
- Read-only scan
