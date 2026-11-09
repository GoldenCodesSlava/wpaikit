# Generate Design

Research the market and references, agree on tone, foundations, fonts, blocks and key copy with the designer, explore distinct concepts, build the chosen direction in Figma on approved tokens, and verify it with screenshots and a mechanical lint.

## Arguments

No arguments; the skill is fully interactive.

## Requirements

- Figma access that can write the target file, read Variables and styles, and inspect screenshots.
- At minimum, the designer provides the target Figma URL and a project description.
- Optional: web search and fetch for competitor and reference research; Figma `generate_image`, which is paid and consumes Figma AI credits.

## Context to load

Before starting, read `knowledge/design/skills/generate-design/SKILL.md`, the full procedure. It names the rule file for each stage. Read those files from `knowledge/design/rules/` when the stage starts.

## Steps

Follow the skill. In short:

### Stage 0 — Setup
- Work in the client project folder, where `.wpaikit/` records live.
- When resuming, read `.wpaikit/project.md`, `status.md`, `figma-ledger.json`, then Global and the current page section of `design-direction.md` (`knowledge/design/rules/figma-build.md`). Convert a dated, chronological `design-direction.md` into the current system plus `decision-log.md` first.
- Check access and inspect the target file. Propose the pages Final Design, Ideas, Archive, Design System, Flows and create missing ones after confirmation. Start `.wpaikit/figma-ledger.json`.
- List the fonts available to Figma.

### Stage 1 — Brief
- Establish mode, audience, primary action, register, materials, design languages, currency, and whether mobile is needed.
- Write the scene sentence and three brand-voice words.
- Start the must-have list: mandatory and forbidden items from the client. Check it at every gate.
- Run design-quality-check in brief mode **before** any decision, and save `.wpaikit/design-brief.md`.

Every gate uses the gate format:
- a numbered list of decisions, each with a recommendation and alternatives;
- one question: "approve all, or which item to change";
- data questions in a separate block that does not block the gate.

### Stage 2 — Research → Gate A
- 3–5 competitors: messaging matrix and positioning options.
- Tone of voice: four axes, form of address per language, glossary.
- 3–5 references from different directions, then one spine and accents.

### Stage 3 — Foundations → Gate B
- Color strategy and palette with contrast pairs; spacing and elevation; locks.
- At least 2 radius systems side by side. If undecided, keep both open until gate D.
- 2–3 font pairings, each checked for Figma availability, glyphs (ș ț, Cyrillic), and license.
- Icon set: ask first, then one set per project. Image treatment, plus an asset inventory listing missing packshots and other gaps.
- A `Foundations — proposal` board showing where each must-have color and logo is used. After approval, create Variables and Text Styles.
- After gate B, any new token is provisional and is listed at the next gate.

### Stage 4 — Structure and copy → Gate C
- Block plan: required, proposed, optional, with reasons. Apply commerce rules for stores.
- Utility pieces from the start: states, overlays, toasts, cookie consent, 404, empty states, and their mobile versions.
- After gate C, create `.wpaikit/status.md` from the block plan and utility pieces (`knowledge/design/rules/project-status.md`). Update it after every item, show the next 2–3 open items, and answer "what is left?" from it.
- Header and footer: content and job only. Their visual pattern is explored in the concepts.
- Key copy in the approved tone, run through the originality check, recorded in `.wpaikit/copy-deck.md` with `approved` or `draft` status.

### Stage 5 — Concepts → Gate D
- 2–3 concepts on the Ideas page (own header + hero + second fold) that differ on at least two axes, built on the approved tokens and real copy.
- Concepts share only tokens, no shared components. Across the set, show at least 2 header patterns and, for stores, 2 card treatments. Show each open radius system.
- Every concept shows the must-haves visibly.
- Screenshots, lint and reflex checks. Give a mobile note per concept.
- Record the chosen direction, borrowed elements and the final shape lock in `.wpaikit/design-direction.md`, and the gate decisions in `.wpaikit/decision-log.md`. The chosen concept moves to Final Design, the others to Archive.

### Stage 6 — Build
- First read "Building" in `knowledge/design/rules/figma-build.md`: components first (buttons with all states), cards, states, mobile, clean-up.
- Then repeat one cycle per item in the status file:
  1. pick the next item and mark it `in progress`;
  2. make 2–3 variants on Ideas (each with a 375 px note and a tap equivalent for hover), or build directly when the direction settles the pattern;
  3. build on Variables, Text Styles and instances; a pattern drawn a second time becomes a component; the item's own states are built with it;
  4. lint the section and run the layout check (`scripts/layout-lint.js`), then screenshot and fix;
  5. present variants, or present at checkpoints;
  6. move the chosen variant to Final Design and the rest to Archive;
  7. append the decision to `.wpaikit/decision-log.md`, rewrite the affected rules in `.wpaikit/design-direction.md` (current system only, Global plus one section per page type), add node IDs to the ledger;
  8. update the status file and show the next 2–3 open items.
- Each new page type starts with 2–3 layout variants built from existing components. Paired pages (for example two catalogs) keep the same block structure unless the content differs. Mobile is adapted for a group of approved pages in one pass.
- Iconify vectors; final images with the approved treatment.
- Mobile only if requested; mobile items go through the same cycle.
- Screenshots: the changed section at reduced size; full page only at checkpoints. Keep the Plugin API pitfalls from figma-build.md in mind.

### Stage 7 — Verify
- Read-only lint, per-section screenshots, anti-drift comparison, design-quality-check in design mode.
- Fix and re-check. Report status items still in `todo` or `review`. Offer optional refinement passes.

### Stage 8 — Handoff
- Links, records, mock inventory, open items, and pending browser checks.
- A handoff note for the next session in `.wpaikit/project.md`, pointing to the status file.

## Constraints

- Never pass a gate without the designer's explicit answer; silence is not approval.
- Never generate mobile frames unless the designer explicitly requested them.
- Never claim visual QA without an inspected screenshot.
- Never use Lorem ipsum in hi-fi work, and never present invented testimonials, logos, or statistics as facts.
- Never use a font that `figma.listAvailableFontsAsync()` does not list.
- Never invent existing design-system token names.
- Never crawl reference sites in bulk or copy competitor copy.
- Announce paid image generation before running it.
- Load the `figma-use` skill before every `use_figma` call, and never run `use_figma` calls in parallel.
