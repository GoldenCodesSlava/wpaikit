---
name: migrate-blocks-v3
description: Use when migrating an existing boilerplate-based WordPress theme from legacy ACF blocks (acf_register_block_type, ACF PRO bundled in inc/dependencies/acf) to ACF Blocks v3 (block.json, ACF PRO as a plugin). Audits the theme, reports a plan, then migrates the core and each block with validation after every step.
metadata:
  short-description: Migrate a boilerplate theme and its blocks to ACF Blocks v3
---

# Migrate Blocks to ACF Blocks v3

## Purpose

Bring a project created from an older boilerplate to the current block model:

- ACF PRO 6.7+ is a plugin in `wp-content/plugins/advanced-custom-fields-pro`, not part of the theme;
- every block is registered from `blocks/{Name}/block.json` (ACF Blocks v3);
- `AbstractBlock` / `BlocksService` match the current boilerplate;
- `tests/blocks-v3.php` (`composer test:blocks`) guards the contract.

Saved content must keep working: block names (`acf/{block-name}`), field keys and field names never change.

The target contract is described in `knowledge/wordpress/rules/boilerplate/php.md` (section "Blocks (ACF Blocks v3)"). Reference implementations from the boilerplate live next to this file in `reference/`:

| File | Use |
|---|---|
| `reference/AbstractBlock.php` | Replaces `src/Theme/Blocks/AbstractBlock.php` |
| `reference/BlocksService.php` | Replaces `src/Theme/Services/BlocksService.php` |
| `reference/blocks-v3.php` | Becomes `tests/blocks-v3.php` |
| `reference/ExampleBlock.block.json` | Shape of every generated `block.json` |

The reference files use the boilerplate identifiers. Always adapt them to the project (Phase 1.2) before writing.

## Phase 1 — Audit (read-only)

### 1.1 Verify location
The cwd must be the theme root: it contains `src/Theme/`, `blocks/` and `acf-json/`. If not → stop: "Run this command from `wp-content/themes/{theme}/`".

Recommend a clean git working tree. If `git status --porcelain` is not empty → warn and ask `[continue / cancel]`.

### 1.2 Project identifiers
Collect, in this order of preference:
- `NAMESPACE` — `namespace` in `../../../.wpaikit.json`, else the PSR-4 key in `composer.json` (`"{Namespace}\\": "src/"`)
- `TEXT_DOMAIN` — `textDomain` in `.wpaikit.json`, else `Text Domain:` in `style.css`
- `CATEGORY` — the block category slug registered in the current `BlocksService::registerBlockCategories()` (e.g. `{slug}-blocks`)
- `CATEGORY_TITLE` — its title string
- `THEME_SLUG` — the theme directory name (e.g. `acme` for `wp-content/themes/acme/`)

Replacement map — apply it to every reference file **and** to every string you move or write (options pages, notices):

