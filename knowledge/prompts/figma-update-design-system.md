# Figma Update Design System

Add new Figma frames to an existing design system — merges new tokens into `design-system.json` and updates the Figma Design System page.

## Arguments

No fixed arguments. The skill asks for new Figma frame URL(s) interactively in Phase 1.

## Requirements

- `.wpaikit/design-system.json` must already exist (run `/figma-design-system` first)
- Run from `wp-content/themes/boilerplate/`

## Context to load

Before starting, read:
1. `knowledge/skills/figma-update-design-system/SKILL.md` — full procedure
2. `knowledge/rules/design-system-layout.md` — exact dimensions for Design System page sections

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Validate
- Read existing `design-system.json`, show token counts and source frames
- Ask user for new Figma frame URL(s)

### Phase 2 — Scan
- `get_design_context` on new frames only
- Skip frames already in `sourceFrames`

### Phase 3 — Diff
- Added / Already present per token type and pattern type

### Phase 4 — Propose names + confirm
- Name new tokens, show diff table, wait for `yes / edit names / cancel`

### Phase 5 — Update Figma
- Add new Variables and Text Styles
- Append new rows to existing Design System page sections

### Phase 6 — Update JSON
- Merge new tokens, append source frame IDs, update `generatedAt`

### Phase 7 — Code prompt
- Remind user to run `/design-system-to-code`

### Phase 8 — Report

## Constraints

- Never delete or modify existing tokens
- Never modify existing Figma Variables, Text Styles, or Design System page elements
- Never run `/design-system-to-code` automatically
- Skip already-scanned frames
