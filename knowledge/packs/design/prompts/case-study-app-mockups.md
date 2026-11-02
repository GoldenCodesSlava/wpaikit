# Case Study App Mockups

Generate the showcase images of a mobile app case study from the app design in Figma: real app screens
placed into fixed iPhone 15 Pro compositions on a soft light-grey background, with the app logo.

## Arguments

```
/case-study-app-mockups <figma-url-with-app-screens> [figma-url-of-case-study]
```

- `<figma-url-with-app-screens>` — page, section or frame with the app screens (phone-sized frames).
- `[figma-url-of-case-study]` — the case study frame to update (optional).

## Workflow

Follow `knowledge/design/skills/case-study-app-mockups/SKILL.md` step by step. It contains the fixed
templates (Overview and wide Showcase), the scripts to run (`scripts/`), the stored device bodies
(`assets/devices/`) and the Figma upload rules.

## Constraints

- One confirmation stop: screens per image, logo and status bar before exporting.
- Never change the compositions; only the screens and the logo change.
- Only the app's real screens — no generated images.
- Never leave temporary export nodes in the Figma file.
