# Create Design System

Extract design tokens from selected Figma frames and produce:
1. A dedicated **"Design System" page** in the same Figma file with visual documentation
2. **Variables** collection with all colors, spacing, and radii
3. **Text Styles** for all typography
4. A local **`.wpaikit/design-system.json`** file mapping raw values to token names

## Arguments

Expected: one or more Figma URLs pointing to representative frames.

Supported input formats:
- Single frame URL: `https://www.figma.com/design/abc123?node-id=1-2`
- Multi-selection URL (Cmd+click in Figma): `https://www.figma.com/design/abc123?node-id=1-2%2C3-4%2C5-6`
- Multiple URLs separated by spaces: `url1 url2 url3`

Parse input:
1. Extract the file key from the first URL (the segment after `/design/`).
2. Collect all node IDs — from comma-separated `node-id` param and/or from multiple URLs.
3. Store as `FILE_KEY` and `NODE_IDS[]`.

## Context to load

Before starting, read:
1. `knowledge/rules/figma-to-block.md` — expected token naming conventions
2. `knowledge/skills/figma-create-design-system/SKILL.md` — full procedure, extraction rules, page layout spec

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Recon
- `get_metadata` on `FILE_KEY` → understand file structure, check if "Design System" page already exists
- `get_variable_defs` on `FILE_KEY` → check for existing Variables (avoid duplicates)

### Phase 2 — Extract
- `get_design_context` on each node in `NODE_IDS[]`
- If multi-selection URL works as a single call — use it; otherwise call per node
- Collect raw values: hex colors, font families, font sizes, font weights, line heights, spacing, border radii

### Phase 3 — Deduplicate & Propose
- Aggregate unique values across all frames
- Sort colors by frequency (most used first)
- Propose semantic names following `knowledge/rules/figma-to-block.md` conventions
- **Show confirmation table to user before making any changes**

### Phase 4 — Confirm
Display table:

```
Colors found:
  #0f172a (×23)  →  Colors/brand/primary
  #0369a1 (×11)  →  Colors/brand/accent
  #64748b (×8)   →  Colors/text/muted
  ...

Typography found:
  Inter 48px/700  →  Heading/4xl
  Inter 32px/700  →  Heading/3xl
  Inter 16px/400  →  Body/base
  ...

Proceed? [yes / edit names / cancel]
```

Wait for user confirmation before Phase 5.

### Phase 5 — Create in Figma

Execute via `use_figma` in this order:

1. **Create "Design System" page** (if it does not exist) at the beginning of the page list
2. **Create Variables collection** named `Tokens` with groups:
   - `Colors/brand/*`
   - `Colors/text/*`
   - `Colors/bg/*`
   - `Colors/border/*`
   - `Spacing/*`
   - `Radius/*`
3. **Create Text Styles** named after Tailwind size classes (`Heading/4xl`, `Body/base`, etc.)
4. **Build the Design System page layout** — see skill for exact frame structure

### Phase 6 — Write `.wpaikit/design-system.json`

After Figma changes are applied, write the file to the project root at `.wpaikit/design-system.json`.

See skill for exact JSON structure. The file maps every raw value to its confirmed token name.

If `.wpaikit/design-system.json` already exists — overwrite it.

### Phase 7 — Report

Output:
```
Design System created

Page: "Design System" — added to file

Variables (Tokens collection):
  Colors — N created
  Spacing — N created
  Radius — N created

Text Styles — N created

Skipped (already existed): ...

Local file: .wpaikit/design-system.json — written

Next step: run /prep-figma to apply these tokens to your design frames.
```

## Constraints

- Do not modify any existing design frames
- Do not create Variables or Styles that conflict with existing ones (check Phase 1 first)
- Do not generate Twig, PHP, or tailwind.config.js
- If user cancels at Phase 4 — stop, make no changes
