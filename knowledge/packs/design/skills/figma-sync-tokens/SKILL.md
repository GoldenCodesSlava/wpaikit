---
name: figma-sync-tokens
description: Use when syncing .wpaikit/design-system.json after a designer manually updated Variables, Text Styles, or Components in Figma. Diffs current Figma state against local JSON and updates only what changed.
metadata:
  short-description: Sync design-system.json with manually updated Figma Variables, Styles, and Components
---

# Figma Sync Tokens

## Purpose

Read current Variables, Text Styles, and Components from Figma, diff against `.wpaikit/design-system.json`, show changes to user, and update the file.

Removed tokens and components are never deleted — they are marked `deprecated: true`.

## Phase 1 — Read local state

Read `.wpaikit/design-system.json`.

Store the current state:
- `LOCAL_COLORS` — `{ hex: name | { name, deprecated } }`
- `LOCAL_TYPOGRAPHY` — `{ key: name | { name, deprecated } }`
- `LOCAL_SPACING` — `{ px: name | { name, deprecated } }`
- `LOCAL_RADIUS` — `{ px: name | { name, deprecated } }`
- `LOCAL_COMPONENTS` — `{ name: { figmaComponentId, variants, deprecated? } }`
- `FILE_KEY` — from `_meta.figmaFile`
- `PAGE_ID` — from `_meta.designSystemPageId`

## Phase 2 — Read Figma state

One call only — no selection required in Figma.

### 2.1 Variables
Call `get_variable_defs` with `FILE_KEY`.

From the response, extract all Variables in the `Tokens` collection:
- `Colors/*` — record name + hex value → build `FIGMA_COLORS: { hex: name }`
- `Spacing/*` — record name + float value → build `FIGMA_SPACING: { px: name }`
- `Radius/*` — record name + float value → build `FIGMA_RADIUS: { px: name }`

Normalize hex to lowercase 6-digit format.

### 2.2 Text Styles

Text Styles are not returned by `get_variable_defs`. To sync typography, the user must have the Design System page open and a text layer selected in Figma.

Check: does `FILE_KEY` match a currently open file with a selection?
- If yes and a text layer is selected → use `get_design_context` to extract Text Styles from the selection context
- If no selection → skip typography sync, note in report: "Typography skipped — open the Design System page and select a text layer to sync styles"

### 2.3 Components

For each entry in `LOCAL_COMPONENTS`, attempt `get_design_context` using its `figmaComponentId` as the node target.

- If the component node is found → read its current name and variant properties → build `FIGMA_COMPONENTS: { name: { figmaComponentId, variants } }`
- If the node returns an error or is not found → mark as removed (will be `deprecated` in Phase 5)
- If all `get_design_context` calls fail with "nothing selected" → skip component sync entirely, note in report: "Components skipped — Figma requires a selection"

Components sync is best-effort: tokens always sync, components sync only if Figma allows it.

## Phase 3 — Diff

Compare each section independently.

### For each token type (colors, typography, spacing, radius):

**Added** — in `FIGMA_*` but not in `LOCAL_*`:
```
+ Colors/brand/secondary  →  #7c3aed
```

**Changed value** — same name in both, but hex/size differs:
```
~ Colors/brand/primary    #0f172a → #111827
```

**Changed name** — same hex in both, but Variable was renamed in Figma:
```
~ #64748b   Colors/text/muted → Colors/text/subtle
```

**Removed** — in `LOCAL_*` but not in `FIGMA_*`, and not already `deprecated`:
```
- Colors/utility/info  (will be marked deprecated)
```

**Already deprecated** — skip, do not show in diff.

**Unchanged** — skip, do not show in diff.

### Components diff

Compare `LOCAL_COMPONENTS` vs `FIGMA_COMPONENTS`:

**Renamed** — `figmaComponentId` matches but name differs:
```
~ Button → PrimaryButton
```

