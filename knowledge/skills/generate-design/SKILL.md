---
name: generate-design
description: Use when a designer wants to generate a UI design in Figma from scratch or from existing materials (design system, references, brand assets). Collects project context through interactive questions, runs a design quality check on the brief, then generates frames in Figma using use_figma.
metadata:
  short-description: Generate a Figma UI design from design system, references, and project brief
---

# Generate Design

## Purpose

Interactively collect design materials and project context, run a quality check on the brief,
then generate a complete UI design directly in Figma — page by page or block by block.

Intended audience: Designers.

---

## Language

Respond in the language of the designer's messages.
If a `--lang` flag is provided (e.g. `--lang ro`), use that language for all output.
The skill content is written in English — this does not affect the language you use to respond.

---

## Prerequisites

Load the `figma-use` skill **before every `use_figma` call**.
Never call `use_figma` directly without it.

---

## Phase 1 — Collect Materials

Run sub-steps sequentially. Never skip to Phase 2 until all relevant steps are done.

### 1.1 Target Figma project

Ask:
```
Which Figma file/page should the design be generated into?
Figma URL →
```

Call `get_metadata` on the URL to confirm the file is accessible.
If the file cannot be read — show the error and re-ask.
Store as `TARGET_URL`.

---

### 1.2 References / Examples

Ask:
```
Is there a Figma URL with references or examples? (moodboard, similar project, screenshots)
  [URL] or [none]
```

**If URL provided:**
- Call `get_screenshot` and `get_design_context` on the reference URL
- Extract: layout density, visual style, color mood, typography feel, spacing rhythm
- Store extracted context as `REFERENCE_CONTEXT`
- Confirm: `References loaded ✓`

**If [none]:**
Ask:
```
Is the project completely empty — no materials at all?
  [yes, empty] or [no, I have something]
```
Set `EMPTY_PROJECT = true` or `false`.

---

### 1.3 Design System

_(Skip this step if `EMPTY_PROJECT = true`)_

Ask:
```
Is there a Figma URL with a Design System (variables, tokens, components)?
  [URL] or [none]
```

**If URL provided:**
- Call `get_variable_defs` and `get_design_context` on the DS URL
- Extract: color tokens, typography scale, spacing scale, radius, shadows
- Store as `DS_TOKENS`
- Confirm: `Design System loaded ✓ — N color tokens, N type styles`

**If [none]:**
Show:
```
Design System not found. What should we do?
  [1] Run /figma-design-system first (recommended)
  [2] Continue — I'll extract colors from the logo/brand
  [3] Continue with a neutral palette
```

- `[1]` → Stop. Show: `Run /figma-design-system, then come back to /generate-design.`
- `[2]` or `[3]` → Set `DS_TOKENS = null`, continue to 1.4

---

### 1.4 Brand Assets

_(Ask only if `DS_TOKENS = null` — no design system was loaded)_

Ask:
```
Is there a logo or image with a color palette in Figma?
  [URL] or [none]
```

**If URL provided:**
- Call `get_screenshot` and `get_design_context`
- Extract dominant colors (primary, secondary, background, text)
- Store as `BRAND_COLORS`
- Confirm: `Brand colors extracted ✓ — Primary: #XXX, Secondary: #XXX, ...`

**If [none]:**
Show:
```
I'll use a neutral palette:
  Text:        #1A1A1A
  Primary:     #2563EB
  Background:  #FFFFFF
  Surface:     #F5F5F5
You can change this after generation.
```
Set `BRAND_COLORS = neutral`.

---

### 1.5 Icon Library

Show:
```
Do you have an icon library in Figma?

  [1] Yes — I'll add icons to a page in the target file (recommended)
  [3] Skip — Figma will generate shapes automatically

Tip: using a real icon library keeps all icons consistent across the design.
Popular free sources on Figma Community: Heroicons, Lucide, Feather, Tabler.
```

**If [1]:**
Ask:
```
Add your icons to a page in the target Figma file, then share the URL of that page.
Icons URL →
```
- Call `get_design_context` on the provided URL
- Extract all component names (e.g. `icon/arrow-right`, `icon/check`, `icon/star`)
- Store as `ICON_COMPONENTS`
- Confirm: `Icon library loaded ✓ — N icons found`
- In Phase 4, pass component names to `use_figma`: "use icon components: [list]"

**If [3]:**
Set `ICON_COMPONENTS = null`.
Figma will generate vector shapes automatically during generation.

---

### 1.6 Photo Source (Pexels)

