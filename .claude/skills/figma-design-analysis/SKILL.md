---
name: figma-design-analysis
description: Use when auditing or reviewing a Figma design for a wpaikit WordPress project before implementation. This skill checks whether the design is ready to be converted into ACF blocks with Twig and Tailwind, including frame structure, Auto Layout, variables, typography, responsive variants, ACF field mapping, and reusable component opportunities. It analyzes and reports only; it does not modify Figma or generate implementation code.
metadata:
  short-description: Audit Figma designs for wpaikit block readiness
---

# Figma Design Analysis

## Purpose

Use this skill to analyze whether a Figma design is ready for reliable AI-assisted implementation as WordPress ACF blocks using Twig and Tailwind.

This is an analysis-only skill. Do not edit the Figma file, create components, generate Twig/PHP/SCSS/JS, or rewrite the design unless the user explicitly switches to a fixing or generation task.

## Required Context

Before reviewing, identify:

- the selected Figma frame, page, or screenshot;
- the target project or boilerplate;
- the active `tailwind.config.js`, if available;
- whether the user wants a quick audit or a detailed implementation-readiness report.

If the Tailwind config is available in the repository, use it as the source of truth for colors, spacing, typography, radius, screens, and container values.

## Analysis Checklist

### 1. Block Boundaries

Check that one top-level Figma frame represents one ACF block.

Good frame names:

```text
HeroBlock
TeamBlock
PricingBlock
```

Flag vague or generated names like `Frame 89`, `Landing section`, `Group 4`, or `Desktop copy`.

### 2. Layer Structure

Check whether the layer tree mirrors the intended HTML structure.

Expected pattern:

```text
HeroBlock
  Container
    Heading
    Description
    CTA Button
  Image
```

Layer names should be in English and semantic. Avoid slash-separated names for regular layers; reserve slash naming for Variables, Text Styles, and Components.

### 3. ACF Field Readiness

Check whether content layers map cleanly to ACF fields.

Recommended mappings:

```text
Heading            -> {{ title }}
Description        -> {{ description }}
CTA Button         -> {{ cta.title }} / {{ cta.url }}
Background Image   -> {{ background_image.url }}
Items              -> {% for item in items %}
Item               -> one repeater row
```

For lists, expect `Items` as the repeater wrapper and `Item` as the repeated row. Flag unclear content groups, mixed data types in one layer, or decorative layers that appear to require ACF fields.

### 4. Auto Layout

Check that all structural layout layers use Auto Layout.

- Horizontal Auto Layout should translate to `flex-row`.
- Vertical Auto Layout should translate to `flex-col`.
- Wrap should translate to `flex-wrap`.
- Item spacing should map to Tailwind `gap-*`.
- Padding should map to Tailwind `p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, or `pl-*`.

Flag manual positioning, inconsistent nesting, missing Auto Layout on containers, and spacing that cannot map to Tailwind tokens.

Absolute positioning is acceptable only for decorative layers named `Decoration/*`, and those layers must not be required for content flow.

### 5. Design Tokens

Check whether colors, spacing, typography, and radius use Figma Variables or Styles that match the active Tailwind config.

For the current boilerplate, expect color variables based on:

```text
colors.brand.primary
colors.brand.accent
colors.brand.muted
colors.text.primary
colors.text.secondary
colors.text.muted
colors.text.inverse
colors.bg.canvas
colors.bg.subtle
colors.bg.dark
colors.border.subtle
colors.border.default
colors.utility.success
colors.utility.warning
colors.utility.error
colors.utility.info
```

If a project defines tokens such as `colors.primary.500`, `colors.gray.900`, `spacing.4`, `spacing.8`, `fontSize.xl`, `fontSize.2xl`, `borderRadius.sm`, or `borderRadius.lg`, expect matching Figma Variables with the same hierarchy.

Flag hardcoded colors, off-scale spacing, one-off radii, and token names that do not exist in the project.

### 6. Typography

Check that all text uses Text Styles instead of inline font sizes or custom line heights.

Recommended style names:

```text
Heading/2xl
Heading/xl
Body/base
Body/sm
Label/sm
```

Flag ad hoc letter spacing, custom line heights outside the design system, and inconsistent styles for equivalent content.

### 7. Responsive Variants

Check whether responsive frames exist when layout changes materially.

Recommended names:

```text
HeroBlock/Desktop
HeroBlock/Tablet
HeroBlock/Mobile
```

Use Tailwind breakpoints as the reference:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Desktop, tablet, and mobile variants should keep the same semantic layer names and ACF field mapping. Flag variants that rename content, drop required fields, or depend on separate unrelated layer structures.

### 8. Reusable Components

Identify repeated UI patterns that should become Figma Components and later Twig includes or macros.

Examples:

```text
Button/Primary      -> views/components/button.twig
Card/Pricing        -> views/components/pricing-card.twig
Media/Video         -> views/components/video.twig
```

Flag detached repeated elements, inconsistent button/card variants, and repeated layouts that should be componentized before implementation.

## Report Format

Return findings ordered by severity.

Use this structure:

```text
Status: Ready / Needs cleanup / Not ready

Critical issues
- [Location] Issue. Impact. Recommended fix.

Important issues
- [Location] Issue. Impact. Recommended fix.

Minor issues
- [Location] Issue. Impact. Recommended fix.

Implementation notes
- ACF blocks detected:
- Likely ACF fields:
- Reusable Twig include candidates:
- Tailwind/token assumptions:
```

If there are no issues in a category, say `None`.

## Readiness Criteria

Mark the design as `Ready` only when:

- block boundaries are clear;
- semantic layer names are stable;
- structural layers use Auto Layout;
- tokens match the active Tailwind config;
- text uses Text Styles;
- responsive variants keep consistent content naming;
- ACF fields and repeaters can be inferred without guessing;
- reusable patterns are identifiable.

Mark it as `Needs cleanup` when issues are local and easy to fix.

Mark it as `Not ready` when the design relies on manual positioning, hardcoded styling, unclear content structure, or inconsistent responsive variants.

## Boundaries

Do not:

- modify the Figma file;
- create or rename layers;
- create Variables, Styles, or Components;
- generate ACF JSON, Twig, PHP, SCSS, or JavaScript;
- claim pixel-perfect readiness when Auto Layout and tokens are missing.
