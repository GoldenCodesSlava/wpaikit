---
name: wcag-design-test
description: Audit a Figma frame (or a desktop + mobile pair) against WCAG 2.2 AA or AAA. Combines a deterministic read-only lint (text and non-text contrast, target size, focus variants, labels, errors, text spacing), a screenshot pass, and a browser-only checklist. Every finding carries a concrete computed fix. Places a report frame next to the audited frame and Accessibility annotations on flagged layers; never changes the audited design.
metadata:
  short-description: WCAG 2.2 review of a Figma frame with computed fixes
---

# WCAG Design Test

Audit one Figma frame against WCAG 2.2 and produce a report a designer can act on. The report
contains:

- what fails;
- where it fails (layer path and node link);
- the measured value and the required value;
- the exact fix.

The report appears in three places:

- a report frame next to the audited frame: a snapshot with numbered pins, the questions and
  checklists, and one card per finding;
- Accessibility annotations on the flagged layers, visible in Dev Mode and the annotation view;
- `.wpaikit/wcag/<frame-slug>.md` for handoff, plus a short summary in chat.

The audit has three groups of checks. The report keeps them apart:

| Group | Source | Label in the report |
|---|---|---|
| A | `scripts/wcag-lint.min.js`, read-only and deterministic | **Measured** |
| B | Screenshot and judgment | **From screenshot** |
| C | Cannot be decided in Figma | **Check in the browser** |

## Hard rules

1. **The audited design is never changed.** The skill adds only:
   - its report frame next to the audited frame, which replaces its own earlier report;
   - Accessibility annotations whose text starts with `**WCAG`, unless `--no-annotations` is given.
     They are metadata and do not change how the frame looks. A re-run replaces them.

   The lint's temporary off-canvas `__wcag_probe` is removed by the lint itself. Never move,
   rename or restyle any existing layer. In a view-only file, skip the frame and the annotations
   and deliver the `.md` and the chat summary.
2. **Numbers come only from the lint.** Every ratio, hex value, size, opacity and token name in the
   report must appear in the lint output. Screenshot findings carry no computed numbers; write
   "estimated from the screenshot" instead.
3. **Nothing unverified is reported as passed.**
   - A criterion counts as passed only when the lint's `checked` shows `checked > 0` and
     `failed = 0`.
   - Group B and C items are never passes.
   - A missing screenshot means group B was not done; say so.
4. **Unrecognised controls are not verified.** The lint finds controls by layer or component name,
   and unnamed ones by shape (marked `*` in `targets`).
   - Compare the controls visible in the screenshot with `targets`. List each control the lint
     missed under "Not verified", recommend naming the layer, and never state 1.4.11 or 2.5.8
     results for it.
   - Confirm every `*` target on the screenshot. A badge or tag detected as a button ("Open now",
     "Garden") is not a control: drop its focus and target-size items from the report.
5. **A lint number is never overridden by a visual impression.** When the screenshot contradicts a
   lint finding because of a known gap, keep the finding. Examples of known gaps: a background
   built from a sibling's children, a mask, rotation. Mark the finding "needs manual check", give
   the reason, and do not drop it silently.
   - Applicability is a judgment, not a number. A 1.4.11 icon finding on an icon that only
     decorates a labelled button, or on an icon that is not a control, may be moved to "Not
     applicable" with the reason. The measured ratio stays as it is.
6. **Severity only goes up.** A lint `critical` or `serious` finding is never lowered. Raising a
   severity needs a stated reason (see Severity).

## Inputs

```
/wcag-design-test <figma-url> [<second-figma-url>] [--level AA|AAA] [--lang ru|ro|en] [--no-annotations]
```

- **Parse the URL.** Read the `fileKey` from `figma.com/design/<fileKey>/...`. For a branch URL,
  use the branch key. Convert `node-id=12-34` to `12:34`.
- **No node-id.** Ask which frame to audit. Do not audit a whole page.
- **Node types.**
  - FRAME, COMPONENT, INSTANCE and GROUP are audited directly.
  - For a SECTION, COMPONENT_SET or page, the lint stops with an error that lists the child frames.
    Ask which one to audit, and offer to audit each one into its own report.
- **Level.** The default is AA. `--level AAA` makes the lint use AAA thresholds. With AA, AAA-only
  criteria (2.5.5, 1.4.6) appear only as `advisory`.