Ask:
```
Do you have a Pexels API key for real photos matched to the project style?
  [key]    — paste your API key (free at pexels.com/api)
  [skip]   — Figma will use placeholder rectangles for images
```

**If key provided:**
- Store as `PEXELS_API_KEY`
- Confirm: `Pexels connected ✓ — photos will be fetched and matched to project style`

**If [skip]:**
- Set `PEXELS_API_KEY = null`
- Images will be placeholder rectangles labeled by content type

---

## Phase 2 — Project Brief

Ask the following as a **single structured block** — all at once, not one question at a time:

```
Tell me about the project — answer everything in one message:

1.  Business           — what does the company do? (1-2 sentences)
2.  Industry           — restaurant / fintech / saas / healthcare / real estate /
                         e-commerce / portfolio / agency / other
3.  Audience           — who is the end customer?
4.  Register           — brand (design = the product: landing, portfolio) /
                         product (design serves the product: SaaS, dashboard, app)
5.  Style              — minimal / bold / luxury / playful / corporate / editorial
6.  Color strategy     — restrained (neutral + 1 accent ≤10%) /
                         committed (1 saturated color covers 30–60%) /
                         full (3-4 color roles, each intentional) /
                         drenched (the surface IS the color, hero / campaigns)
7.  Scene              — one sentence: who uses this, where, in what lighting,
                         in what mood?
                         Example: "A doctor reviews records on a tablet in a waiting room at noon"
                         (theme, density, and tone are derived from this — don't ask separately)
8.  Quality            — wireframe (structure, no detail) / hi-fi (full design)
9.  Generation         — page-by-page / block-by-block
10. Mobile             — mobile version needed? (yes / no, default: no)
11. Pages              — which to create? (e.g. Home, About, Services, Contact)
12. Sections           — key blocks for each page, or [standard]
13. Language           — en / ro / ru / other
14. Inspiration        — sites/brands you like? (URL or name, optional)
15. Anti-references    — sites/brands you DON'T like or don't want to resemble?
                         (URL or name, optional — but very helpful)
16. Container width    — 1200 / 1280 / 1440 / 1536 px
17. Full-width blocks  — should some sections break out of the container to fill the full
                         screen width for visual contrast? (yes / no)
```

### Derive full context from scene

After receiving the brief, derive `THEME`, `DENSITY`, and `TONE` from the scene — never ask directly.
Run the sentence through all three derivations independently.

**Theme:**

| Scene signals | THEME |
|---|---|
| Daylight · outdoor · public space · quick glance · retail | Light |
| Night shift · dim room · monitoring · focused work · extended sessions | Dark |
| Mixed or no clear signal | Light (default) |

**Visual density** — how much information and spacing per screen:

| Scene signals | DENSITY |
|---|---|
| Quick glance · mobile-first · customer-facing · leisure | Spacious — generous padding, large type, few elements per section |
| Professional · office · desktop-primary · task-focused | Balanced — moderate spacing, clear hierarchy |
| Expert user · monitoring · data-heavy · dashboard-like | Compact — dense layout, smaller type, more elements visible |

**Tone** — emotional character guiding decoration level and warmth:

| Scene signals | TONE |
|---|---|
| Luxury · leisure · premium product · home browsing | Premium — rich materials, large imagery, high craft on details |
| Healthcare · legal · financial · institutional | Clean — no decoration, trust through clarity and whitespace |
| SaaS · productivity · developer tool · B2B | Utilitarian — function-first, decoration only when it aids comprehension |
| Creative · portfolio · agency · culture | Expressive — personality through type and unexpected layout choices |
| Restaurant · hospitality · lifestyle · retail | Warm — inviting, textured, photography-led |
| Neutral / no strong signal | Balanced |

Store as:
```
THEME   = light | dark
DENSITY = spacious | balanced | compact
TONE    = premium | clean | utilitarian | expressive | warm | balanced
```

Show derivation briefly to the designer before the quality check:
```
Derived from scene:
  Theme:    Light
  Density:  Spacious (customer at home, leisurely)
  Tone:     Premium (luxury product)
Correct? [yes / no — I'll adjust]
```
If [no] — ask what to correct, update the values.

### Anti-references

Store the anti-references as `ANTI_REFS`. They are used in two ways:
1. In Phase 3 quality check — check that the direction doesn't resemble them
2. In Phase 4 generation — passed as negative constraints to `use_figma`

If anti-references were provided, show them explicitly in the Design Brief summary.

### Default sections by industry

If designer answers `[standard]` for sections, use this table:

