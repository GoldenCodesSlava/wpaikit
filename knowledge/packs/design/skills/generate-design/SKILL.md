---
name: generate-design
description: Generate a Figma page or site from a brief, brand materials, and references. Research competitors and references, agree on tone, foundations, fonts, blocks and key copy, explore distinct concepts, build the chosen direction on approved tokens, and verify it with screenshots and a mechanical lint.
metadata:
  short-description: Research, agree foundations, explore concepts, build and verify a Figma design
---

# Generate Design

Create a coherent, distinctive, usable design in a designer-specified Figma file. This skill is for designers and does not generate implementation code. Respond in the designer's language; --lang overrides the response language only. Confirm the language or languages of the text inside the design separately.

Before every use_figma call, load the figma-use skill. Never run use_figma calls in parallel. Follow the prerequisites of any other Figma tool used. If a required tool is unavailable, explain the specific limitation; never claim that a file, image, or screenshot was created or checked when it was not.

## How the flow works

Nine stages, four gates. A gate is a stop: present a proposal and wait for an explicit answer. Silence or elapsed time is not approval. Between gates, work without asking for permission on every step.

- **Assert, then confirm.** Propose a concrete recommendation with its reason ("I propose X because Y; confirm or adjust"). Do not offer menus of options with no recommendation.
- **Gate format.** List the gate's decisions as a numbered list, one line each: the decision, your recommendation, and the alternatives shown. End with one question: "Approve all, or which item should change?".
  - Data questions (missing facts, prices, times) go in a separate short block marked "does not block the gate"; use placeholders until they are answered.
  - An answer to the data questions alone does not approve the gate. One approval covers only the decisions that were listed. Never ask about only one decision and let the rest pass by default.
- **Must-haves.** Keep the client's mandatory and forbidden items in `.wpaikit/design-brief.md`. At every gate, state where each must-have appears; if one is not visible, say so.
- **Ask little.** Ask 2–3 questions per round, normally one round per stage, and only what changes the result. Infer the rest from the brief and materials.
- **Fast path.** If the designer supplies an approved item (references, palette, fonts, icon set, final copy, an existing design system), record it as approved and skip its proposal. Still run its checks: fonts available in Figma, glyphs, contrast. Say which stages were shortened.
- **Delegation.** Choose a direction yourself only when the designer explicitly delegated that choice.
- **State your reading of ambiguous requests.** When a request has two plausible readings (for example "redo the photo": the frame around it or the badge on it), write one line "I read this as …" before building. If the readings lead to different work, ask instead.
- **Keep the status file.** From gate C onward, `.wpaikit/status.md` tracks every block, state and utility piece. After each finished item, show the next two or three open items. Answer "what is left?" from the file, not from memory.

| Stage | Output | Rules to read |
|---|---|---|
| 0 Setup | Access, page structure, existing records, available fonts | figma-build |
| 1 Brief | Design read, `.wpaikit/design-brief.md` | design-quality-check (brief mode) |
| 2 Research | Competitor matrix, tone, 3–5 references → **Gate A** | research-references, copy-and-tone |
| 3 Foundations | Palette, fonts, locks, icons, board → **Gate B** → Variables and Text Styles | foundations, typography-and-fonts, imagery-and-icons, anti-slop |
| 4 Structure and copy | Block plan and copy deck → **Gate C** → status file | copy-and-tone, commerce (stores), project-status |
| 5 Concepts | 2–3 concepts on Ideas → **Gate D** → Design Direction and decision log | design-direction, anti-slop, imagery-and-icons, figma-lint |
| 6 Build | One cycle per status item, page by page | figma-build, project-status, imagery-and-icons, figma-lint, visual-qa |
| 7 Verify | Lint, screenshots, critique, fixes | figma-lint, visual-qa, design-quality-check (design mode) |
| 8 Handoff | Links, records, open items, handoff note | design-direction, figma-build |

Rule files, read each when its stage starts:

- knowledge/design/rules/figma-build.md
- knowledge/design/rules/project-status.md
- knowledge/design/rules/research-references.md
- knowledge/design/rules/copy-and-tone.md
- knowledge/design/rules/foundations.md
- knowledge/design/rules/typography-and-fonts.md
- knowledge/design/rules/imagery-and-icons.md
- knowledge/design/rules/anti-slop.md
- knowledge/design/rules/design-direction.md
- knowledge/design/rules/visual-qa.md
- knowledge/design/rules/figma-lint.md
- knowledge/design/rules/commerce.md

The quality check is in knowledge/design/skills/design-quality-check/SKILL.md.

## 0. Setup

