---
name: figma-prep
description: Use when preparing a Figma page frame for code generation. Applies design tokens, Auto Layout, and semantic naming without changing visual appearance.
metadata:
  short-description: Prepare Figma page for dev handoff — tokens, Auto Layout, naming, components
---

# Figma Prep

## Core Principle

**The visual appearance of every block must remain pixel-perfect identical to the original.**

Every change is structural only: naming, token binding, Auto Layout addition with preserved spacing values, component instance replacement. If any operation risks shifting pixels — skip it and add it to the report.

## Step 1 — Setup

### 1.1 Read local data
Read `.wpaikit/design-system.json`.

Extract:
- `FILE_KEY` from the input URL
- `colors` map — hex → Variable name
- `typography` map — font key → Style name
- `components` map — component names and `figmaComponentId`

### 1.2 Check "Dev Ready" page
Call `get_metadata` on `FILE_KEY`.

- If page `"Dev Ready"` does not exist → create it via `use_figma`
- If page exists → use it (append new blocks, do not recreate)

### 1.3 Copy page frame to "Dev Ready"
Copy the target page-level frame to the "Dev Ready" page.

Name the copy: `[original frame name] — Dev` (e.g. `Homepage — Dev`).

**Never modify the original frame.**

## Step 2 — Decompose

Inside the copied frame, identify all top-level block frames (direct children).

Preserve the original layout exactly — do not add Auto Layout to the parent frame, do not change `x`, `y`, `width`, or `height` of any block. The spacing between blocks stays exactly as in the original design.

This step is purely identification: find and list all direct child frames to prepare for Step 3.

## Step 3 — Rename blocks (confirmation required)

For each top-level block frame, propose a semantic name following `knowledge/rules/figma-to-block.md`.

Naming heuristics:

| Signals in the block | Proposed name |
|---|---|
| Large heading + image + CTA button | `HeroBlock` |
| Grid of cards with headings | `FeaturesBlock` |
| Testimonial quotes | `TestimonialsBlock` |
| Logos in a row | `LogosBlock` |
| Large heading + text + form | `ContactBlock` |
| Price cards | `PricingBlock` |
| Team member cards | `TeamBlock` |
| FAQ accordion items | `FAQBlock` |
| Large background image + text | `BannerBlock` |
| Footer links + copyright | `FooterBlock` |
| Navigation + logo | `HeaderBlock` |

Show confirmation table to user:

```
=== Block names ===

  Frame 89    →  HeroBlock
  Group 4     →  FeaturesBlock
  Frame 120   →  TestimonialsBlock
  Frame 201   →  FooterBlock

Confirm each name or type a replacement:
```

Wait for user to confirm or correct each name before applying.

## Step 4 — Apply tokens

For every layer inside each block, apply tokens from `design-system.json`.

### Colors
For each fill or stroke with a hardcoded hex value:
1. Look up the hex in `colors` map (normalize to lowercase 6-digit hex first)
2. If found → bind to the matching Variable
3. If not found → leave unchanged, add to report as "unmatched color"

### Typography
For each text layer with inline font properties:
1. Build key: `FontFamily/sizePx/weight`
2. Look up in `typography` map
3. If found → apply the matching Text Style
4. If not found → leave unchanged, add to report as "unmatched typography"

**Do not change any font size, weight, color, or spacing values during this step.**

## Step 5 — Fix Auto Layout

For each structural container (frame or group) that does not have Auto Layout:

### Measuring existing spacing
1. Read the positions (`x`, `y`) of all direct children
2. Calculate gaps between children:
   - Horizontal: sort by `x`, measure `child[n+1].x - (child[n].x + child[n].width)`
   - Vertical: sort by `y`, measure `child[n+1].y - (child[n].y + child[n].height)`
3. Read padding: distance from container edge to first/last child

### Applying Auto Layout
Apply Auto Layout only if:
- All gaps between children are **equal** (±2px tolerance) — use that value as `itemSpacing`
- All children are aligned on the same axis

Set:
- `layoutMode`: `HORIZONTAL` or `VERTICAL` based on child positions
- `itemSpacing`: measured gap value (exact, do not round)
- `paddingTop/Right/Bottom/Left`: measured padding values (exact)
- `primaryAxisSizingMode`: `FIXED` (keep the same frame size)
- `counterAxisSizingMode`: `FIXED`

**Skip the container if:**
- Gaps between children are unequal (irregular spacing)
- Children overlap
- Only one child exists (Auto Layout adds no value)

Add skipped containers to the report with measured gap values so the user can fix manually.

## Step 6 — Componentize

For each button, badge, or card layer that matches a component in `design-system.json`:

1. Identify by visual match: fills, size range, and text structure matching a known component
2. Replace with an instance of the matching Figma Component (`figmaComponentId` from JSON)
3. Set variant properties to match the original layer appearance:
   - Fill color → `Type` variant (Primary / Secondary / Ghost)
   - Height → `Size` variant (SM / MD / LG)
4. Position the instance at the same `x`, `y` as the original layer
5. If the match is ambiguous → skip and add to report

**Do not replace if the resulting instance would be a different size than the original.**

## Step 7 — Rename layers

For each block, rename child layers to ACF-ready semantic names.

Follow the naming table from `knowledge/rules/figma-to-block.md`:

| Layer signals | Rename to |
|---|---|
| Largest text in block | `Heading` |
| Second-largest text | `Subheading` |
| Long paragraph text | `Description` |
| Small label above heading | `Label` |
| Rectangle/image fill | `Image` |
| Button-like frame | `CTA Button` |
| Repeated group of items | `Items` |
| Single item inside `Items` | `Item` |
| Background image/layer | `Background Image` |
| Decorative shape (no content) | `Decoration/[shape]` |

Only rename layers that have generic/generated names (`Frame N`, `Group N`, `Rectangle N`, `Text N`, `Vector N`).
Do not rename layers that already have semantic names.

Apply without confirmation — changes appear in the report.

## Step 8 — Report

```
=== Prep complete: [Frame name] ===

Page: "Dev Ready" — [created / updated]

Blocks renamed:
  Frame 89   → HeroBlock
  Group 4    → FeaturesBlock
  ...

Tokens applied:
  Colors   — N layers updated, N unmatched
  Typography — N layers updated, N unmatched

Auto Layout added: N containers
Auto Layout skipped (irregular spacing):
  - HeroBlock > Container (gaps: 12px, 24px, 12px) — fix manually

Components replaced: N instances

Layers renamed: N total

Needs manual attention:
  - [layer path] — reason
  - ...
```

## Boundaries

- Never modify the original page frame
- Never change `x`, `y`, `width`, `height` of any content layer
- Never change font size, color value, or spacing value
- Do not apply Auto Layout if spacing is irregular
- Do not replace a component if its size would differ from the original
- Do not proceed past Step 3 without user confirmation on block names
