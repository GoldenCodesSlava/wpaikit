# Foundations: Color, Space, Shape, Locks

Use in stage 3 of /generate-design. Foundations are a small, approved token set (a "design system lite") that the designer confirms at gate B, before any concept is drawn. Components are not foundations: they come out of the chosen concept and are systematized later with /figma-components.

Typography and font choice have their own rules in knowledge/design/rules/typography-and-fonts.md. Both are presented together at gate B.

## Register and scene

- **Register.** Decide whether the surface is **brand** (marketing site, landing, portfolio, store front: the design is the product) or **product** (account area, dashboard, configurator: the design serves a task). Most sites are brand. Brand allows stronger color, larger type contrast, and image-led sections. Product wants tighter scales and restraint.
- **Scene sentence.** Write one sentence about who looks at this, where, under what light, and in what mood. Example: "a parent comparing clinics on a phone during a lunch break". Light or dark theme follows from it. If the sentence does not settle the theme, it is not concrete enough. Never choose dark or light by default.

## Color

1. **Pick a color strategy before picking colors.**
   - **Restrained:** tinted neutrals plus one accent at ≤10% of visual weight.
   - **Committed:** one saturated color carries 30–60% of the surface.
   - **Full palette:** 3–4 named roles, each used deliberately.
   - **Drenched:** the surface is the color (hero, campaign).
   Restrained is not the safe default for brand work. Choose and name the strategy in the proposal.
2. **Name a real anchor for the strategy**, for example "Stripe-like restraint" or "Mailchimp-yellow full palette". It should come from the references chosen at gate A.
3. **Roles, not swatches.**
   - Primary/brand.
   - Accent, if different from primary.
   - A neutral scale of 9–11 steps.
   - Surfaces (canvas, subtle, raised).
   - Text (primary, secondary, muted, inverse).
   - Border (subtle, default).
   - Semantic (success, warning, error, info) with 2–3 shades each.
   Skip secondary and tertiary brand colors unless the brief needs them.
4. **Neutrals.** Tint every neutral slightly toward the brand hue; in OKLCH terms chroma 0.005–0.015 is enough. Avoid pure #000 and #fff for large areas. Do not mix warm and cool grays.
5. **Hue choice.** Do not reach for blue (≈250°) or warm orange (≈60°) by reflex, or for the category palette (healthcare teal, finance navy and gold). See the category-reflex check in knowledge/design/rules/anti-slop.md.
6. **Weight.** Apply 60-30-10 to visual weight, not pixel count. The accent works because it is rare. Keep one meaning per color: the link color is not also decorative text.
7. **Contrast pairs.** List every text/background pair the design will use and check it:
   - 4.5:1 for body text;
   - 3:1 for large text (≥24px, or ≥18.67px bold);
   - 3:1 for UI boundaries, focus rings, and meaningful icons.
   Gray text on a colored background is a common failure: use a darker shade of that background color instead. Never convey state by color alone.
8. **Dark theme**, when the scene asks for it, is not inverted light:
   - depth comes from lighter surfaces (for example 3 steps), not shadows;
   - accents are slightly desaturated;
   - light text on dark gets more line-height and a lighter weight.
9. **Format.** Reason in OKLCH if useful, but store hex sRGB in Figma Variables and in the handoff. Avoid alpha colors as tokens except for overlays and focus rings.

## Space and grid

- **Spacing scale on a 4px base:** 4, 8, 12, 16, 24, 32, 48, 64, 96, plus 128 for brand section separation if needed.
- **Rhythm.** Related elements sit 8–12px apart; distinct sections sit 48–96px apart (desktop). Vary spacing for rhythm: identical padding everywhere reads as monotone.
- **Default desktop frame:** 1440px wide unless the brief or existing system says otherwise. Propose a content max width (typically 1200–1280px) and a 12-column grid with 24px gutters, adjusted to the content. Mobile frames are created only on request; then 375 or 390px wide with a 4-column grid and 16–20px margins.
- **Body measure:** 60–75 characters. With 16px body text that is about 560–680px.

