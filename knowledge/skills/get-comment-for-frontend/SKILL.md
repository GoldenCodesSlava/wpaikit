---
name: get-comment-for-frontend
description: Use when generating a developer reference .md file that lists all ACF blocks on a WordPress page. Reads wp-config.php for DB credentials, queries post_content directly from the database, parses Gutenberg block comments, and resolves Twig + SCSS + JS file paths for each block.
metadata:
  short-description: Generate a .md block reference file for a WordPress page without WP-CLI
---

# Page Blocks Reference Generator

## Purpose

Generate a `page-blocks-<slug>.md` developer reference file that lists every ACF block
used on a specific WordPress page, with exact file paths to Twig, SCSS, and JS (if present).

Intended audience: Frontend developers who need to find and fix block files quickly.

---

## Phase 1 — Read DB credentials from wp-config.php

### 1.1 Locate wp-config.php

Search from the current working directory upward:
- `../../wp-config.php` (standard: running from `wp-content/themes/boilerplate/`)
- `../../../wp-config.php`
- `wp-config.php` (if already at WP root)

If not found, show:
```
Error: wp-config.php not found. Run this command from wp-content/themes/boilerplate/.
```
Stop.

### 1.2 Extract credentials

Read the file and extract:
- `DB_NAME` — from `define( 'DB_NAME', '...' );`
- `DB_USER` — from `define( 'DB_USER', '...' );`
- `DB_PASSWORD` — from `define( 'DB_PASSWORD', '...' );`
- `DB_HOST` — from `define( 'DB_HOST', '...' );`
- `$table_prefix` — from `$table_prefix = '...';`

Pattern: both `define('DB_NAME', 'value')` and `define( 'DB_NAME', 'value' )` are valid.

**Never print credentials to output.**

---

## Phase 2 — Resolve page slug and query post_content

### 2.1 Parse the argument

The argument may be:
- A full URL: `https://site.local/about/` → slug = `about`
- A path: `/about/` or `about` → slug = `about`
- Home page indicators: `/`, `home`, `https://site.local/` → slug = home page (see 2.2b)

Strip leading/trailing slashes. Take the last path segment as the slug.

### 2.2a Query by slug (non-home pages)

```bash
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" \
  --batch --skip-column-names \
  -e "SELECT post_content, post_title FROM ${table_prefix}posts WHERE post_name = 'SLUG' AND post_status = 'publish' AND post_type = 'page' LIMIT 1;"
```

### 2.2b Home page query

If slug is empty / home:

```bash
# Step 1: get page_on_front option
mysql ... -e "SELECT option_value FROM ${table_prefix}options WHERE option_name = 'page_on_front' LIMIT 1;"

# Step 2: get post_content by ID
mysql ... -e "SELECT post_content, post_title FROM ${table_prefix}posts WHERE ID = PAGE_ID LIMIT 1;"
```

If `page_on_front` is `0`, the blog index is the home page — no ACF blocks to list.
Show: `Note: Home page uses the blog index (no ACF blocks).` and stop.

### 2.3 Handle not found

If the query returns empty:
```
Error: Page with slug "SLUG" not found (must be published, post_type = page).
```
Stop.

### 2.4 Store results

Store `post_content` and `post_title` for the next phase.

---

## Phase 3 — Parse ACF blocks from post_content

### 3.1 Extract block names

WordPress Gutenberg stores blocks as HTML comments. ACF blocks use the `acf/` namespace:

Self-closing:
```html
<!-- wp:acf/hero-block {"name":"acf/hero-block","data":{},...} /-->
```

With inner content:
```html
<!-- wp:acf/hero-block {"name":"acf/hero-block",...} -->
...
<!-- /wp:acf/hero-block -->
```

Regex to match all block names: `<!-- wp:(acf/[a-z0-9-]+)`

Extract the full block identifier (e.g. `acf/hero-block`) from every match.

### 3.2 Preserve order, deduplicate

Keep the first occurrence order. Remove duplicates — list each unique block once.

