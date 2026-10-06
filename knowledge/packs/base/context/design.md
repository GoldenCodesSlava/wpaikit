## Design workflow

```
/analyze-figma          ← audit (optional but useful)
/figma-design-system    ← tokens + patterns cache (.wpaikit/design-system.json)
/figma-components       ← components (reads cache, no extra Figma calls)
/prep-figma             ← dev-ready copy: decompose, rename, tokens, Auto Layout

# Design-first (alternative starting point):
/generate-design        ← generate a Figma design from brief, DS and references
/design-quality-check   ← audit a brief or a design for quality issues

# SEO (before implementation):
/figma-seo-structure    ← which blocks, links, schema the page needs (run first)
/figma-seo-texts        ← copy for the editorial blocks (run after structure is approved)
```

- When in doubt about how a block should be structured or named in Figma, check
  `knowledge/shared/rules/figma-blocks.md` first.
- Hand off `.wpaikit/design-system.json` and the `Dev Ready` page to development.
