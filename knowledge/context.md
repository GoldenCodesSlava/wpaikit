# wpaikit Knowledge

This file is the entry point for AI tools (Claude Code, Codex, Cursor, etc.) working on a project that uses the wpaikit boilerplate.

## Stack

WordPress · ACF · Timber/Twig · Tailwind CSS · PHP (strict types) · Vite

## Knowledge Base

```
knowledge/
├── context.md              ← this file (AI entry point)
├── rules/
│   ├── figma-to-block.md          Design standards: Figma → ACF block
│   ├── figma-to-code.md           Universal rules for all Figma-to-code generation ← read first
│   └── design-system-layout.md    Exact pixel spec for the Design System page
├── prompts/
│   ├── analyze-figma.md           Full prompt for Figma analysis workflow
│   ├── figma-design-system.md     Full prompt for design system extraction
│   ├── figma-components.md        Full prompt for component creation
│   ├── prep-figma.md              Full prompt for dev-ready frame preparation
│   ├── figma-sync-tokens.md       Full prompt for syncing tokens after manual designer edits
│   ├── figma-to-block.md                  Full prompt for generating WordPress block from Figma
│   ├── figma-update-design-system.md      Full prompt for adding new frames to existing design system
│   ├── setup-fonts.md                     Full prompt for font audit, conversion, and @font-face generation
│   ├── scan-components.md                 Full prompt for scanning SCSS/Twig and building components registry
│   └── validate-code.md                   Full prompt for validating SCSS/Twig/PHP against coding rules
└── skills/
    ├── figma-design-analysis/
    │   └── SKILL.md        Analysis checklist and report format
    ├── figma-create-design-system/
    │   └── SKILL.md        Extraction rules, naming, page layout spec
    ├── figma-components/
    │   └── SKILL.md        Component variant rules, layout spec
    ├── figma-prep/
    │   └── SKILL.md        Block decomposition, token binding, Auto Layout rules
    ├── figma-sync-tokens/
    │   └── SKILL.md        Diff logic, deprecated token format, update rules
    ├── figma-to-block/
    │   └── SKILL.md        Layer→ACF mapping, BEM+SCSS generation, responsive rules
    ├── design-system-to-code/
    │   └── SKILL.md        Component Twig+SCSS generation, tailwind.config.js update
    ├── setup-fonts/
    │   └── SKILL.md        Font audit, woff/woff2 conversion via fonttools, @font-face SCSS
    ├── figma-update-design-system/
    │   └── SKILL.md        Merge new Figma frames into existing design system, update Figma page
    ├── scan-components/
    │   └── SKILL.md        Scan SCSS/Twig files, extract BEM classes and include signatures, write registry
    └── validate-code/
        └── SKILL.md        Validate SCSS/Twig/PHP against coding rules, fix violations, handle unknown colors
```

Read the relevant file from `knowledge/` before acting on any wpaikit-related task.

## Commands

When the user writes `/command-name [args]`, read the linked prompt file and follow it exactly.

| Command | Prompt file | Description |
|---|---|---|
| `/analyze-figma <figma-url> [--lang en\|ro\|ru]` | `knowledge/prompts/analyze-figma.md` | Audit a Figma frame for ACF block implementation readiness |
| `/figma-design-system <figma-url>` | `knowledge/prompts/figma-design-system.md` | Extract tokens from frames → create Design System page + Variables + Text Styles + `_patterns` cache |
| `/figma-components` | `knowledge/prompts/figma-components.md` | Create Figma Components with variants from `_patterns` in `.wpaikit/design-system.json` |
| `/prep-figma <figma-url>` | `knowledge/prompts/prep-figma.md` | Prepare a page frame for code generation — tokens, Auto Layout, naming, components |
| `/figma-sync-tokens` | `knowledge/prompts/figma-sync-tokens.md` | Sync `design-system.json` after designer manually edited Variables or Styles in Figma |
| `/figma-update-design-system` | `knowledge/prompts/figma-update-design-system.md` | Add new Figma frames to existing design system — merge tokens and update Figma page |
| `/figma-to-block <desktop-url> [<mobile-url>]` | `knowledge/prompts/figma-to-block.md` | Generate PHP + Twig + SCSS + ACF JSON for a WordPress block from a Figma frame |
| `/design-system-to-code` | `knowledge/prompts/design-system-to-code.md` | Generate Twig components + SCSS partials + update tailwind.config.js from design-system.json |
| `/setup-fonts` | `knowledge/prompts/setup-fonts.md` | Audit fonts vs design-system.json, remove unused, convert to woff/woff2, generate @font-face SCSS |
| `/scan-components` | `knowledge/prompts/scan-components.md` | Scan SCSS and Twig files, build `.wpaikit/components-registry.md` for reuse in generation commands |
| `/validate-code` | `knowledge/prompts/validate-code.md` | Validate SCSS, Twig, PHP against coding rules — report violations and fix them |

### Examples

```
/analyze-figma https://www.figma.com/design/abc123?node-id=1-2 --lang ru
/figma-design-system https://www.figma.com/design/abc123?node-id=1-2%2C3-4%2C5-6
/figma-components
```

### Recommended order

```
/analyze-figma          ← audit (optional but useful)
/figma-design-system    ← tokens + patterns cache
/figma-components       ← components (reads cache, no extra Figma calls)
/prep-figma             ← dev-ready copy: decompose, rename, tokens, Auto Layout
/setup-fonts            ← audit, convert, connect fonts from design-system.json
/design-system-to-code  ← generate Twig components + SCSS + tailwind.config.js
/scan-components        ← scan SCSS + Twig, build components registry (run before figma-to-block)
/figma-to-block         ← generate PHP + Twig + SCSS + ACF JSON per block (reads registry)
```

## Constraints

- `/analyze-figma` — read-only, do not modify Figma files.
- `/figma-design-system` — may create a new page, Variables, and Text Styles; never modify existing design frames.
- `/figma-components` — reads `.wpaikit/design-system.json` only; never calls `get_design_context`.
- `/prep-figma` — works on a copy in "Dev Ready" page; never modifies original frames.
- `/figma-to-block` — run from `wp-content/themes/boilerplate/`; never overwrites files without confirmation.
- `/figma-sync-tokens` — read-only from Figma; updates only token sections of `design-system.json`; never deletes tokens (uses `deprecated: true`).
- `/figma-update-design-system` — never deletes or modifies existing tokens; skips frames already in `sourceFrames`; never runs `/design-system-to-code` automatically.
- `/setup-fonts` — never deletes font files without user confirmation; never references ttf/otf in generated CSS.
- `/scan-components` — read-only scan; only writes `.wpaikit/components-registry.md`; never modifies SCSS or Twig files.
- Do not generate implementation code (Twig, PHP, ACF JSON) unless explicitly asked.
- When generating any code from Figma, read `knowledge/rules/figma-to-code.md` first — it overrides all other style conventions.
- When in doubt about a design rule, check `knowledge/rules/figma-to-block.md` first.
