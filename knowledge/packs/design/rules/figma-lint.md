# Figma Lint: Mechanical Checks

Use after each built section in stage 6 (scoped to that section), in stage 7 on whole page frames, and after any large fix. Screenshots show how the page looks. A read-only `use_figma` script shows what the file actually contains: fonts, colors, radii, sizes, and unbound values. Run both. Load the figma-use skill before the call. The script only reads the file and returns data.

Accessibility has its own rule: knowledge/design/rules/wcag-figma-checks.md holds the WCAG thresholds and the WCAG lint (`wcag-lint.min.js`). That lint composites opacity, gradients and image pixels, and checks non-text contrast, target size, focus variants, labels and errors. The contrast and target rows below are a fast pre-check while building a section. Run the WCAG lint before a gate or delivery, and use its numbers when the two disagree.

Lint findings are evidence for judgment, not a verdict. A clean lint does not prove a good design; a flagged item can be intentional when it is recorded as an exception in the Design Direction.

## What to collect per page frame

| Check | Threshold | Severity if failed |
|---|---|---|
| Text contrast against the nearest solid background (pre-check) | Thresholds from knowledge/design/rules/wcag-figma-checks.md (AA: 4.5:1 body, 3:1 large) | Critical |
| Text over an image fill | Not computed here; the WCAG lint measures it | — |
| Font families and styles used | Only the approved ones (type lock) | Important |
| Smallest font size | Body ≥16, UI ≥14, captions ≥13, nothing below 12 | Important |
| Text not using a Text Style | 0 in final frames | Important |
| Distinct solid fills on frames and shapes, excluding neutrals and semantics | One accent hue (accent lock) | Important |
| Corner radii used | Only values in the radius system (shape lock) | Important |
| Fills, strokes, radii, and gaps not bound to Variables | 0 where a token exists | Important |
| Interactive elements (`Button`, `Link`, `Icon Button`, `Input` by name) smaller than 24×24 (pre-check; the WCAG lint applies the 2.5.8 spacing exception) | 0 | Important |
| Eyebrow-like labels: uppercase text ≤14px above a heading | ≤ ceil(sections ÷ 3) | Preference |
| Hero: text layers in the first section | ≤4 groups (eyebrow, headline, sub, CTA group) | Important |
| Text with fixed height (`textAutoResize` = `NONE`) | 0; use hug or min-height | Important |
| Dashes and quotes | Match the language rules in knowledge/design/rules/copy-and-tone.md | Preference |
| Generic layer names (`Frame 12`, `Group 4`, `Rectangle 3`) | 0 for structural layers (knowledge/shared/rules/figma-blocks.md) | Important |
| Auto-layout frames with a fixed size on the stacking axis whose content overflows. Usually caused by `resize()`, which resets sizing to FIXED. | 0 | Critical, content is clipped |
| Repeated instances in one row (cards) with different heights or footers at different heights | Equal | Important |
| Number ranges like `36–40` without word joiners, which can break across lines | 0 | Preference |
| Variables and Text Styles not listed in the Design Direction (provisional tokens) | Reported at the next gate | Important |

## Reference script

Adapt the root node ID and the approved lists. The script uses the raw Plugin API, so it ends with `return`.

