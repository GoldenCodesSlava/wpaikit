# Boilerplate Architecture

## Project Structure

WordPress core lives in `wp-admin/`, `wp-includes/`, and root `wp-*.php` files; it is gitignored and `wpkit init` downloads the latest release. Custom work belongs in `wp-content/themes/boilerplate/`.

Theme PHP lives in `src/Theme/`:
- `Controllers/` — route-level rendering (one controller per WP template)
- `Services/` — business logic, WP_Query helpers, CPT data formatting
- `Blocks/` — shared base block class (`AbstractBlock`)
- `Config/` — constants and configuration

Other locations:
- `blocks/{BlockName}/` — ACF Blocks v3: `block.json` + PHP class
- `views/` — Twig layouts, partials, components, block templates
- `acf-json/` — ACF local JSON field group exports
- `frontend/src/` — Vite / Tailwind / SCSS / JS source
- `frontend/dist/` — build output, not committed
- `inc/` — bundled Timber bootstrap; do not modify unless intentionally updating
- ACF PRO 6.7+ is a per-project plugin in `wp-content/plugins/advanced-custom-fields-pro`, not part of the theme and not committed

Every profile ships `ExampleBlock` (the implementation reference) and `ColumnsBlock` (a row of 1–6 `ColumnBlock` columns; in each column editors add Content, Media and Buttons blocks). `ColumnsBlockV2` (`acf/columns-block-v2`) is the earlier field-based variant (repeater of columns + Flexible Content, edited in the sidebar), kept for comparison. The WooCommerce profile additionally ships `ProductsListingBlock`. `ColumnsBlock` is the only generic content block: before generating a new block for column layouts, check whether a `ColumnsBlock` preset covers the design. Do not add other generic content blocks to the starters.

Reusable Twig components include buttons, video, responsive images, feedback states, consent, and profile-specific commerce UI. Read `knowledge/wordpress/rules/boilerplate/theme-foundation.md` before adding global settings, image markup, or system states.

## What to Commit

Do not commit: `wp-config.php`, `.env`, uploads, debug logs, `vendor/`, `node_modules/`, `frontend/dist/`, third-party plugin code.

Always commit: `composer.lock`.

Keep `inc/` unchanged unless intentionally updating the bundled dependency. Never copy ACF PRO into the theme.
