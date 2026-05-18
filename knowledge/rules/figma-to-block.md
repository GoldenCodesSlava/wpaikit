# Figma to ACF Block — Design Rules

Rules for structuring Figma designs so they can be reliably converted to ACF blocks using Twig and Tailwind CSS in the wpaikit boilerplate.

---

## Frame Structure

One top-level frame = one ACF block.

Name frames after the block they represent:

```
HeroBlock
TeamBlock
PricingBlock
ContactBlock
```

Do not use generated names (`Frame 89`, `Group 4`, `Desktop copy`, `Landing section`).

---

## Layer Naming

Layer names become Twig variable names. Use English, semantic names:

| Figma layer | Twig output |
|---|---|
| `Heading` | `{{ heading }}` |
| `Description` | `{{ description }}` |
| `CTA Button` | `{{ cta.title }}` / `{{ cta.url }}` |
| `Background Image` | `{{ background_image.url }}` |
| `Items` (group) | `{% for item in items %}` |
| `Item` (child) | one repeater row |

Use `/` only for Variables, Text Styles, and Component variants — not for regular layer grouping.

---

## Auto Layout

Use Auto Layout on every structural container. It maps directly to Tailwind flex utilities:

| Figma | Tailwind |
|---|---|
| Horizontal | `flex flex-row` |
| Vertical | `flex flex-col` |
| Wrap | `flex-wrap` |
| Gap | `gap-{n}` |
| Padding | `p-{n}` / `px-{n}` / `py-{n}` |

Absolute positioning is allowed only for layers named `Decoration/*` that are purely decorative and not part of content flow.

---

## Design Tokens

All colors, spacing, typography, and radii must use Figma Variables that match `tailwind.config.js`.

### Colors

```
Colors/brand/primary   →  brand.primary   (#0f172a)
Colors/brand/accent    →  brand.accent    (#0369a1)
Colors/brand/muted     →  brand.muted     (#64748b)
Colors/text/primary    →  text.primary    (#0f172a)
Colors/text/secondary  →  text.secondary  (#334155)
Colors/text/muted      →  text.muted      (#64748b)
Colors/text/inverse    →  text.inverse    (#ffffff)
Colors/bg/canvas       →  bg.canvas       (#ffffff)
Colors/bg/subtle       →  bg.subtle       (#f8fafc)
Colors/bg/dark         →  bg.dark         (#0f172a)
Colors/border/subtle   →  border.subtle   (#e2e8f0)
Colors/border/default  →  border.default  (#cbd5e1)
```

Never use hardcoded hex values — only Variables.

### Spacing

Match Tailwind's default spacing scale (1 unit = 4px):

```
4px   →  spacing-1
8px   →  spacing-2
16px  →  spacing-4
24px  →  spacing-6
32px  →  spacing-8
48px  →  spacing-12
64px  →  spacing-16
```

### Typography

Use Text Styles named after Tailwind size classes:

```
Heading/4xl  →  text-4xl
Heading/3xl  →  text-3xl
Heading/2xl  →  text-2xl
Heading/xl   →  text-xl
Body/base    →  text-base
Body/sm      →  text-sm
Label/sm     →  text-sm
```

Do not set custom `letter-spacing` or `line-height` outside the design system.

---

## Responsive Variants

Create separate frames for layouts that change materially between breakpoints.

Name them:
```
HeroBlock/Desktop
HeroBlock/Tablet
HeroBlock/Mobile
```

Use Tailwind breakpoints as reference:

```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

Keep the same semantic layer names and ACF field mapping across all variants. Do not rename content layers or remove fields between variants.

---

## Reusable Components

If a UI pattern appears in more than one block, create a Figma Component. This signals that a Twig include or macro is needed.

```
Button/Primary       →  views/components/button.twig
Card/Team            →  views/components/team-card.twig
Media/Video          →  views/components/video.twig
Icon/WithLabel       →  views/components/icon-label.twig
```

---

## What to Avoid

- Hardcoded hex colors instead of Variables
- Absolute positioning on structural layers
- Custom shadows not defined as Variables
- Detached repeated elements (use Components instead)
- Inconsistent layer names between Desktop/Mobile variants
- Inline font sizes outside Text Styles
- Custom `letter-spacing` values not in the design system