If no ACF blocks found:
```
Note: No ACF blocks found in the post_content for "PAGE TITLE".
This page may use only classic content or non-ACF blocks.
```
Stop (do not write the output file).

---

## Phase 4 — Resolve file paths

For each block identifier (e.g. `acf/hero-block`):

### 4.1 Derive names

| Step | Example |
|------|---------|
| Strip `acf/` prefix | `hero-block` |
| kebab-case slug | `hero-block` |
| PascalCase class name | `HeroBlock` (capitalize each segment split by `-`) |

### 4.2 Standard file paths

| File | Path pattern |
|------|-------------|
| PHP class | `blocks/{ClassName}/{ClassName}.php` |
| Twig template | `views/blocks/{ClassName}/{ClassName}.twig` |
| SCSS partial | `frontend/src/css/blocks/_{slug}.scss` |

### 4.3 JS file — check existence

Check these paths in order (use Bash `test -f`):

1. `frontend/src/js/blocks/{slug}.js`
2. `frontend/src/js/blocks/{ClassName}.js`
3. `frontend/src/js/blocks/{slug}.ts`
4. `frontend/src/js/blocks/{ClassName}.ts`

Use the first path that exists. If none exist, JS = `none`.

### 4.4 Existence flags

Check whether each standard file actually exists on disk:
- If missing, note it as `⚠ not found` in the output table

---

## Phase 5 — Write output file

### 5.1 File name

Write to the current working directory:
- `page-blocks-{slug}.md` for regular pages
- `page-blocks-home.md` for the home page

### 5.2 Output format

```markdown
# Page: {post_title}

**Slug:** `{slug}`
**Generated:** {YYYY-MM-DD}
**Blocks found:** N

---

## Blocks

### 1. {ClassName}

| File | Path | Status |
|------|------|--------|
| Twig | `views/blocks/{ClassName}/{ClassName}.twig` | ✓ |
| SCSS | `frontend/src/css/blocks/_{slug}.scss` | ✓ |
| PHP  | `blocks/{ClassName}/{ClassName}.php` | ✓ |
| JS   | `frontend/src/js/blocks/{slug}.js` | ✓ |

### 2. {ClassName}

| File | Path | Status |
|------|------|--------|
| Twig | `views/blocks/{ClassName}/{ClassName}.twig` | ✓ |
| SCSS | `frontend/src/css/blocks/_{slug}.scss` | ✓ |
| PHP  | `blocks/{ClassName}/{ClassName}.php` | ✓ |
| JS   | — | — |
```

Rules:
- JS row is omitted entirely when no JS file exists (not `none` or `—`)
- Status `✓` = file exists on disk, `⚠ not found` = file is missing
- One `###` heading per block, numbered sequentially

### 5.3 Terminal summary

After writing the file, show:

```
Page: About Us (about)
Blocks: 5

  1. HeroBlock
     Twig  ✓  views/blocks/HeroBlock/HeroBlock.twig
     SCSS  ✓  frontend/src/css/blocks/_hero-block.scss
     PHP   ✓  blocks/HeroBlock/HeroBlock.php
     JS    ✓  frontend/src/js/blocks/hero-block.js

  2. TeamBlock
     Twig  ✓  views/blocks/TeamBlock/TeamBlock.twig
     SCSS  ✓  frontend/src/css/blocks/_team-block.scss
     PHP   ✓  blocks/TeamBlock/TeamBlock.php
     JS    —

  3. CtaBlock
     Twig  ✓  views/blocks/CtaBlock/CtaBlock.twig
     SCSS  ⚠  frontend/src/css/blocks/_cta-block.scss  ← not found
     PHP   ✓  blocks/CtaBlock/CtaBlock.php
     JS    —

Output written: page-blocks-about.md
```

---

## Boundaries

- Read-only: never modify any file other than writing the output `.md`
- Never print DB credentials to the terminal
- Never run `UPDATE`, `INSERT`, or `DELETE` queries
- If `mysql` command is not available, show: `Error: mysql CLI not found. Install mysql-client and retry.`
- If DB connection fails, show the mysql error and stop
