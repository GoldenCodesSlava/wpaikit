---
name: figma-update-design-system
description: Use when adding new Figma frames to an existing design system. Merges new tokens into design-system.json, updates the Figma Design System page, and prompts user to run /design-system-to-code to propagate changes to code.
metadata:
  short-description: Add new Figma frames to existing design system — merge tokens and update Figma page
---

# Figma Update Design System

## Purpose

Extend an existing `.wpaikit/design-system.json` with tokens from new Figma frames.
Updates the Figma Design System page with any new tokens found.
Never deletes or modifies existing tokens — only adds new ones.

## Phase 1 — Validate existing state

Read `.wpaikit/design-system.json`.

If file does not exist → stop: "No design system found. Run /figma-design-system first."

Extract:
- `FILE_KEY` = `_meta.figmaFile`
- `PAGE_ID` = `_meta.designSystemPageId`
- `EXISTING_COLORS` = `colors`
- `EXISTING_TYPOGRAPHY` = `typography`
- `EXISTING_SPACING` = `spacing`
- `EXISTING_RADIUS` = `radius`
- `EXISTING_PATTERNS` = `_patterns`
- `SOURCE_FRAMES` = `_meta.sourceFrames`

Show current state:
```
=== Update Design System ===

Existing design system:
  Source frames: N frames (scanned on {generatedAt})
  Colors:     N tokens
  Typography: N tokens
  Spacing:    N tokens
  Radius:     N tokens
  Patterns:   buttons (N), badges (N), cards (N), forms (inputs: N, ...)

Provide Figma URL(s) for the new frames to scan:
```

Wait for user to provide URL(s).

## Phase 2 — Scan new frames

Parse node IDs from the provided URL(s).

### Already-scanned frames

For any node ID already present in `SOURCE_FRAMES`, do NOT skip automatically. Instead, ask:

```
⚠ Frame {id} ({frame name}) was already scanned on {generatedAt}.

What would you like to do?
  [patterns-only]  — rescan only _patterns (forms, buttons, badges, cards). Tokens unchanged.
  [full]           — rescan everything: tokens + patterns. New tokens will be merged in.
  [skip]           — skip this frame entirely.
```

Wait for user response per frame (or apply the same answer to all already-scanned frames if the user says "same for all").

**`patterns-only` mode:**
- Call `get_design_context` on the frame
- Extract only UI Patterns (buttons, badges, cards, forms)
- Do NOT extract or diff colors, typography, spacing, radius
- Merge new patterns found into `_patterns` (append, never remove existing)

**`full` mode:**
- Call `get_design_context` on the frame
- Extract everything: tokens + patterns
- Proceed through full diff in Phase 3

**`skip` mode:**
- Skip the frame, do not scan it

### New frames

Call `get_design_context` on each frame not in `SOURCE_FRAMES`.

Extract using the same rules as `/figma-design-system` Phase 2:
- Colors (hex + frequency)
- Typography (family/size/weight combinations)
- Spacing (gap and padding values on Tailwind scale)
- Border radius values
- UI Patterns: buttons, badges, cards, and form elements (inputs, selects, textareas, checkboxes, radios, toggles)

Store as `NEW_COLORS`, `NEW_TYPOGRAPHY`, `NEW_SPACING`, `NEW_RADIUS`, `NEW_PATTERNS`.

## Phase 3 — Diff

### 3.1 Token diff (new frames only)

Compare new scan results against existing tokens:

**Color diff** — for each color in `NEW_COLORS`:
- Hex already in `EXISTING_COLORS` → **skip**
- Hex is new → **added**

**Typography diff** — for each `FontFamily/sizePx/weight` key:
- Key already in `EXISTING_TYPOGRAPHY` → **skip**
- Key is new → **added**

**Spacing / Radius diff** — same logic.

**Patterns diff** — for each pattern type:
- Candidates not present in existing `_patterns` → **added**
- Existing candidates → **skip**

### 3.2 Figma sync check (always run, regardless of new frames)

Even if no new tokens or frames were provided, check whether existing JSON data is reflected in Figma.

Compare `_patterns` against `components` in `design-system.json`:
- For each pattern sub-type that has candidates in `_patterns` (buttons, badges, cards, and each form sub-type)
- Check if a corresponding entry exists in `components` (has a `figmaComponentId`)
- If **missing from `components`** → mark as **not yet created in Figma**

```
FIGMA SYNC CHECK

Not yet created in Figma (exist in _patterns but missing in components):
  forms.inputs     → Input
  forms.checkboxes → Checkbox
  forms.toggles    → Toggle
```

If any items are not yet created → proceed to Phase 5.4 to create them, even if token diff is empty.

If token diff is also empty and all patterns are already in Figma → show:
```
Nothing to update. design-system.json and Figma are in sync.
```
And stop.

## Phase 4 — Propose names for new tokens

Apply the same naming heuristics as `/figma-design-system` Phase 3.

Show diff table:

```
=== What's new ===

COLORS — N new
  #3b82f6  ×8   →  Colors/brand/secondary   [new]
  #f59e0b  ×4   →  Colors/utility/warning   [new]

TYPOGRAPHY — N new
  Inter 20px 600  →  Heading/lg   [new]

SPACING — N new
  40px  →  Spacing/10   [new]

RADIUS — no changes

PATTERNS — N new candidates
  forms.inputs:   2 new
  forms.toggles:  1 new

Already present (skipped):
  Colors: N, Typography: N, Spacing: N, Radius: N

Proceed? [yes / edit names / cancel]
```

