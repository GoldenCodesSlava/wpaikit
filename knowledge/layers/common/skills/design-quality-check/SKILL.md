---
name: design-quality-check
description: Use when auditing a design brief or existing Figma design for predictable AI patterns, category reflexes, absolute bans, and color/typography quality issues. Has two modes — brief mode (checks intent before generation) and design mode (reads Figma frames and audits visual output).
metadata:
  short-description: Audit a design brief or Figma frames for AI slop patterns and design quality issues
---

# Design Quality Check

## Purpose

Catch predictable AI design patterns — category reflexes, banned visual patterns, and
weak design decisions — before they reach Figma or after a design already exists.

Two modes auto-detected by input:
- **Brief mode** — no Figma URL → checks a text brief/plan (pre-generation)
- **Design mode** — Figma URL provided → reads actual frames and audits visual output

---

## Mode Detection

```
/design-quality-check                     → Brief mode  (interactive, reads current brief)
/design-quality-check <figma-url>         → Design mode (reads Figma frames)
```

In Brief mode: checks design intent and strategy before anything is generated.
In Design mode: checks what was actually created in Figma.

---

## Checks (both modes)

### Check 1 — Category Reflex (first-order)

Detect if the industry + color strategy = an immediately predictable outcome.

Known first-order reflexes to flag:

| Industry | Reflex pattern |
|----------|---------------|
| Healthcare | White background + teal/mint accent |
| Fintech / Finance | Navy + gold |
| Restaurant / Food | Dark background + warm amber/gold |
| Real estate | White + dark blue |
| SaaS / Tech | Blue-to-purple gradient hero |
| Crypto / Web3 | Neon colors on black |
| Luxury / Fashion | Black + gold |
| Eco / Sustainability | White + green |
| Education | Blue + yellow |
| Legal | Navy + serif typography |

**Brief mode:** compare industry + stated colors/style against the table.
**Design mode:** extract dominant colors from `get_screenshot`, compare against table.

If match found → flag as `⚠ Category reflex (first-order)` and propose an alternative.

---

### Check 2 — Category Reflex (second-order)

After avoiding the first-order reflex, designs often fall into a predictable "anti-reflex":

| Avoided | Common fallback (also reflex) |
|---------|-------------------------------|
| Not navy fintech | Terminal-native dark mode |
| Not white healthcare | Editorial typographic with serif |
| Not SaaS blue gradient | Warm cream / beige SaaS |
| Not black luxury | Minimalist all-white luxury |
| Not neon crypto | Brutalist high-contrast crypto |

Flag if the proposed or actual direction matches a known anti-reflex.

---

### Check 3 — Absolute Bans

Detect and reject these patterns unconditionally:

| Pattern | What to look for |
|---------|-----------------|
| **Side-stripe borders** | `border-left` or `border-right` as a colored accent on cards, alerts, list items |
| **Gradient text** | Text using gradient fill (background-clip: text equivalent in Figma) |
| **Decorative glassmorphism** | Blur + transparency used as default card style without clear reason |
| **Hero metric template** | Big number + small label + supporting stats + gradient accent (SaaS cliché) |
| **Identical card grid** | 3+ same-sized cards with icon + heading + text, repeated without variation |
| **Modal as default** | Primary interaction hidden in a modal when inline alternatives exist |

**Brief mode:** detect from section descriptions and stated patterns.
**Design mode:** detect visually from `get_design_context` layer structure and `get_screenshot`.

Each detected ban → flag as `✗` with a concrete alternative.

---

### Check 4 — Color Strategy Validation

Four valid strategies — check that the chosen strategy is being honored:

| Strategy | Rule |
|----------|------|
| **Restrained** | Tinted neutrals + one accent at ≤10% of the surface |
| **Committed** | One saturated color carries 30–60% of the page |
| **Full palette** | 3–4 named color roles, each used with purpose |
| **Drenched** | The surface IS the color — appropriate for hero pages, campaigns |

**Brief mode:** verify the stated strategy is consistent with stated colors/style.
**Design mode:** measure color distribution from `get_screenshot`, check against stated strategy.

Flag if the execution contradicts the stated strategy.
Also flag if pure `#000000` or `#FFFFFF` is used — every neutral should be tinted toward the brand hue.

---

### Check 5 — Register Consistency

