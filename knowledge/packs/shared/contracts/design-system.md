# Contract: `.wpaikit/design-system.json`

The design system cache is the hand-off file between design and development. It is written by
`/figma-design-system` (Design pack) and kept in sync by `/figma-sync-tokens` and
`/figma-update-design-system`. Development commands read it to map Figma values to token names.

The file can be produced in a different project (for example by the designer) and copied into
`.wpaikit/` of the development project.

## Shape

```json
{
  "_meta": {
    "figmaFile": "FILE_KEY",
    "designSystemPageId": "PAGE_ID",
    "generatedAt": "YYYY-MM-DD",
    "sourceFrames": ["node-id-1"]
  },
  "colors":     { "#0f172a": "Colors/brand/primary" },
  "typography": { "Inter/48/700": "Heading/4xl" },
  "spacing":    { "16": "Spacing/4" },
  "radius":     { "8": "Radius/lg" },
  "components": { "Button": { "figmaComponentId": "1:2", "variants": { "Type": ["Primary"] } } },
  "_patterns":  { "buttons": [], "badges": [], "cards": [], "inputs": [] }
}
```

| Key | Meaning |
|---|---|
| `_meta` | Source Figma file, Design System page and frames the tokens were extracted from |
| `colors` | raw hex → Figma Variable name |
| `typography` | `Family/size/weight` → Text Style name |
| `spacing`, `radius` | px value (string) → Figma Variable name |
| `components` | Figma Components created by `/figma-components` |
| `_patterns` | Raw measured patterns (buttons, badges, cards, inputs) used to build components |

## Rules for readers

- A token value is either a name string or `{ "name": "...", "deprecated": true }`.
  Skip deprecated tokens when generating new code.
- Unknown keys must be ignored — writers may add sections.
- Token names follow `Group/subgroup/name`. Code converts them to framework names
  (for Tailwind: `Colors/brand/primary` → `brand-primary`, `Spacing/4` → `4`, `Radius/lg` → `lg`).
- If the file is missing, read the Figma Variables and Text Styles directly through the Figma MCP,
  or ask for the file from the designer. Never invent token names.
