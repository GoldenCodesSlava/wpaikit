# Imagery and Icons

Use when foundations define the image treatment and icon set (stage 3), in concepts (stage 5), and during the build (stage 6).

## Imagery

### When imagery is required

Image-led briefs need real imagery in the design: hospitality, food, clinics and interiors, real estate, travel, fashion, products, events, crafts. A text-only page or colored blocks where photos belong is a defect, not restraint (knowledge/design/rules/anti-slop.md).

"Imagery" also includes product screenshots, diagrams with real data, and illustrations. Do not use rectangle-built fake product UI.

### Asset inventory (stage 3)

Before gate B, go through the supplied photos against the planned page types:

- hero;
- category tiles;
- product cards;
- story sections;
- team and location;
- blog.

For each role, note: available (file names), weak (wrong angle, busy background, low resolution), or missing.

Product cards in a store usually need consistent packshots: one product, neutral or brand background, same angle and light. Interior photos are not a substitute. A missing packshot set is a gap to report at gate B, with options:

- a product shoot;
- client-supplied photos;
- clearly labeled placeholders.

Do not wait until the concepts to report it. Never generate images of the client's real products as if they were photos.

Ask directly for cut-outs (products on a transparent background, separate pieces such as slices or beans) when a planned composition places products freely over a background or animates them. Do not plan to cut products out of busy photos yourself: automated retouching leaves visible smudges. If cut-outs do not exist, report it as a gap at gate B.

### Large vector art

A `use_figma` script has a size limit (about 50,000 characters). Maps, detailed illustrations, and dot grids often exceed it as inline path data.

- Prefer a designer-supplied SVG or PNG uploaded with `upload_assets`.
- If the vector must be built by code, split it into chunks below the limit, create each chunk with `figma.createNodeFromSvg`, then flatten or group them. Record the offset of the resulting bounds: a flattened vector starts at its content bounds, not at the original frame origin.
- When a ready-made vector is needed and not available, give the designer a precise generation prompt (projection, bounds, grid step, dot size, colors) instead of approximating it.

### Sourcing order

1. Brand and client assets supplied by the designer.
2. Generated images via the Figma MCP `generate_image`, rules below.
3. A clearly labeled placeholder frame that says what the image must show, for example `[Photo: the clinic reception, daylight]`. Use this when generation is unavailable or inappropriate, for instance for real team portraits, real products, or real premises.

Never present a generated image as a real person, real product, real premises, or real work of the client. Annotate generated images as "Generated: replace with real photo" where a real photo is expected.

### Art direction

- **One decisive image beats five mediocre ones.** Commit the hero to one mood.
- **Search or describe the brand's physical object, not the category.** Not "Italian food" but "hand-cut pasta on a scratched oak table, low warm side light".
- **Keep one treatment across the page** (image lock): crop logic, color grading, light, and whether people appear. Use at least two distinct aspect ratios per page so it does not look stamped.
- **Leave room for text** where text overlays the image. Check the text contrast on the actual pixels.
- **No pills, badges, or labels over images** unless they carry information (for example a price on a product tile). No decorative photo credits.

### generate_image rules

`generate_image` is a **paid** Figma AI feature: every call consumes the file's credits.

- **Before the first call**, tell the designer how many images you plan to generate in the current stage and which model you will use.
- **Models:**
  - concepts (stage 5): the cheapest model (`gemini-3.1-flash-lite-image`), at most one key image per concept;
  - final images (stage 6): a higher-quality model, after the concept is approved.
- **Placement.** Create a correctly sized frame with a semantic name (for example `Background Image`, `Image`) in the layout first. Then call `generate_image` with that frame's `nodeId`: the image fill is replaced without resizing the frame. Nested instance IDs are not supported; target the main node.
- **Size.** Request the frame's aspect ratio. Width and height go up to 2048 and act as a ratio hint; the model picks the closest supported size.
- **Prompt template**, in English regardless of the design language:

  ```
  {subject: the brand's physical object or scene}, {setting and context},
  {light: direction, quality, time of day}, {camera: angle, distance, lens feel},
  {color grading matching the palette: name 2–3 palette colors},
  {composition: where empty space is left for text},
  photographic, natural, no text, no logos, no watermarks, no UI elements
  ```

- **Inspect the result in the screenshot.** Check anatomy (hands, faces), legible fake text, wrong local details (signs, cars, architecture, food that does not belong to the region), and fit with the palette. Regenerate at most twice per slot, then report.
- **List** every generated image in the handoff.

## Icons

### Choosing the set

1. **Ask first** whether the designer or brand already uses an icon set. If so, use only that.
2. **Otherwise propose 2–3 sets** that match the type and shape system, and recommend one at gate B. For example:
   - Lucide (ISC): neutral outline;
   - Phosphor (MIT): several weights, friendly;
   - Tabler (MIT): technical outline;
   - Material Symbols (Apache-2.0): variable weight and fill.
3. **One set per project.** Fix the style (outline or filled), stroke width, and size grid in the Design Direction (icon lock). Brand logos are the only exception.

### Getting icons (Iconify)

All Iconify endpoints are public and need no key:

- **Search:** `https://api.iconify.design/search?query={term}&prefixes={set}&limit=32`. Use English terms and try synonyms.
- **SVG:** `https://api.iconify.design/{set}/{name}.svg`, for example `https://api.iconify.design/lucide/shopping-cart.svg`.
- **Set metadata and license:** `https://api.iconify.design/collections?prefixes={set}`. Read `license.spdx`.

**Licenses:**

- Allowed without asking: MIT, ISC, Apache-2.0, CC0-1.0, OFL-1.1.
- Sets that require attribution (CC-BY, for example Font Awesome Brands) need the designer's approval.
- Logos are trademarks whatever the icon license says.

**Insert as editable vectors.** Either upload the SVG with `upload_assets` (SVG imports as a vector tree), or pass the SVG string into a `use_figma` script and call `figma.createNodeFromSvg(svg)`. Name the node `Icon/{name}`; if the same icon appears several times, make it a component. Bind the icon color to a color Variable. Fetch icons on demand and do not bulk-download whole sets.

### Sizing and alignment

- **Size** is 1–1.25 times the adjacent text: 16–20px next to 16px text. Use the 16/20/24 grid that matches the rendered size.
- **Stroke follows the adjacent text weight:** about 1.5px next to regular text, 2px next to medium or semibold. Keep it consistent across the page.
- **States:** outline is the default, filled is the active or selected state, when the set supports both.
- **Optical alignment:** the icon side of a button gets about 2px less padding (for example 16 text side, 14 icon side). Shift play triangles slightly toward their point.
- **Labels and targets:** pair icons with labels when that helps comprehension. Icon-only controls need an accessible name in the handoff and a hit area of at least 24×24px; aim for 40–44px.
- **Recognizability:** check every icon at 16px in the screenshot.

### Animated icons (Lordicon)

Use animated icons only where motion carries meaning: a success state, an empty state, one or two accents on a page. Never as decoration on every feature.

- **In Figma:** place a static key frame (PNG or standard SVG export) and annotate `Animated: lordicon {icon id or URL}, trigger: {hover | in-view | loop}`. Lordicon's Lottie-based SVG does not render reliably in Figma.
- **License:** the free plan requires attribution. Icons must not be bundled into reusable templates or themes. Record the license choice in the handoff.
- **Implementation:** respect reduced motion; looping motion longer than 5 seconds needs a pause option. Handle this in the browser implementation, not in Figma.
