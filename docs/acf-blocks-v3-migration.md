# Migrating a project to ACF Blocks v3

Projects created from the boilerplates before the ACF Blocks v3 release register blocks with
`acf_register_block_type()`, bundle ACF PRO 6.2 inside the theme and render the editor preview
without theme styles. This guide moves such a project to the current boilerplate model:

- ACF PRO 6.7+ is a regular plugin in `wp-content/plugins/advanced-custom-fields-pro`;
- every block is an ACF Blocks v3 block registered from `blocks/{Name}/block.json`;
- the editor iframe loads the theme stylesheet;
- `tests/blocks-v3.php` (`composer test:blocks`) guards the contract.

Saved content does not change: block names stay `acf/{block-name}` and field keys stay the same.

The AI command `/migrate-blocks-v3` (WordPress knowledge pack) runs the same procedure step by
step. Use this guide to review what it does or to migrate by hand.

## Why now

- WordPress 7.1 renders the block editor canvas in an iframe. The v2 "edit mode" depends on
  wp-admin scripts that are not loaded there, so fields end up in a narrow sidebar.
- ACF PRO 6.8.9+ switches every block without an explicit version to v3 on WordPress 7.1. An
  unmigrated theme then shows unstyled previews, and the legacy helpers below misbehave.

## Before you start

1. Work on a branch with a clean working tree.
2. Have the licensed ACF PRO zip (6.7 or newer).
3. Note the pages that use each block. Save their HTML so you can compare after the migration:

   ```bash
   curl -s https://project.test/page-with-blocks/ > before.html
   ```

## 1. Move ACF PRO out of the theme

1. Install and activate ACF PRO as a plugin **first**:

   ```bash
   wp plugin install /path/to/advanced-custom-fields-pro.zip --activate
   ```

   The theme only includes its bundled copy when `class_exists('ACF')` is false, so the plugin
   takes over immediately. Make sure it is **active**, not just installed: once the bundled loader
   is removed, an inactive plugin leaves the site without ACF fields, options and blocks.
2. Move the options pages from `inc/dependencies/acf/theme-settings.php` into
   `AcfService::registerOptionsPages()` (called from `AcfService::init()`), unchanged.
3. Replace `ThemeSetup::initializeAcfPro()` (the `init` hook that includes
   `inc/dependencies/acf/init.php`) with an `admin_notices` callback that warns when
   `class_exists('ACF')` is false.
4. Delete `inc/dependencies/acf/`. Do not copy a newer ACF into the theme instead: ACF 6.8 ships
   its own `vendor/` autoloader, which the theme's `vendor/` ignore rule would drop from git.

Check: the site still answers 200, wp-admin shows the Theme Settings menu, and deactivating the
plugin shows the notice instead of a fatal error.

## 2. Update the block core

Copy from the current boilerplate (replace the `Boilerplate` namespace, the `boilerplate` text
domain and the `boilerplate-blocks` category with the project values):

- `src/Theme/Blocks/AbstractBlock.php`
- `src/Theme/Services/BlocksService.php`

Keep any project-specific helper methods that your old `AbstractBlock` had.

What changes:

| Before | After |
|---|---|
| Each block hooks `acf/init` and calls `acf_register_block_type()` | `BlocksService` registers `blocks/*/block.json` on `init`; blocks without `block.json` still register through a deprecated fallback, already as v3 |
| `render(array $block)` guesses the preview from `is_admin()` | `render()` receives the six ACF render arguments; `$this->isPreview` is set before `getContext()` |
| `getField()` returns raw `$block['data']` (repeater row counts, attachment IDs) | `getField()` reads saved blocks through `get_field()`; raw data only for the inserter example (`is_example` marker) |
| A switched-off True/False field falls back to the default | `false` is kept for True/False fields |
| A hidden block (`is_active` off) looks active in the editor | It is outlined and labelled "Hidden on frontend" |
| — | Twig helpers `block_wrapper_attributes()`, `acf_inline_text()`, `acf_inline_toolbar()` |

> **Behaviour changes to expect.** Repeater, group and flexible content fields read through
> `getField()` used to come back empty on the frontend; after the update they render. True/False
> fields read with a `true` default used to ignore "off"; after the update they respect it. Review
> those blocks on the frontend.

## 3. Load theme styles in the editor iframe

In `AssetService`, enqueue the main stylesheet on `enqueue_block_assets` when `is_admin()` is true
(built `frontend/dist/css/main.css`, or the Vite dev server URL in `BOILERPLATE_DEV` mode). Without
this the v3 preview renders without Tailwind.

## 4. Migrate each block