```js
const ROOT_ID = 'PAGE_FRAME_ID';
const APPROVED_FONTS = ['Family A', 'Family B'];
const RADIUS_SYSTEM = [0, 8, 16, 999];

const root = await figma.getNodeByIdAsync(ROOT_ID);
const toLin = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = ({ r, g, b }) => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const solid = fills => Array.isArray(fills) ? fills.find(f => f.visible !== false && f.type === 'SOLID' && (f.opacity ?? 1) > 0.95) : null;
const hasImage = fills => Array.isArray(fills) && fills.some(f => f.visible !== false && f.type === 'IMAGE');

function background(node) {
  for (let p = node.parent; p && p.type !== 'PAGE'; p = p.parent) {
    if ('fills' in p) {
      if (hasImage(p.fills)) return { image: true };
      const s = solid(p.fills);
      if (s) return { color: s.color };
    }
  }
  return { color: { r: 1, g: 1, b: 1 } };
}

const out = { contrast: [], onImage: [], fonts: {}, smallText: [], noTextStyle: 0,
  fixedHeightText: [], radii: {}, offSystemRadii: [], unboundFills: 0, smallTargets: [], genericNames: [],
  overflowingFrames: [], unevenRows: [], breakableRanges: [] };

for (const node of root.findAll(() => true)) {
  if (node.type === 'FRAME' && node.layoutMode && node.layoutMode !== 'NONE' && node.children.length) {
    const vertical = node.layoutMode === 'VERTICAL';
    const fixedStack = vertical ? node.primaryAxisSizingMode === 'FIXED' : node.counterAxisSizingMode === 'FIXED';
    const flow = node.children.filter(c => c.layoutPositioning !== 'ABSOLUTE');
    const contentBottom = Math.max(...flow.map(c => c.y + c.height)) + node.paddingBottom;
    if (fixedStack && flow.length && contentBottom > node.height + 1) out.overflowingFrames.push({ id: node.id, name: node.name, height: node.height, content: Math.round(contentBottom) });
    const inst = flow.filter(c => c.type === 'INSTANCE');
    if (node.layoutMode === 'HORIZONTAL' && inst.length > 1 && inst.every(c => c.mainComponent && c.mainComponent.id === inst[0].mainComponent.id)) {
      const hs = [...new Set(inst.map(c => Math.round(c.height)))];
      if (hs.length > 1) out.unevenRows.push({ id: node.id, name: node.name, heights: hs });
    }
  }
  if (/^(Frame|Group|Rectangle|Ellipse|Vector) \d+$/.test(node.name)) out.genericNames.push(node.id);
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    out.radii[node.cornerRadius] = (out.radii[node.cornerRadius] || 0) + 1;
    if (!RADIUS_SYSTEM.includes(node.cornerRadius)) out.offSystemRadii.push({ id: node.id, r: node.cornerRadius });
  }
  if ('fills' in node && solid(node.fills) && !(node.boundVariables && node.boundVariables.fills)) out.unboundFills++;
  if (/^(Button|Link|Icon Button|Input)/.test(node.name) && (node.width < 24 || node.height < 24))
    out.smallTargets.push({ id: node.id, name: node.name, w: node.width, h: node.height });

  if (node.type !== 'TEXT') continue;
  if (!node.textStyleId) out.noTextStyle++;
  if (/\d[–-]\d/.test(node.characters) && !node.characters.includes('⁠')) out.breakableRanges.push(node.id);
  if (node.textAutoResize === 'NONE') out.fixedHeightText.push(node.id);
  const bg = background(node);
  for (const seg of node.getStyledTextSegments(['fontName', 'fontSize', 'fills'])) {
    const key = `${seg.fontName.family} ${seg.fontName.style}`;
    out.fonts[key] = (out.fonts[key] || 0) + 1;
    if (seg.fontSize < 13) out.smallText.push({ id: node.id, size: seg.fontSize });
    const fg = solid(seg.fills);
    if (!fg) continue;
    if (bg.image) { out.onImage.push(node.id); continue; }
    const large = seg.fontSize >= 24 || (seg.fontSize >= 18.67 && /bold|semibold|black|heavy/i.test(seg.fontName.style));
    const r = ratio(fg.color, bg.color);
    if (r < (large ? 3 : 4.5)) out.contrast.push({ id: node.id, text: seg.characters.slice(0, 40), ratio: +r.toFixed(2) });
  }
}

out.offFonts = Object.keys(out.fonts).filter(f => !APPROVED_FONTS.some(a => f.startsWith(a)));
out.onImage = [...new Set(out.onImage)];
return out;
```

**Limits of the script:**

- Fill opacity, layer opacity, blend modes, gradients, and effects are not composited. Treat borderline ratios (within 0.3 of the threshold) as "check visually", and confirm with the WCAG lint (knowledge/design/rules/wcag-figma-checks.md).
- Text on images and gradients is measured by the WCAG lint, not by this script.
- Interactive elements are found by layer name, so the naming rules matter.

## Reporting

Group findings by root cause, not by node: "14 text layers use #8A8F98 on #FFFFFF (3.2:1)" is one finding. For each finding give the frame, evidence, impact, and the smallest fix. Fix Critical items, re-run the lint on the affected frames, and take a fresh screenshot.

## Layout checks

`knowledge/design/skills/generate-design/scripts/layout-lint.js` checks how elements sit relative to each other. Run it together with the script above after each built section, and on whole page frames in stage 7. Paste it into one `use_figma` call and edit only `CONFIG`:

- `targets`: section or page frame IDs, all on one page;
- `band`: the name pattern of the brand band from the Design Direction, or `''` when there is none;
- `minGap`: the smallest gap between two controls (default 8).

| Check | What it finds | Severity |
|---|---|---|
| `clip` | Text, controls and focus rings cut by a clipping parent; frames or text hidden entirely outside it | critical for text, important for controls and focus rings, moderate when hidden |
| `gap` | Two filled controls closer than `minGap`, unless their common parent is a group (tabs, segmented control, pagination, stepper) | important when touching, otherwise moderate |
| `overlap` | Frames partly overlapping in free layout; the checked frame overlapping a sibling on the page | moderate; important for the checked frame |
| `icon-align` | An icon centered against multi-line text more than 1.5× taller than the icon, in a horizontal row | moderate |
| `radius` | One kind of control (same component set or name before ` — `) with several radii | moderate |
| `radius` | Different kinds of controls with different radii | info: confirm it is intended |
| `band` | Text overlapping the brand band | important |
| `truncation` | Text with truncation on, or a fixed text box shorter than one line | moderate / important |

Limits:

- Controls are found by layer and component names (button, link, input, chip, tab…), so naming matters.
- Overflow along a carousel or scroll row is intended when the row is named so (carousel, slider, scroll, track…); only cuts across the row are reported.
- Contrast is not checked here: use the WCAG lint.

The fixture and expected results are in `evals/layout-lint/` of the wpaikit repository.

## Plugin API pitfalls

The known Plugin API pitfalls that cause clipped, collapsed or black layers are listed in knowledge/design/rules/figma-build.md. Check them when a lint finding has no obvious cause.
