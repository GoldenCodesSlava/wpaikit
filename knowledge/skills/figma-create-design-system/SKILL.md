---
name: figma-create-design-system
description: Use when extracting design tokens from Figma frames and creating a Design System page with Variables and Text Styles in the same Figma file.
metadata:
  short-description: Extract tokens from Figma and create a Design System page + Variables + Styles
---

# Figma Create Design System

## Purpose

Extract all design tokens from representative Figma frames, then create:
- A dedicated **"Design System" page** in the same Figma file with visual documentation
- A **Variables collection** (`Tokens`) for colors, spacing, and radii
- **Text Styles** for all typography

This skill does not modify existing design frames. It only creates new structure in the Design System page and the Variables/Styles panel.

## Phase 1 — Recon

### 1.1 File metadata
Call `get_metadata` with `FILE_KEY`.

Check:
- List of existing pages — note if "Design System" page already exists
- Total number of pages and frames (to understand file size)

### 1.2 Existing Variables
Call `get_variable_defs` with `FILE_KEY`.

Check:
- Are there existing Variable collections?
- Are there Variables named with `Colors/*`, `Spacing/*`, `Radius/*`?

### 1.3 Existing state check

If "Design System" page **or** Variables **or** `.wpaikit/design-system.json` already exist — stop and ask:

```
Design System already exists (created: [date from _meta.generatedAt or "unknown"]).

What would you like to do?
  [update]    — rescan frames, add new tokens, update changed ones, skip identical
  [overwrite] — delete the Design System page and recreate from scratch using the current layout spec
  [cancel]    — stop, make no changes
```

Wait for user response before continuing.

**If `update`:**
- Keep existing "Design System" page
- In Phase 5: skip Variables/Styles that already exist with the same name and value; add new ones; update changed values
- In Phase 6: overwrite `design-system.json` with fresh scan results

**If `overwrite`:**
- Delete the existing "Design System" page entirely
- Delete all Variables in the `Tokens` collection
- Delete all Text Styles created by this command (matched by name pattern `Heading/*`, `Body/*`, `Label/*`)
- Proceed as if running for the first time
- In Phase 6: overwrite `design-system.json` completely

**If `cancel`:**
- Stop immediately, make no changes

## Phase 2 — Extract

Call `get_design_context` for each node in `NODE_IDS[]`.

If the URL contains multiple node IDs (multi-selection), attempt a single call first. If it returns only one node, fall back to individual calls per node.

For each frame, collect:

### Colors
- Fill colors of rectangles, frames, text, icons
- Stroke colors
- Record as hex value + frequency count

Ignore:
- Transparent fills (opacity 0)
- White `#ffffff` and black `#000000` only if they appear fewer than 3 times (likely one-off)

### Typography
For each text layer, record:
- Font family
- Font size (px)
- Font weight (numeric: 400, 500, 600, 700)
- Line height (px or %)
- Letter spacing

Group identical combinations — each unique combination = one Text Style candidate.

### Spacing
Record gap and padding values from Auto Layout frames:
- `itemSpacing` → gap
- `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`

Collect only values that appear on the Tailwind spacing scale (multiples of 4px). Skip one-off values.

### Border Radius
Record `cornerRadius` values from rectangles and frames.
Skip 0 (no radius) unless it appears as the dominant pattern.

### UI Patterns (for `_patterns` cache)

While scanning, also identify candidate components. Do not confirm or create them yet — only record for later use by `/figma-components`.

**Button candidates** — a layer is a button candidate if:
- It is a frame or group with height between 32px and 64px
- It contains exactly one text layer
- It has a fill color or stroke
- It has `cornerRadius` > 0

Record: `nodeId`, `name`, `width`, `height`, `fills[]`, `cornerRadius`, `text`, `parentName`

**Badge/Tag candidates** — a layer is a badge candidate if:
- Height between 20px and 36px
- Contains one short text layer (< 20 chars)
- Has a fill + `cornerRadius` > 0

Record: same fields as button.

**Card candidates** — a layer is a card candidate if:
- It is a frame with vertical Auto Layout
- Contains at least: one image layer + one text layer
- Appears more than once with similar structure across the scanned frames

Record: `nodeId`, `name`, `width`, `childLayerTypes[]`, `parentName`

**Form element candidates** — collect all of the following sub-types into a `forms` group:

