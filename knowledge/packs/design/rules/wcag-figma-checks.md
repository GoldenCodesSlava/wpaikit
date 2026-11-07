# WCAG Checks in Figma

Deterministic, read-only WCAG 2.2 checks for one Figma frame. The script is
`knowledge/design/skills/wcag-design-test/scripts/wcag-lint.js`; the skill pastes its minified
build `wcag-lint.min.js` (same behaviour, a third smaller). Its findings are evidence: a
screenshot pass and judgment turn them into the report, but a lint number is never overridden by a
visual impression.

## Running the script

1. Load the figma-use skill before the call.
2. Read `wcag-lint.min.js` and replace only the `CONFIG` line (line 1):
   `const CONFIG = { rootId: '<node id of the frame>', level: 'AA' | 'AAA', probeImages: true, tokens: [] };`
   When `.wpaikit/design-system.json` exists, pass its colours as `tokens: [{ name, hex }]`. Local
   COLOR Variables and Variables bound inside the frame are read automatically.
3. Pass the whole file as the `use_figma` code. It sets the frame's page as current, so no page switch is needed before it.
4. The script returns:
   - `findings`
   - `review`: candidates for the screenshot pass
   - `browserChecks`
   - `headingCandidates`
   - `images`
   - `checked`: per-criterion counts
   - `compact`: one `criterion|nodeId|severity|parentId` line per item
   - `fixes`: one `fix|nodeId|target|toHex|vsHex[,vsHex]|threshold|token` line per suggested colour
   - `tokens`: how many colour tokens were available
   - `targets`: one `nodeId|kind|name` line per recognised interactive element; `kind*` means it
     was recognised by shape, not by name. Visible controls missing from this list were not
     measured.
   - `mode: "compact"` and `omitted` when the full result would exceed the 48 KB `use_figma`
     return limit: findings are grouped (`c`, `s`, `ids`, `path`, `obs`, `req`, `fix` texts) and
     advisory, then moderate details are dropped first.

The script never edits the audited frame. For text over images it builds a temporary
`__wcag_probe` frame at (-100000, -100000), exports it and removes it in `finally`. It also deletes
any leftover probe at the end. The `use_figma` code limit is 50 KB: the readable source is ~50 KB,
the minified build ~34 KB. After editing `wcag-lint.js`, rebuild the `.min.js` in the wpaikit
repository (`node evals/wcag-design-test/build-lint.mjs`); a test fails when the build is stale.

## What it checks

| WCAG | Check | Threshold (AA / AAA) | Base severity |
|---|---|---|---|
| 1.4.3 / 1.4.6 | Text contrast for every styled text segment against the composited background, including layer and paint opacity | 4.5 / 7 normal; 3 / 4.5 large (≥ 24px, or ≥ 18.66px with weight ≥ 700) | critical below 0.67 × threshold, otherwise serious |
| 1.4.3 | Gradient background | worst gradient stop | as above |
| 1.4.3 | Image background | Bound first: image as white and as black under any overlays. If inconclusive, pixel probe with verdict on p5 | as above; moderate when p5 passes but the min fails |
| 1.4.1 | Text segment in a different colour, no underline, weight difference < 200 | ≥ 3:1 against the surrounding text | serious |
| 1.4.11 | Field, checkbox and slider-thumb boundary: the better of border or fill vs outer background | 3:1 | serious |
| 1.4.11 | Icon-only control: icon colour vs the background behind the icon | 3:1 | serious |
| 1.4.11 | State indicators (`dot`, `range`, `progress`, `active`…) vs the area around them, not the track under them | 3:1 | moderate |
| 2.4.7 | Instance of an interactive component whose component set has no `Focus` variant | variant exists | serious, reported once on the component set |
| 2.5.8 | Target < 24px whose 24px circle hits another target, or two undersized targets < 24px apart | 24×24 or spacing | serious |
| 2.5.5 | Target < 24×24 that passes 2.5.8 only through the spacing exception | 44×44 | advisory |
| 3.3.2 | Field without a short text (≤ 40 chars) within 24px above or to the left | visible label | critical |
| 3.3.1 | Field with a red border and no error-like text within 24px below | error in text | critical |
| 1.4.12 / 1.4.4 | Text with `textAutoResize = NONE` | hug or min-height | moderate |
| 1.4.12 | Multi-line body text (≤ 20px, > 60 chars) with line-height < 1.5 | 1.5 | advisory |
| 1.3.3 | Instructions such as "click the green button" or "on the left" | — | moderate |
| 1.3.1 / 2.4.6 | More than one text at the largest size (≥ 32px), i.e. a second H1 | one H1 | moderate |
| 1.3.1 | More than half of the text layers have no Text Style | — | advisory, on the root frame |
| 1.3.2 | Frame without auto layout whose layer order differs from the visual order (rows, then left to right) | equal | moderate |
| best practice | Text below 12px | — | advisory |

Base severity comes from the lint. The report may raise a text-contrast failure to critical, with a
reason, when the text is a heading, the primary action's label, or text inside a form field.
Non-text contrast stays serious. The report never lowers a lint failure.

## Fix suggestions

Every finding carries `fix: { summary, options[] }`. The values are computed by the script; the
report words them and may reorder them, but never invents a colour, ratio, size or opacity.

