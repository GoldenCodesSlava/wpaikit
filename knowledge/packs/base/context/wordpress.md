## WordPress workflow

```
/scan-project           ← build the project knowledge base (once per project)
/setup-fonts            ← audit, convert, connect fonts from design-system.json
/design-system-to-code  ← Twig components + SCSS + tailwind.config.js
/scan-components        ← components registry (run before figma-to-block)
/figma-to-block         ← PHP + Twig + SCSS + ACF JSON per block
/validate-code          ← check SCSS, Twig, PHP against the rules

# After implementation, for developer review:
/get-comment-for-frontend <url>  ← list all blocks on a page with file paths
```

- When generating any code from Figma, read `knowledge/wordpress/rules/figma-to-code.md` first —
  it overrides all other style conventions.
- Theme rules live in `knowledge/wordpress/rules/boilerplate/`.