- **Language.** Report language follows the conversation; `--lang` overrides it. Always give the
  criterion number together with its official English title, for example `1.4.3 Contrast (Minimum)`.
- **Two URLs** (a desktop and a mobile frame of the same page):
  - lint each frame;
  - write one report with a section per frame;
  - add the consistency checks (3.2.3, 3.2.4) and the reflow note (1.4.10).

## Procedure

### 1. Prepare

1. Call `create_session` for the file. Load the figma-use skill before any `use_figma` call.
2. Read `knowledge/design/rules/wcag-figma-checks.md` for the lint contract, thresholds, fix rules
   and known gaps.
3. Do not call `get_metadata` on the frame: on a large frame it returns the whole subtree. The lint
   checks the node type and returns the root's name, type and size.
4. If `.wpaikit/design-system.json` exists, turn its `colors` map (`{ "#hex": "Variable/name" }`)
   into `tokens: [{ name, hex }]`. The lint reads local COLOR Variables and bound Variables by
   itself.

### 2. Lint (group A)

1. Read `knowledge/design/skills/wcag-design-test/scripts/wcag-lint.min.js`. It is the minified
   build of the readable `wcag-lint.js` next to it; paste the build, it is a third smaller.
2. Replace only the values on line 1 (`const CONFIG = …`). Pass the whole file unchanged as the
   `use_figma` code. Do not shorten, retype or "fix" any other line.
3. If the call fails with an error that mentions the probe or `createImage`, run it again with
   `probeImages: false`. The image-background bound still works without the probe.
   - Text over images with an inconclusive bound then goes to group B, marked "not measured".
4. If it still fails, say that the measured checks could not run and why. Never replace the lint
   with hand-measured values.
