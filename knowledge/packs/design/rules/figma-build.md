# Figma Build: File, Records, Working Practice

How /generate-design organizes the target Figma file, keeps its records, and builds safely across long sessions. Read it at stage 0 and before the first stage 6 cycle.

## File structure

Use five pages. Create the missing ones at stage 0, after the designer confirms. In an existing file, map its pages to these roles and ask before renaming or adding pages.

| Page | Holds | Rules |
|---|---|---|
| Final Design | Approved work only | Numbered sections (`01 Home — desktop`, `02 States`…). Master components live here or on Design System, never on Ideas or Archive |
| Ideas | Concepts and block variants waiting for a choice | Empty when nothing waits for the designer. After a choice, the winner goes to Final Design and the rest to Archive in the same cycle |
| Archive | Rejected concepts and variants | Nothing is deleted unless the designer asks. Keep the original names, so a variant can be found and restored |
| Design System | Token and component documentation | Built by /figma-design-system with knowledge/design/rules/design-system-layout.md. /generate-design only reserves the page |
| Flows | Maps of user scenarios | Only when the designer asks for scenario maps. Static snapshots, not a prototype |

## Records

All records live in `.wpaikit/` in the client project folder:

| File | Holds |
|---|---|
| `project.md` | Handoff note: what the project is, where everything is, the working rules agreed with the designer |
| `status.md` | Backlog and state of every item (knowledge/design/rules/project-status.md) |
| `figma-ledger.json` | Map from semantic names to Figma IDs |
| `design-direction.md` | The current system: global rules and one section per page type (knowledge/design/rules/design-direction.md) |
| `decision-log.md` | Append-only history of decisions: what was shown, chosen and rejected, and why |
| `design-brief.md`, `copy-deck.md` | Brief, must-haves, tone; approved copy |

`design-system.json`, built later by /figma-design-system, is the development contract. The ledger is the working map for the design run and is not handed to developers.

### Ledger format

```json
{
  "fileKey": "FILE_KEY",
  "updated": "2026-11-07",
  "pages": { "final": "0:1", "ideas": "428:6450", "archive": "12:2", "designSystem": "435:6450", "flows": null },
  "sections": {
    "home.hero": { "id": "91:258", "page": "final", "status": "Home — desktop #1" }
  },
  "components": {
    "Button": { "set": "343:4290", "properties": { "Label": "Label#2:0", "Icon": "Icon#4:64" } }
  },
  "variables": { "collection": "VariableCollectionId:8:2", "color/primary": "VariableID:8:3" },
  "textStyles": { "Heading/display": "S:f10aaf…," },
  "effectStyles": { "Elevation/overlay": "S:c5ded8…," },
  "images": { "hero.loaf": "imageHash" },
  "provisional": ["Heading/hero"]
}
```

- Write every ID a `use_figma` call returns into the ledger in the same cycle. Never reconstruct an ID from memory or from a screenshot.
- Keys are stable semantic names (`page.section`), not layer names, which change.
- When an ID is not found, look the node up by name with a read-only call, then fix the ledger.

### Resuming after a break or context compaction

Read in this order and act only after step 4:

1. `.wpaikit/project.md`
2. `.wpaikit/status.md`: the current item and the next ones
3. `.wpaikit/figma-ledger.json`
4. Global and the current page's section of `design-direction.md`

Then confirm the current item's nodes with one read-only `use_figma` call.

## Working practice

