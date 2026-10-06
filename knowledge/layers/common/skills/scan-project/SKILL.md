---
name: scan-project
description: Use when scanning any project to build a machine-readable knowledge base at .wpaikit/project.md. Auto-detects project type (WordPress, Next.js, Laravel, Vue, Generic) and scans relevant directories for components, blocks, design system files, entry points, and naming conventions. Output is used by all generation commands to make context-aware decisions.
metadata:
  short-description: Scan project structure and write .wpaikit/project.md knowledge base
---

# Scan Project

## Purpose

Build `.wpaikit/project.md` — a universal machine-readable index of the project structure, tech stack, components, and conventions.

This file is read by any generation command (figma-to-block, design-system-to-code, etc.) to understand the project without re-scanning every time.

The skill auto-detects the project type — it works for WordPress, Next.js, React, Laravel, Vue, or any other project.

---

## Phase 1 — Detect project type

Scan the current directory for the following indicator files:

| Indicator | Project type |
|---|---|
| `wp-config.php` or `wp-content/` present | **WordPress** |
| `package.json` + (`app/` or `pages/` or `src/app/`) | **Next.js** |
| `package.json` + `src/components/` with `.tsx` or `.jsx` | **React** |
| `package.json` + `src/` with `.vue` files | **Vue** |
| `composer.json` + `resources/views/` | **Laravel** |
| `package.json` only | **Node/JS** |
| None of the above | **Generic** |

Store as `PROJECT_TYPE`.

If running inside a WordPress theme (`wp-content/themes/`), set `PROJECT_SUBTYPE = "WP_THEME"` and use the theme root as the working directory.

---

## Phase 2 — Read tech stack

### 2.1 Read package.json (if exists)

Read `package.json`. Extract:
- `name` — project name
- `version` — current version
- `dependencies` + `devDependencies` — all installed packages

From the packages, derive `FRAMEWORK_VERSIONS`:
- `next` → Next.js version
- `react` / `react-dom` → React version
- `vue` → Vue version
- `tailwindcss` → Tailwind CSS version
- `typescript` → TypeScript in use (yes/no)
- `vite` / `webpack` / `turbopack` → bundler
- `@acf-block-builder` / `acf-*` → ACF integration
- `timber/timber` → Timber/Twig (WordPress)

### 2.2 Read composer.json (if exists)

Read `composer.json`. Extract:
- `require` + `require-dev` — PHP dependencies
- `timber/timber` version
- `php` version requirement

### 2.3 Summarize stack

Build a clean `TECH_STACK` list:
```
WordPress 6.x, ACF Pro, Timber/Twig 2.x, Tailwind CSS 3.x, Vite, TypeScript
```

---

## Phase 3 — Map key directories

Based on `PROJECT_TYPE`, check existence of these directories and record those that exist:

### WordPress (WP_THEME)

| Directory | Purpose |
|---|---|
| `blocks/` | ACF block PHP classes |
| `views/blocks/` | Block Twig templates |
| `views/components/` | Reusable Twig components |
| `views/partials/` | Layout partials (header, footer, nav) |
| `frontend/src/css/` or `frontend/src/styles/` | SCSS/CSS source |
| `frontend/src/js/` or `frontend/src/ts/` | JS/TS source |
| `acf-json/` | ACF field group JSON |
| `.wpaikit/` | wpaikit config and caches |

### Next.js / React

| Directory | Purpose |
|---|---|
| `src/components/` or `components/` | UI components |
| `src/app/` or `pages/` | Page routes |
| `src/styles/` or `styles/` | CSS/SCSS source |
| `public/` | Static assets |
| `src/lib/` or `lib/` | Utility functions |
| `src/hooks/` or `hooks/` | Custom React hooks |

### Laravel

| Directory | Purpose |
|---|---|
| `resources/views/` | Blade templates |
| `resources/views/components/` | Blade components |
| `resources/css/` | CSS source |
| `resources/js/` | JS source |
| `app/Http/Controllers/` | Controllers |

### Generic

Scan for any directory matching these patterns:
- `src/`, `app/`, `components/`, `templates/`, `views/`, `pages/`

Record all that exist.

---

## Phase 4 — Scan components and blocks

Based on `PROJECT_TYPE`:

### WordPress (WP_THEME)

**Blocks** — scan `blocks/` directory:
- For each subdirectory (e.g. `blocks/HeroBlock/`), record:
  - Block name (directory name)
  - PHP file path: `blocks/{Name}/{Name}.php`
  - Twig path: `views/blocks/{Name}/{Name}.twig`
  - SCSS path: `frontend/src/css/blocks/_{kebab-name}.scss` or `frontend/src/blocks/_{kebab-name}.scss`

**Components** — scan `views/components/`:
- For each `.twig` file, record name and path

**Partials** — scan `views/partials/`:
- For each `.twig` file, record name and path

### Next.js / React