## Shape and elevation

- **Radius system.** Propose at least two of these on the board, with a recommendation:
  - all sharp (0–2);
  - soft (cards 12–16, controls 8–10);
  - pill controls with soft cards.
  
  Mixed systems are allowed only as an explicit rule, for example "pill buttons, 16 cards, 8 inputs". A brand identity built from rectangles is a reason to recommend sharp, not a reason to skip the alternative. Offer a single option only when an existing design system or the designer has already fixed the shape.
  
  If the designer cannot choose from the board, keep both options open: create both radius scales as Variables, show each in at least one concept, and lock the shape at gate D.
- **Concentric radius.** Outer radius = inner radius + padding (+ stroke). A 16px card with 8px padding holds an 8px child. Beyond about 24px of padding, the nested surfaces are independent and keep their own tokens.
- **Elevation.**
  - Use shadows for depth and borders for structure: dividers, inputs, table cells, selected states.
  - A quiet light-mode shadow is three layers: 0 0 0 1px black 6%, 0 1px 2px −1px black 6%, 0 2px 4px black 4%.
  - In dark mode, use one 1px white ring at about 8% instead of shadows.
  - If a shadow is clearly visible at a glance, it is probably too strong.
- **Images** get a 1px inside stroke at about 10% black (10% white in dark mode) when they sit on a same-tone background. Logos and illustrations get none.
- **Nesting.** Do not put cards inside cards; use spacing, type, and dividers for hierarchy inside a card.

## Locks

Locks are invariants recorded in the Design Direction and checked mechanically in QA (knowledge/design/rules/figma-lint.md).

- **Gate B:** propose the locks and fix the ones that are already decided (accent, theme, type, icons).
- **Gate D:** fix the shape lock and the imagery lock if the concepts were still exploring them.

Concepts may only vary a lock that is still open.

| Lock | Rule | Allowed exception |
|---|---|---|
| Accent | One accent color for actions and highlights | Semantic colors (error, success, sale) are not accents |
| Shape | One radius system | A documented mixed rule |
| Theme | Light or dark chosen once for the page | One deliberate color-block band (for example a dark CTA band), recorded |
| Type | The approved families and styles only | — |
| Icons | One icon set, one stroke width, one size grid | Brand logos |
| Imagery | One treatment: crop logic, color grading, outline rule | — |

## The gate B board

Before asking for approval, build one exploration frame named `Foundations — proposal`. It shows:

- the color roles as swatches with hex values and the contrast ratio of each text pair;
- where each must-have color and logo variant will be used, for example "gold: logo on dark, ribbon detail, price highlight";
- the type scale set in real project copy, in every design language (see typography-and-fonts.md);
- buttons, an input, and a card in each proposed radius system, side by side;
- the icon set at 16/20/24px;
- one sample of the image treatment if an image is already available;
- the asset inventory: available versus missing images per planned block (knowledge/design/rules/imagery-and-icons.md).

This board is a direction test, not a component library. Inspect its screenshot, then present it with the proposal text.

## Creating tokens after gate B

After the designer approves, create the minimal token set in the target file. Use names compatible with /figma-design-system and knowledge/shared/contracts/design-system.md:

- Variables collection `Tokens`:
  - colors as `Colors/brand/primary`, `Colors/text/primary`, `Colors/bg/canvas`, `Colors/border/subtle`, …;
  - spacing as `Spacing/1` (4px), `Spacing/2` (8px), `Spacing/4` (16px), …;
  - radii as `Radius/sm`, `Radius/md`, `Radius/lg`, ….
- Text Styles `Heading/*`, `Body/*`, `Label/*`.

Bind all generated layers to these Variables and styles. Do not invent token names that differ from an existing system in the file. If the file already has a design system, extend it only with the designer's consent.

---
Parts of this file are adapted from Impeccable (Apache-2.0) and Better UI; values are starting points to verify by eye.
