# Figma to Block (HTML)

Slice a Figma block frame into static front-end code: HTML markup, SCSS partial with Tailwind
`@apply`, and a JS module when the block is interactive. No CMS or backend integration.

## Arguments

```
/figma-to-block-html <desktop-url>
/figma-to-block-html <desktop-url> <mobile-url>
```

- `desktop-url` — required. URL of a single block frame (e.g. `HeroBlock` from the `Dev Ready` page)
- `mobile-url` — optional. URL of the same block's mobile variant

Responsive styles are always generated. If `mobile-url` is provided → use exact mobile values.
If not → apply smart responsive defaults.

## Requirements

- Figma MCP is connected
- Run from the root of the front-end project
- Tokens: `.wpaikit/design-system.json` (preferred) or Figma Variables read through MCP

## Context to load

Before starting, read:
1. `knowledge/slicing/rules/markup.md` — universal slicing rules (**mandatory**)
2. `knowledge/slicing/rules/structure.md` — where files go
3. `knowledge/shared/rules/figma-blocks.md` — how blocks and layers are structured and named in Figma
4. `knowledge/shared/contracts/design-system.md` — token cache format
5. `knowledge/slicing/skills/figma-to-block-html/SKILL.md` — full generation procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Setup
Load tokens, components registry and project paths. Parse URLs → node IDs.

### Phase 2 — Read design
`get_design_context` (+ `get_screenshot`) on the desktop frame, and on the mobile frame if given.

### Phase 3 — Analyze
Map layers → content model and HTML elements, Figma properties → Tailwind classes, build
responsive pairs, detect interactive behaviour.

### Phase 4 — Interactive confirmation
Show the proposed structure. Let the user edit before generating.

### Phase 5 — Generate files
HTML, SCSS partial (+ JS module), entry imports, exported assets — each through the validation loop.

### Phase 6 — Update project knowledge base and report

## Constraints

- No Tailwind utilities in HTML (only `container` on `__inner`)
- No hardcoded hex colors or raw px — tokens only
- Always generate responsive styles even without a mobile frame
- JS only for interactive blocks
- Never overwrite existing files without asking
