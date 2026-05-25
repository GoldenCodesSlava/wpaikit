# Design Quality Check

Audit a design brief or existing Figma frames for predictable AI patterns,
category reflexes, absolute bans, and color/typography quality issues.

## Arguments

- No argument → **Brief mode**: reads current brief interactively
- `<figma-url>` → **Design mode**: reads Figma frames and audits visual output

## Requirements

- Design mode requires Figma MCP (`get_design_context`, `get_screenshot`)
- Design mode with fixes requires `figma-use` skill loaded before `use_figma`

## Context to load

Before starting, read:
1. `knowledge/skills/design-quality-check/SKILL.md` — full procedure and all checks

## Steps

Follow the skill exactly. High-level summary:

### Auto-detect mode
- No URL → Brief mode (check intent and strategy)
- URL provided → Design mode (read Figma, check visual output)

### Run 8 checks
1. Category reflex — first-order (industry → predictable palette)
2. Category reflex — second-order (predictable anti-reflex)
3. Absolute bans (side-stripe borders, gradient text, glassmorphism, hero metric, identical cards, modal-first)
4. Color strategy validation (restrained / committed / full / drenched)
5. Register consistency (brand vs product)
6. Theme logic (scene-based, not reflex-based)
7. Typography hierarchy (design mode only)
8. Layout rhythm (design mode only)

### Show results
- ✗ critical / ⚠ warning / ✓ passed per check
- For each issue: proposed alternative + [accept / suggest different / keep original]

### After fixes
- Brief mode → return control to `/generate-design` for Design Brief Summary
- Design mode → offer to apply fixes in Figma

## Constraints

- Never block over a designer override — document and proceed
- Never invent color values — only use existing tokens or brand colors
- Load `figma-use` skill before any `use_figma` call in design mode
