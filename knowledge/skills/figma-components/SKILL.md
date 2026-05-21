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

Group `_patterns` candidates and show a summary to the user.

### Output format

```
=== UI Patterns found ===

BUTTONS (N candidates)
  Variations detected:
    - filled dark    (#0f172a, r=8px, "Get Started", "Contact Us")  → Button/Primary
    - filled accent  (#0369a1, r=8px, "Learn More")                 → Button/Secondary
    - no fill/stroke (#ffffff, r=8px, "Skip")                       → Button/Ghost
  Proposed variants: Type × Size × State
  Create? [yes / skip]

BADGES (N candidates)
  Variations detected:
    - light gray fill, pill shape, short text  → Badge/Default
    - green fill                               → Badge/Success
  Proposed variants: Color × Size
  Create? [yes / skip]

CARDS (N candidates)
  Variations detected:
    - image + title + description + CTA (×4 times) → Card/Team
  Proposed variants: none (single structure)
  Create? [yes / skip]

FORMS (N candidates)
  inputs     (N) — states: Default, Focus, Error, Disabled  → Input
  selects    (N) — states: Default, Focus, Disabled          → Select
  textareas  (N) — states: Default, Focus, Error             → Textarea
  checkboxes (N) — states: Unchecked, Checked, Disabled      → Checkbox
  radios     (N) — states: Unchecked, Checked, Disabled      → Radio
  toggles    (N) — states: Off, On, Disabled                 → Toggle
  Create? [yes / skip]
```

Wait for user response on each group before proceeding.

Show only sub-types that have ≥ 1 candidate. Omit empty sub-types from the list.

### Grouping rules

**Buttons:** group by fill color similarity (same hex or same Variable). Each unique fill = one Type variant.

**Badges:** group by fill + border-radius. Full radius (≥ 999px) = pill shape. Partial = rounded square.

**Cards:** group by `childLayerTypes[]` signature. Cards with the same layer structure = same component candidate.

**Forms:** group by `subType`. Within each sub-type, states become variant property values.

## Phase 3 — Create Components in Figma

Load the `figma-use` skill before calling `use_figma`.

Create components on page `PAGE_ID` in file `FILE_KEY`, inside a new frame named `Components` (placed after the `Radius` frame on the Design System page, following the same section style from `knowledge/rules/design-system-layout.md`).

### Button component

Create a Figma Component Set named `Button` with variant properties:

| Property | Values |
|---|---|
| Type | Primary, Secondary, Ghost |
| Size | SM (32px height), MD (40px height), LG (48px height) |
| State | Default, Hover, Disabled |

Structure of each variant (horizontal Auto Layout):
- Optional icon slot (16px, hidden by default)
- Text label
- Padding: SM=`8px 16px`, MD=`12px 20px`, LG=`14px 24px`
- Corner radius: from `TOKENS.radius` (match to the detected value)
- Fill: map detected hex to Variable name from `TOKENS.colors`

State styling:
- Default: base fill
- Hover: fill opacity 90%
- Disabled: fill opacity 40%, text opacity 40%

### Badge component

Create a Figma Component Set named `Badge` with variant properties:

| Property | Values |
|---|---|
| Color | Default, Success, Warning, Error |
| Size | SM (20px height), MD (28px height) |

Structure (horizontal Auto Layout):
- Optional dot indicator (6px circle)
- Text label
- Padding: SM=`2px 8px`, MD=`4px 10px`
- Corner radius: from detected value

Color mapping:
- Default → `Colors/border/subtle` fill, `Colors/text/secondary` text
- Success → green tint (use `Colors/utility/success` if exists)
- Warning → amber tint
- Error → red tint

### Card component

Create a Figma Component named `Card/[DetectedName]` (e.g. `Card/Team`).

Structure: mirror the detected `childLayerTypes[]` layout exactly, using Auto Layout.
Replace raw fills with matching Variables from `TOKENS.colors`.

No variant properties unless multiple card structures were detected.

### Form components

Create one Figma Component Set per confirmed sub-type. Place all form components in a `Forms` section on the Design System page (after the `Components` section, same section style).

**Input / Textarea / Select:**

| Property | Values |
|---|---|
| State | Default, Focus, Error, Disabled (only states found in scan) |

Structure (horizontal Auto Layout):
- Placeholder text layer (left-aligned)
- Select only: chevron icon layer (right side, 16px)
- Textarea: vertical Auto Layout, min-height 120px
- Stroke: 1px, mapped to `Colors/border/default` (Focus → `Colors/brand/primary`, Error → `Colors/utility/error`)
- Fill: none or `Colors/bg/subtle`
- Corner radius: from detected `cornerRadius`

State styling:
- Default: `Colors/border/default` stroke
- Focus: `Colors/brand/primary` stroke, slightly elevated shadow
- Error: `Colors/utility/error` stroke
- Disabled: 40% opacity

**Checkbox / Radio:**

| Property | Values |
|---|---|
| State | Unchecked, Checked, Disabled |

Structure:
- Checkbox: 20×20px square, `cornerRadius: 4px`, stroke `Colors/border/default`
- Checked state: fill `Colors/brand/primary`, white checkmark icon
- Radio: 20×20px circle, stroke `Colors/border/default`
- Checked state: fill `Colors/brand/primary`, white dot inside

**Toggle:**

| Property | Values |
|---|---|
| State | Off, On, Disabled |

Structure:
- Track: 44×24px pill (`cornerRadius: 9999`)
- Off: fill `Colors/border/default`; On: fill `Colors/brand/primary`; Disabled: 40% opacity
- Handle: 20×20px white circle, positioned left (Off) or right (On)

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