| Industry | Sections |
|----------|----------|
| Restaurant | Hero · Menu Preview · About / Story · Gallery · Booking CTA · Location · Footer |
| Fintech / SaaS | Hero · Features (3-col) · Social Proof · Pricing · FAQ · CTA · Footer |
| Healthcare | Hero · Services · Why Us · Team · Testimonials · CTA · Contacts · Footer |
| Real Estate | Hero · Search / Filter · Featured Listings · How It Works · Testimonials · CTA · Footer |
| E-commerce | Hero · Categories · Featured Products · Benefits · Newsletter CTA · Footer |
| Portfolio | Hero · Work / Cases · About · Skills · Testimonials · Contact · Footer |
| Agency | Hero · Services · Case Studies · Team · Clients · CTA · Footer |
| Other | Hero · About · Services / Features · CTA · Footer |

Store `CONTAINER_WIDTH` (number).

**If answer to question 17 is yes:**
Ask as a follow-up (separate message, not part of the brief block):
```
Which sections should be full-width?
  [list them] or [agent decides]
```
- If designer lists sections → store as `FULL_WIDTH_BLOCKS`
- If [agent decides] → AI selects 1–3 sections that benefit most from full-width treatment
  (typically: Hero, full-bleed gallery, dark CTA banner); store the chosen list as `FULL_WIDTH_BLOCKS`

**If answer to question 17 is no:**
Set `FULL_WIDTH_BLOCKS = []`.

Store all answers as `BRIEF`.

---

## Phase 3 — Design Quality Check

**Before showing the Design Brief summary, run the quality check on the collected brief.**

Read `knowledge/skills/design-quality-check/SKILL.md` and execute it in **Brief mode**
using `BRIEF` as the input. Do not ask the designer for a Figma URL — the input is the text brief.

Show the quality check results with all flags and proposed alternatives.
Wait for the designer to resolve each issue (`[accept]`, `[suggest different]`, or `[keep original]`).

After all issues are resolved, update `BRIEF` with accepted changes.

Then show the Design Brief Summary:

```
╔══════════════════════════════════════════════════════╗
║  DESIGN BRIEF
╠══════════════════════════════════════════════════════╣
║  Target:       [Figma file name]
║  Register:     [brand / product]
║  Style:        [style] · [color strategy] · [quality level]
║
║  Scene:        "[scene sentence]"
║  Theme:        [Light / Dark]
║  Density:      [Spacious / Balanced / Compact]
║  Tone:         [Premium / Clean / Utilitarian / Expressive / Warm / Balanced]
║
║  Mode:         [page-by-page / block-by-block]
║  Mobile:       [yes / no]
║  Container:    [1200 / 1280 / 1440 / 1536]px
║  Full-width:   [none / Hero · Gallery · ...]
║
║  Colors:       [from DS: N tokens / from logo: #XXX #XXX / neutral]
║  Typography:   [from DS: FontName / system default: Inter]
║  Language:     [en / ro / ru]
║
║  Inspiration:  [urls or none]
║  Anti-refs:    [urls/names or none]
║
║  Photos:       [Pexels ✓ / placeholders]
║  References:   [✓ loaded / none]
║  QC applied:   [N fixes · M overrides]
║
║  Pages (N):
║    1. [PageName]  →  [Section · Section · Section]
║    2. [PageName]  →  [Section · Section · Section]
║    ...
╚══════════════════════════════════════════════════════╝

Continue?
  [yes]    — start generation
  [adjust] — change parameters
  [cancel] — cancel
```

**If [adjust]:**
Ask: `What would you like to change?`
Re-apply only the changed parameter, then re-show the summary.
Maximum 3 adjustment rounds before proceeding.

**If [cancel]:** Stop cleanly.

---

## Phase 4 — Generate in Figma

Load the `figma-use` skill before any `use_figma` call.

### General rules

- Desktop frame: **1440px** wide, height = auto (content)
- Mobile frame: **375px** wide — **only if `MOBILE = yes`**
- Frame naming: `[PageName] / Desktop` and `[PageName] / Mobile`
- All text content: **Lorem ipsum** at realistic lengths
- Colors: prefer `DS_TOKENS` → fallback `BRAND_COLORS` → fallback neutral
- Typography: prefer DS font styles → fallback Inter (body) + appropriate heading font
- All frames go into `TARGET_URL`
- Apply `THEME`, `DENSITY`, and `TONE` consistently across all frames
- If `ANTI_REFS` is set — pass them explicitly to `use_figma` as "avoid the visual language of [X]"
- If `ICON_COMPONENTS` is set — pass component names to `use_figma`: "use these icon components: [list]. Do not create custom vector shapes for icons."
- If `ICON_COMPONENTS = null` — Figma generates vector shapes automatically

