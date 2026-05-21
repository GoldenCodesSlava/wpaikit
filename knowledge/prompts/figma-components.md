# Figma Components

Read UI patterns saved by `/figma-design-system` and create Figma Components with variants on the Design System page.

## Arguments

No URL required. All information comes from `.wpaikit/design-system.json`.

## Context to load

Before starting, read:
1. `knowledge/skills/figma-components/SKILL.md` — full procedure, variant rules, component layout spec

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Read local data

Read `.wpaikit/design-system.json`.

If the file does not exist → stop and tell the user to run `/figma-design-system` first.

Extract:
- `_meta.figmaFile` — Figma file key
- `_meta.designSystemPageId` — where to place components
- `_patterns` — raw candidates found during token scan
- `colors`, `typography`, `radius` — to map token names onto components

### Phase 2 — Present findings

Show the user what was found, grouped by type. For each group, show:
- How many candidates found
- A short description of what they look like
- Proposed component name and variants

User picks what to create. Wait for confirmation before Phase 3.

### Phase 3 — Create Components in Figma

For each confirmed component type, use `use_figma` to create it on the Design System page.

See skill for exact variant structure per component type.

### Phase 4 — Update `.wpaikit/design-system.json`

Add a `components` section to the existing file. Do not overwrite other sections.

### Phase 5 — Report

```
Components created

Button
  Variants: Type (Primary, Secondary, Ghost) × Size (SM, MD, LG) × State (Default, Hover, Disabled)
  → 9 variants created

Badge
  Variants: Color (Default, Success, Warning, Error) × Size (SM, MD)
  → 8 variants created

Skipped: Cards — confirmed by user to skip

Local file: .wpaikit/design-system.json → updated

Next step: run /prep-figma to apply tokens and components to your design frames.
```

## Constraints

- Do not call `get_design_context` — use only data from `.wpaikit/design-system.json`
- Do not modify existing design frames
- Do not proceed to Phase 3 without user confirmation
- If `_patterns` is empty or missing → tell user to re-run `/figma-design-system`
