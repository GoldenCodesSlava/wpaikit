# Slicing Project Structure

Slicing works in any front-end project — there is no dedicated boilerplate. This file defines where
generated files go.

## Resolution order

1. `.wpaikit/project.md` → `## Key Directories` and `## Entry Points` (written by `/scan-project`).
   Use those paths when present.
2. Existing project conventions: if the project already has a blocks/components directory,
   a main SCSS file or a main JS file, reuse them.
3. Otherwise use the defaults below and tell the user which paths were created.

Never create a second parallel structure next to an existing one.

## Defaults

```
src/
├── blocks/
│   └── {block-kebab}/
│       └── {block-kebab}.html        ← block markup
├── components/
│   └── {component-kebab}.html        ← reusable component markup
├── scss/
│   ├── main.scss                     ← SCSS entry: imports every partial
│   ├── blocks/_{block-kebab}.scss
│   └── components/_{component-kebab}.scss
├── js/
│   ├── main.js                       ← JS entry: imports and initialises modules
│   └── blocks/{block-kebab}.js       ← only for interactive blocks
└── assets/
    ├── images/                       ← exported Figma images
    └── icons/                        ← exported SVG icons
tailwind.config.js                    ← tokens from design-system.json
```

## Entry files

- SCSS entry: add `@import 'blocks/{block-kebab}';` (or `@use`, following what the file already uses).
- JS entry: add `import { init{BlockPascal} } from './blocks/{block-kebab}.js';` and call it once
  after `DOMContentLoaded` (or in the existing init routine).
- If an entry file does not exist, create it and tell the user to include it in their build.

## Assets

- Export images used by the block from Figma into `src/assets/images/` with kebab-case names
  (`hero-block-background.webp`). Prefer WebP for photos and SVG for icons and logos.
- Reference assets with paths relative to the HTML file location used by the project build.

## Shared files

- `.wpaikit/design-system.json` — tokens (written by `/figma-design-system` in the Design pack or
  delivered by the designer). Format: `knowledge/shared/contracts/design-system.md`.
- `.wpaikit/components-registry.md` — existing components, reused instead of re-implemented.
- `.wpaikit/project.md` — project knowledge base (`/scan-project`).
