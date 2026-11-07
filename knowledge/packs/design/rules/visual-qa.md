# Visual QA for Generated Figma Designs

Inspect actual screenshots at these points:

- after the foundations board and each concept;
- after the hero and each major section;
- on every completed page.

Compare against the brief, the approved foundations and locks, the block plan, the copy deck, and the chosen Design Direction. A successful tool call is not proof that the design looks correct. Pair screenshot review with the read-only lint in knowledge/design/rules/figma-lint.md.

## How to look

- **Judge each section at readable size.** A thumbnail of a long page hides spacing, clipping, and wrapping defects. Take a full-page screenshot for rhythm and separate screenshots for each major section.
- **Squint test.** Blur your view of the screenshot. The most important element, the second most important element, and the groupings must still be identifiable.
- **Anti-drift.** Compare the built page with the approved concept frame. Missing hero composition, signature motifs, imagery, or a sliding back into a generic template is a defect, not an interpretation.
- **Small laptop.** Check that the hero message and primary CTA fit within a 1280×800 viewport as well as the frame size.

## Check the visible result

1. **First view.**
   - The main message and primary action are clear.
   - Navigation is on one line, about 64–80px high, with an active state.
   - The hero has at most 4 text elements and the headline at most 2 lines.
   - Nothing is clipped.
2. **Text.**
   - Real or draft copy in every design language.
   - Line breaks: no orphaned single word in headings, no CTA wrapping.
   - Hierarchy works through size, weight, and space together.
   - Line length is 60–75 characters for body text.
   - Legibility over images is good, long labels fit, and no glyph is missing (ș ț, Cyrillic).
   - Punctuation follows the language rules in knowledge/design/rules/copy-and-tone.md.
   - Do not judge a hi-fi page from Lorem ipsum.
3. **Composition and rhythm.**
   - Sections have distinct jobs.
   - No more than two image/text splits in a row, and the same composition anchor at most two sections in a row.
   - Spacing is tight inside groups and generous between sections.
   - Image crops are intentional, with at least two aspect ratios.
   - Text and navigation placed over photos sit on calm areas, not over signs, bright lights or busy detail.
   - CTAs and feature lists align across card groups (shared baselines).
   - Empty space is deliberate.
4. **System and locks.**
   - Approved color roles with one accent, approved fonts and styles, one radius system, and one theme with any recorded exception.
   - Concentric radii on nested surfaces; no nested cards.
   - Vector icons from the approved set with a consistent stroke and size, optically aligned. Glyphs, emoji, or words do not count as icons.
   - Components and tokens are reused. Variation must have a reason.
5. **Accessibility visible in a static frame.**
   - Contrast meets 4.5:1 for body and 3:1 for large text and UI, verified by the WCAG lint (knowledge/design/rules/wcag-figma-checks.md).
   - A focus state is drawn and visible against every background it crosses.
   - Targets are at least 24×24px, ideally 40–44px.
   - Form labels are visible and errors are shown as text, not color alone.
   - Moving media has a pause control.
6. **States.** Inspect focus, hover or active, loading, error, empty, success, and disabled states where relevant. Note states that exist only as a written specification.
7. **Responsive.** Inspect each requested viewport independently: overflow, clipped text, unusable controls, lost functions or content priorities.
8. **Content and assets.**
   - Mark unverified claims, demo products, proof slots, draft copy, and generated images that stand in for real photos.
   - Image-led briefs must show real imagery, not colored blocks.
   - Do not disguise placeholders as final content.
9. **Must-haves.** Each item on the client's must-have list is visible in a meaningful role, not hidden in small labels. Each forbidden item, for example a disliked type style, is absent. Signature brand elements follow their usage rules, for example a band that must run off the page or into red is never a floating rectangle.
10. **Distinctiveness.** Apply the reflex checks and Tier 2 list in knowledge/design/rules/anti-slop.md. Ignore items recorded as exceptions in the Design Direction.
11. **Task completeness.** Compare visible sections with the approved block list and trace the primary user journey. For online stores, apply knowledge/design/rules/commerce.md: product, price, purchase action, and cart must be identifiable in the agreed scope.

## Decide what to fix

- **Critical:** clipped or unreadable content, failed text contrast, a missing approved required block or primary action, broken hierarchy, a requested viewport that does not work, fabricated claims presented as fact. Fix before delivery.
- **Important:** a lock violation, drift from the approved concept, repeated generic compositions, an inconsistent visual language, weak image fit, missing key states, unbound tokens, undersized targets. Fix, or explain a deliberate decision and record it.
- **Preference:** a stylistic alternative that still serves the brief. Offer it without blocking the design.

For each issue, identify the frame and the visible evidence, change only what addresses it, then inspect a fresh screenshot. Do not silently replace the selected concept while polishing.

## Limits of Figma review

Screenshots and the lint cannot verify keyboard order, accessible names, screen-reader announcements, browser zoom and reflow, actual animation timing, or performance. Mark these as handoff checks for the implemented interface. If screenshot access fails, say "Visual QA not verified" and report which frames need inspection.
