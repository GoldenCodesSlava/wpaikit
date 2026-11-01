# PHP Conventions

## General

- `declare(strict_types=1)` on every file
- Namespace: `Boilerplate\`
- PascalCase classes, typed properties where practical
- No queries or formatting logic in Twig

## Services

Constructor sets properties only. Hooks are registered in an explicit `init()` called from `ThemeSetup`. Never call `$this->init()` inside a constructor.

## Post Types

`PostTypesService` is the single CPT registration point. It is empty by default. Do not register post types in blocks, templates, or controllers.

To add a CPT: copy `ExamplePostService.php` → `{Entity}Service.php`, update `POST_TYPE`. Always add `'no_found_rows' => true` to `WP_Query` calls that don't need pagination.

## Blocks (ACF Blocks v3)

Blocks are ACF Blocks v3 and need ACF PRO 6.7+ (a per-project plugin, not bundled in the theme). Create four matched files:

```
blocks/{BlockName}/block.json               ← metadata + acf settings
blocks/{BlockName}/{BlockName}.php          ← PHP class: context, sanitization, inserter example
views/blocks/{BlockName}/{BlockName}.twig   ← Twig template
acf-json/group_{block_name}.json           ← ACF field group, location block == acf/{block-name}
```

Copy `ExampleBlock` as the reference. `BlocksService` registers every `blocks/*/block.json` on `init` and routes rendering to the class.

### block.json

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "acf/hero-block",
    "title": "Hero Block",
    "description": "Short editor-facing description.",
    "category": "boilerplate-blocks",
    "icon": "cover-image",
    "keywords": ["hero", "banner"],
    "textdomain": "boilerplate",
    "supports": { "align": false, "anchor": true, "html": false },
    "acf": {
        "blockVersion": 3,
        "renderCallback": "Boilerplate\\Theme\\Services\\BlocksService::renderAcfBlock",
        "autoInlineEditing": false
    }
}
```

- `name` is `acf/{kebab-case of BlockName}`. Keep the `acf/` namespace: saved content and field group locations depend on it.
- `renderCallback` is always the `BlocksService::renderAcfBlock` dispatcher. Do not use `renderTemplate`.
- Never add `mode`, `supports.mode` or `supports.jsx`: v3 has no edit mode, and a v3 block with legacy mode settings renders only a placeholder.
- Do not put `example` in block.json. Inserter preview data lives in the class (`getExample()`) so it can be translated.

### PHP class

- Namespace `Boilerplate\Theme\Blocks\{BlockName}`, `class {BlockName} extends AbstractBlock`. No `init()`, no `acf_register_block_type()`; metadata belongs to block.json.
- Override `getContext(array $block)` to collect fields with `$this->getField('name', $default, $block)` and `sanitizeContext(array $context)` to normalize them (`sanitizeText`, `sanitizeHtml`, `sanitizeUrl`, `sanitizeImage`, `sanitizeLink`, `sanitizeChoice`).
- `getField()` reads saved blocks through `get_field()` (formatted repeater rows, image arrays). Raw `$block['data']` is used only for the inserter example. A switched-off True/False field returns `false`, not the default.
- `$this->isPreview` is true while the editor renders the preview. Heavy blocks limit their queries there (see `ProductsListingBlock` in the WooCommerce profile).
- Override `getExample()` with neutral preview data: `['attributes' => ['mode' => 'preview', 'data' => [...]]]`.
- `is_active` (True/False) hides the block on the frontend; in the editor the block stays visible with a "Hidden on frontend" marker.

### Twig

- Open the root element with `{{ block_wrapper_attributes({id: block_anchor ?: block_custom_id ?: block_id, class: 'hero-block ...'}) }}`. It merges the editor's HTML anchor, additional CSS classes and supports on the frontend. Do not print `block_class` manually.
- Inline editing: `{{ acf_inline_text('title') }}` on elements that contain only a Text/Textarea value, `{{ acf_inline_toolbar('image') }}` (or a list of fields) for other field types. These helpers print attributes only in the editor preview. Never call `acf_inline_text_editing_attrs()` / `acf_inline_toolbar_editing_attrs()` directly: they leak `data-acf-*` and `role="button"` to the frontend.
- Extra context: `is_preview`, `inner_content`, `block_anchor`, `block_id`, `page`.
- Never show an empty block in the editor. In the preview (`is_preview`) keep empty Text/Textarea elements with `acf_inline_text('field', {placeholder: '…'})` so editors type in place, and render `components/editor-placeholder.twig` (`label`, `attributes: acf_inline_toolbar('field')`, `variant: 'media'` for images) for other empty fields. Do not use ACF default values as sample content: they are saved and reach the frontend.

### Field group

- `key: group_{block_name}`, location `block == acf/{block-name}`, a Settings tab with `is_active` (True/False, default 1).
- `block_custom_id` is deprecated: editors use Advanced → HTML anchor (`supports.anchor`). Keep the field only in existing blocks for old content.

`tests/blocks-v3.php` (`composer test:blocks`) enforces this contract for every block.

### Parent and inner blocks (ColumnsBlock)

`ColumnsBlock` is the reference for nested ACF blocks, three levels deep:

- `ColumnsBlock` (`acf/columns-block`) — the row: header and grid settings. Renders `<InnerBlocks class="columns-block__grid" allowedBlocks="{{ allowed_blocks }}" template="{{ inner_blocks_template }}" />`; pass the JSON from PHP so Twig escapes it (Twig does not escape string literals). ACF replaces the tag with the rendered children on the frontend.
- `ColumnBlock` (`acf/column-block`, `parent: ["acf/columns-block"]`) — a container with only `is_active`. Renders `<InnerBlocks class="columns-block__stack" …>` limited to `ColumnBlock::ALLOWED_BLOCKS`; editors click + to add sub-blocks in any order. In the preview an empty column shows a hint that CSS hides once the column has a block.
- Sub-blocks (`parent: ["acf/column-block"]`): `ContentBlock` (one WYSIWYG field), `MediaBlock` (image or video, `media_type`), `ButtonsBlock` (up to two buttons). Each shows `components/editor-placeholder.twig` when empty.
- ACF edits only top-level fields in the canvas (Text/Textarea inline, others via the toolbar popover); keep each block's fields top level instead of nesting repeaters or Flexible Content.
- Context: the row provides `boilerplate/columns` (its data; `ColumnsBlock::settingsFromData()` reads values by field name or key). `BlocksService` adds `boilerplate/innerBlock` = `{index, count}` to inner blocks of theme blocks and `boilerplate/parentInnerBlock` = the parent's position (frontend only; blocks list them in `usesContext`). `MediaBlock` uses the column position for image `sizes` and eager loading; `ColumnBlock` drops columns over the limit.
- Count-dependent layout lives in CSS (`:has()` with `:nth-child(n of .wp-block-acf-column-block)`), so the editor canvas and the frontend share one grid.
- `getExample()` of a container returns nested `innerBlocks` with `is_example` data.
- Hooks a block needs (e.g. ACF validation) live in a service: block classes have no `init()`. `VideoService` validates every ACF URL field with the wrapper class `boilerplate-video-url`.

## Dependencies

`composer.lock` is committed. Always run `composer install` (not `update`) when setting up.