- **Project folder.** Records live in `.wpaikit/` of the client project. If the session is open in another folder (for example the wpaikit repository), ask the designer to open the client project, or confirm where the records should live.
- **Resume first.** If records exist, read them in the resume order from knowledge/design/rules/figma-build.md (`project.md`, `status.md`, the ledger, the relevant Design Direction section) and treat them as approved context unless the designer says otherwise. Other records: `design-brief.md`, `copy-deck.md`, `decision-log.md`, `design-system.json`. If `design-direction.md` is a dated log of decisions, convert it first (design-direction.md, "Converting an existing chronological file").
- **Target file.** Collect the Figma URL and project description. Check access and inspect pages, frames, Variables, Text Styles, components. Propose the page structure from figma-build.md (Final Design, Ideas, Archive, Design System, Flows) and create the missing pages after the designer confirms. Start `.wpaikit/figma-ledger.json`.
- **Fonts.** List available fonts with `figma.listAvailableFontsAsync()` and keep the result for stage 3.
- Use only materials the designer supplied and sources available in the environment. Never ask the designer to paste API keys into chat.

## 1. Brief

Record the design read. Ask only for missing decisions that change the result:

- **Mode:** new design, redesign preserving the brand, or new visual identity. For redesigns, record what must be preserved: logo, brand colors and fonts, navigation labels, information architecture, legal copy, recognizable elements.
- **Audience and goal:** the audience, the primary action, and which page or view matters first.
- **Register:** brand (marketing, landing, store front) or product (task UI). Assert your reading.
- **Materials:** available pages, real copy, images, brand assets, existing icon set, references and anti-references.
- **Languages and region:** the language or languages of the design text, always asked explicitly; the display currency for a store.
- **Mobile frames:** required or not.

Write a scene sentence and three brand-voice words (knowledge/design/rules/foundations.md, knowledge/design/rules/typography-and-fonts.md).

Start the must-have list: required brand colors and logo variants, slogans, styles the client dislikes (for example "no serifs"), and usage rules for signature brand elements. Brand books often imply such rules without stating them: when the materials include a signature element (a band, a frame, a pattern, a cut-off monogram), ask how it may be cropped, where it may end, and what it must never touch. Ask once whether anything else is mandatory or forbidden, and add every later constraint the moment it appears.

Run design-quality-check in brief mode before any decision depends on the brief. Resolve contradictions with the designer. Save the confirmed design read to `.wpaikit/design-brief.md`.

## 2. Research: competitors, tone, references

Follow knowledge/design/rules/research-references.md and knowledge/design/rules/copy-and-tone.md:

1. Analyze 3–5 competitors: messaging matrix and positioning options.
2. Define the tone of voice: the four axes, form of address per language, tone and anti-tone words, glossary.
3. Select 3–5 visual references from different directions and present them in a table.

**Gate A.** Use the gate format: recommended positioning, tone profile, references with the recommended spine and accents, must-have list. Record the result in `.wpaikit/design-brief.md`. If the designer provided their own references and positioning, this gate becomes a short confirmation.

## 3. Foundations

Follow knowledge/design/rules/foundations.md, knowledge/design/rules/typography-and-fonts.md, and knowledge/design/rules/imagery-and-icons.md. Check the proposal against knowledge/design/rules/anti-slop.md (category reflex, aesthetic lane).

Prepare:

- the color strategy and palette by roles, with contrast pairs;
- 2–3 font pairings, one recommended, each with source, license, glyph check, and Figma availability;
- the spacing base and elevation;
- at least two radius systems side by side (for example sharp and soft), unless the brand identity or an existing design system fixes the shape; even then, show one alternative when the evidence is only indirect;
- proposed locks;
- the icon set (ask first whether one is already chosen; one set per project);
- the image treatment;
- an asset inventory: which images the planned blocks need, which exist, and which gaps need a shoot, the client, or generation.

Build the `Foundations — proposal` board on Ideas and inspect its screenshot. Show every alternative you ask about, and where each must-have color or logo variant will be used.

**Gate B.** Use the gate format: palette and color strategy, fonts, shape options, icon set, image treatment and asset gaps, locks. Colors the designer called "approximate" are inputs to refine, not an approved palette.

After approval, create the approved Variables and Text Styles (foundations.md, "Creating tokens after gate B") and record their IDs in the ledger. Do not invent names that conflict with an existing system. If shape was left open, create both radius options as Variables and decide at gate D.

**After gate B, never add tokens silently.** Any later Variable or Text Style is provisional: list it under "New tokens to approve" at the next gate.

## 4. Structure and copy

