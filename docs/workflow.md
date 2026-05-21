# wpaikit — Development Workflow

Full guide for building a WordPress site from scratch when you have only a Figma file from a client.

---

## Prerequisites

Before starting, verify your environment:

```bash
wpaikit doctor
```

Checks Node.js, pnpm, PHP, Composer, WP-CLI, Git. Fix any errors before proceeding.

**Required tools:**
- Node.js 18+
- pnpm
- PHP 8.1+
- Composer
- WP-CLI
- Git
- Python + fonttools (for fonts): `pip install fonttools brotli`

---

## Stage 1 — Scaffold the Project

```bash
wpaikit init
```

Interactive prompts:
- **Project name** — human-readable (e.g. `My Client Site`)
- **Slug** — kebab-case, used for theme folder and text domain (e.g. `my-client-site`)
- **Namespace** — PascalCase PHP namespace (e.g. `MyClientSite`)
- **Location** — new subdirectory or current directory

What it does automatically:
1. Downloads the latest WordPress
2. Clones the boilerplate into `wp-content/`
3. Renames the theme folder, PHP namespace, and text domain everywhere
4. Runs `composer install` and `npm install && npm run build` inside the theme
5. Writes `.wpaikit.json` with project metadata

**After init — manual steps:**

```bash
cd my-client-site              # if you chose a new subdirectory
```

1. Create a local database (Herd, MAMP, TablePlus, or CLI)
2. Configure `wp-config.php`:
   ```php
   define('DB_NAME',     'your_db');
   define('DB_USER',     'root');
   define('DB_PASSWORD', '');
   define('DB_HOST',     'localhost');
   define('BOILERPLATE_DEV', true);   // enables Vite dev assets
   ```
3. Open the site in a browser → complete WordPress setup wizard
4. Activate the theme in **wp-admin → Appearance → Themes**

---

## Stage 2 — Install AI Knowledge Base

Navigate to the **theme root** first:

```bash
cd wp-content/themes/my-client-site
```

Then install:

```bash
wpaikit knowledge install
```

What it copies into your theme root:
- `knowledge/` — prompts, skills, and rules for all AI commands
- `CLAUDE.md` — Claude Code project instructions (auto-loaded by Claude Code)
- `AGENTS.md` — Codex/OpenAI agent instructions
- `.claude/commands/` — slash commands for Claude Code (`/figma-to-block`, `/analyze-figma`, etc.)

> All subsequent stages run from the theme root: `wp-content/themes/my-client-site/`

---

## Stage 3 — Figma Audit

**Goal:** Understand the design before touching any code. Catch problems early.

Open Claude Code in the theme root, then:

```
/analyze-figma <figma-url> [--lang en|ro|ru]
```

What it checks:
- Frame naming (are blocks named semantically — `HeroBlock`, `TeamBlock`?)
- Auto Layout usage (is it applied to all structural containers?)
- Design tokens — Variables + Text Styles exist?
- Responsive variants (Desktop + Mobile frames provided?)
- Reusable Components vs detached copies

**Output:** Readiness report with warnings and blockers.

**Decision:**
- Tokens missing → designer adds them, or proceed to Stage 4 (the command creates them)
- Frames not named → `/prep-figma` cleans up
- Design ready → proceed to Stage 4

---

## Stage 4 — Design System Extraction

**Goal:** Extract all design tokens from Figma. Creates `design-system.json` and a Design System page in Figma.

```
/figma-design-system <figma-url>
```

**Prepare the URL:** Cmd+click 4–6 representative frames in Figma → Copy link. The URL will contain multiple `node-id` values — paste it as-is.

What it does:
- Scans selected frames for colors, typography, spacing, radius, and UI patterns
- Creates a "Design System" page in Figma with visual token overview (swatches, type samples, spacing bars)
- Creates Figma Variables + Text Styles if they don't exist
- Writes `.wpaikit/design-system.json`

**Output:**
- `.wpaikit/design-system.json` — the token cache used by all subsequent commands
- Figma: "Design System" page
- Figma: Variables + Text Styles

---

## Stage 5 — Figma Component Sets

**Goal:** Create Figma Component Sets from UI patterns found in Stage 4.

```
/figma-components
```

No arguments — reads `_patterns` from `design-system.json` (no extra Figma API calls).

Creates Component Sets with variant properties (Type × Size × State) for buttons, badges, cards, etc.

**Output:**
- Figma: Component Sets on the Design System page
- `design-system.json`: `components` section added

---

## Stage 6 — Frame Preparation

**Goal:** Make Figma frames dev-ready for code generation — without touching the original design.

```
/prep-figma <figma-url>
```

Pass the URL of a page-level frame (e.g. the homepage frame).

What it does:
- Creates a "Dev Ready" page with a copy of the selected frame
- Renames layers to semantic names (`Heading`, `Description`, `CTA Button`, `Items`)
- Binds detached styles to Variables and Text Styles
- Replaces detached elements with Component instances
- Preserves original spacing

**Run once per page** (homepage, about, contacts, etc.).

---

## Stage 7 — Fonts Setup

**Goal:** Connect project fonts — audit, convert to woff/woff2, generate `@font-face`.

```
/setup-fonts
```

Requires `fonttools`: `pip install fonttools brotli`