For every `blocks/{Name}/`:

1. Create `block.json` from the metadata in `init()`:

   ```json
   {
       "$schema": "https://schemas.wp.org/trunk/block.json",
       "apiVersion": 3,
       "name": "acf/{block-name}",
       "title": "…",
       "description": "…",
       "category": "{slug}-blocks",
       "icon": "…",
       "keywords": ["…"],
       "textdomain": "{text-domain}",
       "supports": { "align": false, "anchor": true, "html": false },
       "acf": {
           "blockVersion": 3,
           "renderCallback": "{Namespace}\\Theme\\Services\\BlocksService::renderAcfBlock",
           "autoInlineEditing": false
       }
   }
   ```

   `name` must equal the old `acf/` + `$this->name`, and it must also equal `acf/` + the kebab-case
   folder name, because `tests/blocks-v3.php` derives it from the folder. If an old block used a
   different `$this->name` (e.g. `TeamBlock` with `team`), rename the folder, the class and the Twig
   file to match (`Team`) — never the block name. Do not add `mode`, `supports.mode`,
   `supports.jsx` or `example`: a v3 block with legacy mode settings renders only a placeholder,
   and the inserter example stays in `getExample()`.
2. Remove `init()` from the class. Add `block_anchor` to `sanitizeContext()` (keep `block_class`
   there; only Twig stops printing it).
3. In Twig, open the root element with
   `{{ block_wrapper_attributes({id: block_anchor ?: block_custom_id ?: block_id, class: '…'}) }}`
   and drop the manual `block_class`. Dynamic class parts are joined with `~`
   (`class: 'hero ' ~ (theme_class)`). Attributes without a value (`hidden`, `data-*` flags) stay
   next to the helper.
4. Optional: mark text-only elements with `{{ acf_inline_text('field') }}` and other editable
   fields with `{{ acf_inline_toolbar('field') }}`. Never call the raw
   `acf_inline_*_editing_attrs()` functions — they print `data-acf-*` and `role="button"` on the
   frontend.
5. Heavy blocks (product or post queries): cap the query while `$this->isPreview` is true; v3
   re-renders the preview on every field change.
6. Leave the field group location (`acf/{block-name}`) and all field keys as they are. Keep
   `block_custom_id` for existing content; mark it deprecated in its instructions.

## 5. Tests and checks

1. Copy `tests/blocks-v3.php` from the boilerplate (adjust the namespace, text domain and
   category) and add `"test:blocks": "php tests/blocks-v3.php"` to `composer.json`.
2. Add the ACF stubs (`acf_register_block_type`, `acf_inline_text_editing_attrs`,
   `acf_inline_toolbar_editing_attrs`, `acf_add_options_page`, `acf_add_options_sub_page`) to
   `phpstan-stubs/plugins.stub`.
3. Run:

   ```bash
   composer phpstan
   composer test:blocks
   cd frontend && npm run build
   ```

4. Compare the frontend HTML with `before.html`. Expected differences only: the
   `wp-block-acf-{name}` class on block roots, attribute order, whitespace — and repeater content
   that was missing before.
5. In the editor: insert each block, edit fields in the sidebar and in the expanded editor
   (pencil icon), try inline editing, hide a block with `is_active`, set an HTML anchor.

## Temporary fallbacks

If some blocks cannot be migrated yet:

- Blocks without `block.json` keep working through `AbstractBlock::registerLegacy()` (v3,
  deprecated).
- `add_filter('acf/blocks/default_block_version', fn () => 2)` or the
  `acf-blocks-v2-iframe-compatibility` plugin restore v2 behaviour. ACF calls both temporary; plan
  the migration anyway.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Fatal error after deleting `inc/dependencies/acf` | ACF PRO plugin not installed or inactive | Install and activate the plugin (step 1) |
| Block shows an icon and an "Edit Block" button instead of a preview | `mode: "edit"` / `supports.mode: false` left in block.json | Remove the legacy mode settings |
| Repeater or group renders empty | Old `getField()` reading raw `$block['data']` | Update `AbstractBlock` (step 2) |
| A True/False switch cannot be turned off | Old `getField()` replacing `false` with the default | Update `AbstractBlock` (step 2) |
| `data-acf-inline-*` / `role="button"` in frontend HTML | Raw ACF inline helpers in Twig | Use `acf_inline_text()` / `acf_inline_toolbar()` |
| Unstyled preview in the editor | Theme CSS not loaded into the iframe | Step 3 |
| Block missing from the inserter | `block.json` name or `renderCallback` namespace wrong | Run `composer test:blocks` |