- **Header and footer are decisions, not fixed rows.** For each, describe the job and the content: navigation, catalog entry, search, cart, language, contacts, delivery info. The visual pattern is explored in the concepts. For stores, catalog entry, search and cart are required.
- **Block plan.** Present a page-by-page block plan. Mark each block as required (by the brief or product type), proposed, or optional. For each, give its job (attract, explain, prove, compare, prompt action), main content, action, and contribution to usability, sales or task completion, and rhythm. Invite the designer to add, remove, or reorder. If a requested block seems harmful or redundant, explain the concern and a viable alternative rather than silently omitting it.
- **Stores.** Apply knowledge/design/rules/commerce.md. A gallery and a catalog link do not replace a product shopping block.
- **Utility pieces.** Add, from the start, what pages need besides blocks, and mark what is in scope: button and link states; card states (hover, in cart, sold out, favourite, skeleton); form states (invalid, sending, sent, send error); header states (sticky, menu, search, cart badge); overlays (mini cart, option pickers, toasts, cookie consent); empty states, 404, back to top; mobile versions of all of these.
- **Copy deck.** Write the key copy per knowledge/design/rules/copy-and-tone.md: hero, section headlines, CTAs, offer, form labels. Use the approved tone and the competitor matrix, and run the originality check. Never invent testimonials, names, logos, or statistics as facts. Mark proof slots that need real data.
- **Store demo data.** For a store without a catalog, generate representative products with plausible prices in the agreed currency and mark them as demo data.

**Gate C.** Use the gate format: block list and order, header and footer content, key copy. Record the copy with status `approved` or `draft` in `.wpaikit/copy-deck.md`. Create `.wpaikit/status.md` from the approved blocks and the utility pieces in scope (knowledge/design/rules/project-status.md); concepts and gate D come first in it.

## 5. Concepts

For a new visual direction, create two or three concepts for the first important page, on the Ideas page.

- **Scope.** Each concept shows its own header, the hero, and enough of the second screen to show the system: rhythm, section treatment, card treatment, density. It uses the approved Variables, fonts, and real or draft copy.
- **Tokens only.** Before gate D, concepts share only tokens and styles. Build each concept's header, buttons and cards inside it; shared components make the concepts identical below the hero.
- **Real differences.** Concepts differ on at least two axes: hero scale (giant, mid, minimal), composition anchor, background mode, density, image priority, or color strategy within the approved palette. A palette swap is a variant, not a concept. Across the set, show at least two header patterns (for example logo left with inline nav; centered logo with split nav; two-tier with catalog and search), for stores two card treatments, and each radius system still open.
- **Must-haves visible.** Every concept shows each must-have in a meaningful role, not only in tiny labels.
- **Text over images.** Before placing text over a photo, find its bright and busy areas. Choose a crop that leaves calm space, or move the text; a gradient does not rescue a busy area.
- **Single concept when justified.** With a precise direction or an established design system, create one focused concept and explain why alternatives would add little.
- **Images.** At most one key image per concept, generated with the cheapest model, after telling the designer the planned number of generations.

Screenshot each concept, fix clipping and unreadable text, and run the reflex checks (anti-slop.md) and the lint (figma-lint.md). Present each concept with its idea and fit to the brief, its axes, how it adapts to mobile, where the must-haves appear, and one practical trade-off. Recommend one, and say which elements can be combined and which provisional tokens the concepts introduced.

**Gate D.** Use the gate format: chosen concept, elements borrowed from others, final shape lock, provisional tokens. Write the Design Direction to `.wpaikit/design-direction.md` and start `.wpaikit/decision-log.md` with the gate A–D entries (knowledge/design/rules/design-direction.md). The Design Direction is the source of truth for the following pages; changes to it must be explicit. Move the chosen concept to Final Design and the others to Archive.

## 6. Build

Stage 6 repeats one cycle for each item in `.wpaikit/status.md`: page blocks, utility pieces, then mobile. Most of a design run happens here, so follow the cycle for every item, including small fixes that become new items. Before the first cycle, read "Building" in knowledge/design/rules/figma-build.md: components first (buttons with all states), cards, states, mobile, clean-up.

### The cycle

