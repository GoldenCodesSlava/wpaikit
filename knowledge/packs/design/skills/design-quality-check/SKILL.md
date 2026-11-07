---
name: design-quality-check
description: Review a design brief or Figma frames for brief fit, clarity, distinctiveness, consistency, accessibility visible in static frames, responsive behavior, and states. Distinguish observed defects from stylistic preferences, and offer named refinement passes.
metadata:
  short-description: Review a brief or Figma design with evidence-based findings and refinement passes
---

# Design Quality Check

Use **brief mode** when given a text brief and **design mode** when given a Figma URL. This command reviews design decisions; it does not generate implementation code.

In design mode, read frame structure and inspect screenshots. Follow the prerequisites for Figma tools, and load the figma-use skill before any use_figma call. A screenshot is required to claim a visual finding. If one cannot be obtained, report which checks remain unverified.

## Brief mode

Check whether the brief identifies:

- the audience and their context;
- the primary task or message;
- the register (brand or product);
- content sources and brand constraints;
- pages or views;
- the language or languages of the design text;
- the desired degree of change (new, redesign preserving the brand, new identity).

The conversation language and --lang do not settle the design language. For a store, confirm the display currency. Ask about missing decisions that would lead to materially different designs.

Check that the client's must-haves are listed: mandatory colors and logo variants, usage rules for signature brand elements, forbidden styles, mandatory blocks. Missing must-haves are the most common reason a good design gets rejected.

Check the scene sentence and the three brand-voice words. Push vague words ("modern, clean, premium") toward concrete ones. Check the planned direction against the references and anti-references. Flag a familiar industry formula only when it would weaken distinctiveness for this project (knowledge/design/rules/anti-slop.md, reflex checks); explain the specific resemblance and an alternative.

When called from /generate-design, brief mode runs in stage 1, before any foundation or block decision. Return a concise list of decisions, assumptions, and open questions for stage 2. Do not require a separate approval ritual for low-impact stylistic warnings.

For an online store, apply knowledge/design/rules/commerce.md. A missing catalog may call for demo product content; it does not justify omitting the product shopping block.

## Design mode

Inspect the target page as a whole, and key frames at their intended viewport sizes. Compare with the brief and, when available, `.wpaikit/design-direction.md` and `.wpaikit/copy-deck.md`. Use knowledge/design/rules/visual-qa.md for the screenshot inspection and knowledge/design/rules/figma-lint.md for mechanical evidence.

When called from /generate-design, first confirm that the generated frames follow the approved foundations (gate B), block list (gate C), and concept (gate D).

Evaluate:

1. **Brief fit.** Can the intended audience understand the offer or complete the primary task? Is the chosen direction still recognizable? Are all approved required blocks present? Is every must-have visible in a meaningful role, and every forbidden item absent?
2. **Content.** Are headings, CTAs, imagery, and evidence specific and credible, in the approved tone? Identify draft copy, demo data, proof slots, generated stand-in images, and unverified claims. Flag the banned filler from knowledge/design/rules/copy-and-tone.md.
3. **Hierarchy and typography.** Check the first view, the squint test, line breaks, reading order, type roles, line length, and text over imagery. A fixed heading ratio does not substitute for visual hierarchy.
4. **Composition and rhythm.** Do sections have distinct jobs? Flag repeated layouts, identical cards, decorative labels, or empty space when they obscure content, with frame-specific evidence.
5. **System cohesion.** Check the approved palette, fonts, and locks; token and component reuse; shapes; image treatment; and real vector icons from one set. Variation is acceptable when it serves a reason.
6. **Accessibility visible in frames.** Check contrast, focus states, target sizes, visible labels, errors not conveyed by color alone, and a pause control on moving media. Take the numbers from the WCAG lint and its thresholds in knowledge/design/rules/wcag-figma-checks.md, not from a visual guess. For a full WCAG report with computed fixes, offer /wcag-design-test. Record keyboard, screen-reader, zoom, motion timing, and performance as browser verification tasks rather than Figma passes.
7. **Responsive views.** Inspect every requested viewport separately for clipping, overflow, lost content or functions, and unusable controls. Do not claim mobile was checked when no mobile frame exists.
8. **Primary journey and cognitive load.**
   - Trace the task through the visible frames.
   - Flag decision points with more than about 4 equal-weight options, places where the user must remember earlier information, and missing "where am I" cues.
   - For an online store, check that a product, displayed price, purchase action, and cart are visible in the agreed scope.
9. **Distinctiveness.** Give a one-line verdict: would a reviewer say "AI made this" at a glance? If yes, name the two or three tells that cause it (anti-slop.md), ignoring recorded exceptions.

### Heuristic lens

For a standalone audit, or when the designer asks for a deeper critique, also score Nielsen's 10 usability heuristics from 0 to 4. Each score needs one line of visible evidence; omit a heuristic that does not apply to static frames rather than guessing.

The ten heuristics:

1. Visibility of system status
2. Match with the real world
3. User control
4. Consistency
5. Error prevention
6. Recognition rather than recall
7. Flexibility
8. Aesthetic and minimalist design
9. Error recovery
10. Help

Then walk the primary path as 2–3 relevant personas, for example:

- a first-time visitor in a hurry on a phone;
- a careful comparer checking price and trust;
- a keyboard or screen-reader user (static evidence only).

Report each persona's concrete red flags.

## Severity and response

- **Critical:** unreadable or clipped content, failed text contrast, a missing approved required block or primary action, a requested viewport that does not work, fabricated claims presented as fact, or a substantial mismatch with the agreed brief. Fix before delivery when the changes are in scope.
- **Important:** a lock violation or inconsistent system, drift from the approved concept, generic repetition that weakens the page, unsuitable imagery, or a missing key state. Fix or explain the deliberate trade-off.
- **Preference:** a viable alternative style. Offer it without blocking progress.

For each finding provide:

- the frame;
- the visible evidence (before);
- the smallest useful change (after);
- why it matters to the user.

Separate observed facts from inference. Group repeated instances under one root cause. Keep scores, if used, tied to evidence; never use a score to replace a finding.

When called from /generate-design, correct high-impact issues in the generated target frames, re-run the lint, and inspect a fresh screenshot. Do not silently change the selected concept. As a standalone audit, remain read-only unless the designer asks for fixes; if fixes are requested, work only in the specified file and follow the Figma tool prerequisites.

Finish with what was inspected, what was fixed, what remains unresolved, and what requires browser verification. Never report a clean visual audit without inspecting screenshots.

## Refinement passes

After verification, offer these named passes when the result suggests them. Run one only when the designer asks. Each pass keeps the approved concept, foundations, and locks, unless the designer agrees to change them.

- **Bolder:** the design is safe or bland.
  - Pick one focal moment and amplify it: larger scale contrast (3–5×), stronger weight contrast, a committed color field, an image that escapes its container.
  - Bold means distinctive, not more effects.
- **Quieter:** the design is loud or busy.
  - Fewer colors and less saturation; lighter weights; more space; remove decorative shadows, gradients, and borders.
  - Quiet still needs intent.
- **Distill:** the design is complex.
  - One primary action per view; remove redundant sections and copy; flatten containers; keep one alignment logic.
- **Clarify:** the copy is vague.
  - Rewrite headings, CTAs, labels, errors, and empty states per knowledge/design/rules/copy-and-tone.md.
- **Polish:** the design is complete but rough.
  - Alignment to the grid, consistent spacing tokens, optical alignment of icons, widows in headings, consistent capitalization and terminology, complete states.

---
The heuristic lens, persona walk, and refinement passes are adapted from Impeccable (Apache-2.0).
