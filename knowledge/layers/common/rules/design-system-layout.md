# Design System Page — Layout Specification

Exact values for the "Design System" page created by `/figma-design-system` and `/figma-components`.
Follow these numbers precisely — the goal is identical output across every project.

---

## Page

| Property | Value |
|---|---|
| Background | `#FFFFFF` |
| Layout | Horizontal Auto Layout |
| Direction | Left → Right |
| Gap between sections | `48px` |
| Padding | `80px` all sides |

---

## Section (shared rules for all sections)

Each section is an independent frame.

| Property | Value |
|---|---|
| Layout | Vertical Auto Layout |
| Background | `#F8FAFC` |
| Border radius | `16px` |
| Padding | `32px` |
| Gap (title → content) | `24px` |
| Min width | `280px` |

### Section title

| Property | Value |
|---|---|
| Font size | `16px` |
| Font weight | `600` |
| Color | `#0F172A` |
| Margin bottom | included in section gap (`24px`) |

---

## Colors

Content layout: grid, horizontal wrap.

| Property | Value |
|---|---|
| Columns | `4` |
| Gap between swatches | `12px` |

### Swatch item (vertical Auto Layout)

| Property | Value |
|---|---|
| Swatch rectangle | `72 × 72px` |
| Border radius | `12px` |
| Gap (swatch → labels) | `8px` |

### Swatch labels (below swatch)

| Element | Font size | Weight | Color |
|---|---|---|---|
| Variable name (e.g. `brand/primary`) | `11px` | `500` | `#334155` |
| Hex value (e.g. `#0f172a`) | `11px` | `400` | `#64748B` |

---

## Typography

Content layout: vertical Auto Layout, one row per style.

| Property | Value |
|---|---|
| Gap between rows | `16px` |
| Divider between rows | `1px solid #E2E8F0` |
| Row layout | Horizontal Auto Layout |
| Gap (label → sample) | `24px` |

### Label column (left, fixed width)

| Property | Value |
|---|---|
| Width | `200px` |

| Element | Font size | Weight | Color |
|---|---|---|---|
| Style name (e.g. `Heading/4xl`) | `12px` | `600` | `#0F172A` |
| Spec (e.g. `48px / 700`) | `12px` | `400` | `#64748B` |

### Sample text (right)

- Text: `"The quick brown fox jumps over the lazy dog"`
- Rendered in the actual Text Style
- If the text overflows the section width → allow wrapping to multiple lines
- Color: `#0F172A`

---

## Spacing

Content layout: vertical Auto Layout, one row per token.

| Property | Value |
|---|---|
| Gap between rows | `12px` |
| Row layout | Horizontal Auto Layout |
| Gap (label → bar) | `16px` |

### Label (left, fixed width)

| Property | Value |
|---|---|
| Width | `140px` |
| Text | `Spacing/4 — 16px` |
| Font size | `12px` |
| Font weight | `500` |
| Color | `#0F172A` |

### Bar

| Property | Value |
|---|---|
| Height | `8px` |
| Width | actual px value of the spacing token (e.g. `16px` for `Spacing/4`) |
| Border radius | `4px` |
| Fill | `#0369A1` (accent) |

---

## Radius

Content layout: horizontal wrap grid.

| Property | Value |
|---|---|
| Columns | `4` |
| Gap | `16px` |

### Radius item (vertical Auto Layout)

| Property | Value |
|---|---|
| Gap (preview → label) | `8px` |

### Preview rectangle

| Property | Value |
|---|---|
| Size | `56 × 56px` |
| Corner radius | actual token value (e.g. `8px` for `Radius/lg`, `9999px` for `Radius/full`) |
| Fill | `#F8FAFC` |
| Border | `1.5px solid #CBD5E1` |

### Labels (below preview)

| Element | Font size | Weight | Color |
|---|---|---|---|
| Variable name (e.g. `Radius/lg`) | `11px` | `500` | `#334155` |
| Px value (e.g. `8px`) | `11px` | `400` | `#64748B` |

---

## Components

Content layout: vertical Auto Layout (groups stacked).

| Property | Value |
|---|---|
| Gap between groups | `32px` |

### Group

| Property | Value |
|---|---|
| Layout | Vertical Auto Layout |
| Gap (group title → items) | `16px` |

### Group title

| Property | Value |
|---|---|
| Text | component name in uppercase (e.g. `BUTTON`, `BADGE`) |
| Font size | `13px` |
| Font weight | `600` |
| Color | `#0F172A` |

### Items row (within a group)

| Property | Value |
|---|---|
| Layout | Horizontal Auto Layout, wrap |
| Gap | `16px` |
| Content | component instances at their natural size |