| Sub-type | Heuristic |
|---|---|
| `input` | Frame height 40–56px, one text layer (placeholder text), has stroke/border, no fill or very light fill (`opacity < 10%`) |
| `textarea` | Frame height 80px+, same stroke pattern as input, no fill or very light fill |
| `select` | Like `input` but also contains an icon layer (chevron/arrow) on the right side |
| `checkbox` | Square frame 16–24px (width ≈ height), may contain a checkmark icon or fill |
| `radio` | Circular frame 16–24px (`cornerRadius` ≥ 9999 or equal to half height) |
| `toggle` | Wide oval frame where width ≥ 2× height (e.g. 44×24px), contains a circular handle layer |

**State detection** — for each form element, check if it appears in a group/frame with sibling variants named:
`Default`, `Focus`, `Error`, `Disabled`, `Checked`, `Unchecked`, `On`, `Off`

If states are detected, record them in `states[]`. If not → record `states: ["Default"]`.

Record per form element:
```
nodeId, name, subType, width, height, states[], fills[], cornerRadius, parentName
```

Group candidates by `subType`. Each subType with ≥ 1 candidate = one form component candidate.

Group candidates by visual similarity (same fills, same size range, same structure). Each group = one component candidate.

## Phase 3 — Deduplicate & Propose Names

### Colors → Variable names

Sort by frequency descending. Propose semantic names:

| Heuristic | Proposed name |
|---|---|
| Darkest color, high frequency | `Colors/brand/primary` |
| Mid-tone, accent, high frequency | `Colors/brand/accent` |
| Gray, mid-tone | `Colors/text/muted` |
| Lightest color used on text | `Colors/text/inverse` |
| Near-white background | `Colors/bg/canvas` |
| Slightly off-white background | `Colors/bg/subtle` |
| Very dark background | `Colors/bg/dark` |
| Light gray stroke | `Colors/border/subtle` |
| Mid gray stroke | `Colors/border/default` |
| Dominant text color (dark) | `Colors/text/primary` |
| Secondary text (slightly lighter) | `Colors/text/secondary` |

If there are colors that don't fit the above, propose `Colors/brand/[name]` or `Colors/utility/[name]`.

Cross-reference with `knowledge/rules/figma-to-block.md` expected token names.

### Typography → Text Style names

Match to Tailwind size classes:

| px size | Proposed name |
|---|---|
| 48px+ | `Heading/4xl` |
| 36px | `Heading/3xl` |
| 30px | `Heading/2xl` |
| 24px | `Heading/xl` |
| 20px | `Heading/lg` |
| 18px | `Body/lg` |
| 16px | `Body/base` |
| 14px | `Body/sm` |
| 12px | `Label/sm` |

Append weight suffix if multiple weights exist for same size: `Body/base/regular`, `Body/base/medium`.

### Spacing → Variable names

```
4px   →  Spacing/1
8px   →  Spacing/2
12px  →  Spacing/3
16px  →  Spacing/4
20px  →  Spacing/5
24px  →  Spacing/6
32px  →  Spacing/8
48px  →  Spacing/12
64px  →  Spacing/16
80px  →  Spacing/20
96px  →  Spacing/24
```

### Radius → Variable names

```
4px   →  Radius/sm
6px   →  Radius/md
8px   →  Radius/lg
12px  →  Radius/xl
16px  →  Radius/2xl
9999px → Radius/full
```

## Phase 4 — Confirmation Table

Show to user before any changes:

```
=== Design System Preview ===

COLORS (N found)
  #0f172a  ×23  →  Colors/brand/primary
  #0369a1  ×11  →  Colors/brand/accent
  #64748b  ×8   →  Colors/text/muted
  ...

TYPOGRAPHY (N found)
  Inter 48px 700  →  Heading/4xl
  Inter 16px 400  →  Body/base
  ...

SPACING (N found)
  16px  →  Spacing/4
  24px  →  Spacing/6
  ...

RADIUS (N found)
  8px   →  Radius/lg
  ...

Will create:
  - Page: "Design System"
  - Variables collection: "Tokens" (N variables)
  - Text Styles: N styles

Proceed? [yes / edit names / cancel]
```

Do not proceed to Phase 5 until user confirms.

## Phase 5 — Create in Figma

Use `use_figma` for all operations. Load the `figma-use` skill before calling `use_figma`.

### 5.1 Create "Design System" page

