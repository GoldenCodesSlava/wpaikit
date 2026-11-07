# WCAG Design Test

Audit a Figma frame against WCAG 2.2 and write a report with a concrete fix for every finding.

## Arguments

- `<figma-url>`: a frame link with `node-id`. With no node-id, ask which frame to audit.
- `<second-figma-url>` (optional): the mobile (or desktop) frame of the same page. Both frames go
  into one report, and the consistency checks are added.
- `--level AA|AAA`: AA by default.
- `--lang ru|ro|en`: the report language. By default it is the conversation language.
- `--no-annotations`: skip the Accessibility annotations on flagged layers.

## Context to load

- Read `knowledge/design/skills/wcag-design-test/SKILL.md` and
  `knowledge/design/rules/wcag-figma-checks.md`.
- Read `.wpaikit/design-system.json` when it exists; its colours become lint tokens.
- Read an earlier `.wpaikit/wcag/<frame-slug>.md` when it exists, for the "Since last run" line.

## Procedure

1. Run `scripts/wcag-lint.min.js` unchanged except for its `CONFIG` line. It checks the node type itself; for a
   section or component set, ask which frame to audit.
2. Inspect screenshots and resolve the lint's `review` items.
3. Check the screenshot-only criteria and list the controls the lint did not recognise.
4. Build the browser checklist for this frame.
5. Assign severities, group repeated findings and word the computed fixes.
6. Write `.wpaikit/wcag/<frame-slug>.md`.
7. Build the report frame next to the audited frame with `scripts/wcag-report.js`, which also adds
   the annotations.
8. Reply with a short summary and a link to the report frame.

Follow the Figma tool prerequisites, including the `figma-use` skill before every `use_figma` call.

## Constraints

- Never change the audited design. Add only the report frame (replacing the skill's own earlier
  report) and `**WCAG` Accessibility annotations. The lint's temporary off-canvas probe removes
  itself.
- Every number in the report comes from the lint output.
- Label screenshot-based findings as such, list browser-only checks separately, and never report
  unverified items as passed.
