# Boilerplate Architecture

## Project Structure

WordPress core is committed in `wp-admin/`, `wp-includes/`, and root `wp-*.php` files. Custom work belongs in `wp-content/themes/boilerplate/`.

Theme PHP lives in `src/Theme/`:
- `Controllers/` — route-level rendering (one controller per WP template)
- `Services/` — business logic, WP_Query helpers, CPT data formatting
- `Blocks/` — shared base block class
- `Config/` — constants and configuration

Other locations:
- `blocks/{BlockName}/` — ACF block PHP classes
- `views/` — Twig layouts, partials, components, block templates
- `acf-json/` — ACF local JSON field group exports
- `frontend/src/` — Vite / Tailwind / SCSS / JS source
- `frontend/dist/` — build output, not committed
- `inc/` — bundled dependencies (ACF Pro); do not modify unless intentionally updating

The starter ships one block (`ExampleBlock`) and four Twig components: `button.twig`, `play-button.twig`, `video.twig`, `load-more-button.twig`.

## What to Commit

Do not commit: `wp-config.php`, `.env`, uploads, debug logs, `vendor/`, `node_modules/`, `frontend/dist/`, third-party plugin code.

Always commit: `composer.lock`.

Keep `inc/` unchanged unless intentionally updating the bundled dependency.