5. Keep the full result for the report. Do not paste raw JSON into chat.
6. **Large pages.** `use_figma` returns at most 48 KB, so the lint switches to `mode: "compact"`
   when its result would not fit:
   - repeated findings are already grouped (`ids` lists every node; `fix` holds the option texts);
   - `omitted` counts what was dropped to fit: first advisory, then moderate findings, then the
     `fixes`, `compact` and `targets` lists.
   When something was omitted and it matters to the designer, run the lint again on the
   top-level sections that hold those findings (each section's node id as `rootId`) and say in
   the report which sections were measured in detail.

### 3. Screenshot pass (group B)

**Screenshots.**
- Call `get_screenshot` on the root with `maxDimension: 2000`.
- Screenshot a top-level section separately only where its text is still too small to read.
- Screenshot the mobile frame separately.

**Resolve every `review` item from the lint.** Decide whether it is a finding, a pass, or a
question for the designer.
- A carousel without a pause control fails 2.2.2 only if it advances on its own. If that is not
  known, put the question under "Needs your answer"; do not report a failure.
- Text over a video background has no measured ratio. Judge the poster frame on the screenshot,
  report it as "estimated from the screenshot", and add the browser check "contrast across the
  whole video, or a scrim behind the text".

**Then check what the lint cannot measure:**

| Criterion | Look for | Default severity |
|---|---|---|
| 1.4.5 Images of Text | Text inside raster images, for example a banner photo with a baked-in headline. Logos are exempt. | serious |
| 1.4.1 / 1.3.3 Use of Color, Sensory Characteristics | Status, required fields, chart series or errors shown only by colour; instructions that rely on shape, position or colour | serious |
| 1.3.1 / 2.4.6 Info and Relationships, Headings and Labels | Heading outline from `headingCandidates` and the screenshot. Look for skipped levels, text that looks like a heading but is not one, and headings that do not describe their section | moderate |
| 2.4.4 Link Purpose (In Context) | Several "Read more" or "Learn more" links with no distinguishing context | moderate |
| 3.3.1 / 3.3.3 Error Identification, Error Suggestion | A form with no error state designed, or error text that does not say how to fix the problem | moderate |
| 3.3.2 Labels or Instructions | Required fields marked with an asterisk that is never explained; format hints only in placeholders | moderate |
| 2.5.7 Dragging Movements | A range slider, drag-to-reorder or swipe-only carousel with no buttons or input as an alternative | serious |
| 2.2.2 Pause, Stop, Hide | Carousels, tickers and video backgrounds without visible controls | conditional |
| 3.2.3 / 3.2.4 Consistent Navigation, Consistent Identification | Two frames only: navigation order, labels and icons differ between them | moderate |
| 1.4.10 Reflow | No mobile frame was provided. This is "not verified", never a failure | — |

Rules for screenshot findings:
- The default severity is `moderate`. Use `serious` when the defect is unambiguous in the
  screenshot (as in the table). Never use `critical`.
- Each finding names the layer, either by node id from the lint lists or by the nearest named
  ancestor in `get_metadata`. It also says what is visible and gives a specific fix in words.
- **Unrecognised controls.** Find every visible control that is not in `targets` and list it under
  "Not verified" (hard rule 4).

### 4. Browser checklist (group C)

List only the items that apply to this frame, and tie each one to its elements:

- **Focus.** Interactive frames from `browserChecks` have no focus state that can be checked in
  Figma. For component sets that do have a Focus variant, the ring's size and contrast (2.4.13)
  still need checking in the browser.
- **Keyboard** (2.1.1, 2.4.3).
  - Tab order through `targets` follows the visual order.
  - No keyboard trap in modals or menus.
  - A skip link before long navigation.
- **Accessible names** (4.1.2, 2.5.3). Propose a name for every icon-only control, and make sure
  the accessible name contains the visible label.
- **Status messages** (4.1.3). Form success, "added to cart", filter results.
- **Content on hover or focus** (1.4.13). Tooltips, mega-menus.
- **Focus not obscured** (2.4.11). Sticky headers, cookie banners, chat widgets.
- **Zoom and reflow** (1.4.4, 1.4.10). 200% zoom; a 320px viewport.
- **Motion and timing** (2.2.2, 2.3.3). `prefers-reduced-motion` for carousels and animations.
- **Page** (3.1.1, 2.4.2). Page language and title.

### 5. Severity and grouping

| Severity | Meaning |
|---|---|
| critical | A failure of an A/AA criterion on main content or the primary action. The text cannot be read, or the control cannot be found or used. |
| serious | An A/AA failure on a secondary element |
| moderate | A borderline case, a likely failure based on the screenshot, or a missing state |
| advisory | AAA criteria and best practice |

- **Base severity comes from the lint.** Raise a text-contrast failure (1.4.3 / 1.4.6) to `critical`
  when the text is one of these, and say why:
  - a heading (the H1 or a section heading);
  - the label of the primary call to action;
  - text inside a form field: label, value, placeholder or error;
  - body text repeated across many nodes.

  Other lint severities stay as they are. Non-text contrast (1.4.11) on fields and checkboxes stays
  `serious`; their labels and errors already carry the critical findings (3.3.2, 3.3.1).
- **Group repeated findings.** Merge findings that share the criterion, the observed colour pair
  and the fix into one item. Give the count and list the node ids. With more than 40 items, also
  group by component (all instances of one component share one fix on the main component).
- **Order** by severity, then top to bottom (`bbox.y`).
- **Number** the items 1…N in that order and keep the same numbers in chat.

### 6. Fix wording

Use `fix.options` from the lint in their order:

- **Token option.** Give the token name, its hex value and the ratio:
  `text → gray/500 #6B7280 → 4.83:1`.
- **Computed option.** Give the hex value and the ratio, and add: "the exact minimum; round toward
  more contrast if you adjust it".
- **Fix on the main component.** When the node is inside an instance, say the fix belongs on the
  main component (name it). Fixing only the instance would create an override.
- **Overlays and panels.** Give the colour, opacity and resulting ratio exactly as computed.
- **Link fixes.** When the lint says no colour satisfies 1.4.1, say that underline is the only fix.
- **Target, label and order fixes.** Pass on the lint's concrete instruction: padding in px, the
  label style to copy, the layer order.

Add one line on who is affected, for example "low-vision users and anyone outdoors on a phone".
Keep it short and specific to the finding.

### 7. Write the report

Write `.wpaikit/wcag/<frame-slug>.md`, replacing any earlier file. The slug is the frame name in
lowercase ASCII with hyphens; for two frames, join both slugs with `--`.

If an earlier report exists, read it first and add a "Since last run" line: what was fixed, what
is still open, what is new. Match items by criterion and node id.

```markdown
# WCAG 2.2 AA — <frame name>

<Figma link to the frame> · <date> · lint: <tokens> colour tokens available

**N critical · N serious · N moderate · N advisory** · N checks for the browser
Since last run: …   (only on a re-run)

## Findings

### 1. 1.4.3 Contrast (Minimum) — Critical · Measured
- Layer: Hero / Container / Subtitle — [2:15](<node link>)
- Now: #9CA3AF on #FFFFFF = 2.54:1
- Required: ≥ 4.5:1
- Fix: text → gray/500 #6B7280 → 4.83:1. Alternative: #6E7581 → 4.50:1 (exact minimum).
- Who is affected: …

## Needs your answer
## Not verified
## Check in the browser
## Handoff for development
- Heading outline (h1–h3) with node ids
- Images: decorative or informative, with proposed alt text (from `images` and the screenshot)
- Icon-only controls with proposed accessible names
- Forms: label, hint, error message and required marker for each field
## Measured
| Criterion | Checked | Failed |
|---|---|---|
| 1.4.3 Contrast (Minimum) | 48 | 0 |
```

"Measured" copies `checked` from the lint. A criterion passed only when its "Failed" is 0.

- **Node link:** `https://www.figma.com/design/<fileKey>/?node-id=<id with ":" replaced by "-">`.
- **Empty sections:** leave out every empty section except "Measured".
- **Instance sublayers:** for a node id like `I2:26;2:3` (a layer inside an instance), link the
  instance (`2:26`).
- **Clean audit:** a frame with no findings still gets a report, listing what was measured and
  what was not verified.

### 8. Build the report frame

1. Read `knowledge/design/skills/wcag-design-test/scripts/wcag-report.js`. Replace only the
   `REPORT` object and pass the whole file as the `use_figma` code.
2. Fill `REPORT` from the `.md` report, using the same numbers and wording:
   - `rootId` — the audited frame. For two frames, build one report per frame.
   - `annotate: false` with `--no-annotations`.
   - `title`, `meta` (date, item count, the `.md` path).
   - `summary` — chips such as `{ label: '11 critical', sev: 'critical' }`; questions and browser
     checks without `sev`.
   - `t` — the labels in the report language: severities, `measured`, `screenshot`, `layer`,
     `now`, `need`, `fix`, `why`, `findings`.
   - `items` — `{ n, crit, title, sev, src: 'measured' | 'screenshot', ids, path, now, need, fix: [], why }`.
     `ids` lists every node of a grouped item: the first gets the numbered pin, the others an
     outline. Leave `ids` empty for a frame-wide item.
   - `sections` — `{ title, lines }` for Needs your answer, Not verified, Check in the browser and
     Measured. The handoff section stays in the `.md` only.
3. Check the result:
   - `annErrors` should be 0;
   - `outside` lists items whose node is outside the frame, such as a component set; they have a
     card but no pin.

   Take one screenshot of the report frame to confirm it renders.

The script places the report to the right of the frame, or below it when the right is taken, and
never over another node. It writes `wpaikit / wcag-report-for` shared plugin data, which lets a
re-run find and replace the report.

### 9. Reply in chat

Keep the reply short:

1. The summary line (counts by severity).
2. Up to five critical or serious items: the number, the criterion and the fix in one line each.
3. The questions from "Needs your answer".
4. A link to the report frame and the path to the `.md` report. Mention that the flagged layers
   carry Accessibility annotations.

Do not repeat the whole report.

## Re-running and verifying

- A re-run after the designer's fixes repeats the whole procedure; the lint is cheap.
- A re-run replaces the report frame and every `**WCAG` annotation, including those on nodes
  outside the frame such as a component set. Annotations from fixed findings disappear.
- To confirm the audited design is unchanged, compare an `exportAsync` fingerprint of the frame
  before and after the run. Also check that no `__wcag_probe` is left.
- The lint's regression set lives in the wpaikit repository (`evals/wcag-design-test`). It is not
  part of a project install.

## Known limits

Tell the designer about a limit when it affects their frame:

- Targets and fields are found by name. Unnamed controls are not measured.
- Backgrounds made of a sibling frame's children, masks and rotation are approximated by bounding
  boxes.
- Auto-layout order is assumed to be the reading order.
- Focus-ring quality (2.4.13) is not measured.
- Video backgrounds are bounded only, never sampled.
