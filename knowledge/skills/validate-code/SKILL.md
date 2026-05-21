---
name: validate-code
description: Use when validating existing SCSS partials, Twig templates, and PHP block classes against project coding rules. Reads main.scss imports and scans views/ to collect files, runs the checklist from figma-to-code.md Rule 10, reports violations, and optionally fixes them.
metadata:
  short-description: Validate SCSS, Twig, and PHP files against coding rules and fix violations
---

# Validate Code

## Purpose

Audit all existing frontend files for rule violations and fix them.
Uses the checklists defined in `knowledge/rules/figma-to-code.md` Rule 10 as the source of truth.

## Phase 1 — Collect files

### 1.1 SCSS files
Find the main SCSS entry file (`frontend/src/css/main.scss` or equivalent).
Parse all `@import` / `@use` lines. Resolve to absolute paths.
Store as `SCSS_FILES`.

Skip: vendor imports, `_variables.scss`, `_reset.scss`, `_mixins.scss` — these follow different conventions.

### 1.2 Twig files
Scan these directories recursively for `*.twig` files:
- `views/components/`
- `views/blocks/`
- `views/partials/`

Store as `TWIG_FILES`.

### 1.3 PHP files
Scan `blocks/` recursively for `*.php` files (block class files only — skip `functions.php` or service files).
Store as `PHP_FILES`.

### 1.4 Read validation context
Read:
- `knowledge/rules/figma-to-code.md` — checklist in Rule 10
- `frontend/tailwind.config.js` — to check color token coverage
- `.wpaikit/design-system.json` — to cross-reference known colors

Show file counts:
```
Files to validate:
  SCSS:  N files
  Twig:  N files
  PHP:   N files
```

## Phase 2 — Validate each file

Process files in this order: SCSS → Twig → PHP.
For each file, read its content and run the relevant checklist.

### SCSS validation

For each file in `SCSS_FILES`, check:

| # | Rule | How to detect |
|---|---|---|
| 1 | Header comment present | First lines contain `// Component:`, `// Block:`, or `// Partial:` |
| 2 | All class names BEM kebab-case | No camelCase selectors, no utility class definitions |
| 3 | No raw CSS properties for color | No `color:`, `background:`, `background-color:`, `border-color:` with raw values |
| 4 | No hardcoded hex colors anywhere | Grep for `#[0-9a-fA-F]{3,6}` in non-comment lines |
| 5 | No hardcoded px values (spacing/radius) | Raw `padding:`, `margin:`, `gap:`, `border-radius:` with px (not inside `@apply`) |
| 6 | All styling via `@apply` | Non-comment CSS property declarations outside of `@apply` |
| 7 | Mobile-first: `@screen md` used for desktop | If layout classes differ by breakpoint, desktop classes inside `@screen md {}` |
| 8 | No `px-*` on outer block/section when container used | `__inner` sibling present + `px-` on parent |
| 9 | `&__inner {}` empty when container used | Contains only a comment or is truly empty |
| 10 | Imported in main.scss | File path appears in entry file imports |

### Twig validation

For each file in `TWIG_FILES`, check:

| # | Rule | How to detect |
|---|---|---|
| 1 | Header comment present | File starts with `{#` block containing `Component:`, `Block:`, or `Partial:` |
| 2 | No Tailwind utility classes in `class=""` | Detect known utility patterns: `flex`, `grid`, `gap-`, `py-`, `text-`, `bg-`, `rounded-`, `items-`, `justify-` in class attributes |
| 3 | Exception: `container` allowed on `__inner` | `container` only on `__inner` div — flag if used elsewhere |
| 4 | Plain text uses `{{ field }}` not `{{ field\|raw }}` | `|raw` on non-URL, non-wysiwyg fields |
| 5 | URLs use `\|raw` | `href="{{ field }}"` without `\|raw` |
| 6 | Optional fields wrapped in `{% if %}` | Fields that could be null/empty used directly without guard |
| 7 | No PHP expressions in Twig | No `<?php` tags, no direct function calls |
| 8 | Known components use `{% include %}` | Check against `.wpaikit/components-registry.md` — if registry exists |

### PHP validation

For each file in `PHP_FILES`, check:

