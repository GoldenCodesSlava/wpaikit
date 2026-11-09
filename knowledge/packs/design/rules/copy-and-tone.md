# Copy and Tone of Voice

Use in stages 2 and 4 of /generate-design. Copy is design material: hierarchy, line breaks, and CTA placement can only be judged with real text. Lorem ipsum and generic AI copy are not acceptable in hi-fi work.

## 1. Define the tone of voice (stage 2)

Write a short tone profile into `.wpaikit/design-brief.md`. The method follows the four dimensions of Nielsen Norman Group:

- **Four axes, each 1–5:**
  - formal ↔ casual
  - serious ↔ funny
  - respectful ↔ irreverent
  - matter-of-fact ↔ enthusiastic
  Place the brand from the brief and the competitor matrix. Note where competitors sit, and whether the brand should match them or deliberately differ.
- **Form of address.** Fix it explicitly for every language: Russian вы/ты, Romanian dumneavoastră/tu, English you. In Russian and Romanian this is the strongest tone lever. Use one form per language across the whole site.
- **Words.** Three or four tone words, plus three anti-tone words: what the brand must never sound like.
- **Glossary.** One preferred term per concept (for example, «запись» and never «бронь», or «programare» and never «rezervare»). Also list banned terms. Never vary terms for variety.
- **Context rules.** Voice stays constant; tone shifts by moment:
  - hero: confident and specific;
  - pricing: plain and transparent;
  - errors: calm and helpful, never humorous;
  - legal: neutral.

Tone refines a clear offer; it does not replace one. If the value proposition is vague, fix the message first.

## 2. Principles shared by major style guides

These are shared by Apple HIG Writing, the Microsoft Writing Style Guide, the Mailchimp Content Style Guide, Material, and GOV.UK.

1. **Clarity beats cleverness.** "Send" beats "Let's do it!". When unsure about a joke, drop it.
2. **Front-load.** Put the key information first in headings and paragraphs. Give each section one job.
3. **Use fewer words.** Cut "simply", "you can", "we offer", "there is". No intro sentence that restates the heading.
4. **Address the reader directly.** Use active voice and start actions with a verb.
5. **Specific over generic.** Use numbers, names, places, and timeframes the client can prove. Do not use superlatives without evidence.
6. **Sentence case** for headings, buttons, and navigation, unless the brand system says otherwise. Use one capitalization rule per element type. No period at the end of a heading or button.
7. **Plain, inclusive language.** No jargon without explanation, no idioms that do not translate, no gendered defaults.
8. **No hype.** Prefer plainspoken. A claim needs a source or a "draft, confirm" mark.

## 3. Writing the copy (stage 4)

**Sources, in priority order:**

1. Copy supplied by the designer or client.
2. Facts from the brief and the client's existing materials.
3. Draft copy written by you from the positioning and competitor matrix.

Never invent testimonials, customer names, certificates, awards, client logos, statistics, or performance claims as facts. Where proof is needed and missing, write the slot with an explicit placeholder that says what is needed, for example `[3 client reviews needed]`. Do not fake the proof.

### Length limits (defaults, override with a reason)

| Element | Limit |
|---|---|
| Hero headline | ≤8 words, ≤2 lines at desktop |
| Hero subtext | ≤20 words |
| Section headline | ≤8 words |
| Section sub or lead | ≤25 words |
| Button or CTA | ≤3 words, verb + object |
| Testimonial | ≤3 lines, attributed with name + role (real only) |
| Body paragraph | ≤4 sentences on marketing pages |

### Actions and microcopy

- **CTA labels name the outcome:**
  - «Записаться на приём», «Programează o consultație», "Get a quote";
  - never «Отправить», «Нажмите здесь», "Submit", or a bare «Подробнее» / «Detalii».
- **One label per intent.** "Contact us" in one section and "Let's talk" in another is a defect.
- **Links make sense out of context:** «Смотреть все цены», not «здесь».
- **Errors** say what happened and how to fix it, without blaming the user. Example: «Укажите телефон в формате +373 xx xxx xxx». No "Oops".
- **Empty states** acknowledge the state, explain the value, and offer the next step.
- **Loading labels** say what is happening: «Отправляем заявку…».
- **Form labels** are visible; placeholders show format only. Explain why non-obvious data is requested.
- **Destructive actions** name the action: «Удалить адрес», not «Да».

## 4. Punctuation and typography per language

| Language | Quotes | Dash | Other |
|---|---|---|---|
| Russian | «ёлочки», „лапки“ inside | em dash with spaces ( — ) is correct punctuation | Non-breaking space after short words (в, и, с, к, о, у, на, не, за) and before the em dash; numbers 1 200; ё where the brand uses it |
| Romanian | „ghilimele” | en or em dash per sentence role | ș ț with comma below; numbers 1.200,50 |
| English | “curly” | Avoid the em dash as a stylistic habit; use commas, colons, or periods | Non-breaking space between a number and its unit |

In every language: use the ellipsis character …, en dash for ranges (10–20), and a non-breaking space in "10 km" or "250 lei". Currency follows the agreed format.

Keep number ranges and number–unit pairs on one line:

- In Figma, put a word joiner (U+2060) on both sides of the dash in a range, and a non-breaking space before the unit: "36⁠–⁠40 часов".
- In the handoff, note the same rule for the implementation (`&nbsp;`, `white-space: nowrap`).

A line break inside "36–/40" is a visible defect.

## 5. Banned filler ("AI voice")

Remove these unless the client explicitly uses them as brand language.

- **English:** elevate, seamless, unleash, unlock, empower, next-gen, revolutionize, cutting-edge, world-class, game-changer, delve, "in today's fast-paced world", "Welcome to…", "Your trusted partner".
- **Russian:**
  - уникальный, инновационный, высококачественный, индивидуальный подход;
  - команда профессионалов, широкий ассортимент, лучшие цены, «Добро пожаловать на сайт»;
  - откройте для себя, погрузитесь в мир, раскройте потенциал, в современном мире;
  - мы предлагаем, качество и надёжность.
- **Romanian:** unic, inovator, soluții personalizate, echipă de profesioniști, calitate superioară, prețuri competitive, experiență de neuitat, descoperă lumea, „Bine ați venit”, lider pe piață.

Also avoid:

- triplets of abstract nouns («качество, надёжность, комфорт»);
- headlines that could fit any competitor;
- rhetorical questions as section headings;
- a different eyebrow label above every heading.

Self-check: replace the brand name with a competitor's. If the sentence still works unchanged, it says nothing specific.

## 6. Originality check

Compare generated copy with the captured competitor texts (knowledge/design/rules/research-references.md). Rewrite any sentence that shares a distinctive run of 6 or more words with a competitor, or that copies a competitor's slogan or recognizable structure.

## 7. Copy status

Keep a copy deck in `.wpaikit/copy-deck.md`: page → section → text, each marked `approved` (supplied or confirmed by the designer) or `draft`. Add a Figma annotation "Copy: draft" or "Copy: approved" on each section frame. Layer names stay semantic and carry no status (knowledge/shared/rules/figma-blocks.md).

---
Sources: NN/g "Tone of Voice Dimensions", Apple HIG Writing, Microsoft Writing Style Guide, Mailchimp Content Style Guide, GOV.UK style guide. Parts adapted from Impeccable (Apache-2.0).
