---
name: figma-components
description: Use when creating Figma Components with variants from UI patterns saved in .wpaikit/design-system.json. Requires /figma-design-system to have been run first.
metadata:
  short-description: Create Button, Badge, Card components with variants on the Design System page
---

# Figma Components

## Purpose

Read `_patterns` from `.wpaikit/design-system.json` and create proper Figma Components with variant properties on the Design System page.

No Figma API read calls — all data comes from the local file.

## Phase 1 — Read local data

Read `.wpaikit/design-system.json`.

Validate:
- File exists → otherwise stop: "Run /figma-design-system first"
- `_meta.figmaFile` present
- `_meta.designSystemPageId` present
- `_patterns` is non-empty → otherwise stop: "No patterns found. Re-run /figma-design-system"
- Check if `_patterns.forms` exists — if present, include form elements in Phase 2

Store:
- `FILE_KEY` = `_meta.figmaFile`
- `PAGE_ID` = `_meta.designSystemPageId`
- `TOKENS` = `{ colors, typography, radius }` — for mapping raw values to variable names

## Phase 2 — Present findings

Read `_patterns` from `design-system.json` and present exactly what was found — no invented sizes or variants.

### Grouping rules (apply before showing output)

**Buttons:** group by fill hex. Same fill = same Type variant.
- Name by visual role: filled dark → `Primary`, filled accent → `Secondary`, stroke-only → `Ghost`, no fill/stroke → `Text`
- If only one fill found → only one Type. Never invent Secondary or Ghost if not in the design.
- Size variants: create only if multiple distinct `height` values exist across found buttons. Use exact px labels (e.g. `48px`, `40px`), not SM/MD/LG.
- State variants: only if hover/disabled/active states were detected in the scan. Default only = 1 state.

**Badges:** group by fill + cornerRadius. Each unique combination = one Color variant.

**Cards:** group by `childLayers[]` structure. Same child structure = same component.

**Forms:** group by `subType`. States from `states[]` in JSON — only those actually found.

### Output format

```
=== UI Patterns found ===

BUTTONS (N found)
  Button A: "Get Started" — fill #0f172a, 160×48px, padding-x 24 padding-y 12, r=8, no icon
  Button B: "Learn More"  — stroke #0f172a, 140×48px, padding-x 20 padding-y 12, r=8, icon right (arrow-right 16px)

  Proposed component: Button
    Type:  Primary (filled #0f172a) · Ghost (stroke #0f172a)
    Size:  48px — 1 height found (no size variants)
    State: Default (from design) · Hover (derived) · Disabled (derived)
  Create? [yes / skip]

BADGES (N found)
  Badge A: "New" — fill #e2e8f0, pill (r=9999), 72×28px, padding-x 10 padding-y 4
  Proposed component: Badge — 1 style, no size variants
  Create? [yes / skip]

CARDS (N found)
  Card A: image 272×200 · Name text · Role text — 320×400px, padding 24, gap 16, r=12
  Proposed component: Card/Team — exact structure from design
  Create? [yes / skip]

FORMS
  inputs (N) — 320×48px, padding-x 16 padding-y 12, r=8, states: Default · Focus · Error · Disabled
  Create? [yes / skip]
```

Wait for user response on each group before proceeding.
Show only groups that have ≥ 1 candidate. Omit empty groups.

## Phase 3 — Create Components in Figma

Load the `figma-use` skill before calling `use_figma`.

Create components on page `PAGE_ID` in file `FILE_KEY`, inside a new frame named `Components` (placed after the `Radius` frame on the Design System page, following the same section style from `knowledge/rules/design-system-layout.md`).

### Button component

Create a Figma Component Set named `Button`.

**Variant properties — only what was confirmed in Phase 2:**
- `Type` — one value per unique fill found (e.g. `Primary`, `Ghost`). Never add a type not found.
- `Size` — one value per distinct height found. If only one height → no Size property at all.
- `State` — always includes `Default`, `Hover`, and `Disabled` regardless of what was scanned.

**State derivation rules:**

`Hover` — if not found in the scan, derive from the Default variant:
- Filled button: darken fill by 10% (multiply each RGB channel by 0.9)
- Ghost/stroke button: apply a light fill tint (10% opacity of the stroke color) as background
- Add a subtle box shadow: `0 2px 8px rgba(0,0,0,0.12)`

