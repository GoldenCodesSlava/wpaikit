# Generate Design

Interactively collect design materials and project context from the designer,
then generate a complete UI design directly in Figma.

## Arguments

No arguments — the skill is fully interactive.

## Requirements

- Figma MCP must be available (`use_figma`, `get_design_context`, `get_variable_defs`, `get_screenshot`)
- Designer provides at minimum: target Figma URL + project description

## Context to load

Before starting, read:
1. `knowledge/skills/generate-design/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Collect Materials
- Ask for target Figma project URL
- Ask for reference/examples URL (or confirm empty project)
- Ask for Design System URL (or offer `/figma-design-system` / skip)
- Ask for brand assets / logo URL if no DS

### Phase 2 — Project Brief
- Ask structured questions in one block: business, industry, audience, style, fidelity,
  generation mode, mobile, pages, sections, language, inspiration

### Phase 3 — Design Quality Check + Brief Summary
- Read `knowledge/skills/design-quality-check/SKILL.md`, run in **brief mode**
- Show quality check results: category reflex, absolute bans, color strategy, register, theme
- Resolve each issue with designer: [accept / suggest different / keep original]
- After fixes → show Design Brief Summary, wait for [yes / adjust / cancel]

### Phase 4 — Generate in Figma
- Load `figma-use` skill before any `use_figma` call
- Execute page-by-page or block-by-block depending on designer's choice
- After each page/block: [continue / adjust / stop]

### Phase 5 — Completion
- Show what was created
- Suggest next commands

## Constraints

- Never generate Mobile frames unless designer explicitly requested it
- Never skip Phase 3 (Quality Check runs before every generation)
- Always use Lorem ipsum for text content
- Never read DS tokens without designer-provided URL
- Load `figma-use` skill before every `use_figma` call
- Load `design-quality-check` skill in brief mode before showing Design Brief summary
