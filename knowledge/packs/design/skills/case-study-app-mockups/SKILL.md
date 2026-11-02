---
name: case-study-app-mockups
description: Use when generating the device mockup images for a CreativSoft case study of a mobile app. Takes the app screens from Figma frames and the app logo, renders 2 fixed iPhone 15 Pro compositions (Overview with logo and three phones, wide showcase with five phones) on a soft light-grey gradient background and places them into the Figma case study.
metadata:
  short-description: Generate mobile app case study mockups from Figma frames
---

# Case Study App Mockups

The mobile-app version of `case-study-mockups`. There is no website to capture, so the screens come from
the app design in **Figma**. The **structure of every image is fixed**; only two things change per app:

1. the app screens inside the iPhones;
2. the logo (template A).

Background: soft cool light-grey gradient `#F3F5FA → #EFF1F7 → #E7ECF2` (160°), no glow.
Device: iPhone 15 Pro, front view. Never invent new compositions, move devices or change sizes.

## Inputs

```
/case-study-app-mockups <figma-url-with-app-screens> [figma-url-of-case-study]
```

- `figma-url-with-app-screens` — required. A page, section or frame that contains the app screens as
  phone-sized frames (width 360–430 px).
- `figma-url-of-case-study` — optional. Case study frame to update. Without it (or on an empty page) the
  case study template is copied there.

## Templates (fixed)

Slots match the case study frame (`Case Study … / Desktop` and `/ Mobile`). Geometry lives in
`templates/compose.html`; do not edit it per app.

| Template | Case slot | Size | Content | Screens |
|---|---|---|---|---|
| **A** Overview | `OverviewBlock` image | 1312×940 | App logo on the left, three front iPhones fanned on the right, the centre one on top | 3 (`overview`) |
| **B** Showcase wide | the image of `ShowcaseBlock` | 1312×720 | Five front iPhones in a staggered row | 5 (`row`) |

The app case study has **no `Two Shots` row** (the two small images under the showcase). If the case study
template still has it, delete that row in the desktop and the mobile frame.

Screen choice: A — the 3 key screens (home / main feature / profile or result); B — 5 screens that tell
the user flow left to right. Avoid empty states, loaders and system dialogs. A and B should not repeat each
other more than once.

## Workflow

Work folder: `<scratchpad>/case-study-app-mockups/<app>/` (call it `WORK`). Scripts are in `scripts/`
(run from the skill folder). Requirements: Chrome, Node 20 (`npm i` once in the skill folder), Python 3 with Pillow and numpy.

### 1. Find the screens (Figma)
Load `figma-use` first. In the given node collect frames with width 360–430 px. Record per frame: id, name,
size and whether it already contains an iOS status bar (a layer named like `Status Bar` / `StatusBar` or a text `9:41`).

### 2. Confirm with the user (one stop)
Show a table: which screens go into A and B, the logo (layer named `logo`, the app icon, or ask for one)
and whether a status bar will be added. Wait for "ok" or corrections. This is the only question in the run.

### 3. Export the screens
`get_screenshot` never upscales, so export through temporary holders:
1. On the same page, for every chosen frame create `TMP app-export <key>`: a frame of size
   `frame.width × round(frame.width × 2556 / 1179)`, `clipsContent = true`, no fill, with a clone of the frame at (0,0).
   Then `holder.rescale(3)`.
2. `get_screenshot(nodeId=holder, maxDimension=2556, contentsOnly=true)` and download each URL to
   `WORK/frames/<key>.png` with `curl -f -L`.
3. Logo: clone the logo layer, recolour it for a light background if it is white, `rescale` it to ~1500 px wide,
   export to `WORK/logo/logo-full.png`.
4. Remove every `TMP app-export` node.

### 4. Screens, palette, logo, devices
```bash
python3 scripts/prepare_screens.py --work WORK [--status-bar]
python3 scripts/palette.py --work WORK
python3 scripts/logo_split.py --work WORK --dark <palette.dark>
python3 scripts/devices.py --work WORK --keys <all keys>   # also writes iso-*.png, not used by A/B
```
- `--status-bar` — only when the frames have no iOS status bar; otherwise the Dynamic Island covers the app header.
- `palette.py` proposes `{dark, light, accent}` from the screens. It is only used for the logo tint and when
  `background` is set to `null` (gradient + glow instead of the flat studio background).
- `logo_split.py` splits the logo into icon + wordmark; if it cannot, template A uses the whole logo.

### 5. Render
`WORK/config.json`:
```json
{
  "work": "<absolute WORK>",
  "background": "linear-gradient(160deg,#f3f5fa 0%,#eff1f7 50%,#e7ecf2 100%)",
  "palette": {"dark": "#240c14", "light": "#f4fcfc", "accent": "#d43424"},
  "logo": <contents of WORK/logo/logo.json, or null>,
  "slots": {
    "overview": ["home", "feature", "profile"],
    "row": ["s1", "s2", "s3", "s4", "s5"]
  },
  "renders": [
    {"template": "A", "file": "overview.png"}, {"template": "B", "file": "showcase-wide.png"}
  ]
}
```
```bash
node scripts/render.js --config WORK/config.json --out WORK/out
```
Renders at 3x. Look at every image before uploading: the Dynamic Island must not cover content, no empty screens.

### 6. Figma
- With a case study URL: find the slots by structure (`OverviewBlock` image → A, `ShowcaseBlock` image → B)
  in the desktop and the mobile frame; remove a `Two Shots` row if it is there.
- Without it: duplicate a case study template on the given page, remove its `Two Shots` row (desktop and mobile)
  and tell the user that the texts are from the template.
- Upload with `upload_assets` (one URL per slot) and `curl -F "file=@<file>;type=image/png" <submitUrl>`.
  Mobile slots: keep width, set height = width × image height / image width before upload.
- Copy the final PNGs to `assets/generated/case-studies/<app>/` in the project.

## Rules
- Load `figma-use` before any `use_figma` call. Never leave `TMP app-export` nodes in the file.
- Only the app's real screens from Figma — no generated images, no screens of other apps.
- Do not change compositions, device model or sizes. Only screens, logo and colours.
