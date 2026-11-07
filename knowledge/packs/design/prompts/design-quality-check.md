# Design Quality Check

Review a design brief or generated Figma frames against the project goal and the visible evidence.

## Arguments

- No Figma URL → brief mode: assess the brief and planned direction.
- `<figma-url>` → design mode: inspect the target frames, screenshots, and lint evidence.

## Context to load

Read `knowledge/design/skills/design-quality-check/SKILL.md`. In design mode, also read `knowledge/design/rules/visual-qa.md`, `knowledge/design/rules/figma-lint.md`, `knowledge/design/rules/wcag-figma-checks.md` and `knowledge/design/rules/anti-slop.md`, plus `.wpaikit/design-direction.md` and `.wpaikit/copy-deck.md` when available.

## Procedure

**Brief mode**
- Identify the audience, primary task, register, design-text language, content and brand constraints, references, and assumptions that could materially change the design.
- Check that the scene sentence and the brand-voice words are concrete.
- From `/generate-design` this runs in stage 1, before any foundation decision.
- For an online store, read `knowledge/design/rules/commerce.md`: a missing catalog calls for labeled demo products, not for omitting the shopping blocks.
- Treat familiar patterns as project-specific questions, not automatic bans.

**Design mode**
- Inspect actual screenshots at every requested viewport and run the read-only lint.
- Check the approved foundations and locks, required blocks, and copy. Then check content, hierarchy, composition, system cohesion, visible accessibility, responsive behavior, icons, states, cognitive load, and distinctiveness.
- Trace the primary task; for a store, verify a product, a price, a purchase action, and the cart.
- For each issue give the frame, evidence, impact, and the smallest useful fix.
- Separate critical defects, important improvements, and stylistic preferences. Report browser-only checks as unverified.
- For a deeper critique, add the Nielsen heuristic lens and a persona walk.

**Fixes and refinement**
- When called from `/generate-design`, correct high-impact defects in the generated frames, re-run the lint, and inspect fresh screenshots.
- As a standalone audit, remain read-only unless fixes were requested.
- Offer the named refinement passes (bolder, quieter, distill, clarify, polish) without running them unasked.

Follow the relevant Figma tool prerequisites, including the `figma-use` skill before every `use_figma` call. Never claim a visual review without a screenshot.