| # | Rule | How to detect |
|---|---|---|
| 1 | `declare(strict_types=1)` first | First non-empty line after `<?php` |
| 2 | Correct namespace | `namespace Boilerplate\Theme\Blocks` present |
| 3 | String fields default to `''` | `get_field('x')` without `?: ''` for text/textarea fields |
| 4 | Object fields default to `null` | `get_field('x')` without `?: null` for image/link fields |
| 5 | Image fields wrapped in `Timber\Image` | Image field values passed to context without `new \Timber\Image()` |
| 6 | No HTML output in PHP | `echo`, `?>...<?php`, heredoc HTML strings |

## Phase 3 — Report

Group results by file. Show violations inline.

```
=== Validation Report ===

SCSS
  ✗ frontend/src/css/components/_button.scss
      [4] Hardcoded hex found: #0f172a (line 8) — not in tailwind.config.js
      [6] Raw CSS property: border-color: #cbd5e1 (line 23)

  ✓ frontend/src/css/components/_badge.scss — clean

  ✗ frontend/src/css/blocks/_hero-block.scss
      [1] Header comment missing
      [8] px-16 on section element when container is used (line 3)

Twig
  ✗ views/components/button.twig
      [2] Tailwind utility classes in class attribute: "flex items-center" (line 14)

  ✓ views/components/badge.twig — clean

PHP
  ✓ blocks/HeroBlock/HeroBlock.php — clean

---
Total: N violations in N files
Clean: N files
```

If zero violations across all files:
```
=== Validation Report ===
All N files are clean. No violations found.
```

## Phase 4 — Fix

After showing the report, ask:

```
Fix violations?
  [all]   — fix all files automatically
  [pick]  — choose which files to fix
  [no]    — exit without changes
```

### Fix loop — per file

For each file with violations:

1. Read the current file content
2. Apply fixes for each violation:

| Violation | Fix |
|---|---|
| Missing header comment | Add standard header comment based on file type and name |
| Hardcoded hex color | Look up in `tailwind.config.js` → if found, replace with `@apply` class. If not found → ask user (see below) |
| Raw CSS color property | Convert to `@apply` equivalent |
| Raw CSS spacing/radius | Convert to nearest Tailwind class via `@apply` |
| Non-`@apply` property | Wrap in `@apply` if equivalent exists; leave with comment if no Tailwind equivalent |
| Tailwind utilities in Twig class attr | Move classes to SCSS via `@apply`, replace with BEM class name in Twig |
| Missing `{% if %}` guard | Wrap field output in `{% if field %}...{% endif %}` |
| Missing `\|raw` on URL | Add `\|raw` filter |
| Missing `?: ''` or `?: null` | Add PHP default value |

3. Write the fixed file
4. Re-validate the file against the full checklist
5. If violations remain → fix again → re-validate (max 2 rounds)
6. Report result: ✓ fixed / ✗ could not auto-fix (list remaining violations)

### Unknown hex color handling

When a hex color is found that doesn't exist in `tailwind.config.js`:

```
Color #3b82f6 not found in tailwind.config.js.
Proposed name: brand-secondary

  [yes]     — add as "brand-secondary" to tailwind.config.js + design-system.json
  [rename]  — enter a different name
  [closest] — use closest existing token instead: brand-accent (#0369a1)
  [skip]    — leave as-is for now (violation stays open)
```

On `yes` / `rename`:
- Add to `tailwind.config.js → theme.extend.colors`
- Add to `.wpaikit/design-system.json → colors`
- Replace hex in the file with the new `@apply` class

### `pick` mode

Show numbered file list:
```
Files with violations:
  1. frontend/src/css/components/_button.scss  (2 violations)
  2. frontend/src/css/blocks/_hero-block.scss  (2 violations)
  3. views/components/button.twig             (1 violation)

Enter file numbers to fix (e.g. 1 3) or [all] or [cancel]:
```

## Phase 5 — Final report

```
=== Validation complete ===

Fixed:
  frontend/src/css/components/_button.scss   2 violations → resolved
  views/components/button.twig              1 violation  → resolved

Could not auto-fix:
  frontend/src/css/blocks/_hero-block.scss
    [6] Non-Tailwind property "clip-path" — no Tailwind equivalent, left as-is

Still clean:
  N files unchanged

tailwind.config.js → N new colors added
design-system.json → N new colors added
```

## Boundaries

- Never modify files that are clean
- Never add hex colors to tailwind.config.js without user confirmation
- Never delete existing styles — only convert or add
- Re-validate every fixed file before moving to the next
- Maximum 2 auto-fix rounds per file — if violations remain after round 2, report and move on
- Skip `_variables.scss`, `_reset.scss`, `_mixins.scss` — these are exempt from BEM and `@apply` rules
