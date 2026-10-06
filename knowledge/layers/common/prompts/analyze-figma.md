# Analyze Figma Design

Analyze a Figma frame or page for ACF block implementation readiness using the wpaikit boilerplate (Twig + Tailwind + ACF).

## Arguments

Extract the arguments from the user's message or command invocation.

Expected: a Figma URL pointing to a specific frame, page, or selection, with an optional language flag.

Supported flags:
- `--lang en` — output the report in English (default)
- `--lang ro` — output the report in Romanian
- `--lang ru` — output the report in Russian

Parse the input as follows:
1. Extract the Figma URL (the value that starts with `https://figma.com` or `https://www.figma.com`).
2. Extract the `--lang` value if present; default to `en` if omitted.
3. Store the resolved language as `REPORT_LANG`.

## Context to load

Before starting, read:

1. `knowledge/rules/figma-to-block.md` — design standards for this stack
2. `knowledge/skills/figma-design-analysis/SKILL.md` — full analysis procedure and report format

## Steps

1. Parse the user's message: extract the Figma URL and the `--lang` flag (default: `en`).
2. Use Figma MCP `get_design_context` with the provided URL to retrieve the design structure
3. Apply every checklist item from the skill:
   - Block boundaries
   - Layer structure and naming
   - ACF field readiness
   - Auto Layout
   - Design tokens (compare against `knowledge/rules/figma-to-block.md`)
   - Typography
   - Responsive variants
   - Reusable components
4. Output the report using the format defined in the skill

## Output format

Follow the report format from `knowledge/skills/figma-design-analysis/SKILL.md` exactly:

```
Status: Ready / Needs cleanup / Not ready

Critical issues
- [Location] Issue. Impact. Fix.

Important issues
- [Location] Issue. Impact. Fix.

Minor issues
- [Location] Issue. Impact. Fix.

Implementation notes
- ACF blocks detected:
- Likely ACF fields:
- Reusable Twig include candidates:
- Tailwind/token assumptions:
```

## Language

Write the entire report in the language resolved from `REPORT_LANG`:
- `en` → English
- `ro` → Romanian
- `ru` → Russian

All section headers, issue descriptions, and implementation notes must be in the chosen language. Technical terms (ACF field names, layer names, Tailwind class names, Figma node paths) stay in their original form regardless of language.

## Constraints

- Do not modify the Figma file
- Do not generate Twig, PHP, ACF JSON, or any implementation code
- Do not claim Ready status if Auto Layout or Variables are missing
