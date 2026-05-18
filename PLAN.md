# wpaikit — Implementation Plan

## Project Overview

`wpaikit` is a CLI tool for scaffolding and developing WordPress sites based on custom boilerplates, with AI agent integration for block and design system development.

| | |
|---|---|
| **npm package** | `@veaceslav-golden/wp-ai-kit` |
| **Binary** | `wpaikit` |
| **Boilerplate repo** | `git@github.com:GoldenCodesSlava/boilerplate-wp-standard.git` |
| **Language** | TypeScript (strict mode) |
| **Package manager** | pnpm workspaces |

---

## Architecture

Two layers with a strict boundary:

```
Layer 1: AI tools (Claude Code, Codex, Cursor)
         /create-block · /init-site · skills · rules
                       ↓ calls
Layer 2: wpaikit CLI
         deterministic: file ops, WP download, block scaffolding, token updates
```

**Rule**: if the operation is deterministic (file rename, template generation, WP download) → CLI. If it requires interpretation (Figma → code, description → block fields) → AI prompt.

---

## Repository Structure

```
wpaikit/
├── packages/
│   ├── core/              # logger, exec, config, errors, rollback
│   └── cli/               # wpaikit binary (commander)
├── knowledge/
│   ├── rules/             # neutral markdown, no AI-specific frontmatter
│   │   ├── wp-boilerplate.md
│   │   ├── acf-blocks.md
│   │   ├── figma-to-block.md
│   │   └── design-system.md
│   ├── templates/
│   │   └── block/
│   │       ├── BlockName.php.hbs
│   │       ├── BlockName.twig.hbs
│   │       └── group_block_name.json.hbs
│   ├── prompts/           # universal prompts with {{ARGUMENTS}} placeholder
│   │   ├── init-site.md
│   │   ├── create-block.md
│   │   ├── create-block-by-figma.md
│   │   └── create-design-system.md
│   ├── examples/
│   │   └── figma-pairs/   # screenshot + generated block code + notes
│   ├── presets.json
│   └── plugins.json
├── packages/
│   └── adapters/
│       ├── claude-code/   # generates .claude/commands/, .claude/skills/
│       └── codex/         # generates AGENTS.md, docs/rules/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json           # pnpm workspace root
```

---

## Phase 0: Monorepo Setup

**Goal**: working monorepo, `wpaikit --version` runs, `pnpm test` passes.

- Init pnpm workspace with `packages/core` and `packages/cli`
- TypeScript strict mode, tsup, vitest, eslint, prettier
- GitHub Actions: lint → test → build
- `package.json` for each package with correct `bin`, `main`, `exports`

**Done when**: `wpaikit --version` outputs a version string locally.

---

## Phase 1: `packages/core`

Shared modules used by CLI (and later adapters):

| Module | Responsibility |
|---|---|
| `logger.ts` | picocolors + @clack/prompts spinners; `info` / `success` / `warn` / `error` |
| `exec.ts` | execa wrapper; masks passwords/tokens in log output |
| `prompts.ts` | @clack/prompts wrappers with sensible defaults |
| `config.ts` | read/write `.wpaikit.json` in project root |
| `errors.ts` | typed errors: `PreflightError`, `ValidationError`, `RollbackError` |
| `rollback.ts` | LIFO cleanup stack; runs on error at any step |

---

## Phase 2: `wpaikit init`

**What it does** — sets up a new WP project from scratch:

