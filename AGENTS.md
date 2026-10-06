# wpaikit — Agent Instructions

## Project

wpaikit is a CLI tool for scaffolding WordPress sites from boilerplates with AI-assisted design-to-code workflows.

**Stack:** TypeScript · pnpm workspaces · ACF · Twig · Tailwind CSS · WordPress

**Packages:**
- `packages/cli` — the `wpaikit` CLI binary
- `packages/core` — shared utilities

## Knowledge Base

The `knowledge/` directory is the single source of truth for wpaikit's AI workflows:

- `knowledge/layers/common/` — cross-preset workflows and Figma tooling
- `knowledge/layers/wordpress/` — WordPress theme and implementation rules
- `knowledge/layers/woocommerce/` — WooCommerce contracts, checks and recipes
- `knowledge/profiles/` — layer composition for each preset
- `knowledge/templates/` — profile-aware root agent files

The selected layers are composed into developer projects by `wpaikit init` and can be repaired or
updated with `wpaikit knowledge install`.

@knowledge/layers/common/context.md
