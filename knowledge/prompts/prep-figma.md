# Prep Figma

Prepare a Figma page frame for code generation without changing its visual appearance.

## Arguments

Expected: a Figma URL pointing to a **page-level frame** (e.g. `Homepage`, `About`, `Services`).

A page-level frame is a top-level frame inside a Figma page — it contains multiple block frames inside it.

```
/prep-figma https://www.figma.com/design/abc123?node-id=1-2
```

Do not pass individual block frames — pass the parent page frame that contains all blocks.

## Requirements

`.wpaikit/design-system.json` must exist. If it does not → stop and tell the user to run `/figma-design-system` first.

## Context to load

Before starting, read:
1. `knowledge/rules/figma-to-block.md` — ACF naming conventions and Auto Layout rules
2. `knowledge/skills/figma-prep/SKILL.md` — full procedure

## Steps

Follow the skill exactly. High-level summary:

### Step 1 — Setup
- Read `.wpaikit/design-system.json`
- Extract `FILE_KEY` from the URL
- Check if "Dev Ready" page exists via `get_metadata`
- If not → create it
- Copy the target page frame to "Dev Ready"

### Step 2 — Decompose
- Identify all top-level block frames inside the copied page
- Preserve original positions and spacing exactly — do not move or reorder anything

### Step 3 — Rename blocks (with confirmation)
- Propose semantic names for each top-level block frame
- Show to user and wait for confirmation per block before applying

### Step 4 — Apply tokens
- Replace hardcoded colors → Variables from `design-system.json`
- Replace inline fonts → Text Styles from `design-system.json`

### Step 5 — Fix Auto Layout
- Add Auto Layout to structural containers that lack it
- Use the exact existing spacing values — never change visual gaps or padding
- Skip layers where spacing is irregular, note in report

### Step 6 — Componentize
- Replace detached button/badge/card instances with Component instances from `design-system.json`

### Step 7 — Rename layers
- Rename child layers to ACF-ready semantic names
- Follow naming rules from `knowledge/rules/figma-to-block.md`

### Step 8 — Report
Output what was done, what was skipped, and what needs manual attention.

## Core constraint

**Never change the visual appearance of any block.**
The "Dev Ready" page must look pixel-perfect identical to the original.
If a change risks shifting pixels — skip it and note in the report.