1. Validate `--name` (required): normalize to `kebab-case`, `PascalCase`, `snake_case`, `Human Title`
2. Create `<name>/` directory in cwd
3. Download latest stable WordPress from wordpress.org/latest.zip → extract into `<name>/`
4. Clone boilerplate repo (`--depth=1`), copy its `wp-content/` into `<name>/wp-content/`
5. Rename theme folder: `wp-content/themes/boilerplate` → `wp-content/themes/<name>`
6. Find/replace across all PHP, JSON, CSS, JS, MD files in `wp-content/themes/<name>/`:

   | Find | Replace | Where |
   |---|---|---|
   | `Boilerplate\` | `<PascalCase>\` | PHP namespace |
   | `'boilerplate'` | `'<kebab-case>'` | text domain in PHP |
   | `"boilerplate"` | `"<kebab-case>"` | text domain in JSON |
   | `boilerplate-blocks` | `<kebab-case>-blocks` | ACF block category |
   | `group_boilerplate_` | `group_<snake_case>_` | ACF JSON keys |
   | `Theme Name: Boilerplate` | `Theme Name: <Human Title>` | style.css |

7. Copy `wp-config-sample.php` → `wp-config.php` with `DB_NAME` pre-filled as `<snake_case>`
8. Post-install (skip with `--skip-install`):
   - `composer install` in `wp-content/themes/<name>/` — if `composer` available
   - `npm install` + `npm run build` in `wp-content/themes/<name>/frontend/` — if `npm` available
   - If either is unavailable: print the command for the developer to run manually
9. Print "Next steps" summary: configure DB credentials in `wp-config.php`, set up local server

**CLI flags**:

```bash
wpaikit init --name my-project              # required
wpaikit init --name my-project --yes        # skip confirmation prompts (CI)
wpaikit init --name my-project --dry-run    # print what would happen, no changes
wpaikit init --name my-project --skip-install   # skip composer/npm
wpaikit init --name my-project --preset woo     # future: select boilerplate variant
```

**Interactive mode** (when `--yes` not passed):
- Confirm project name and derived values (PascalCase namespace, text domain)
- Multiselect plugins from `knowledge/plugins.json` (with groups, defaults pre-checked)
- Summary screen → confirm before running

**Rollback**: every step registers a cleanup function. On error — all completed steps are reversed (directory removed, etc.).

**Idempotency**: if `<name>/` already exists, prompt before overwriting.

**Done when**: `wpaikit init --name test-site` produces a fully renamed, ready-to-configure WP project.

---

## Phase 3: `wpaikit doctor` + tests + publish v0.1.0

**`wpaikit doctor`** — environment check:
- `node` version (minimum TBD)
- `git` installed
- `composer` installed (warn if not)
- `npm` installed (warn if not)
- Write permissions in cwd
- Output: human-readable + `--json`

**Tests**:
- Unit tests for all `packages/core` modules
- Integration tests for `init` in a temp directory (mock WP download + boilerplate clone)
- Rollback scenario tests: mock failure at each step, verify cleanup
- Snapshot tests for `--json` outputs

**Publish**: `@veaceslav-golden/wp-ai-kit@0.1.0` to npm. Verify `npx @veaceslav-golden/wp-ai-kit init` from a clean environment.

---

## Phase 4: Knowledge Base

All files in English. No AI-tool-specific frontmatter (adapters add that later).

### `knowledge/rules/wp-boilerplate.md`
- Theme directory structure and extension points
- Naming conventions: files (kebab-case), PHP classes (PascalCase), functions (camelCase)
- Build pipeline: Vite config, Tailwind, SCSS, output paths
- PHP standards: `declare(strict_types=1)`, namespace `Boilerplate\`, typed properties
- JS standards: Prettier config (2-space, single quotes, ES5 trailing commas, 160 char width)
- Service pattern: constructor sets properties only, hooks in `init()`, called from `ThemeSetup`
- Where to put blocks, services, CPTs

### `knowledge/rules/acf-blocks.md`
- Block anatomy: PHP class + Twig template + ACF JSON group (triplet)
- PHP class structure based on `AbstractBlock`:
  - `init()`: sets `name` (kebab-case), `title`, `description`, `keywords`, `icon`
  - `getContext()`: gets ACF fields via `$this->getField()`, builds context array
  - `sanitizeContext()`: sanitizes every value using AbstractBlock helpers
  - `getExample()`: preview data for Gutenberg editor
- ACF JSON key conventions: `group_{namespace}_{block_slug}`, `field_{block_slug}_{field_name}`
- ACF JSON location binding: `"value": "acf/{block-name}"`
- Base fields every block must have: `is_active` (true_false) + `block_custom_id` (text)
- Twig autoescape rules (full table from README)
- Twig template conventions: Tailwind classes, `block_id` / `block_class` / `block_custom_id`
- `BlocksService` auto-loads any class in the `Boilerplate\Theme\Blocks\` namespace

### `knowledge/rules/figma-to-block.md`
- One Figma frame = one ACF block
- Figma Variables → Tailwind token mapping
- Auto-layout → flex/grid CSS
- Responsive rules and breakpoints (from tailwind.config.js)
- Typography mapping
- What NOT to do: inline styles, raw hex codes, classes outside design system

### `knowledge/rules/design-system.md`
- `tailwind.config.js` structure and extension points
- Token categories: colors, fonts, spacing, radius, shadows
- Syncing with Figma Variables

### `knowledge/templates/block/`

Three Handlebars templates. Template variables:

| Variable | Example |
|---|---|
| `{{BlockName}}` | `HeroBlock` |
| `{{block-name}}` | `hero-block` |
| `{{block_name}}` | `hero_block` |
| `{{BlockTitle}}` | `Hero Block` |
| `{{namespace}}` | `Boilerplate` |
| `{{textDomain}}` | `boilerplate` |

**`BlockName.php.hbs`** — PHP class extending AbstractBlock with `init()`, `getContext()`, `sanitizeContext()`, `getExample()` stubs.

**`BlockName.twig.hbs`** — minimal Twig template with `block_id`, `block_class`, `block_custom_id` wired up, placeholder content section.

**`group_block_name.json.hbs`** — ACF JSON with base fields (`is_active`, `block_custom_id`), correct key naming, location binding.

### `knowledge/presets.json`

```json
{
  "presets": [
    {
      "id": "standard",
      "name": "WP Standard",
      "repo": "git@github.com:GoldenCodesSlava/boilerplate-wp-standard.git",
      "branch": "main",
      "postInstall": [
        "composer install",
        "cd frontend && npm install",
        "cd frontend && npm run build"
      ]
    }
  ]
}
```

### `knowledge/plugins.json`

Grouped plugin registry. Example groups: SEO & Performance, Dev Tools, Forms, Media. Each plugin has `slug`, `label`, `default: true/false`.

---

## Phase 5: Block commands + v0.2.0

### `wpaikit create-block <name>`

Generates a new ACF block from templates. Must be run from inside a wpaikit project (checks for `.wpaikit.json`).

```bash
wpaikit create-block Hero
wpaikit create-block HeroBlock       # same result, normalizes to HeroBlock
wpaikit create-block hero-block      # same result
wpaikit create-block Hero --dry-run  # print what would be created
```

Steps:
1. Normalize name to `PascalCase` + derive `kebab-case`, `snake_case`, `Human Title`
2. Check no block with this name exists already
3. Render 3 templates with Handlebars
4. Write files:
   - `wp-content/themes/<project>/blocks/HeroBlock/HeroBlock.php`
   - `wp-content/themes/<project>/views/blocks/HeroBlock/HeroBlock.twig`
   - `wp-content/themes/<project>/acf-json/group_<project>_hero_block.json`
5. Print summary of created files

### Other block commands

```bash
wpaikit list-blocks --json           # list all blocks with name, path, ACF key
wpaikit theme-info --json            # theme name, namespace, paths, node/composer versions
wpaikit list-tokens --json           # design tokens parsed from tailwind.config.js
wpaikit apply-tokens <tokens.json>   # update tailwind.config.js (backup first, then patch)
```

All commands: support `--json` and human-readable output. Destructive commands support `--dry-run`.

`apply-tokens` writes a backup to `tailwind.config.js.bak` before modifying.

**Done when**: `wpaikit create-block Hero` creates a working ACF block that matches the ExampleBlock structure and auto-loads without errors.

---

## Phase 6: Universal Prompts

Each file in `knowledge/prompts/` uses this structure:

```markdown
# Title

