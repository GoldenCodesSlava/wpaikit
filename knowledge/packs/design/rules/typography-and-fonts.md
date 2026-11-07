# Typography and Font Selection

Use in stage 3 of /generate-design. Font choice is its own decision with its own evidence, presented at gate B together with the palette. If the designer already approved fonts for this project, record them, run only the availability and glyph checks, and skip the selection procedure.

## Selection procedure

1. **Three brand-voice words, written as physical objects.**
   - Not "modern, elegant".
   - Something like "warm, mechanical, opinionated" or "calm, clinical, careful".
   - The type should feel like an object from the brand's world: a museum caption, a pharmacy label, a workshop manual, a concert poster.
2. **Name the three fonts you would pick by reflex.** Treat any that appear on the reflex list below as a hypothesis to beat, not a default.
3. **Search real catalogs** with the three words in mind. Use the sources below.
4. **Filter.** A candidate survives only if it passes all four checks:
   - glyph coverage for every design language;
   - Figma availability;
   - license for web and client use;
   - enough weights: at least regular plus a heading weight, ideally a variable font.
5. **Cross-check.** Elegant is not necessarily serif; technical is not necessarily sans or mono; warm is not necessarily a soft serif. If the final pick equals the reflex, explain why it still wins or keep looking.
6. **Shortlist 2–3 pairings.** For each, give roles, rationale tied to the three words, source, license, glyph and availability results, and available weights. Recommend one.

### Reflex list (training-data defaults)

Fraunces · Newsreader · Lora · Crimson · Playfair Display · Cormorant · Syne · IBM Plex Sans/Serif/Mono · Space Grotesk · Space Mono · Inter · DM Sans · DM Serif · Outfit · Plus Jakarta Sans · Instrument Sans/Serif.

- **Latin-only projects:** prefer to look further; use a listed font only with a reason recorded in the Design Direction.
- **Cyrillic projects:** the pool of fonts that cover Cyrillic and Romanian ș ț and are available in Figma is small, and several listed fonts are in it. The list is advisory there: a listed font is fine when the three words justify it.
- **Existing brand fonts always win** over this list.

## Sources

| Source | Use | Notes |
|---|---|---|
| **Google Fonts** | Primary source | OFL/Apache licenses: free commercial use and self-hosting. Most families are available in Figma. Family metadata including `subsets` (`latin-ext`, `cyrillic`, `cyrillic-ext`) is in `https://fonts.google.com/metadata/fonts`, an unofficial JSON. |
| **Fontshare** (`https://api.fontshare.com/v2/fonts`) | Latin-only projects | No family currently covers Cyrillic. The ITF Free Font License forbids modification, including subsetting and format conversion, and redistribution, including committing files to a repo or theme. The client should download and own the license. Its OFL families have no such limits. Usable in Figma only if uploaded to the designer's Figma organization. |
| **Fontesk** | Inspiration only | Licenses vary per font, and many are personal-use or demo. The designer must confirm the license from the font's own files before it is proposed as final. |
| **Fontjoy** (`https://fontjoy.com`) | Optional candidate generator | Pairs Google fonts only, with no script filter; quality is uneven. Candidates still go through every filter above. Never present a Fontjoy pair without the checks. |
| **Refero font pairings** | Pairing inspiration | `https://styles.refero.design/design-styles/website-font-pairings`, read per page; see knowledge/design/rules/research-references.md. |
| **Designer or brand fonts** | Always first | Verify availability in Figma; if missing, ask the designer to upload them to the organization or approve a substitute. |

## Mandatory checks

### Figma availability

The Figma MCP runs on Figma's side and cannot load fonts installed only on the designer's computer. Before proposing a font:

1. Inside a `use_figma` call (load figma-use first), run `figma.listAvailableFontsAsync()`.
2. Confirm that each candidate family and every style you need is listed.
3. Load each style with `figma.loadFontAsync` before writing text.

If a font is missing, do not proceed with it: propose the closest available alternative and say so.

### Glyph coverage

Subset tags are not proof. Some fonts tagged `latin-ext` carry only cedilla ş ţ (U+015F, U+0163), not the correct Romanian comma-below ș ț (U+0219, U+021B).

For each language in the design, check the actual glyphs in every weight you plan to use:

- **Romanian:** `ă â î ș ț Ă Â Î Ș Ț`
- **Russian:** `Ё Ж Щ Ы Э Ю Я ё ж щ ы э ю я` plus «» and the em dash.
- **Other languages:** their own special characters.

How to check:

- **Fastest:** set the test string in the Figma board and inspect the screenshot for fallback glyphs or missing characters.
- **More reliable** when a shell is available: request `https://fonts.googleapis.com/css2?family={Family}&text={test string}`, download the returned font file, and read its cmap with fontTools.

Report the result in the shortlist.

### License

Record source and license for every chosen family in the Design Direction. /setup-fonts and development rely on it, for example to avoid converting or subsetting ITF-licensed files.

## Pairing rules

- Contrast on one clear axis: serif + sans (structure), geometric + humanist (personality), condensed display + regular body (proportion). Two similar sans-serifs read as a mistake.
- One family with strong weight and size contrast is often stronger than a timid pair. A second family must earn its place.
- At most 3 families per project, including any accent or mono face.
- Typical shapes for brand work:
  - editorial, luxury, long-form: display serif + sans body;
  - tech: one committed sans with tight heading tracking;
  - consumer, food, travel: a warmer humanist sans plus a display face;
  - studios: rule-breaking is allowed when intentional.

## Scale and settings

- **Five roles** cover most pages: display, title, heading, body, caption. Add a lead or subtitle style only if the content needs it.
- **Ratio** of at least 1.25 between steps for brand work (1.25, 1.333, or 1.5). Product UI can use 1.125–1.2. Flat scales read as uncommitted.
- **Line-height:** display 1.05–1.1, headings 1.2–1.3, body 1.5–1.6, at least 1.4 for anything that wraps to 3+ lines. Light text on dark: add 0.05–0.1.
- **Tracking:**
  - −1% to −2% for headings 24px and larger;
  - about +5% for uppercase labels 14px and smaller;
  - 0 for body text.
  Do not apply SF Pro's tracking table to other fonts.
- **Weights:** 400 or heavier below 18px; weights 100–300 only at 28px and above. Emphasis is one weight step up in the same family, not a random second face.
- **Size floors:** body 16px, UI and controls 14px, captions 13px, rarely anything below 12px. Mobile form inputs 16px.
- **Hero headline:** at most 2 lines at desktop width. Roughly 48–60px for headlines over 6 words; 72px and above only for 3–5 words.
- **Language length.** Romanian and Russian text runs 15–30% longer than English. Size headings and buttons for the longest design language.
- **Details:**
  - tabular figures for prices, counters, and number columns;
  - real punctuation per language (see knowledge/design/rules/copy-and-tone.md);
  - natural-case text with uppercase applied as a style;
  - a font's Display cut at large sizes and its Text cut at small sizes, when the family has both.

Note implementation-only concerns for the handoff instead of solving them in Figma: font loading strategy, `text-wrap: balance`, rem units.

---
Parts of this file are adapted from Impeccable (Apache-2.0) and Better Typography.
