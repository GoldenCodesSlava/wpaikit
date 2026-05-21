# wpaikit — Agent Instructions

## Project

wpaikit is a CLI tool for scaffolding WordPress sites from boilerplates with AI-assisted design-to-code workflows.

**Stack:** TypeScript · pnpm workspaces · ACF · Twig · Tailwind CSS · WordPress

**Packages:**
- `packages/cli` — the `wpaikit` CLI binary
- `packages/core` — shared utilities

## Knowledge Base

The `knowledge/` directory is the single source of truth for wpaikit's AI workflows.
It is copied into developer projects by `wpaikit knowledge install`.

@knowledge/context.md