**Colours (1.4.3, 1.4.11, 2.4.7, 3.3.1).** Each colour fix has up to two options:

1. **Token.** The nearest token by OKLab distance that passes the threshold. It must be in the same
   colour family: neutral for neutral; for chromatic colours, hue within 35° and chroma ≥ 0.04. A
   grey border never becomes green. The token must also fit the scope: text fill, frame/shape fill
   or stroke.
2. **Computed.** The same hue and chroma, with the smallest OKLCH lightness change that passes,
   snapped to hex. This is the exact minimum (for example 4.50:1). Tell the designer to round it
   toward more contrast if they adjust it by hand.

Each option includes `from`, `to`, `token`, `ratio`, `deltaE`, `vs` (the backgrounds or text
colours it was checked against) and `thr`.

Further rules for specific finding types:

| Finding | Fix |
|---|---|
| Text with layer opacity < 1 | First option: "set opacity to 100%", when that alone passes |
| Text over an image or gradient | Overlay with the minimum opacity in 5% steps, checked against the worst case (white or black image pixels, every gradient stop), in the darkest token for light text or the lightest token for dark text. For an image, also a "solid panel" option. For a gradient, also text-colour options checked against every stop |
| Text on a button or chip | Change the control's fill first (it keeps the label colour), then the text colour. Fields and checkboxes keep their fill; only text and border colours change |
| 1.4.1 link | Underline first. A colour option only when one colour reaches both 3:1 against the text and 4.5:1 against the background; otherwise the fix says that no such colour exists |
| 2.4.7 focus | Ring colour ≥ 3:1 against the background around the instance, closest to the component fill (a 2px outline at 2px offset) |
| 3.3.1 error | Error-text colour ≥ 4.5:1, derived from the red border |
| 2.5.8 / 2.5.5 target size | Padding needed for a 24×24 (or 44×44) hit area around the visible shape. When two undersized targets clash, the extra gap needed |
| Other findings | Concrete instructions: labels styled like an existing field label, Auto height, line-height in px, which H2 size to use, a Text Style map, the layer order, and copy that names the button by its label |

`evals/wcag-design-test/score.py fixes FILE` re-checks every `fixes` line with an independent
contrast implementation.

## How the background is found

Walk up from the node. At each level, first take lower siblings whose box covers at least 90% of
the node's box, then the parent's fills. Stop at the first opaque layer; otherwise use the page
background. Paint and layer opacity are composited. Text opacity counts only up to the layer that
provides the background.

Blend modes other than normal and pass-through cannot be computed. Such text goes to `review` with
criterion 1.4.3.

## How interactive targets are found

Targets are found by layer name, or by the main component name for instances, matching:
`button, btn, link, input, field, textarea, select, dropdown, checkbox, radio, switch, toggle, thumb,
handle, tab, chip, dot, bullet, pagination, close, prev, next, pause, play, arrow, menu, hamburger,
search`.

The innermost match wins: `Checkbox Row` gives way to `Checkbox`, except that a button of at most
64×64 wins over its single icon (the search button, not its 18px glyph). Text layers count only
when the name contains `link` and the text has at most 40 characters.

Unnamed controls are found by shape and marked `*`:
- a filled or stroked box 28–72px tall with one short label (≤ 30 chars) and rounded corners or a
  border is a button;
- a box ≥ 160px wide whose only text looks like a placeholder (`your`, `email`, `search`, … or a
  faded text) is a field;
- a stroked square of 12–24px with no text is a checkbox.

Badges and tags can match the button shape; the screenshot pass drops them. An icon of at most
48px inside a labelled button (a filled or stroked box with one short label) is decoration and is
not a target.

**Unnamed controls (`Frame 12`) are invisible to these checks.** When the screenshot shows controls
that the lint did not list, say so in the report and recommend naming the layers. Do not claim
1.4.11 or 2.5.8 passed for them.

Interactive frames that are not component instances go to `browserChecks`: their focus state
cannot be verified in Figma.

## Review hints (screenshot pass)

| Criterion | Hint |
|---|---|
| 2.2.2 | Outermost frame named carousel/slider/gallery with no `pause`/`stop`/`play` layer. A failure only if it auto-advances: ask or mark it as conditional |
| 2.5.7 | Slider with thumbs and no input or field next to it |
| 1.4.3 | Blend modes, or the image probe disabled |

## Known gaps

- Images, gradients and overlays inside a sibling frame's children are not part of the background
  stack. Only the sibling's own fills are.
- Rotated nodes and masks are measured by their bounding box.
- Text over video uses the white/black bound only; a video has no stable pixels, and the Plugin
  API cannot copy a VIDEO fill into the probe. An inconclusive bound goes to `review`.
- Reading order is checked only in frames without auto layout, and only among children that
  contain text. Auto-layout order is assumed to be the reading order.
- Focus indicator quality (2.4.13 AAA: size and contrast of the ring) is not measured yet.

## Validation

`evals/wcag-design-test/golden.json` in the wpaikit repository is the regression set:
- `WCAG Broken`: 35 expected findings. The lint finds all 35, including 28/28 in the lint group, with 0 false positives on the 8 must-not-flag edge cases.
- `WCAG Clean`: 0 critical/serious.

Re-run it after any change to the script.