If the page does not exist:
- Create a new page named exactly `Design System`
- Position it as the first page in the file
- **Save the new page's node ID as `DESIGN_SYSTEM_PAGE_ID`** — needed for `_meta` in Phase 6

### 5.2 Create Variables collection

Create a collection named `Tokens`.

Add variables in this order:
1. All `Colors/*` variables (type: COLOR)
2. All `Spacing/*` variables (type: FLOAT)
3. All `Radius/*` variables (type: FLOAT)

Set the confirmed names and values from Phase 3.

### 5.3 Create Text Styles

For each typography entry, create a Text Style with:
- Name from Phase 3
- Font family, size, weight, line height, letter spacing from Phase 2

### 5.4 Build the Design System page layout

Read `knowledge/rules/design-system-layout.md` and follow every value exactly.

Page layout: all sections in a horizontal row, white background, `48px` gap between sections.

Sections to create in order: **Colors → Typography → Spacing → Radius**

## Phase 6 — Write `.wpaikit/design-system.json`

Create the directory `.wpaikit/` if it does not exist, then write `design-system.json`.

### File structure

```json
{
  "_meta": {
    "figmaFile": "FILE_KEY",
    "designSystemPageId": "DESIGN_SYSTEM_PAGE_ID",
    "generatedAt": "YYYY-MM-DD",
    "sourceFrames": ["node-id-1", "node-id-2"]
  },
  "colors": {
    "#0f172a": "Colors/brand/primary",
    "#0369a1": "Colors/brand/accent",
    "#64748b": "Colors/text/muted"
  },
  "typography": {
    "Inter/48/700": "Heading/4xl",
    "Inter/16/400": "Body/base",
    "Inter/14/400": "Body/sm"
  },
  "spacing": {
    "16": "Spacing/4",
    "24": "Spacing/6",
    "48": "Spacing/12"
  },
  "radius": {
    "8": "Radius/lg",
    "9999": "Radius/full"
  },
  "_patterns": {
    "forms": {
      "inputs": [
        {
          "nodeId": "11-1",
          "name": "Input/Default",
          "subType": "input",
          "width": 320,
          "height": 48,
          "states": ["Default", "Focus", "Error", "Disabled"],
          "fills": [],
          "cornerRadius": 8,
          "parentName": "ContactBlock"
        }
      ],
      "selects": [],
      "textareas": [],
      "checkboxes": [],
      "radios": [],
      "toggles": []
    },
    "buttons": [
      {
        "nodeId": "12-3",
        "name": "Frame 12",
        "width": 160,
        "height": 48,
        "fills": ["#0f172a"],
        "cornerRadius": 8,
        "text": "Get Started",
        "parentName": "HeroBlock"
      }
    ],
    "badges": [
      {
        "nodeId": "45-6",
        "name": "Tag",
        "width": 72,
        "height": 28,
        "fills": ["#e2e8f0"],
        "cornerRadius": 9999,
        "text": "New",
        "parentName": "BlogCard"
      }
    ],
    "cards": [
      {
        "nodeId": "78-9",
        "name": "Frame 78",
        "width": 320,
        "childLayerTypes": ["image", "text", "text", "frame"],
        "parentName": "TeamBlock"
      }
    ]
  }
}
```

### Rules

- `colors` keys — lowercase hex, always 6 digits (e.g. `#0f172a`, not `#0F172A`)
- `typography` keys — `FontFamily/sizePx/weight` (e.g. `Inter/16/400`)
- `spacing` and `radius` keys — numeric string of the px value without unit (e.g. `"16"`, not `"16px"`)
- Only include tokens that were confirmed by the user in Phase 4
- `_patterns` is always written regardless of what user confirmed — it is raw scan data for `/figma-components`
- If the file already exists, overwrite it completely

## Phase 7 — Report

```
Design System created

Page "Design System" → added as first page

Variables — Tokens collection:
  Colors   → N variables
  Spacing  → N variables
  Radius   → N variables

Text Styles → N styles

Skipped (already existed):
  [list any]

Local file: .wpaikit/design-system.json → written

Next step: run /figma-components to create UI components from found patterns.
```

## Boundaries

Do not:
- Modify any existing design frames or pages
- Create Variables that duplicate existing ones
- Generate tailwind.config.js or any code files
- Proceed past Phase 4 without user confirmation
- Write `.wpaikit/design-system.json` before Figma changes are successfully applied
