---
name: case-study-mockups
description: Use when generating the device mockup images (browser, iPhone, isometric phone grid) for a CreativSoft case study page from a live site URL. Captures the site, takes its logo and colours, renders the 4 fixed case-study compositions and places them into the Figma case study (desktop + mobile).
metadata:
  short-description: Generate case study mockup images from a site URL
---

# Case Study Mockups

## Purpose

Generate the 4 showcase images of a case study page from a site URL. The **structure of every image is
fixed** (it reproduces the images in the Waterford Treasures case study). Only three things change per site:

1. the screenshots inside the browsers and phones;
2. the logo (template A);
3. the background colours (light / dark) and the glow, taken from the site palette.

Never invent new compositions, move devices or change sizes. If a template does not fit a site, report it.

## Inputs

```
/case-study-mockups <site-url> [figma-url-of-case-study]
                    [--auth user:pass] | [--login-url URL --user USER --pass PASS]
```

- `site-url` — required. The site to capture.
- `figma-url` — optional. Case study frame to update. Without it a copy of the template case is created.
- Login — optional, passed **only as separate parameters**.

**Always say this at the start, before any work** (in the user's language):

> If the site is closed (staging with a password or a login page), pass access as a separate parameter:
> `--auth user:pass` for a browser password prompt (HTTP basic auth), or
> `--login-url <login page> --user <login> --pass <password>` for a login form.

If `discover.js` prints `LOCKED`, stop and ask for access. Never capture a login page as a mockup.
Pass credentials only to the scripts; never repeat them in replies, files or Figma.

## Templates (fixed)

Reference: Figma file `9nC9u4odqDiTbDaGf1ZA0b`, page `Final`, frame `Case Study Waterford Treasures / Desktop` (`2246:5787`)
and `/ Mobile` (`2459:7745`). Geometry lives in `templates/compose.html`; do not edit it per site.

| Template | Case slot | Size | Background | Content | Shots needed |
|---|---|---|---|---|---|
| **A** Overview | `OverviewBlock` image | 1312×940 | light | Wide browser (home, first screen) + front iPhone (mobile home). Phone right edge = hero right edge in the browser. Horizontal logo (icon + wordmark) under the browser, starting on the line of the header logo | `home-d`, `home-m`, logo |
| **B** Showcase wide | first image of `ShowcaseBlock` | 1312×720 | light | Big browser 900 px with a feature section + small Mac browser 370×499 with a tablet page (834 px). Bottoms on one line, small window overlaps the big one by 28 px | `<section>-d`, `<page>-t` |
| **C** Iso grid | left image of `Two Shots` | 644×556 | dark | Grid of isometric iPhone 15 Pro with 9 different mobile screens | 9 × `<key>-m` |
| **D** Browser + phones | right image of `Two Shots` | 644×556 | dark | Browser 540 px with a section + two front iPhones bottom-right | `<section2>-d`, 2 × `<key>-m` |

Section choice for B and D: a map or listing if the site has one; otherwise **any block with cards**,
otherwise the most visually interesting section (large images, illustrations, product UI). Avoid text-only
blocks, forms and footers. B and D must show different sections. C uses 9 different screens across
different pages (hero of inner pages, card sections, feature sections); avoid duplicates of A.

## Workflow

Work folder: `<scratchpad>/case-study-mockups/<domain>/` (call it `WORK`). Scripts are in `scripts/`
(run from the skill folder). Requirements: Chrome, Node 20 (`npm i` once in the skill folder), Python 3 with Pillow + numpy.

### 1. Discover
```bash
node scripts/discover.js --url <site> --out WORK/discover.json [auth params]
```
Gives pages with headings and card counts, the logo URL and a proposed palette `{dark, light, accent}`:
- `dark` — footer background if dark, otherwise the darkest neutral colour of the site (not pure black);
- `light` — the lightest non-white background colour; if there is none, mix the accent with white (8%);
- `accent` — the most used saturated button colour (used for the glow).

### 2. Confirm with the user (one stop)
Show a short table: for every template the pages/sections you picked, the palette swatches (hex) and the logo.
Wait for "ok" or corrections. This is the only question in the run.

### 3. Capture
Write `WORK/plan.json` (format in the header of `scripts/capture.js`). Keys: `home` (d + m), the B section (d),
the B tablet page (t), the D section (d), 2 phone keys for D and 9 keys for C (m).
```bash
node scripts/capture.js --plan WORK/plan.json --out WORK/shots [auth params]
```
It scrolls the whole page (reveal animations, lazy images), returns to the section, waits for CSS animations
and images, hides cookie banners and keeps sections right under a sticky header. Run it in the background
(several minutes). Then look at every shot: empty white areas, half-loaded images, banners, cut blocks.
Recapture bad ones with another section or page.

### 4. Logo
```bash
node scripts/logo.js --work WORK --src <discover.logo.src> [--auth user:pass]
python3 scripts/logo_split.py --work WORK --dark <palette.dark>
```
Splits the logo into icon + wordmark (stacked or side by side). If it cannot be split, template A uses the whole logo.

### 5. Devices
```bash
node scripts/screens.js --work WORK --keys <all mobile keys>
python3 scripts/devices.py --work WORK --keys <all mobile keys>
```
Front iPhone 15 Pro (rounded screen mask) and isometric iPhone 15 Pro (screen mapped by its corners).
Device bodies are stored in `assets/devices/` — do not re-export them from Figma.

### 6. Render
Write `WORK/config.json`:
```json
{
  "work": "<absolute WORK>",
  "domain": "site.com",
  "palette": {"dark": "#25221e", "light": "#faf8f4", "accent": "#b4975a"},
  "logo": <contents of WORK/logo/logo.json>,
  "slots": {
    "desktopHome": "home-d.png", "mobileHome": "home",
    "desktopSection": "map-d.png", "tabletPage": "museums-t.png",
    "isoScreens": ["passport","pastport","onepass","glance","pickown","plan","chapters","home","viking"],
    "desktopSection2": "onepass-d.png", "phone1": "pastport", "phone2": "passport"
  },
  "renders": [
    {"template": "A", "file": "overview.png"}, {"template": "B", "file": "showcase-wide.png"},
    {"template": "C", "file": "iso-grid.png"}, {"template": "D", "file": "browser-phones.png"}
  ]
}
```
`domain` is the production domain shown in the browser address bar (ask if the site is a staging URL).
```bash
node scripts/render.js --config WORK/config.json --out WORK/out
```
Renders at 3x. Look at every image before uploading.

### 7. Figma
- With a Figma URL: find the slots inside the given desktop and mobile case frames by structure
  (`OverviewBlock` image → A, `ShowcaseBlock` first image → B, `Two Shots` left → C, right → D).
- Without a Figma URL: duplicate `2246:5787` and `2459:7745` on page `Final` to free space, rename them
  `Case Study <Site> / Desktop|Mobile`, and tell the user that the texts are still from Waterford.
- Upload with `upload_assets` (one URL per slot) and POST each file with
  `curl -F "file=@<file>;type=image/png" <submitUrl>`. In zsh loop with `bash -c` and a heredoc.
  If a POST fails, request a new URL for that slot and retry.
- Mobile slots: keep width, set height = width × image height / image width before upload.
- Copy the final PNGs to `assets/generated/case-studies/<domain>/` in the project.
- Finish with screenshots of the four desktop slots and a short report: pages used, palette, what was replaced.

## Rules
- Load `figma-use` before any `use_figma` call.
- Do not change compositions, device models, sizes or the browser chrome. Only screenshots, logo and colours.
- Never use AI image generation for screens — only real screenshots of the site.
- Do not capture pages with personal data of real users (accounts, orders, dashboards).