| Boilerplate | Project |
|---|---|
| `Boilerplate\` (and the escaped `Boilerplate\\` in JSON / PHP strings) | `{NAMESPACE}\` |
| `'boilerplate'` / `"boilerplate"` (text domain) | `{TEXT_DOMAIN}` |
| `boilerplate-blocks` | `{CATEGORY}` |
| `Boilerplate Blocks` | `{CATEGORY_TITLE}` |
| `boilerplate-block-hidden` (CSS class in `AbstractBlock`) | `{THEME_SLUG}-block-hidden` |
| `boilerplate-editor-style` (style handle) | `{THEME_SLUG}-editor-style` |

Existing project handles and identifiers that still say `boilerplate` (e.g. `boilerplate-style`, `composer.json` `name`, `Theme Name`) are out of scope: list them in the report under "Leftover identifiers" and leave them unchanged.

### 1.3 ACF state
- Bundled copy: does `inc/dependencies/acf/acf.php` exist? Read its `Version:` header.
- Plugin copy: does `../../plugins/advanced-custom-fields-pro/acf.php` exist? Read its `Version:` header.
- Plugin activation: if WP-CLI can reach the site (`wp core is-installed --path=../../..` succeeds), run `wp plugin is-active advanced-custom-fields-pro --path=../../..`. Report `active`, `inactive` or `not checked (WP-CLI unavailable)`.
- Loader: does `ThemeSetup` include `inc/dependencies/acf/init.php` (usually `initializeAcfPro()` on `init`)? Does `inc/dependencies/acf/theme-settings.php` register options pages?

### 1.4 Block inventory
For each `blocks/{Name}/` record:
- `block.json` present? (present → already v3-registered; still check it against the contract)
- legacy metadata in `init()`: `name`, `title`, `description`, `keywords`, `icon`
- **name mismatch:** `$this->name` must equal kebab-case of the folder/class name (`TeamBlock` → `team-block`), because `tests/blocks-v3.php` derives the block name from the folder. Flag every mismatch.
- field group in `acf-json/` with location `block == acf/{name}`
- `getField()` calls with a boolean default (True/False fields) — no code change is needed, but behaviour changes (see Phase 6)
- direct reads of `$block['data']` or `get_field()` outside `getField()`
- heavy queries in `getContext()` (`WP_Query`, `get_posts`, `wc_get_products`, service query classes)
- Twig root element: hard-coded `id="{{ ... }}"` / `class="... {{ block_class }}"`
- raw `acf_inline_text_editing_attrs` / `acf_inline_toolbar_editing_attrs` in Twig

### 1.5 Core inventory
- `AbstractBlock`: legacy (constructor hooks `acf/init`, `register()` calls `acf_register_block_type`, `init()` is `abstract`) or current (`registerLegacy()`, `getEditorExample()`, a non-abstract `init()`)? List public/protected methods that are **not** in `reference/AbstractBlock.php` — they are project helpers and must be kept.
- `BlocksService`: has `renderAcfBlock()`? List project-specific additions. Note: the legacy `init()` loads blocks immediately, the reference defers `loadBlocks()` to the WordPress `init` hook. Search the theme for code that reads block instances or `BlocksService` state before `init` and list it.
- `AssetService`: has an `enqueue_block_assets` callback? List unused admin-style methods (e.g. `enqueueAdminAssets()` with a commented-out hook, `loadThemeStylesInAdmin()` with no caller).
- `AcfService`: registers the Theme Settings options pages?
- `phpstan-stubs/plugins.stub`: has the ACF block stubs?
- `composer.json`: has `test:blocks`?

### 1.6 Report and confirm

```
=== ACF Blocks v3 migration plan ===

Project:   {NAMESPACE} · text domain {TEXT_DOMAIN} · category {CATEGORY}
ACF:       bundled 6.2.5 (inc/dependencies/acf) · plugin: not installed / 6.8.10 active / 6.8.10 inactive
Core:      AbstractBlock legacy · BlocksService legacy · editor styles missing

Blocks (N):
  HeroBlock        legacy init()   heavy query: no   bool getField: 1   Twig root: manual id/class
  ProductsBlock    legacy init()   heavy query: yes  bool getField: 0   Twig root: manual id/class

Warnings:  TeamBlock: $this->name 'team' ≠ folder name → see 4.0
Leftover identifiers (unchanged): composer.json name boilerplate/wordpress-theme · style handle boilerplate-style

Steps:
  1. ACF PRO plugin            {blocked: install the plugin first / ready}
  2. Core files                AbstractBlock, BlocksService, AssetService, AcfService, ThemeSetup
  3. Blocks                    N × block.json + class + Twig
  4. Tests                     tests/blocks-v3.php, composer test:blocks, phpstan stubs