### Pexels image fetching

If `PEXELS_API_KEY` is set — fetch real photos before generating any section that contains an image.

**Query construction:**

Build the search query by combining signals from the brief:

| Signal | Source | Examples |
|--------|--------|---------|
| Subject | section type | `restaurant interior`, `team portrait`, `product`, `office`, `food` |
| Mood | `TONE` | `luxury`, `moody`, `warm`, `clean`, `minimal`, `editorial` |
| Lighting | `THEME` | `dark` (dark theme) · `bright` (light theme) |
| Style | `BRIEF.style` | `cinematic`, `lifestyle`, `architectural` |

Examples:
```
Hero — restaurant, premium, dark  → "restaurant interior luxury dark moody cinematic"
Gallery — food                    → "food plating editorial close-up warm"
Team — healthcare, clean          → "doctor portrait professional bright minimal"
Hero — fintech, minimal, light    → "office architecture minimal clean bright"
CTA — real estate                 → "modern house exterior bright architecture"
```

**Fetch flow (per image):**

```
GET https://api.pexels.com/v1/search
  ?query=[constructed query]
  &per_page=3
  &orientation=landscape
  &size=large
Authorization: PEXELS_API_KEY
```

- Pick `photos[0].src.large2x` URL (highest quality)
- Call `upload_assets` with the URL to upload the image into the Figma file
- Store the returned Figma asset reference
- Pass it to `use_figma` as the image for that section

**If fetch fails** (network error, quota exceeded, 0 results):
- Try a simplified query (subject only, no modifiers)
- If still fails → fall back to placeholder rectangle, note in generation log

**If `PEXELS_API_KEY = null`:**
- Use labeled placeholder rectangles: `[Hero Image]`, `[Team Photo]`, `[Gallery 1]`

### Block layout structure

Every section block must follow this two-layer structure:

```
[SectionName]            ← top-level block frame
  Container              ← inner container frame
    [content elements]
```

**Top-level block frame rules:**
- Width: Fill (100% of the page frame width)
- Layout: Vertical Auto Layout, horizontally centered (`counterAxisAlignItems: CENTER`)
- Padding: 20px left, 20px right; top/bottom depends on density (see Density rules)
- No fixed width — stretches full page width

**Container frame rules:**
- Width: Fixed — exactly `CONTAINER_WIDTH` px (1200 / 1280 / 1440 / 1536)
- Height: Hug contents
- All section content goes inside Container, not directly in the block frame

**Full-width blocks** (`FULL_WIDTH_BLOCKS` list):
- Sections listed as full-width still use the two-layer structure
- BUT `Container` width = Fill (100%) instead of fixed
- Alternatively: content is placed directly in the block frame when the visual effect requires edge-to-edge imagery or color
- Use full-width sparingly — 1–3 sections max — to create visual contrast against contained sections

### Density rules

Apply `DENSITY` to spacing, type size, and information load per section:

| DENSITY | Padding between sections | Inner padding | Type scale | Elements per section |
|---|---|---|---|---|
| **Spacious** | 120–160px | 80–120px | Large (H1 ≥ 64px) | Few — 1 key message per section |
| **Balanced** | 80–120px | 48–80px | Standard (H1 ≥ 48px) | Moderate — clear hierarchy |
| **Compact** | 48–80px | 24–48px | Smaller (H1 ≥ 36px) | More — multiple elements visible |

### Tone rules

Apply `TONE` to decoration level, imagery treatment, and component style:

| TONE | Decoration | Imagery | Components | Typography feel |
|---|---|---|---|---|
| **Premium** | High craft — layered, textured, refined details | Full-bleed, cinematic, high quality | Generous sizing, subtle shadows, smooth radius | Large, airy, editorial |
| **Clean** | None beyond structure | Functional or absent | Sharp edges, minimal shadow, high contrast | Efficient, readable, no personality |
| **Utilitarian** | Only when it aids comprehension | Data, icons, diagrams | Dense, predictable, consistent | Neutral, monospace accents ok |
| **Expressive** | Personality through type and layout asymmetry | Art-directed, unexpected crops | Unconventional — break the grid intentionally | Strong typographic hierarchy, varied weights |
| **Warm** | Texture, organic shapes, photography-led | Lifestyle, human, inviting | Soft radius, warm shadows | Approachable, mid-weight |
| **Balanced** | Moderate — tasteful | Standard | Standard | Standard |

### Register-specific rules

