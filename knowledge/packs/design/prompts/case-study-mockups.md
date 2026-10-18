# Case Study Mockups

Generate the 4 showcase images of a case study page from a live site URL: real screenshots placed
into fixed browser / iPhone compositions, with background colours and logo taken from the site.

## Arguments

```
/case-study-mockups <site-url> [figma-url] [--auth user:pass | --login-url URL --user U --pass P]
```

- `<site-url>` — the site to capture (required).
- `[figma-url]` — the case study frame to update (optional).
- Login for closed sites — only as separate parameters.

## Workflow

Follow `knowledge/design/skills/case-study-mockups/SKILL.md` step by step. It contains the fixed
templates, the scripts to run (`scripts/`), the stored device bodies (`assets/devices/`) and the Figma
upload rules.

## Constraints

- Always tell the user at the start how to pass a login for a closed site.
- One confirmation stop: pages, sections, palette and logo before capturing.
- Never change the compositions; only screenshots, logo and background colours change.
- Only real screenshots of the site — no generated images.