```

Ask: `[migrate all / pick blocks / core only / cancel]`.

Gate before any write:
- Plugin missing or older than 6.7 → stop after the report. Tell the user to run `wp plugin install /path/to/advanced-custom-fields-pro.zip --activate`. (A bundled copy older than 6.7 cannot register v3 blocks either; with no suitable ACF at all, only the report runs.)
- Plugin installed but **inactive** → stop after the report and ask the user to activate it. Removing the bundled loader would leave the site without ACF.
- Activation not checked (no WP-CLI) → ask the user to confirm the plugin is active before Phase 2.

## Phase 2 — ACF out of the theme

Only when the plugin copy exists with version ≥ 6.7.

1. Move the options pages from `inc/dependencies/acf/theme-settings.php` into `AcfService` as a private `registerOptionsPages()` called at the end of `AcfService::init()`. Keep page titles, slugs, capabilities, `redirect` and parents unchanged; use `{TEXT_DOMAIN}` in `__()` (replacement map). Guard with `function_exists('acf_add_options_page') && function_exists('acf_add_options_sub_page')`.
2. In `ThemeSetup`: replace the `init` hook that includes `inc/dependencies/acf/init.php` with `add_action('admin_notices', [$this, 'renderMissingAcfNotice'])`, **delete the old loader method** (usually `initializeAcfPro()`), and add:

   ```php
   /**
    * ACF PRO is installed per project as a regular plugin; warn admins when it is missing.
    */
   public function renderMissingAcfNotice(): void
   {
       if (class_exists('ACF') || !current_user_can('activate_plugins')) {
           return;
       }

       printf(
           '<div class="notice notice-error"><p>%s</p></div>',
           esc_html__('The theme requires the Advanced Custom Fields PRO plugin. Install and activate it in wp-content/plugins.', '{TEXT_DOMAIN}')
       );
   }
   ```
3. Ask before deleting: `Delete inc/dependencies/acf/ ({N} files)? [yes / skip]` — show the file count, not the file list. On yes → delete the directory.
4. Validate: `php -l` on `AcfService.php` and `ThemeSetup.php`; `grep -rnE "(include|require)(_once)?[^;]*dependencies/acf" src functions.php` returns nothing.

## Phase 3 — Core

Write each file only after showing the planned change and getting `[write / skip / cancel]`.

1. `src/Theme/Blocks/AbstractBlock.php` ← `reference/AbstractBlock.php` adapted with the replacement map. Re-add every project helper method found in 1.5 unchanged.
2. `src/Theme/Services/BlocksService.php` ← `reference/BlocksService.php` adapted. Keep `registerBlockCategories()` with the project category slug and title. Re-add project-specific methods and hooks.
3. `AssetService`: add a public `enqueueEditorCanvasAssets()` hooked on `enqueue_block_assets` that returns unless `is_admin()` and enqueues the same main stylesheet as the frontend (Vite dev server URL in development mode, `frontend/dist/css/main.css` otherwise) under the handle `{THEME_SLUG}-editor-style`. Extract the shared enqueue into a private helper if the frontend method inlines it. Leave the existing frontend handles unchanged. Unused admin-style methods found in 1.5: report them and ask `[remove / keep]`.
4. `phpstan-stubs/plugins.stub`: add stubs for `acf_register_block_type(array $block): array|false`, `acf_inline_text_editing_attrs(string $field_name, array $args = []): string`, `acf_inline_toolbar_editing_attrs(string|array $fields, array $args = []): string|array`, `acf_add_options_page(array $page = []): array|false`, `acf_add_options_sub_page(array $page = []): array|false` — only those that are missing.

After each file: `php -l {file}`. After all four: `composer phpstan` (if it runs out of memory: `composer phpstan -- --memory-limit=1G`). Fix errors before Phase 4.

At this point every legacy block still works through `registerLegacy()` (already v3). Smoke check when WP-CLI can reach the site: `wp option get home --path=../../..` gives the URL; `wp post list --post_type=page,post --s='wp:acf/' --fields=ID,url --path=../../..` gives pages with blocks. Each must answer HTTP 200. Otherwise skip and say so in the report.

## Phase 4 — Blocks

One block at a time, in inventory order. For each `{Name}` (kebab `{name}`, snake `{name_snake}`):

### 4.0 Name mismatch (only for blocks flagged in 1.4)
The block name (`acf/` + old `$this->name`) must never change. Ask:
`{Name}: block name acf/{old} does not match the folder. [rename folder + class to match / skip this block]`
- Rename: move `blocks/{Name}/` and `views/blocks/{Name}/` to the PascalCase of `{old}` (e.g. `team` → `Team`), rename the class, its namespace segment and the Twig file. The block name and field group stay untouched.
- Skip: the block keeps working through `registerLegacy()`, but `composer test:blocks` will fail on it until it is migrated; say so in the report.

### 4.1 block.json
Copy `reference/ExampleBlock.block.json` verbatim to `blocks/{Name}/block.json` (keeps `$schema`, `apiVersion`, `acf.blockVersion`, `acf.autoInlineEditing: false`), then replace:
- `name`: `acf/` + the old `$this->name` (must equal the field group location)
- `title`, `description`, `icon`, `keywords`: the source strings from `init()` (without `__()`)
- `category`: `{CATEGORY}`; `textdomain`: `{TEXT_DOMAIN}`
- `acf.renderCallback`: `{NAMESPACE}\\Theme\\Services\\BlocksService::renderAcfBlock`
- `supports`: `{ "align": false, "anchor": true, "html": false }` unless the old `supports` enabled `align` — then keep that value
- never `mode`, `supports.mode`, `supports.jsx`, `renderTemplate` or `example`

### 4.2 PHP class
- Remove `init()` and the legacy metadata properties it set.
- In `sanitizeContext()` add `$sanitized['block_anchor'] = $this->sanitizeAttribute($context['block_anchor'] ?? '');` next to `block_custom_id`.
- Replace direct `get_field('x')` / `$block['data']['x']` reads in `getContext()` with `$this->getField('x', $default, $block)`.
- Heavy query found in 1.4 → cap it while `$this->isPreview` is true (e.g. `private const PREVIEW_PER_PAGE = 4;` and `if ($this->isPreview) { $perPage = min($perPage, self::PREVIEW_PER_PAGE); }`).
- Keep `getExample()`; it feeds the inserter preview.
- Keep `block_class` in `sanitizeContext()`: `AbstractBlock` still provides it; only the Twig root stops printing it.
- `getField()` with a boolean default: no change; list the field for the Phase 6 report.

### 4.3 Twig
- Root element → `<{tag} {{ block_wrapper_attributes({id: block_anchor ?: block_custom_id ?: block_id, class: '{existing static classes}'}) }} {valueless attributes}>`. Dynamic class parts are concatenated with `~` inside parentheses: `class: 'example-block ' ~ (theme_classes[background_color]|default(theme_classes.white))`. Remove `{{ block_class }}` and the manual `id`. Keep attributes without a value (`hidden`, `data-*` flags) outside the helper. If the old template printed an `id` only when `block_custom_id` was set, use `block_anchor ?: block_custom_id` (no `block_id` fallback).
- Replace raw `acf_inline_*_editing_attrs` calls with `acf_inline_text()` / `acf_inline_toolbar()`.
- Optional, ask once for all blocks `[add inline editing / skip]`: `{{ acf_inline_text('field') }}` on elements whose only content is a Text/Textarea field, `{{ acf_inline_toolbar('field') }}` on wysiwyg, image and link elements (for images put it on the wrapping `<figure>`/element; for links it may go on the `<a>`). Skip repeater sub-fields (ACF has no inline editing for them). Keep `{% if field %}` guards as they are: an empty field stays editable through the sidebar.

### 4.4 Field group
- Do not change the location, keys or names.
- If a `block_custom_id` field exists, set its `instructions` to "Deprecated: use Advanced → HTML anchor in the block sidebar. Kept as a fallback for existing content." and bump `modified` to the current Unix time.

### 4.5 Validate the block
`php -l blocks/{Name}/{Name}.php`, JSON parse of `block.json`, then continue with the next block.

## Phase 5 — Tests

1. Write `tests/blocks-v3.php` ← `reference/blocks-v3.php` adapted with the replacement map.
2. Add `"test:blocks": "php tests/blocks-v3.php"` to `composer.json` scripts.
3. Run `composer test:blocks`, `composer phpstan`, and `npm run build` in `frontend/`. Fix every failure the test names (it reports the block and the broken rule).

## Phase 6 — Report

```
=== ACF Blocks v3 migration: done ===

