# Anti-Slop: Defects and AI Tells

Use when proposing foundations and concepts (stages 3 and 5) and in QA (stage 7). The test is simple: if someone could look at the page and say "AI made this" without hesitation, it is not done. Distinctiveness comes from the brief, the references, and the content, not from avoiding a list. This file has two tiers so it does not turn into dogma.

## Tier 1: defects (always fix)

These are failures regardless of style. In QA they are Critical or Important.

- Text contrast below 4.5:1 (body) or 3:1 (large text, UI boundaries, meaningful icons).
- Clipped, overflowing, or overlapping text; a CTA label wrapping to two lines.
- The primary action not visible in the first viewport (check at 1280×800 as well as the frame size).
- A hero with more than 4 text elements (eyebrow, headline, subtext, CTA group), or a headline over 2 lines at desktop.
- Lock violations: a second accent, a radius outside the system, an unrecorded theme flip, a font or icon set outside the approved ones (knowledge/design/rules/foundations.md).
- Duplicate CTA intents with different labels; vague labels («Отправить», "Submit", «Подробнее» alone).
- Unsourced claims, fake testimonials, invented logos or statistics presented as real.
- Text glyphs, emoji, or words instead of icons for controls (cart, menu, close, arrows).
- Nested cards (a card inside a card).
- An empty cell in a bento or grid, or more grid cells than items.
- Zero imagery on an image-led brief (restaurant, hotel, clinic interior, product, travel, fashion, real estate), or colored rectangles where photos belong.
- Gradient text, and side-stripe accent borders thicker than 1px on cards, list items, or alerts.

## Tier 2: AI tells (challenge, may keep with a reason)

These are signs of default generation. Flag each one with evidence. Keep it only if it serves this brief, and record the reason under "Exceptions" in the Design Direction. In QA they are Important when repeated, otherwise Preference.

**Layout**
- Centered stack hero → three identical icon+title+text cards → logo strip → testimonial carousel → CTA band, in that order.
- The same layout family repeated: more than 2 image/text splits in a row; the same composition anchor more than 2 sections in a row.
- Identical feature-card grids. Product grids in a store are not this tell (knowledge/design/rules/commerce.md).
- Cards used by default where spacing and alignment would group content.
- A big-number "hero metric" block with small labels and a gradient accent.
- More than one marquee; decorative scroll cues; "Step 1 / 2 / 3" labels on content that is not a process.

**Type and labels**
- An uppercase tracked eyebrow above every section heading. Allow at most ceil(sections ÷ 3) unless they are a named brand device.
- Section numbers («01 —») as decoration.
- A random serif word inside a sans headline for "emphasis".
- Monospace as costume for "technical" on a non-technical brand.

**Color and surface**
- The category palette: healthcare white + teal, finance navy + gold, eco green + beige, tech dark blue + purple glow, crypto neon on black.
- The premium-consumer default: cream (#f5f1ea-ish) + brass or clay + espresso.
- Purple-blue gradients, mesh blobs, glow orbs, glassmorphism as decoration.
- Large rounded-square icon tiles above every heading.

**Copy**
- See the banned filler list in knowledge/design/rules/copy-and-tone.md.

## Reflex checks

Run these when choosing direction (stages 3 and 5) and again in QA.

1. **First-order category reflex.** Could someone guess the theme and palette from the category alone ("dental clinic → white and teal")? If yes, revisit the scene sentence and color strategy.
2. **Second-order reflex.** Could someone guess the aesthetic family from category plus anti-references ("not corporate → editorial serif with mono labels")? That is the trap one level deeper.
3. **Aesthetic lane.** Name the lane you are in, for example "Swiss grid", "editorial magazine", "soft premium", "brutalist utility", or "warm consumer". Check that the brief actually calls for that lane. Editorial-magazine styling (display serif, italics, ruled columns, small mono labels) is currently the most saturated lane: use it only when the content is editorial.
4. **Inverse test.** Describe the page in one sentence the way a competitor would describe theirs. If that sentence fits the typical site in the category, push one decision further: composition, color strategy, imagery, or type.

## How to use this file

- Do not reject a font, a centered layout, cards, or a gradient merely because it appears here. Reject it when the evidence shows it makes this page generic or harms clarity.
- When the designer deliberately chooses a Tier 2 item, record it once and stop re-flagging it.
- Existing brand identity (fonts, colors, signature layouts) is never "slop". Preserve it in redesigns unless the designer asked to change it.

---
Adapted from Impeccable (Apache-2.0) and the taste skill pack; tiers and exceptions are wpaikit's.