**Variants changed** — same component, but variant properties or values differ:
```
~ Button  Size: [SM, MD, LG] → [XS, SM, MD, LG]  (variant added)
~ Button  State: [Default, Hover, Disabled] → [Default, Active, Disabled]  (variant renamed)
```

**Removed** — in `LOCAL_COMPONENTS` but not found in Figma:
```
- Card/Team  → deprecated
```

**Added** — new component in Figma not in local JSON:
```
+ Tooltip   variants: Position (Top, Bottom, Left, Right)
```

## Phase 4 — Confirm

Show the full diff to the user:

```
=== Design System Changes ===

COLORS
  + Colors/brand/secondary       #7c3aed          (new)
  ~ Colors/brand/primary         #0f172a → #111827 (value changed)
  ~ #64748b                      text/muted → text/subtle (renamed)
  - Colors/utility/info          → deprecated

TYPOGRAPHY
  + Heading/5xl                  56px / 700        (new)
  ~ Body/base                    Inter/16/400 → Inter/18/400 (changed)

SPACING
  (no changes)

RADIUS
  - Radius/sm                    → deprecated

COMPONENTS
  ~ Button                       Size: added XS variant
  - Card/Team                    → deprecated
  + Tooltip                      Position (Top, Bottom, Left, Right)

Update .wpaikit/design-system.json? [yes / cancel]
```

If there are no changes at all:
```
Design system is up to date. No changes detected.
```

Do not proceed to Phase 5 without user confirmation.

## Phase 5 — Update JSON

Read the existing file and apply only the token sections. Preserve `_meta`, `_patterns`, `components` exactly as-is.

Update `_meta.generatedAt` to today's date.

### JSON format for deprecated tokens

When a token is removed from Figma, change its value from a plain string to an object:

```json
{
  "colors": {
    "#0f172a": "Colors/brand/primary",
    "#1d4ed8": { "name": "Colors/utility/info", "deprecated": true }
  },
  "typography": {
    "Inter/16/400": "Body/base",
    "Inter/12/400": { "name": "Label/xs", "deprecated": true }
  }
}
```

### Rules

**Tokens:**
- Added → insert with plain string value
- Changed value → update hex key (remove old key, add new key with same name)
- Changed name → update string value, keep hex key
- Removed → convert to `{ "name": "...", "deprecated": true }`
- Already deprecated → leave unchanged

**Components:**
- Renamed → update `name` key in `components` object
- Variants changed → update `variants` object
- Removed → add `"deprecated": true` to the component entry
- Added → insert new entry with `figmaComponentId` and `variants`

```json
{
  "components": {
    "Button": {
      "figmaComponentId": "123:456",
      "variants": {
        "Type": ["Primary", "Secondary", "Ghost"],
        "Size": ["XS", "SM", "MD", "LG"],
        "State": ["Default", "Active", "Disabled"]
      }
    },
    "Card/Team": {
      "figmaComponentId": "789:012",
      "variants": {},
      "deprecated": true
    }
  }
}
```

- `_meta` → update only `generatedAt`
- `_patterns` → never touch

## Phase 6 — Report

```
=== Sync complete ===

Colors
  Added:      N
  Changed:    N
  Deprecated: N

Typography
  Added:      N
  Changed:    N
  Deprecated: N

Spacing     — no changes
Radius
  Deprecated: N

Components
  Added:      N
  Changed:    N
  Deprecated: N
  Skipped:    (if Figma selection was unavailable)

Local file: .wpaikit/design-system.json → updated
```

## Boundaries

- Never modify Figma files
- Never call `get_design_context` on design frames
- Typography sync via `get_design_context` is optional — only if user has a selection in Figma
- Never delete tokens from JSON
- Never modify `_patterns`
- Never delete components — use `deprecated: true`
- Component sync is best-effort — skip gracefully if Figma selection is unavailable
- Do not proceed past Phase 4 without user confirmation