If `edit names` → let user rename specific tokens. Re-display table after each rename.
After `yes` → proceed to Phase 5.

## Phase 5 — Update Figma

Load `figma-use` skill before calling `use_figma`.

### 5.1 Add new Variables

Add new `Colors/*`, `Spacing/*`, `Radius/*` to the existing `Tokens` collection.
Do not touch existing variables.

### 5.2 Add new Text Styles

Add Text Styles for new typography tokens only.
Do not touch existing Text Styles.

### 5.3 Append to Design System page

Append new token entries to the existing sections on page `PAGE_ID`:
- Colors section → append new swatches (same swatch size/style as existing)
- Typography section → append new rows
- Spacing section → append new bars
- Radius section → append new previews

Follow `knowledge/rules/design-system-layout.md` for exact dimensions.
Do not reorder or remove existing elements.

### 5.4 Create Figma Component Sets for new patterns

For every new pattern candidate found in Phase 2 that does not already have a corresponding entry in `design-system.json → components`:

Apply the same creation logic as `knowledge/skills/figma-components/SKILL.md` Phase 3:
- Place new components in the existing `Components` section on the Design System page (or `Forms` section for form elements)
- If the section does not exist yet → create it following the same section style from `knowledge/rules/design-system-layout.md`
- Use token Variables from `TOKENS.colors` and `TOKENS.radius` for fills and radii

**New button/badge/card patterns** → create Component Sets with Type × Size × State variants (same as `/figma-components`)

**New form element patterns** → create Component Sets per sub-type:
- Input, Textarea, Select → State variants (Default, Focus, Error, Disabled)
- Checkbox, Radio → State variants (Unchecked, Checked, Disabled)
- Toggle → State variants (Off, On, Disabled)

Show confirmation before creating components:
```
New components to create in Figma:
  Input     → Component Set (State: Default, Focus, Error, Disabled)
  Checkbox  → Component Set (State: Unchecked, Checked, Disabled)
  Toggle    → Component Set (State: Off, On, Disabled)

Create? [yes / skip]
```

After creation, save the new `figmaComponentId` for each component — used in Phase 6 to update `design-system.json → components`.

## Phase 6 — Update `.wpaikit/design-system.json`

Merge new tokens into the existing file:

```json
{
  "_meta": {
    "figmaFile": "FILE_KEY",
    "designSystemPageId": "PAGE_ID",
    "generatedAt": "YYYY-MM-DD",
    "sourceFrames": ["old-id-1", "old-id-2", "new-id-1", "new-id-2"]
  },
  "colors": {
    "...existing tokens...": "Colors/brand/primary",
    "#3b82f6": "Colors/brand/secondary"
  },
  "typography": { "...existing...", "Inter/20/600": "Heading/lg" },
  "spacing": { "...existing...", "40": "Spacing/10" },
  "radius": { "...existing..." },
  "_patterns": {
    "buttons": [...existing...],
    "badges": [...existing...],
    "cards": [...existing...],
    "forms": {
      "inputs":    [...existing + new...],
      "selects":   [...],
      "textareas": [...],
      "checkboxes":[...],
      "radios":    [...],
      "toggles":   [...new...]
    }
  },
  "components": {
    "...existing components...": {},
    "Input": {
      "figmaComponentId": "node-id-from-phase-5.4",
      "variants": { "State": ["Default", "Focus", "Error", "Disabled"] }
    },
    "Checkbox": {
      "figmaComponentId": "node-id-from-phase-5.4",
      "variants": { "State": ["Unchecked", "Checked", "Disabled"] }
    }
  }
}
```

Rules:
- `sourceFrames` = old IDs + new IDs (append, never remove)
- `generatedAt` = today's date
- Existing tokens are never removed or changed
- `_patterns` arrays are merged (append new, preserve old)

## Phase 7 — Code update prompt

```
=== Design system updated ===

New tokens added:
  Colors:     N
  Typography: N
  Spacing:    N
  Patterns:   N new form element candidates

To propagate to code, run:
  /design-system-to-code

It will:
  • Add new tokens to tailwind.config.js
  • Generate Twig + SCSS for new components (e.g. Input, Toggle)
  • Auto-skip existing components with no changes
```

## Phase 8 — Report

```
=== Update complete ===

Frames scanned: N new
  {node-id-1} → {frame name}
  {node-id-2} → {frame name}

Added to design-system.json:
  Colors:     N new  (total: N)
  Typography: N new  (total: N)
  Spacing:    N new  (total: N)
  Radius:     N new  (total: N)
  Patterns:   N new candidates

Added to Figma:
  Variables:        N new
  Text Styles:      N new
  Component Sets:   N new (Input, Checkbox, Toggle, ...)
  Design System page: updated

Total source frames: N (was N)
```

## Boundaries

- Never delete or modify existing tokens in JSON or Figma
- Never modify existing Variables, Text Styles, or Design System page elements
- Never run `/design-system-to-code` automatically — only prompt
- Skip frames already listed in `sourceFrames`
- Do not proceed past Phase 4 without user confirmation
