# Design Direction and Decision Log

/generate-design keeps decisions in two files with different jobs:

| File | Holds | How it changes |
|---|---|---|
| `.wpaikit/design-direction.md` | The current system: what applies now, globally and per page type | Edited in place. When a decision changes, the rule is rewritten; history is never appended here |
| `.wpaikit/decision-log.md` | The history: what was shown, what the designer chose and why | Append-only, numbered entries |

Read the Design Direction before generating any further page and after every context compaction. Read the log only when the reason behind a rule matters, or to restore a rejected variant. A long chronological file makes a resumed session search for the current rule among superseded ones; the split prevents that.

The Design Direction is not a second, invented design system: tokens live in Figma Variables and Text Styles and, after /figma-design-system, in `.wpaikit/design-system.json`. It states the rules for using them.

## Design Direction: structure

Create it after gate D. Write each entry as a rule, not a story: "Product cards: photo 4:3, roast-date badge over the photo, price row pinned to the bottom (log 12)". The log number is optional and points to the reason.

### Global

- **Design read (stage 1):** register, page or view type, audience, primary action, scene sentence, three brand-voice words, brand and content constraints. For redesigns, what is preserved.
- **Must-haves:** the client's mandatory and forbidden items, and where each one appears, for example "gold — logo on dark, ribbon detail, step numbers".
- **References (gate A):** the spine and the accents, with URLs and the traits borrowed from each; anti-references.
- **Foundations (gate B):**
  - design languages and currency;
  - color strategy (Restrained / Committed / Full palette / Drenched), its named anchor, and the color roles with hex and the Variable name of each; contrast pairs checked;
  - font families with roles, source, license, glyph-check result, and Figma availability; type scale ratio;
  - spacing base, radius system, elevation model;
  - icon set with license, style, stroke, and size grid;
  - image treatment.
- **Locks:** accent, shape, theme, type, icons, imagery (knowledge/design/rules/foundations.md).
- **Chosen concept (gate D):** a one-sentence idea; its axes (hero scale, composition anchor, background mode, density, image priority, header pattern, card treatment, radius system); elements borrowed from other concepts; the frame link.
- **Visual language:** composition principle, typographic character, shape and material rules, signature motif or "second-read" moment if any. Reference the actual Figma tokens.
- **Components:** each shared component with its variants, states and usage rules, for example "Button: primary for one action per screen; drop-fill hover, no movement".
- **Interaction:** primary path, essential states, and behavior to verify in the browser.
- **Responsive intent:** requested breakpoints and how priorities or composition change; what replaces hover on touch.
- **Content voice:** a pointer to the tone profile in `.wpaikit/design-brief.md` and to `.wpaikit/copy-deck.md`; claims that require confirmation.
- **Provisional tokens:** Variables or Text Styles added after gate B, each with its approval status.
- **Exceptions:** Tier 2 items from knowledge/design/rules/anti-slop.md kept deliberately, with their reason, so later reviews do not flag them again.
- **Avoid:** project-specific anti-references and patterns that would obscure this message. These are review prompts, not unconditional bans.

### Pages

One subsection per page type (Home, Catalog, Product, Checkout…), in the order of work. Each holds only what this page adds to or changes from Global:

- the chosen layout and its frame link;
- the section map (below);
- page-specific components and states;
- mobile notes.

When a page rule differs from a Global rule, it applies to that page only; say so explicitly ("overrides Global: …"). If the same override appears on a second page, promote it to Global.

### Keeping it current

- Aim for a file a resumed session can read in one pass. When it grows past about 400 lines, move detail into page sections, or into the log if it is history.
- Never leave a superseded rule in place with "(old)". Replace it; the log keeps the history.
- Rejected variants are not listed here. They are in the log and on the Archive page.

## Decision log

Append one entry per decision, in the same cycle as the decision (generate-design, stage 6, step 7):

```markdown
### 12 · 2026-10-31 · Home — Bread process
- Shown: BP1 «Раскрытие буханки» (101:1), BP2 «Нарезка» (101:2), BP3 «Слои» (101:3)
- Chosen: BP1, with a product card on hover over a slice
- Designer: «Шаги не нужно привязывать к кускам»
- Rejected: BP2, BP3 — moved to Archive
- Changed in the Design Direction: Pages › Home › Bread process
- Tokens: none
```

- Quote the designer's words when they explain the choice.
- When a decision reverses an earlier one, say which entry it supersedes.
- Record gate approvals (A–D) as entries too.

## Converting an existing chronological file

If a project's `design-direction.md` is a dated log of decisions, convert it when the run resumes: rename it to `decision-log.md` unchanged, then write a new `design-direction.md` with only the rules that apply now, checked against the Figma file. Tell the designer it was converted, and list any rule you could not confirm.

## Concept comparison

Compare directions on:

- fit with the brief;
- distinctiveness, using the reflex checks in anti-slop.md;
- clarity of the primary action;
- visibility of the must-haves;
- content and asset feasibility;
- responsive potential: one or two sentences on how the header, hero and cards recompose on mobile.

Name concrete evidence and trade-offs. Do not use a numerical score as a substitute for judgment.

- A different color on the same layout is a variant, not a second concept; concepts differ on at least two axes.
- Concepts that share the same header, cards and section layout below the hero are one concept with different heroes.

## Section map

For each agreed section of a page, write one line in its page subsection:

Section — job — key message — copy source and status — media role — composition — action

Discuss a proposed removal or addition with the designer before changing the approved list. Keep the primary action recognizable across the page with one label per intent, without repeating the same visual weight everywhere by default.