Scan `src/components/` (or `components/`):
- For each `.tsx` / `.jsx` / `.ts` / `.js` file, record component name and path
- If subdirectories exist (e.g. `ui/`, `layout/`, `forms/`), note the group

### Laravel

Scan `resources/views/components/`:
- For each `.blade.php` file, record component name and path

### Generic

Scan any `components/`, `templates/`, `views/` directory found in Phase 3.
Record files by extension: `.html`, `.twig`, `.vue`, `.tsx`, `.jsx`, `.blade.php`

---

## Phase 5 — Check design system files

Look for these files and record those that exist:

| File | Purpose |
|---|---|
| `.wpaikit/design-system.json` | wpaikit design tokens (colors, typography, spacing) |
| `tailwind.config.js` / `tailwind.config.ts` | Tailwind custom theme |
| `design-tokens.json` / `tokens.json` | Generic design tokens |
| `src/styles/variables.scss` / `frontend/src/css/base/_variables.scss` | SCSS variables |
| `src/styles/globals.css` / `src/app/globals.css` | Global CSS (Next.js) |
| `theme.config.js` / `theme.ts` | Custom theme config |

---

## Phase 6 — Detect naming conventions

Analyze discovered files to extract naming patterns:

**Components/Blocks naming:**
- Check whether directories and files use PascalCase, kebab-case, or camelCase
- Example: `HeroBlock/` → PascalCase blocks; `hero-block.scss` → kebab-case SCSS

**CSS class naming:**
- If SCSS files found → check for BEM patterns (`.block__element--modifier`)
- If Tailwind used → note "Tailwind utility classes"

**File organization:**
- Colocation (component + styles in same directory) vs separation (all SCSS in one folder)

**PHP/backend naming** (WordPress):
- ACF field name pattern (snake_case, kebab-case)
- PHP class naming (PascalCase extending base class)

Summarize as a short `NAMING_CONVENTIONS` block.

---

## Phase 7 — Find entry points

Locate main entry files:

| Entry | Paths to check (in order) |
|---|---|
| SCSS/CSS | `frontend/src/css/main.scss`, `src/styles/globals.css`, `src/index.css`, `resources/css/app.css` |
| JS/TS | `frontend/src/js/main.ts`, `src/main.ts`, `src/index.ts`, `src/app/layout.tsx`, `resources/js/app.js` |
| PHP | `functions.php`, `app/Http/Controllers/`, `routes/web.php` |
| Twig/Template | `views/index.twig`, `resources/views/layouts/app.blade.php`, `src/app/layout.tsx` |
| Config | `tailwind.config.js`, `vite.config.ts`, `next.config.js`, `nuxt.config.ts` |

Record only those that exist.

---

## Phase 8 — Write project.md

Write `.wpaikit/project.md`.

If `.wpaikit/` directory does not exist → create it.

If file already exists → overwrite it entirely.

### File format

```md
# Project Knowledge

<!-- Generated by /scan-project on {DATE} -->
<!-- Run /scan-project to regenerate after structural changes -->
<!-- Commands: figma-to-block, design-system-to-code update this file automatically -->

## Project Type
{PROJECT_TYPE} — {brief description, e.g. "WordPress theme with ACF + Timber/Twig"}

## Tech Stack
{TECH_STACK — one line per technology with version if known}

## Key Directories
| Path | Purpose |
|---|---|
{for each directory found in Phase 3}
| `{path}` | {purpose} |
{end for}

## Components & Blocks
| Name | Type | Primary files |
|---|---|---|
{for each component/block found in Phase 4}
| {Name} | {block/component/partial/page} | `{main file}` |
{end for}

## Design System Files
{for each design system file found in Phase 5}
- `{path}` — {purpose}
{end for}

## Entry Points
{for each entry point found in Phase 7}
- **{type}:** `{path}`
{end for}

## Naming Conventions
{NAMING_CONVENTIONS — extracted in Phase 6}
```

---

## Phase 9 — Report

```
=== Project Knowledge Base ===

Project type: {PROJECT_TYPE}
Tech stack:   {TECH_STACK summary}

Scanned:
  Blocks/components: N
  Design system files: N found
  Entry points: N found

Written:
  .wpaikit/project.md

How it works:
  - Run /scan-project once per project, then again after major structural changes
  - All generation commands (figma-to-block, design-system-to-code) read this file
  - figma-to-block auto-updates the Components & Blocks table after each new block

Next steps:
  {if WordPress} Run /scan-components to also build the SCSS/Twig components registry.
  {if design-system.json not found} Run /figma-design-system to extract design tokens.
  {otherwise} Run /figma-to-block to generate your first block — it will read project.md automatically.
```

---

## Boundaries

- Read-only scan — never modify any source files
- Never print `.env` contents, DB credentials, or API keys
- Only writes `.wpaikit/project.md`
- If a file or directory does not exist → skip it silently, do not error
- Works from any directory — auto-detects project root by finding `package.json`, `composer.json`, or `wp-config.php`