What this command does.

## Arguments

User passed: {{ARGUMENTS}}

Expected arguments:
- `--arg` (required) — description

## Context to load

Before starting, read:
1. `knowledge/rules/wp-boilerplate.md`
2. `knowledge/rules/acf-blocks.md`

In Claude Code these load as skills automatically.
In other environments — read them explicitly before starting.

## Steps

1. ...

## Constraints

- ...

## Error handling

- Condition → action
```

### Prompts to write

**`init-site.md`** — run `wpaikit init` with collected parameters, show preset options.

**`create-block.md`**:
1. Read rules: `wp-boilerplate`, `acf-blocks`
2. Run `wpaikit theme-info --json` to get project context
3. Ask user: block name, fields needed, layout intent
4. Run `wpaikit create-block <name>` to scaffold files
5. Edit generated files to add the correct ACF fields (PHP + JSON) and Twig layout

**`create-block-by-figma.md`**:
1. Read rules: `wp-boilerplate`, `acf-blocks`, `figma-to-block`
2. Get design context via Figma MCP
3. Run `wpaikit list-tokens --json` to get current design tokens
4. Generate block PHP, Twig, ACF JSON following the rules
5. Run `wpaikit create-block <name>` to scaffold, then fill in generated content
6. Show result: created files, dev server command

**`create-design-system.md`**:
1. Read rules: `design-system`, `figma-to-block`
2. Extract Variables from Figma MCP
3. Map to tailwind.config.js token structure
4. Run `wpaikit apply-tokens <tokens.json>`

---

## Phase 7: Claude Code Adapter + v0.3.0

### What the adapter generates

From `knowledge/`, produces Claude Code-specific files:

**`.claude/commands/*.md`** — one per prompt in `knowledge/prompts/`:
- Adds frontmatter: `description`, `argument-hint`
- Replaces `{{ARGUMENTS}}` → `$ARGUMENTS`

**`.claude/skills/<name>/SKILL.md`** — one per rule in `knowledge/rules/`:
- Adds frontmatter: `name`, `description` (written as "when to activate this skill")
- Content stays as-is from knowledge/rules/

### Commands

```bash
wpaikit install claude-code           # copy to <project>/.claude/
wpaikit install claude-code --global  # copy to ~/.claude/
wpaikit sync claude-code              # update from current package version (warns on manual edits)
```

### Done when

Full cycle works: `wpaikit install claude-code` → `/create-block Hero` in Claude Code → block files created and correct.

---

## Phase 8: Codex Adapter + v0.4.0

### What the adapter generates

**`AGENTS.md`** in project root — index only (no inline content):
- List of available `wpaikit` commands with descriptions
- List of available prompts with links to `docs/prompts/`
- Links to rules in `docs/rules/`

**`docs/rules/*.md`** — copied from `knowledge/rules/` (for direct file references in prompts)

**`docs/prompts/*.md`** — from `knowledge/prompts/` with Codex-specific `{{ARGUMENTS}}` substitution

### Commands

```bash
wpaikit install codex
wpaikit sync codex
```

### Key difference from Claude Code adapter

Codex has no auto-activation of skills. Every prompt must contain explicit "read file X" instructions — these are already written into the universal prompts.

### Done when

Same `/create-block Hero` scenario produces an equivalent result in Codex as in Claude Code.

---

## Phase 9: Figma Integration + v0.5.0

- Finalize and test `create-block-by-figma.md` prompt end-to-end
- Add 5+ `knowledge/examples/figma-pairs/` entries: Figma screenshot + generated block code + notes on mapping decisions
- Document limitations of Figma MCP in `figma-to-block.md`
- Run adapter sync: `wpaikit sync claude-code` + `wpaikit sync codex`

**Quality target**: < 30% of generated blocks require manual edits to match the design.

---

## Phase 10: Design System command + v0.6.0

- Finalize `create-design-system.md` prompt
- Test `wpaikit apply-tokens` against real Figma Variable exports
- Verify existing blocks in project still render correctly after token update
- Add backup + rollback to `apply-tokens`

---

## Phase 11: Docs + Release v1.0.0

- `docs/setup-claude-code.md`
- `docs/setup-codex.md`
- `docs/architecture.md`
- `docs/extending.md` — how to add a new command or adapter
- `docs/troubleshooting.md`
- QA run: macOS, Linux, WSL
- Publish `@veaceslav-golden/wp-ai-kit@1.0.0`

---

## Milestones

| Version | Scope |
|---|---|
| `0.1.0` | `wpaikit init` + `wpaikit doctor` |
| `0.2.0` | `wpaikit create-block` + block utility commands |
| `0.3.0` | Claude Code adapter: `/create-block` works end-to-end |
| `0.4.0` | Codex adapter: same result as Claude Code |
| `0.5.0` | Figma integration: `/create-block-by-figma` |
| `0.6.0` | Design system: `/create-design-system` |
| `1.0.0` | Full docs, QA on all platforms |

---

## Security

- No passwords accepted as CLI flags — only via interactive prompts or env vars (`WPAIKIT_DB_PASSWORD`, `WPAIKIT_GIT_TOKEN`)
- Mask all passwords and tokens in log output (via `core/exec.ts`)
- Never store tokens in `.wpaikit.json`
- No telemetry without explicit opt-in

---

## Post-1.0 Roadmap

- MCP server (`@veaceslav-golden/wp-ai-kit-mcp`) — structured AI interface to theme data
- `wpaikit create-cpt` — Custom Post Type scaffolding
- `wpaikit create-pattern` — Gutenberg block patterns
- `wpaikit deploy` — staging/production deployment
- Cursor/Windsurf adapters
- WooCommerce boilerplate preset (`boilerplate-wp-woo`)
- VS Code extension
