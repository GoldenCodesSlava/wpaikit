# Figma SEO Structure

Audit a Figma page for structural SEO — which blocks exist or are missing, how the page links to
other pages, schema markup, trust signals, local signals, and layout states. After the user approves
the plan, build the missing blocks directly in Figma and annotate them for developers.

This command covers **structure**. Copy (meta, H1, editorial text) is handled by `/figma-seo-texts` —
run it after the structure is approved.

## Arguments

```
/figma-seo-structure <figma-url> [--lang en|ro|ru]
```

`<figma-url>` — Figma URL of the page frame to audit (required).
`--lang` — language of the report and annotations (default: language of the conversation).
Texts placed into Figma follow the language already used in the design.

## Context to load

Before starting, read:
1. `knowledge/design/skills/figma-seo-structure/SKILL.md` — full procedure
2. `knowledge/shared/rules/figma-blocks.md` — block structure and layer naming standard
3. The `figma-use` skill — **mandatory before any `use_figma` call**

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Brief
Ask: niche + primary market (country, city), main target query (`[auto]` allowed), mode (`[audit]` / `[build]`), where to build (`[copy]` / `[in-place]`).

### Phase 2 — Discover the file (read-only)
Read `.wpaikit/` caches if present. Collect the style inventory (fonts, colors, radii, buttons, cards, icons, imagery) and reusable blocks from the file. Record source node IDs for this session only.

### Phase 3 — Classify the page type
Detect from structure + frame name. Confirm with the user.

### Phase 4 — Audit against the checklist
Search intent & landing structure, internal linking, E-E-A-T, local SEO, content blocks, Schema.org, layout states. Each item: ✅ / ⚠️ / ❌ + reason + priority (P1/P2/P3).

### Phase 5 — Report + plan
Show the report and the build plan. Write `seo-structure-{page-slug}.md`. Stop and wait for approval.

### Phase 6 — Build in Figma
Only after approval and only in `[build]` mode. One block per `use_figma` call, screenshot after each. Reuse existing components and tokens.

### Phase 7 — SEO annotations
Create/reuse the `SEO` annotation category. Annotate links, canonicals, schema, NAP, layout-state rules.

### Phase 8 — Final report
List built blocks, annotations, placeholder data to replace, and next commands.

## Constraints

- Audit is read-only — nothing is built before explicit approval
- Load the `figma-use` skill before every `use_figma` session
- Never edit original frames unless `[in-place]` was chosen; never delete user content
- Reuse existing components/styles — never introduce a new visual language
- All invented data is flagged as placeholder and listed as "to replace"
- Never promise rich results Google no longer shows (FAQ for non-authoritative sites, HowTo)
- Never hardcode project-specific IDs, brands, colors, or fonts into kit files
- Only writes: Figma (after approval) and `seo-structure-{slug}.md`
