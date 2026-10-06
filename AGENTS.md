# wpaikit — Agent Instructions

## Project

wpaikit is a CLI tool for scaffolding WordPress sites from boilerplates with AI-assisted design-to-code workflows.

**Stack:** TypeScript · pnpm workspaces · ACF · Twig · Tailwind CSS · WordPress

**Packages:**
- `packages/cli` — the `wpaikit` CLI binary
- `packages/core` — shared utilities

## Knowledge Base

The `knowledge/` directory is the single source of truth for wpaikit's AI workflows. It is split
into independent packs that users select with `wpaikit knowledge install --packs`:

- `knowledge/packs.json` — pack catalog: commands, shared files, WordPress variants, command metadata
- `knowledge/packs/design/` — Figma workflows for designers (no code generation, no WordPress rules)
- `knowledge/packs/slicing/` — CMS-agnostic HTML + SCSS + Tailwind + JS slicing
- `knowledge/packs/wordpress/` — WordPress theme rules and ACF block generation
- `knowledge/packs/woocommerce/` — extra directory of the `woo` WordPress variant
- `knowledge/packs/shared/` — files and commands used by several packs (`figma-blocks.md`,
  contracts, `/scan-project`, `/setup-fonts`)
- `knowledge/packs/base/` — fragments for the generated `AGENTS.md` and `knowledge/context.md`

Pack `X` installs to `knowledge/X/` in the project; `claude-commands/` installs to
`.claude/commands/`. Every `knowledge/...` reference inside a pack must resolve when that pack is
installed alone — `packages/cli/src/__tests__/knowledge.test.ts` enforces this, and keeps the Slicing
pack free of WordPress specifics. To add a command: put `prompts/`, `skills/` and
`claude-commands/` files in the pack and register the command in `packs.json`.
