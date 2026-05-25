# Page Blocks Reference Generator

Generate a `.md` file that lists all ACF blocks used on a WordPress page,
with Twig, SCSS, and JS file paths for each block — for developer reference.

## Arguments

`<page-url-or-slug>` — the full page URL or slug (e.g. `https://site.local/about` or `about`)

## Requirements

- Run from `wp-content/themes/boilerplate/`
- `wp-config.php` must exist two levels up (standard WordPress root)
- No WP-CLI required — uses direct MySQL access

## Context to load

Before starting, read:
1. `knowledge/skills/get-comment-for-frontend/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Read DB credentials
- Parse `wp-config.php` to extract `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `$table_prefix`

### Phase 2 — Query post_content
- Extract the slug from the argument
- Run a MySQL query to get `post_content` for the matching published page

### Phase 3 — Parse blocks
- Extract all `<!-- wp:acf/* -->` block names from the post_content
- Deduplicate and preserve order

### Phase 4 — Resolve file paths
- For each block name, derive the class name and check Twig + SCSS + JS paths
- Mark JS path only if the file exists on disk

### Phase 5 — Write output
- Write `page-blocks-<slug>.md` in the current working directory

## Constraints

- Never modify `wp-config.php` or any theme files
- Read-only DB query — SELECT only
- If the page is not found, show a clear error and stop
- Never display DB credentials in output
