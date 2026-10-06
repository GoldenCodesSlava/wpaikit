## Slicing workflow

```
/scan-project           ← build the project knowledge base (once per project)
/setup-fonts            ← audit, convert, connect fonts from design-system.json
/figma-to-block-html    ← HTML + SCSS + JS per block
```

- Read `knowledge/slicing/rules/markup.md` before generating any HTML, SCSS or JS — it overrides
  all other style conventions. File locations: `knowledge/slicing/rules/structure.md`.
- Tokens come from `.wpaikit/design-system.json` (format: `knowledge/shared/contracts/design-system.md`)
  or directly from Figma Variables.
