# Figma Sync Tokens

Re-read Variables and Text Styles from Figma after a designer made manual changes, and update `.wpaikit/design-system.json` to match.

## Arguments

No arguments. All data comes from `.wpaikit/design-system.json` (`_meta.figmaFile`).

## Requirements

`.wpaikit/design-system.json` must exist. If not → stop and tell the user to run `/figma-design-system` first.

## Context to load

Before starting, read:
1. `knowledge/skills/figma-sync-tokens/SKILL.md` — full diff and update procedure

## Steps

Follow the skill exactly. High-level summary:

### Phase 1 — Read local state
Read `.wpaikit/design-system.json` → current known tokens.

### Phase 2 — Read Figma state
Two cheap calls using `FILE_KEY` from `_meta`:
- `get_variable_defs` → all current Variables with names and values
- `get_design_context` on `designSystemPageId` → current Text Styles

### Phase 3 — Diff
Compare Figma state vs local JSON:
- Added tokens (in Figma, not in JSON)
- Changed tokens (value or name differs)
- Removed tokens (in JSON, not in Figma) → mark as `deprecated`

### Phase 4 — Confirm
Show diff table to user. Wait for confirmation before writing.

### Phase 5 — Update JSON
Apply confirmed changes to `.wpaikit/design-system.json`.
Preserve `_meta`, `_patterns`, `components` — only update token sections.

### Phase 6 — Report
Summary of what changed.

## Constraints

- Never modify Figma files
- Never remove tokens from JSON — use `deprecated: true` instead
- Do not update `_patterns` or `components` sections — those are managed by other commands
- Do not proceed past Phase 4 without user confirmation
