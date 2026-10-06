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

## Blocks

Create blocks as a matched triplet:

```
blocks/{BlockName}/{BlockName}.php          ← PHP class
views/blocks/{BlockName}/{BlockName}.twig   ← Twig template
acf-json/group_{block_name}.json           ← ACF field group
```

Copy `ExampleBlock` as the reference for metadata, context building, sanitization, and preview data. `BlocksService` auto-loads any class in the `Boilerplate\Theme\Blocks\` namespace.

## Dependencies

`composer.lock` is committed. Always run `composer install` (not `update`) when setting up.