What it does:
1. Reads font families + weights needed from `design-system.json` typography tokens
2. Scans `frontend/src/fonts/` for font files
3. Shows audit table — needed vs found, files to remove
4. Removes unused font files (asks for confirmation)
5. Converts TTF/OTF → woff2 + woff
6. Generates `frontend/src/fonts/_fonts.scss` with `@font-face` blocks (`font-display: swap`)
7. Adds `@import 'fonts/fonts'` at the top of `main.scss`

---

## Stage 8 — Design System to Code

**Goal:** Generate Twig components + SCSS partials + update `tailwind.config.js`.

```
/design-system-to-code
```

What it generates:
- `views/components/{name}.twig` — Twig component with BEM classes and header comment
- `frontend/src/css/components/_{name}.scss` — SCSS partial with `@apply` per variant
- `frontend/tailwind.config.js` — updated with color, radius, and typography tokens (merge only, never overwrites existing)
- `frontend/src/css/main.scss` — `@import` lines added for each new component

After generation:
```bash
cd frontend && npm run build   # verify SCSS compiles without errors
```

---

## Stage 9 — Components Registry

**Goal:** Index all existing components and SCSS classes so block generation can reuse them.

```
/scan-components
```

Run after Stage 8 (once components exist). Re-run whenever new components are added.

What it does:
- Reads `frontend/src/css/main.scss` to discover all imported SCSS files
- Extracts BEM blocks, elements (`__element`), and modifiers (`--modifier`) from each file
- Reads header comments from `views/components/` and `views/partials/` Twig files
- Writes `.wpaikit/components-registry.md`

`/figma-to-block` reads this registry automatically — uses `{% include %}` for known components instead of duplicating markup.

---

## Stage 10 — Block Generation

**Goal:** Generate a WordPress ACF block (PHP + Twig + SCSS + ACF JSON) for each page section.

```
/figma-to-block <desktop-url> [<mobile-url>]
```

One run = one block. Run from the theme root.

**Workflow per block:**
1. Pass the Figma URL for the desktop frame (and optionally mobile)
2. Interactive Phase 4 — review proposed ACF fields:
   - `rename 2 body_text` — rename field
   - `type 2 wysiwyg` — change field type
   - `add logo_image image` — add a field
   - `remove 3` — remove a field
   - `container no` — skip container wrapper (for full-width blocks)
   - `done` — proceed to generation
3. Files are generated:

| File | Path |
|---|---|
| PHP class | `blocks/{Name}/{Name}.php` |
| Twig template | `views/blocks/{Name}/{Name}.twig` |
| SCSS partial | `frontend/src/css/blocks/_{name}.scss` |
| ACF JSON | `acf-json/group_{name}.json` |

4. SCSS partial is auto-imported in `main.scss`
5. After each block → sync ACF JSON: **wp-admin → Custom Fields → Sync**

**Repeat for every block on every page.**

---

## Stage 11 — Token Sync (ongoing)

**Goal:** Keep `design-system.json` in sync when the designer manually updates Variables or Text Styles in Figma.

```
/figma-sync-tokens
```

Run whenever the designer says "I updated the colors / fonts / spacing in Figma."

What it does:
- Reads current Variables via `get_variable_defs` (no Figma selection needed)
- Diffs against `design-system.json`
- Reports: Added / Changed / Removed tokens
- Updates JSON — removed tokens marked `deprecated: true`, never deleted

---

## Full Sequence Summary

```
wpaikit doctor                  check environment

wpaikit init                    scaffold WordPress + boilerplate
  ↓ manual: DB + wp-config + browser setup + activate theme

cd wp-content/themes/{slug}
wpaikit knowledge install       copy AI knowledge base + slash commands

/analyze-figma <url>            audit design readiness
/figma-design-system <url>      extract tokens → design-system.json + Figma Design System page
/figma-components               create Figma Component Sets
/prep-figma <url>               dev-ready frames (repeat per page)
/setup-fonts                    audit + convert + connect fonts
/design-system-to-code          Twig components + SCSS + tailwind.config.js
/scan-components                index components for reuse

/figma-to-block <url>           generate block (repeat for each block)
  ↓ sync ACF JSON in wp-admin after each block

/figma-sync-tokens              ongoing — sync when designer updates tokens
/scan-components                re-run after adding new components
```

---

## Ongoing Development

| Situation | Action |
|---|---|
| New block from Figma | `/prep-figma` (if needed) → `/figma-to-block` |
| Designer changed tokens | `/figma-sync-tokens` → update `tailwind.config.js` if colors changed |
| New Twig component added | `/scan-components` |
| Fonts changed | `/setup-fonts` |
| Dev server | `cd frontend && npm run dev` |
| Production build | `cd frontend && npm run build` |
| PHP static analysis | `composer phpstan` |

---

## Key File Reference

| File | Purpose |
|---|---|
| `.wpaikit.json` | Project metadata (name, namespace, preset) |
| `.wpaikit/design-system.json` | Token cache — source of truth for all generation commands |
| `.wpaikit/components-registry.md` | Component index — read by `/figma-to-block` |
| `frontend/src/css/main.scss` | SCSS entry point — all imports here |
| `frontend/tailwind.config.js` | Tailwind config — updated by `/design-system-to-code` |
| `acf-json/` | ACF field group JSON — sync in wp-admin after each block |
| `views/blocks/` | Twig block templates |
| `views/components/` | Reusable Twig components |
| `views/partials/` | Layout partials (header, footer) |
| `knowledge/` | AI rules, prompts, and skills |
| `.claude/commands/` | Claude Code slash commands |
