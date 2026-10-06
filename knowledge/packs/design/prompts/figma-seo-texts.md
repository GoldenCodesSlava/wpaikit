# Figma SEO Texts

Analyze a Figma page and generate multilingual SEO-optimized texts for all editorial blocks.

All Figma texts are placeholders — everything is replaced with real, SEO-optimized copy.
Dynamic data blocks (product cards, category grids, testimonials) are skipped entirely.

## Arguments

```
/figma-seo-texts <figma-url>
```

`<figma-url>` — Figma URL of the page frame to analyze (required).

## Context to load

Before starting, read:
1. `knowledge/design/skills/figma-seo-texts/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Collect brief
Ask: languages + country, niche, market (country/city), output mode (meta/copy/all), keywords (auto/manual), tone of voice.

### Phase 2 — Analyze Figma page
Call `get_design_context` on the frame. Walk the layer tree. Build a block map. Auto-classify each block as `editorial` or `dynamic`.

### Phase 3 — Confirm block list
Show the classification to the user. Wait for confirmation or edits before generating.

### Phase 4 — Generate keywords
If keywords = auto: generate 10–15 localized keywords per language. Show for confirmation.

### Phase 5 — Generate SEO texts
For each language, generate texts for all confirmed editorial blocks following SEO rules.

### Phase 6 — Write output file
Write `seo-texts-{page-slug}.md` to current working directory.

### Phase 7 — Report

## Constraints

- Read-only from Figma — never modify layers or text
- Never generate texts for dynamic blocks
- Never translate mechanically — localize per language
- Never proceed past Phase 3 without user confirmation
- Never proceed past Phase 4 (keywords) without user confirmation
- Only writes the output `.md` file