1. **Pick.** Take the next open item: the designer's order first, otherwise the plan order. Mark it `in progress`. State its job, message, copy source, media role, action, and composition in one or two lines.
2. **Variants or direct build.** Make two or three variants on Ideas when the designer asked for options, or when the Design Direction does not settle the item's pattern yet. Otherwise build directly. Variants differ in composition, not only in color; each gets one line on how it works at 375 px and what replaces any hover on touch.
3. **Build.** Build in manageable sections, never a long page in one opaque call. Use instances; a pattern drawn a second time becomes a component. Build the states the item owns together with it. Keep page-wide rhythm and vary composition where content warrants it (visual-qa.md, Composition).
4. **Check.** Run the lint and the layout check (figma-lint.md, `scripts/layout-lint.js`) on the new section, then take a screenshot and apply visual-qa.md. Fix and check again. Show the designer only checked work.
5. **Present.** Present variants with a recommendation and wait for the choice. Present a direct build when the designer asked for block-by-block control, or at a checkpoint: after the hero, after each page, after each group of utility pieces. Otherwise continue. Mark presented items `review`.
6. **Place.** Apply the requested adjustments, move the chosen variant to Final Design and the others to Archive, keeping their dependencies (figma-build.md, Clean-up). Re-run step 4 if the placed section changed.
7. **Record.** Append the decision to `decision-log.md` (what was shown, chosen and rejected, the designer's words). Then rewrite the affected rules in `design-direction.md`, Global or the page subsection, so it states what applies now. Add the new node IDs to the ledger.
8. **Update status.** Mark the item `done` (approved), `review`, `deferred`, or `waiting client`; add items the designer introduced; show the next two or three open items.

### Other page types

After the first page, every new page type (for example catalog, product, checkout, about) starts with a layout item:

- Two or three layout variants on Ideas, built from the existing components and the Design Direction. Change the layout and the page-specific blocks, not the system. A variant that needs a new component, token or pattern says so, and the new piece is approved with it.
- Then its blocks go through the cycle like the first page.
- **Paired pages.** Pages of the same type for different products or sections (for example coffee and bread catalogs) use the same block structure unless the content differs. When they differ, say why. Compare them side by side before presenting.
- **Mobile.** When mobile is in scope, adapt a whole group of approved pages in one pass, after their desktop versions are approved, so shared patterns (filters, sticky actions, drawers) are solved once.

### In every cycle

- **Images.** Generate final images with the approved treatment; label placeholders and generated images honestly.
- **Icons.** Insert icons from the approved set as vectors via Iconify. Animated icons are a static frame plus an annotation (imagery-and-icons.md).
- **Pattern inspiration** (21st.dev or similar): at most one or two patterns per project, translated into the spine's grammar.
- **States, mobile, clean-up, bulk changes:** follow figma-build.md, Building.
- **Screenshots and Figma calls:** follow figma-build.md, Working practice. If a call fails without an obvious reason, check its Plugin API pitfalls.

## 7. Verify

1. Run the read-only lint and the layout check (knowledge/design/skills/generate-design/scripts/layout-lint.js) from knowledge/design/rules/figma-lint.md on every completed page frame.
2. Inspect full-page and per-section screenshots with knowledge/design/rules/visual-qa.md, including the anti-drift comparison with the approved concept. For stores, apply the commerce checks.
3. Run design-quality-check in design mode against the brief, Design Direction, approved blocks, and copy deck.
4. Fix Critical and high-impact Important findings, re-run the lint, and inspect fresh screenshots. Do not silently replace the chosen concept while fixing.
5. Check the status file: every in-scope item is `done`, `deferred`, or `waiting client`. Report items still in `todo` or `review`.

Report anything that could not be verified. A static Figma screenshot does not prove keyboard, screen-reader, or zoom behavior.

Afterwards, offer optional refinement passes by name, without running them unasked: bolder, quieter, distill, clarify copy, polish (design-quality-check, Refinement passes).

## 8. Handoff

Finish with:

- links to Final Design sections and the Ideas and Archive pages;
- the updated `design-direction.md`, `decision-log.md`, `copy-deck.md`, `status.md` and ledger;
- a mock inventory: for each distinctive ingredient (hero composition, signature motifs, imagery, icons), how it should be implemented and what must not be lost;
- open items from the status file (deferred and waiting client), plus draft copy, demo products, proof slots, generated images that need real photos, font licenses the client must obtain;
- the checks performed and browser-only checks pending;
- a handoff note in `.wpaikit/project.md`: where the records are, the Figma file and page IDs, what is approved, a pointer to the status file, and the working rules agreed with the designer. Do not write it into `CLAUDE.md` or `AGENTS.md` when WPAIKit manages them.

Point to /figma-design-system in update mode to document the tokens and build the `_patterns` cache, /figma-components for components, and /prep-figma for a development-ready copy.

## Boundaries

- Write only to the designer-specified target Figma file. Do not modify a separate design-system file or existing frames without an explicit request.
- Do not create mobile frames unless requested.
- Do not claim visual QA without an inspected screenshot, or lint results without running the script.
- Never present rejected concepts or variants as final pages, and never delete them unless asked.
- Do not crawl reference sites in bulk. Do not copy competitor copy, logos, or complete layouts.
- Tell the designer before paid image generation, and keep to the stated number of calls.
- If a Figma call fails, retry a transient failure once when reasonable, then report what exists and what remains incomplete. Do not loop indefinitely.
