# Migrate Blocks to ACF Blocks v3

Migrate an existing boilerplate-based theme from legacy ACF blocks (`acf_register_block_type()`, ACF PRO bundled in `inc/dependencies/acf`) to ACF Blocks v3 (`block.json`, ACF PRO as a plugin).

## Arguments

No arguments.

## Requirements

- Run from the theme root: `wp-content/themes/{theme}/` (contains `src/Theme/`, `blocks/`, `acf-json/`)
- ACF PRO 6.7+ installed **and active** as a plugin in `wp-content/plugins/advanced-custom-fields-pro`; otherwise only the audit report runs
- A clean git working tree is recommended

## Context to load

Before starting, read:
1. `knowledge/wordpress/skills/migrate-blocks-v3/SKILL.md` — full procedure
2. `knowledge/wordpress/rules/boilerplate/php.md` — the ACF Blocks v3 contract (section "Blocks")
3. `knowledge/wordpress/rules/boilerplate/twig.md` — Twig autoescape rules
4. `knowledge/wordpress/skills/migrate-blocks-v3/reference/` — reference `AbstractBlock`, `BlocksService`, `tests/blocks-v3.php` and `block.json`

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Audit
- Collect project identifiers (namespace, text domain, block category)
- Check bundled vs plugin ACF PRO, core files and every block
- Report the plan and ask `[migrate all / pick blocks / core only / cancel]`

### Phase 2 — ACF out of the theme
- Options pages → `AcfService`, missing-ACF notice in `ThemeSetup`, delete `inc/dependencies/acf/` after confirmation

### Phase 3 — Core
- `AbstractBlock`, `BlocksService` from the reference (project helpers kept), editor iframe styles in `AssetService`, phpstan stubs

### Phase 4 — Blocks
- Per block: name check, `block.json`, class without `init()`, Twig root through `block_wrapper_attributes()`, field group (`block_custom_id` marked deprecated, keys untouched)

### Phase 5 — Tests
- `tests/blocks-v3.php`, `composer test:blocks`, `composer phpstan`, `npm run build`

### Phase 6 — Report

## Constraints

- Never rename blocks, field keys or field names
- Never delete `inc/dependencies/acf/` while the ACF PRO plugin is missing or older than 6.7
- Show every change and confirm before writing; never commit