`Disabled` — if not found in the scan, derive from the Default variant:
- Set entire component opacity to 40%
- Change cursor hint in layer name: append `(disabled)`

**Structure of each variant** — use exact values from `_patterns.buttons`:
- Width: from scanned `width` (or hug if auto)
- Height: exact scanned `height`
- Padding: exact `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- Corner radius: exact `cornerRadius`
- Fill: scanned `fills[0]` mapped to Variable from `TOKENS.colors`
- Stroke: from scanned `stroke` (if present)
- Text layer: exact `typography.fontFamily`, `fontSize`, `fontWeight`, `color` mapped to Variable
- Icon slot: add only if `hasIcon: true` — position from `iconPosition`, size from `iconSize`

### Badge component

Create a Figma Component Set named `Badge`.

**Variant properties — only what was found:**
- `Color` — one per unique fill combination found
- `Size` — only if multiple heights exist in scanned badges

**Structure** — use exact values from `_patterns.badges`:
- Padding: exact `paddingLeft/Right/Top/Bottom`
- Corner radius: exact `cornerRadius`
- Typography: exact values from `typography`
- Fill: mapped to Variable

### Card component

Create a Figma Component named `Card/[DetectedName]`.

**Structure** — mirror `childLayers[]` exactly:
- Vertical Auto Layout
- `gap` from scanned value
- Padding: exact `paddingLeft/Right/Top/Bottom`
- Corner radius: exact `cornerRadius`
- Each child layer in order: image placeholder → text layers (with exact typography per layer)

No variant properties unless multiple distinct card structures were confirmed.

### Form components

Create one Figma Component Set per confirmed sub-type.

**Structure** — use exact values from `_patterns.forms.[subType][]`:
- Width × height: exact from scan
- Padding: exact `paddingLeft/Right/Top/Bottom`
- Corner radius: exact `cornerRadius`
- Stroke: from scanned `stroke`
- Fill: from scanned `fills` (mapped to Variable, or none)
- Typography: exact from scanned `typography`
- Icon: add only if `hasIcon: true`

**State property** — only values from `states[]` in the scan. Never add `Error` or `Disabled` if not in the design.

State styling:
- Default: scanned fill + stroke
- Focus: swap stroke to `Colors/brand/primary`
- Error: swap stroke to `Colors/utility/error`
- Disabled: 40% opacity on entire component

## Phase 4 — Update `.wpaikit/design-system.json`

Read the existing file, add `components` key. Do not overwrite other keys.

```json
{
  "_meta": { ... },
  "colors": { ... },
  "typography": { ... },
  "spacing": { ... },
  "radius": { ... },
  "_patterns": { ... },
  "components": {
    "Button": {
      "figmaComponentId": "node-id",
      "variants": {
        "Type": ["Primary", "Secondary", "Ghost"],
        "Size": ["SM", "MD", "LG"],
        "State": ["Default", "Hover", "Disabled"]
      }
    },
    "Badge": {
      "figmaComponentId": "node-id",
      "variants": {
        "Color": ["Default", "Success", "Warning", "Error"],
        "Size": ["SM", "MD"]
      }
    },
    "Input": {
      "figmaComponentId": "node-id",
      "variants": {
        "State": ["Default", "Focus", "Error", "Disabled"]
      }
    },
    "Checkbox": {
      "figmaComponentId": "node-id",
      "variants": {
        "State": ["Unchecked", "Checked", "Disabled"]
      }
    },
    "Toggle": {
      "figmaComponentId": "node-id",
      "variants": {
        "State": ["Off", "On", "Disabled"]
      }
    }
  }
}
```

## Phase 5 — Report

```
Components created

Button
  Variants: Type (Primary, Secondary, Ghost) × Size (SM, MD, LG) × State (Default, Hover, Disabled)
  → N variants total

Badge
  Variants: Color (Default, Success, Warning, Error) × Size (SM, MD)
  → N variants total

Skipped: [list anything user skipped]

Local file: .wpaikit/design-system.json → updated (components section added)

Next step: run /prep-figma to apply tokens and components to your design frames.
```

## Boundaries

Do not:
- Call `get_design_context` or any Figma read tool — use only `.wpaikit/design-system.json`
- Modify existing design frames
- Create components not confirmed by the user in Phase 2
- Overwrite `colors`, `typography`, `spacing`, `radius`, or `_patterns` when updating the JSON