ACF:     plugin 6.8.10 active · inc/dependencies/acf removed
Core:    AbstractBlock, BlocksService, AssetService, AcfService, ThemeSetup, phpstan stubs
Blocks:  N migrated (block.json + class + Twig), M skipped
Tests:   composer test:blocks ✓ · composer phpstan ✓ · npm run build ✓

Expected frontend changes:
  - wp-block-acf-{name} class on block roots, attribute order
  - repeater / group content that rendered empty before now renders (getField fix)
  - True/False fields with a `true` default now respect "off" (list them, e.g. TeamBlock show_roles)

Not changed (out of scope): {leftover identifiers}; theme README / AGENTS.md block sections — update them by hand if they describe the old triplet or inc/dependencies/acf

Check in the editor:
  1. Insert each block — preview has theme styles
  2. Sidebar fields and the expanded editor (pencil icon)
  3. Inline editing on marked elements
  4. is_active off → "Hidden on frontend" outline; frontend hides the block
  5. Advanced → HTML anchor becomes the section id
```

Do not commit. Suggest the commit split: ACF move (the large `inc/dependencies/acf` deletion goes alone) · core · blocks · tests.

## Boundaries

- Never rename a block (`acf/{name}`), a field key or a field name — saved content depends on them.
- Never delete `block_custom_id` fields; only mark them deprecated.
- Never delete `inc/dependencies/acf/` while the ACF plugin is missing or older than 6.7.
- Never add `mode`, `supports.mode`, `supports.jsx` or `example` to block.json.
- Never call the raw `acf_inline_*_editing_attrs()` functions from Twig.
- Never overwrite a file without showing the change and getting confirmation.
- Do not commit or push.