| Register | Expected treatment |
|----------|--------------------|
| **Brand** | Design IS the product. Full visual expression, typographic boldness, high craft. |
| **Product** | Design SERVES the product. Clarity, efficiency, hierarchy over decoration. |

Flag if:
- Brand register + overly utilitarian, undifferentiated style
- Product register + heavy decoration that competes with content

---

### Check 6 — Theme Logic

A theme (light/dark) should follow from the use-scene, not be chosen by reflex.

**Brief mode:** verify the theme follows logically from the scene description provided.
If the designer didn't provide a scene → ask: *"Describe in one sentence who uses this, where, and under what light."*

**Design mode:** check if the chosen theme makes sense for the stated audience and context.

Flag if: dark chosen "because it looks cool" or light chosen "to be safe."

---

### Check 7 — Anti-reference Proximity

If `ANTI_REFS` is set (designer provided brands/sites to avoid):

**Brief mode:** Compare the stated direction (style, color strategy, layout approach) against the anti-references.
Flag if the brief would naturally produce something visually similar to what should be avoided.

**Design mode:** Compare `get_screenshot` visual output against anti-reference screenshots (if URLs available).
Flag if the overall aesthetic reads as similar.

Output format for this check:
```
⚠ Anti-reference proximity
  Brief direction resembles "[anti-ref name]":
  → Both use [shared characteristic]
  → Proposed adjustment: [specific change to differentiate]
  [accept] [suggest different] [keep original]
```

This check is always `⚠` (warning), never `✗` (critical) — the designer may intentionally
be close to a reference for strategic reasons.

---

### Check 9 — Typography Hierarchy (Design mode only)

- Body text line length: 65–75 characters per line
- At least 1.25× ratio between heading levels
- Minimum 2 distinct weight levels used

---

### Check 10 — Layout Rhythm (Design mode only)

- Spacing must vary across sections (not uniform padding everywhere)
- Sections should not all use the same visual density
- Cards used only when truly the best affordance — nested cards are always wrong

---

## Output Format

Same format for both modes. Mode is labeled at the top.

```
Design Quality Check — [Brief Mode / Design Mode]
──────────────────────────────────────────────────

✓ Color strategy: Committed — single dominant color, correct
✓ Register: Brand — full visual expression appropriate

⚠ Category reflex (first-order)
  Healthcare + white + teal = immediately predictable
  → Proposed: warm off-white (#FAFAF7) + deep slate (#1E293B) as primary surface
  Reason: breaks the association without losing professionalism
  [accept] [suggest different] [keep original]

✗ Identical card grid detected
  "3 cards: icon + heading + text" in Features section
  → Proposed: 1 large feature spotlight (left-right split) + 2 secondary in a list
  [accept] [suggest different] [keep original]

✗ Gradient text detected
  CTA heading described with gradient fill
  → Proposed: solid brand color at full weight, size contrast for emphasis
  [accept] [suggest different] [keep original]

──────────────────────────────────────────────────
Summary: 2 critical  ✗ · 1 warning  ⚠ · 2 passed  ✓

Fix all critical issues before proceeding.
Warnings can be accepted or overridden by the designer.
```

---

## Fix Flow

For each flagged issue, wait for the designer's choice before moving to the next:

- **[accept]** → apply the proposed alternative, note the change
- **[suggest different]** → designer describes their preferred alternative → confirm and note
- **[keep original]** → note as designer override, mark with `⚑ designer override`

After all issues are resolved → show final summary:

```
Quality Check Complete
──────────────────────────────────────────────────
Fixed:            2 issues resolved
Designer overrides: 1 (gradient text — kept intentionally)
Passed:           2 checks clean
──────────────────────────────────────────────────
```

In **Brief mode** (called from `/generate-design`):
→ Return control to generate-design, which shows the Design Brief Summary next.

In **Design mode** (standalone):
→ Ask: `Fix the issues in Figma? [yes] [no — report only]`
If [yes] → load figma-use skill and apply fixes.

---

## Boundaries

- Never block generation over a designer override — document it and proceed
- Warn about second-order reflexes but do not treat them as critical (⚠ not ✗)
- Never invent color tokens — only reference values from DS_TOKENS or BRAND_COLORS
- In Design mode: load figma-use skill before any use_figma call
- Maximum 1 round of fixes per issue — do not loop indefinitely