**Brand register (`REGISTER = brand`):**
- Design has full visual expression — typography is bold, colors are committed
- Sections have distinct visual characters — not uniform
- Spacing varies for rhythm — not the same padding everywhere
- Hero is the centerpiece — highest craft level

**Product register (`REGISTER = product`):**
- Clarity over decoration — content hierarchy is the design
- Consistent spacing system — predictable, not monotonous
- Components serve the data — no decoration that competes with content
- Whitespace is intentional — not filler

### Absolute bans — enforced at generation time

Before generating any section, check it against these bans.
If a section would naturally produce one of these → propose an alternative before calling `use_figma`:

| Banned pattern | Alternative |
|---|---|
| `border-left/right` as colored card accent | Full border, background tint, or leading number |
| Gradient text fill | Solid brand color, emphasis via weight or size |
| Glassmorphism as default card style | Solid surface with subtle shadow |
| Big number + small label + gradient accent (hero metric) | Editorial stat layout, or remove metrics entirely |
| 3+ identical cards: icon + heading + text | Mix: 1 spotlight + list, or asymmetric grid |
| Modal as first design choice | Inline expansion, drawer, or dedicated page |

---

### Wireframe mode rules

When `quality = wireframe`:
- Grayscale only: #1A1A1A · #666666 · #CCCCCC · #F5F5F5 · #FFFFFF
- Image placeholders: filled rectangles labeled "Image" / "Photo"
- No icons — use simple geometric shapes or labeled boxes
- Buttons: rounded rectangles with label text only
- No shadows, no gradients

### Hi-fi mode rules

When `quality = hi-fi`:
- Full color palette from `DS_TOKENS` or `BRAND_COLORS`, honoring `COLOR_STRATEGY`
- Real typographic hierarchy: H1 → H2 → H3 → Body → Caption — minimum 1.25× ratio between steps
- Body text line length: target 65–75 characters
- Every neutral tinted toward the brand hue (not pure #000/#FFF)
- Styled components: buttons with fill/border, cards with shadow and radius
- Background variations between sections — not all the same surface color
- Spacing variation across sections — not uniform padding everywhere

---

### 4A — Page-by-page mode

For each page in the ordered list:

1. Announce:
   ```
   Generating page: [PageName]
   Sections: [Section · Section · Section]
   ```
2. Call `use_figma` to create one full-page frame with all sections
3. After generation, ask:
   ```
   [PageName] ready.
     [continue]   — next page ([NextPageName])
     [adjust]     — describe what to change
     [stop]       — finish here
   ```
4. If `[adjust]`: apply change, re-show prompt (max 2 rounds per page)
5. If last page and `[continue]`: go to Phase 5

---

### 4B — Block-by-block mode

For each page:

1. Announce:
   ```
   Page: [PageName] — generating block by block.
   Order: [Section 1 · Section 2 · ... · Section N]
   ```

2. For each section block:

   a. Announce: `Block: [SectionName]`
   b. Call `use_figma` to add the section to the page frame
   c. Ask:
      ```
      "[SectionName]" ready.
        [continue]   — next block ([NextSectionName])
        [adjust]     — describe what to change
        [new page]   — move to next page
        [stop]       — finish here
      ```
   d. If `[adjust]`: apply change, re-show (max 2 rounds per block)
   e. If `[new page]`: skip remaining blocks, move to next page
   f. If `[stop]`: go to Phase 5

3. After last block of a page → announce next page or go to Phase 5

---

### Mobile generation

If `MOBILE = yes`, after completing all desktop frames:

1. Announce: `Generating mobile versions (375px)...`
2. For each page, generate mobile frame
3. Single column, stacked sections, larger touch targets

---

## Phase 5 — Completion

```
Generation complete ✓

Created:
  ✓ [PageName] / Desktop     N sections
  ✓ [PageName] / Desktop     N sections
  [✓ [PageName] / Mobile  — if applicable]

Next steps:
  → /design-quality-check <url>  — audit the final design (design mode)
  → /figma-design-system         — lock tokens from this design
  → /prep-figma <url>            — prepare frames for handoff to development
  → /figma-to-block <url>        — generate code for a specific block
```

---

## Boundaries

- Never generate Mobile frames unless `MOBILE = yes`
- Never skip Phase 3 (Quality Check + Design Brief summary)
- Always use Lorem ipsum for all text content
- Never load DS tokens without a designer-provided URL
- Never modify the Design System file — `TARGET_URL` is the only writable target
- Load `figma-use` skill before every `use_figma` call without exception
- Maximum 2 adjustment rounds per page/block
- If Figma MCP tool call fails: show the error, ask if they want to retry or skip