- **One Figma call at a time.** Never run `use_figma` calls in parallel. Figma state changes must be strictly sequential. Read-only calls may follow each other without waiting for the designer, but never overlap a writing call.
- **One page per call.** A call switches to one page at most.
- **Screenshots.** They are the largest cost of a long session:
  - inspect the changed section, not the whole page; take a full-page screenshot only at checkpoints;
  - for routine checks, request a reduced size where the tool allows it, and full resolution only to inspect a detail;
  - do not screenshot unchanged frames again;
  - to keep an image as a record, save it to `.wpaikit/` (for example via the screenshot's download URL), instead of pasting it into the chat again;
  - do not return exported images from `use_figma`: the return value is limited to about 48 KB.

## Building

- **Tokens.** Bind fills, strokes, radii, spacing, and text to the approved Variables and Text Styles.
- **Names.** Keep semantic section and layer names compatible with knowledge/shared/rules/figma-blocks.md. Never overwrite existing frames; build next to them.
- **Components first.** Reuse existing components. Turn the chosen concept's header, buttons, cards and icons into components, then build pages from instances. Buttons get their full state set (default, hover, pressed, focus, disabled, loading) before the first section. Never draw a button as a plain frame on a page. When a drawn pattern appears a second time, make it a component and replace the first copy with an instance.
- **Cards.** In a row, image tops, titles and footers align. The card fills the row height, and the footer (price, action) is pinned to the bottom.
- **States.** Include the states that matter on the primary path: focus (a visible ring, 3:1 against its surroundings), hover or active, loading, error, success, empty, disabled. Build the states an item owns together with it, for example a form with its invalid, sending, sent and error states, on desktop and mobile. Document behavior a static frame cannot show.
- **Mobile.** Adapt after the desktop direction is stable. Recompose rather than stack mechanically, and keep every function and content priority. Check that every element the desktop block promises is still visible (for example all products in a hero composition), that no button is clipped, and that hover-only features have a tap equivalent with a visible affordance. Inspect mobile screenshots separately.
- **Clean-up.** Before moving frames between pages, list what the chosen elements depend on, such as component sources. Those stay on Final Design.
- **Bulk changes.** Do not replace or restyle nodes by layer name alone: names lie (a layer named `Icon/plus` may hold a clock). Match by structure (type and children) and size, choose a variant by meaning when several share a structure, and check a screenshot of each replaced type.

## Known Plugin API pitfalls

These caused most of the defects that lint and screenshots caught in practice. Apply them while building, not only when fixing.

| Symptom | Cause | Fix |
|---|---|---|
| A frame collapses or clips its content after a size change | `resize()` sets both sizing modes to FIXED | Call `resize()` first, then set `primaryAxisSizingMode = 'AUTO'` or `layoutSizingVertical = 'HUG'` |
| A child collapses in a vertical stack | `FILL` on the stacking axis of a hugging parent, or `layoutWrap = 'WRAP'` on a vertical frame | Children `HUG` on the stacking axis; `layoutWrap = 'NO_WRAP'` |
| Widths change when a node is replaced | A new node inserted next to a `FILL` sibling before the old one is removed shares the width with it | Read the sizes first; remove the old node, then insert and size the new one |
| `HUG` or `ABSOLUTE` is rejected | `HUG` works only on an auto-layout frame or a text inside one; `ABSOLUTE` only on a child of auto-layout | Append to an auto-layout parent first, then set the mode |
| A cloned text or vector renders black | The clone kept a bound paint without its resolved value | Create the node fresh, or reassign the fill with `setBoundVariableForPaint` |
| Opacity on a Variable-bound fill is ignored | `setBoundVariableForPaint` returns a new paint without the opacity | Assign the bound paint, then reassign `{...node.fills[0], opacity}`, or use layer opacity |
| A tint inside a component renders solid in instances | Paint opacity on a bound fill is lost in instances | Put the tint on a separate layer with layer opacity |
| `Cannot write to node with unloaded font` | A text node, one of its segments, or the target text style uses a font not loaded in this call | Load every font from `getStyledTextSegments(['fontName'])` and the style's font before text, `setTextStyleIdAsync`, `textAutoResize`, resize, or append |
| Text still truncates after a fix | `textTruncation` takes `'DISABLED'` or `'ENDING'` (not `'DISABLE'`); text cloned from a component may keep `maxLines` | Set `textTruncation = 'DISABLED'` and clear `maxLines` |
| `node does not exist` in the middle of a loop | An earlier step removed or replaced the node or its ancestor | Collect IDs first; before each step check `node.removed` or fetch with `getNodeByIdAsync` |
| An instance has no children | Its ancestor frame is hidden | Make the ancestors visible for the operation, then hide them again |
| Changes to an instance sublayer fail | Sublayers of an instance (`I…;…`) cannot be cloned or moved | Change component properties or the main component; detach only when the designer agrees |
| A hidden layer in a component cannot be turned on in instances | Visibility is not exposed | Add a BOOLEAN component property and bind it to `visible` |
| A group moves after `figma.group()` | The group takes the bounds of its children | Read the intended x and y before grouping and set them on the group afterwards |
| An export fails or is cut | Exported images are limited to 4096 px; clones can lose image fills on export | Use `scale = min(wanted, 4000 / height)`; export the original node, reached from another page with `getNodeByIdAsync` |
| A script fails with a code size error | Inline vector paths or data exceed the script limit | Split the data or upload the asset (knowledge/design/rules/imagery-and-icons.md, Large vector art) |
