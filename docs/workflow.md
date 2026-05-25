# wpaikit — Ghid Complet

Ghid pas cu pas pentru construirea unui site WordPress de la zero,
folosind boilerplate-ul wpaikit și comenzile AI integrate în Claude Code.

---

## Cuprins

1. [Instalare wpaikit](#instalare-wpaikit)
2. [Inițializarea proiectului](#inițializarea-proiectului)
3. [Instalarea Knowledge Base](#instalarea-knowledge-base)
4. [Comenzi disponibile](#comenzi-disponibile)
5. [Workflow complet](#workflow-complet)
6. [Actualizare wpaikit](#actualizare-wpaikit)

---

## Instalare wpaikit

### Cerințe preliminare

Verifică că ai instalat toate instrumentele necesare:

| Instrument         | Versiune minimă | Verificare                     |
| ------------------ | --------------- | ------------------------------ |
| Node.js            | 18+             | `node --version`               |
| pnpm               | orice           | `pnpm --version`               |
| PHP                | 8.1+            | `php --version`                |
| Composer           | orice           | `composer --version`           |
| Git                | orice           | `git --version`                |
| Python + fonttools | orice           | `pip install fonttools brotli` |

### Instalare globală

```bash
npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
```

### Verificare instalare

```bash
wpaikit --version
wpaikit doctor
```

Comanda `doctor` verifică automat toate dependențele și raportează ce lipsește.

### Actualizare

Când apare o versiune nouă:

```bash
npm install -g @veaceslav-golden/wp-ai-kit-core@latest
npm install -g @veaceslav-golden/wp-ai-kit@latest
```

Apoi actualizează knowledge base-ul în proiectul tău (din folderul temei):

```bash
wpaikit knowledge install
```

---

## Inițializarea proiectului

```bash
wpaikit init
```

Prompturi interactive:

- **Project name** — numele proiectului (ex: `Salon Frumusețe`)
- **Slug** — kebab-case, folosit pentru folderul temei (ex: `salon-frumusete`)
- **Namespace** — namespace PHP în PascalCase (ex: `SalonFrumusete`)
- **Location** — subdirector nou sau directorul curent

Ce face automat:

1. Descarcă ultima versiune WordPress
2. Clonează boilerplate-ul în `wp-content/`
3. Redenumește tema, namespace-ul PHP și text domain-ul peste tot
4. Rulează `composer install` și `npm install && npm run build` în temă
5. Creează fișierul `.wpaikit.json` cu metadatele proiectului

### Pași manuali după init

```bash
cd salon-frumusete   # dacă ai ales un subdirector nou
```

1. Creează o bază de date locală (prin Herd, MAMP, TablePlus sau CLI)
2. Configurează `wp-config.php`:
   ```php
   define('DB_NAME',     'salon_frumusete');
   define('DB_USER',     'root');
   define('DB_PASSWORD', '');
   define('DB_HOST',     'localhost');
   define('BOILERPLATE_DEV', true);  // activează assets Vite în dev
   ```
3. Deschide site-ul în browser → completează wizard-ul WordPress
4. Activează tema în **wp-admin → Appearance → Themes**

---

## Instalarea Knowledge Base

Navighează în **folderul rădăcină al temei**:

```bash
cd wp-content/themes/salon-frumusete
```

Instalează knowledge base-ul:

```bash
wpaikit knowledge install
```

Ce se copiază în proiectul tău:

- `knowledge/` — prompturi, skill-uri și reguli pentru toate comenzile AI
- `CLAUDE.md` — instrucțiuni pentru Claude Code (încărcat automat)
- `AGENTS.md` — instrucțiuni pentru Codex/OpenAI
- `.claude/commands/` — comenzile slash pentru Claude Code

> Toate comenzile de mai jos se rulează din folderul rădăcină al temei.

---

## Comenzi disponibile

Deschide Claude Code din folderul temei și folosește comenzile slash.
Fiecare comandă citește automat fișierele din `knowledge/` înainte de execuție.

---

### `/analyze-figma`

**Scop:** Auditează un frame Figma pentru a verifica dacă designul este pregătit pentru implementare.

```
/analyze-figma <figma-url> [--lang en|ro|ru]
```

**Ce verifică:**

- Denumirea frame-urilor (sunt blocurile numite semantic — `HeroBlock`, `TeamBlock`?)
- Utilizarea Auto Layout în containere structurale
- Existența token-urilor (Variables + Text Styles în Figma)
- Variantele responsive (frame Desktop + Mobile furnizate?)
- Componente reutilizabile vs. copii detașate

**Output:** Raport de pregătire cu avertismente și blocante.

**Când se folosește:** Înainte de orice altă comandă — pentru a înțelege starea designului.

**Parametri:**

- `<figma-url>` — URL-ul frame-ului Figma
- `--lang` — limba raportului: `en` (implicit), `ro`, `ru`

---

### `/generate-design`

**Scop:** Generează un design UI direct în Figma pe baza unui brief de proiect, sistem de design și referințe.

```
/generate-design
```

**Fără argumente** — comanda este complet interactivă.

**Flux de lucru în 5 faze:**

**Faza 1 — Colectare materiale (6 pași)**

1. URL-ul proiectului Figma țintă
2. URL cu referințe/exemple (moodboard, proiect similar)
3. URL Design System (sau `/figma-design-system` mai întâi, sau paletă neutră)
4. Brand assets — logo/imagine cu paleta de brand (dacă nu există DS)
5. Bibliotecă de iconițe — pagină Figma cu iconițe proprii (recomandat), sau skip
6. Pexels API key — pentru fotografii reale adaptate stilului proiectului (sau skip)

**Faza 2 — Brief de proiect (un singur bloc de întrebări)**

- Descrierea business-ului, industria, audiența
- Register: brand (landing, portofoliu) / product (SaaS, dashboard)
- Stilul vizual: minimal / bold / luxury / playful / corporate / editorial
- Strategia de culori: restrained / committed / full / drenched
- **Scenă** — o propoziție: cine folosește, unde, la ce lumină, în ce stare de spirit
  _(din scenă se derivă automat: Theme light/dark, Density, Tone — nu se întreabă separat)_
- Calitate: wireframe / hi-fi
- Mod generare: pagină cu pagină / bloc cu bloc
- Mobile: da / nu (implicit nu)
- Pagini și secțiuni
- Limba conținutului
- **Lățimea containerului:** 1200 / 1280 / 1440 / 1536 px
- **Blocuri full-width:** da / nu (secțiuni care ies din container — Hero, Gallery, CTA banner)
- Inspirație și anti-referințe (opțional)

**Faza 3 — Quality Check + Design Brief Summary**

- Rulează automat `/design-quality-check` în brief mode
- Verifică: category reflex, absolute bans, strategia de culori, register, tema
- Fiecare problemă: `[accept] [suggest different] [keep original]`
- Afișează Design Brief complet — confirmi înainte de generare

**Faza 4 — Generare în Figma**

- Structura obligatorie per bloc: `[SectionName]` (Fill 100%, Auto Layout, centrat, 20px H padding) → `Container` (lățime fixă din brief) → conținut
- Fotografii: fetch automat din Pexels pe baza industriei + tonului + tipului de secțiune
- Iconițe: componente din biblioteca furnizată, nu vectori auto-generați

**Faza 5 — Finalizare**

- Sugerează comenzile următoare: `/design-quality-check`, `/figma-design-system`, `/prep-figma`

**Opțiuni de generare:**

- **Pagină cu pagină** — generează o pagină întreagă, apoi `[continue / adjust / stop]`
- **Bloc cu bloc** — generează câte un bloc pe rând, control complet

**Note:**

- Textul generat este Lorem ipsum
- Mobile se generează doar dacă este solicitat explicit
- Desktop: 1440px lățime frame; container: lățime aleasă în brief

**Când se folosește:** La începutul proiectului, când designerul vrea să genereze machetele din brief.

---

### `/design-quality-check`

**Scop:** Auditează un brief de design sau frame-uri Figma existente pentru pattern-uri AI predictibile, reflexe de categorie și probleme de calitate vizuală.

```
/design-quality-check
/design-quality-check <figma-url>
```

**Două moduri detectate automat:**

- **Brief mode** (fără URL) — verifică intenția de design înainte de generare
- **Design mode** (cu URL Figma) — citește frame-urile și auditează output-ul vizual

**Ce verifică (ambele moduri):**

| #   | Check                                                                                                         | Tip       |
| --- | ------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Category reflex (first-order) — industrie + culori = rezultat predictibil                                     | ✗ critic  |
| 2   | Category reflex (second-order) — anti-reflexul comun după evitarea primului                                   | ⚠ warning |
| 3   | Absolute bans: side-stripe borders, gradient text, glassmorphism, hero metric, card grid identic, modal-first | ✗ critic  |
| 4   | Validarea strategiei de culori (restrained/committed/full/drenched)                                           | ✗ / ⚠     |
| 5   | Register consistency (brand vs product)                                                                       | ⚠ warning |
| 6   | Theme logic — tema urmează scena, nu reflexul                                                                 | ⚠ warning |
| 7   | Anti-reference proximity — direcția seamănă cu ce trebuie evitat                                              | ⚠ warning |
| 8   | Typography hierarchy — doar design mode                                                                       | ⚠ warning |
| 9   | Layout rhythm — doar design mode                                                                              | ⚠ warning |

**Output:**

```
✓ Color strategy: Committed — correct
⚠ Category reflex (first-order): Healthcare + white + teal = predictable
  → Proposed: warm off-white + deep slate
  [accept] [suggest different] [keep original]
✗ Identical card grid detected in Features section
  → Proposed: 1 spotlight + 2 list items
  [accept] [suggest different] [keep original]
──────────────────────────────────────────────
Summary: 1 critical ✗ · 1 warning ⚠ · 1 passed ✓
```

**Fix flow:** Pentru fiecare problemă alegi `[accept]`, `[suggest different]` sau `[keep original]`.

**Note:**

- Warning-urile pot fi acceptate sau ignorate de designer
- În brief mode: rulat automat de `/generate-design` înainte de generare
- În design mode: oferă opțiunea de a aplica fix-urile direct în Figma

**Când se folosește:**

- Automat, înainte de orice generare (integrat în `/generate-design`)
- Manual, pentru a audita un design existent în Figma

---

### `/figma-design-system`

**Scop:** Extrage toate token-urile de design din Figma și creează un Design System complet.

```
/figma-design-system <figma-url>
```

**Cum se pregătește URL-ul:**
Cmd+click pe 4–6 frame-uri reprezentative în Figma → Copy link. URL-ul va conține mai multe valori `node-id` — lipește-l ca atare.

**Ce face:**

- Scanează frame-urile selectate pentru culori, tipografie, spațiere, raze și pattern-uri UI
- Creează pagina „Design System" în Figma cu swatchuri vizuale, exemple de text și bare de spațiere
- Creează Figma Variables + Text Styles dacă nu există
- Detectează elemente de formular (input, textarea, select, checkbox, toggle)
- Scrie `.wpaikit/design-system.json`

**Output:**

- `.wpaikit/design-system.json` — cache-ul de token-uri folosit de toate comenzile ulterioare
- Figma: pagina „Design System"
- Figma: Variables + Text Styles

**Când se folosește:** O singură dată la început (sau cu `/figma-update-design-system` pentru adăugiri ulterioare).

---

### `/figma-components`

**Scop:** Creează Component Set-uri Figma cu variante din pattern-urile UI găsite în faza anterioară.

```
/figma-components
```

**Fără argumente** — citește `_patterns` din `design-system.json` (fără apeluri suplimentare la Figma API).

**Ce creează:**

- Component Set-uri cu proprietăți de variantă (Type × Size × State) pentru butoane, badge-uri, carduri, formulare etc.
- Secțiunea `components` în `design-system.json`

**Când se folosește:** După `/figma-design-system`, înainte de `/prep-figma`.

---

### `/figma-update-design-system`

**Scop:** Adaugă frame-uri noi la un Design System existent — fără a șterge token-urile existente.

```
/figma-update-design-system
```

**Fără argumente** — interactiv.

**Ce face:**

- Verifică starea `design-system.json` existent
- Cere URL-uri pentru frame-uri noi
- Compară token-urile noi cu cele existente (diff)
- Verifică dacă componente Figma lipsesc față de JSON
- Actualizează pagina Design System în Figma (append, nu replace)
- Creează Component Set-uri pentru pattern-uri noi
- Îmbinează JSON-ul — nu șterge niciodată token-uri existente

**Când se folosește:** Când designerul adaugă pagini noi sau secțiuni noi în Figma după extracția inițială.

---

### `/figma-sync-tokens`

**Scop:** Sincronizează `design-system.json` când designerul a modificat manual Variables sau Text Styles în Figma.

```
/figma-sync-tokens
```

**Ce face:**

- Citește Variables curente via `get_variable_defs` (nu necesită selecție în Figma)
- Compară cu `design-system.json`
- Raportează: Adăugate / Modificate / Șterse
- Actualizează JSON — token-urile șterse sunt marcate `deprecated: true`, niciodată eliminate

**Când se folosește:** Ori de câte ori designerul modifică culorile, fonturile sau spațierea direct în Figma.

---

### `/prep-figma`

**Scop:** Pregătește frame-urile Figma pentru generarea de cod — fără a modifica designul original.

```
/prep-figma <figma-url>
```

**Ce face:**

- Creează pagina „Dev Ready" cu o copie a frame-ului selectat
- Redenumește layer-ele cu nume semantice (`Heading`, `Description`, `CTA Button`, `Items`)
- Leagă stilurile detașate de Variables și Text Styles
- Înlocuiește elementele detașate cu instanțe de componente
- Aplică Auto Layout acolo unde lipsește
- Păstrează spațierea originală

**Când se folosește:** Înainte de `/figma-to-block`, pentru fiecare pagină sau bloc complex.

---

### `/setup-fonts`

**Scop:** Auditează, convertește și conectează fonturile proiectului.

```
/setup-fonts
```

**Cerință:** `pip install fonttools brotli`

**Ce face:**

1. Citește familiile de fonturi și greutățile necesare din `design-system.json`
2. Scanează `frontend/src/fonts/` pentru fișierele existente
3. Afișează tabelul de audit — necesar vs. găsit, fișiere de eliminat
4. Elimină fișierele de fonturi neutilizate (cere confirmare)
5. Convertește TTF/OTF → woff2 + woff
6. Generează `frontend/src/fonts/_fonts.scss` cu blocuri `@font-face` (`font-display: swap`)
7. Adaugă `@import 'fonts/fonts'` în `main.scss`

**Când se folosește:** O singură dată după extracția Design System-ului.

---

### `/design-system-to-code`

**Scop:** Generează componente Twig + parțiale SCSS + actualizează `tailwind.config.js`.

```
/design-system-to-code
```

**Ce generează:**

- `views/components/{name}.twig` — componentă Twig cu clase BEM și comentariu header
- `frontend/src/css/components/_{name}.scss` — parțial SCSS cu `@apply` per variantă
- `frontend/tailwind.config.js` — actualizat cu token-uri de culori, raze și tipografie (merge, nu suprascrie)
- `frontend/src/css/main.scss` — linii `@import` adăugate pentru fiecare componentă nouă

**Validare după generare:**

```bash
cd frontend && npm run build
```

**Când se folosește:** După `/figma-components`, pentru a genera codul componentelor în proiect.

---

### `/scan-components`

**Scop:** Indexează toate componentele existente și clasele SCSS pentru reutilizarea lor la generarea de blocuri.

```
/scan-components
```

**Ce face:**

- Citește `frontend/src/css/main.scss` pentru a descoperi toate fișierele SCSS importate
- Extrage blocuri BEM, elemente (`__element`) și modificatori (`--modifier`) din fiecare fișier
- Citește comentariile header din fișierele Twig din `views/components/` și `views/partials/`
- Scrie `.wpaikit/components-registry.md`

**Output:** `.wpaikit/components-registry.md` — index folosit automat de `/figma-to-block`

**Când se folosește:** După `/design-system-to-code` și ori de câte ori sunt adăugate componente noi.

---

### `/validate-code`

**Scop:** Validează fișierele SCSS, Twig și PHP existente împotriva regulilor de codare și repară violările.

```
/validate-code
```

**Ce verifică:**

_SCSS:_

- Comentariu header prezent
- Clase BEM în kebab-case (fără camelCase sau clase utilitare)
- Tot styling-ul prin `@apply` (fără proprietăți CSS raw)
- Fără culori hex hardcodate
- Mobile-first: clase de bază = mobile, `@screen md {}` = desktop

_Twig:_

- Fără clase Tailwind utilitare în atribute `class=""` (excepție: `container`)
- Câmpuri plain text: `{{ field }}` (fără `|raw`)
- URL-uri: `{{ field.url|raw }}`
- Câmpuri opționale învelite în `{% if field %}`

_PHP:_

- `declare(strict_types=1)` prezent
- Namespace corect
- Câmpuri image învelite în `new \Timber\Image()`

**Flow:**

1. Afișează raport cu violări per fișier
2. Întreabă: `[all]` — repară tot / `[pick]` — alege fișierele / `[no]` — ieși
3. Repară automat (max 2 runde per fișier)
4. Culori hex necunoscute → cere confirmare → adaugă în `tailwind.config.js` + `design-system.json`

**Când se folosește:** După orice generare de cod sau modificare manuală SCSS/Twig/PHP.

---

### `/figma-to-block`

**Scop:** Generează un bloc ACF WordPress complet (PHP + Twig + SCSS + ACF JSON) dintr-un frame Figma.

```
/figma-to-block <desktop-url> [<mobile-url>]
```

Un singur run = un singur bloc. Rulează din folderul rădăcină al temei.

**Flux de lucru per bloc:**

1. Pasează URL-ul frame-ului desktop (și opțional cel mobil)
2. Faza interactivă — revizuiește câmpurile ACF propuse:
   ```
   rename 2 body_text      — redenumește câmpul
   type 2 wysiwyg          — schimbă tipul câmpului
   add logo_image image    — adaugă un câmp
   remove 3                — elimină un câmp
   container no            — fără container (pentru blocuri full-width)
   done                    — generează
   ```
3. Fișierele generate:

| Fișier        | Cale                                   |
| ------------- | -------------------------------------- |
| Clasă PHP     | `blocks/{Name}/{Name}.php`             |
| Template Twig | `views/blocks/{Name}/{Name}.twig`      |
| Parțial SCSS  | `frontend/src/css/blocks/_{name}.scss` |
| ACF JSON      | `acf-json/group_{name}.json`           |

4. Parțialul SCSS este importat automat în `main.scss`
5. **Sincronizează ACF JSON după fiecare bloc:** wp-admin → Custom Fields → Sync

**Structura Twig generată:**

_Cu container:_

```html
<section class="hero-block">
  <div class="hero-block__inner container">
    <div class="hero-block__content">...</div>
  </div>
</section>
```

_Fără container (full-width):_

```html
<section class="hero-block">
  <div class="hero-block__content">...</div>
</section>
```

**Structura tab-urilor ACF:**

- **Settings** — întotdeauna prezent (`is_active`, `block_custom_id`)
- **Content** — câmpuri text, textarea, wysiwyg, link
- **Media** — câmpuri image, video, file
- **Appearance** — câmpuri select, radio, color_picker
- **[Repeater]** — câte un tab per repeater

**Când se folosește:** Pentru fiecare secțiune/bloc de pe fiecare pagină.

---

### `/get-comment-for-frontend`

**Scop:** Generează un fișier `.md` de referință pentru developeri, listând toate blocurile ACF de pe o pagină WordPress cu căile Twig, SCSS și JS.

```
/get-comment-for-frontend <page-url-or-slug>
```

**Fără WP-CLI** — accesează direct baza de date MySQL.

**Ce face:**

1. Citește `wp-config.php` pentru credențialele DB (fără a le afișa)
2. Interoghează `wp_posts` pentru `post_content` al paginii
3. Parsează comentariile `<!-- wp:acf/block-name -->` din conținut
4. Derivează căile de fișiere pentru fiecare bloc (Twig, SCSS, PHP, JS)
5. Verifică existența fișierelor pe disk
6. Scrie `page-blocks-{slug}.md` în directorul curent

**Output exemplu:**

```markdown
# Page: Acasă

**Slug:** `home`
**Blocks found:** 4

### 1. HeroBlock

| File | Path                                      | Status |
| ---- | ----------------------------------------- | ------ |
| Twig | views/blocks/HeroBlock/HeroBlock.twig     | ✓      |
| SCSS | frontend/src/css/blocks/\_hero-block.scss | ✓      |
| PHP  | blocks/HeroBlock/HeroBlock.php            | ✓      |
| JS   | frontend/src/js/blocks/hero-block.js      | ✓      |
```

**Argumente:**

- `https://site.local/despre` → slug = `despre`
- `despre` → slug = `despre`
- `/` sau `home` → pagina de start

**Când se folosește:** Când un developer primește o pagină pentru review/bugfix și vrea să găsească rapid fișierele.

---

## Workflow complet

### Workflow A — Design existent în Figma (cel mai frecvent)

```
─── INSTALARE ───────────────────────────────────────────────

npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor                    # verifică mediul

─── INIȚIALIZARE ────────────────────────────────────────────

wpaikit init                      # scaffold WordPress + boilerplate
  ↓ manual: crează DB, configurează wp-config.php,
            completează wizard WordPress, activează tema

cd wp-content/themes/{slug}
wpaikit knowledge install         # copiază knowledge base + slash commands

─── DESIGN ──────────────────────────────────────────────────

/analyze-figma <url>              # auditează designul (opțional, dar recomandat)
/figma-design-system <url>        # extrage tokeni → design-system.json + pagina Figma
/figma-components                 # creează Component Set-uri Figma
/prep-figma <url>                 # pregătește frame-urile (repetă per pagină)
/setup-fonts                      # auditează + convertește + conectează fonturile

─── COD ─────────────────────────────────────────────────────

/design-system-to-code            # Twig componente + SCSS + tailwind.config.js
  ↓ cd frontend && npm run build  # verifică că SCSS compilează

/scan-components                  # indexează componentele pentru reutilizare

/figma-to-block <url>             # generează bloc (repetă pentru fiecare bloc)
  ↓ după fiecare bloc: wp-admin → Custom Fields → Sync

─── ONGOING ─────────────────────────────────────────────────

/figma-sync-tokens                # când designerul modifică tokeni în Figma
/figma-update-design-system       # când apar pagini/secțiuni noi în Figma
/scan-components                  # după adăugarea de componente noi
/validate-code                    # verificare cod după orice modificare
/get-comment-for-frontend <url>   # referință pentru developer la review/bugfix
```

---

### Workflow B — Proiect nou fără design (design-first)

```
─── INSTALARE + INIȚIALIZARE ────────────────────────────────

(același ca Workflow A)

─── GENERARE DESIGN ─────────────────────────────────────────

/generate-design                  # brief interactiv → generează design în Figma
  ↓ revizuiești și ajustezi în Figma

─── EXTRAGERE TOKENI ────────────────────────────────────────

/figma-design-system <url>        # extrage tokeni din designul generat
/figma-components                 # creează componente Figma
/prep-figma <url>                 # pregătește frame-urile pentru cod

─── COD ─────────────────────────────────────────────────────

(continuă ca în Workflow A, de la /setup-fonts)
```

---

## Situații frecvente

| Situație                                   | Comandă                                                  |
| ------------------------------------------ | -------------------------------------------------------- |
| Bloc nou din Figma                         | `/prep-figma` (dacă e nevoie) → `/figma-to-block`        |
| Designerul a schimbat culorile/fonturile   | `/figma-sync-tokens` → actualizează `tailwind.config.js` |
| Pagini noi adăugate în Figma               | `/figma-update-design-system`                            |
| Componentă nouă Twig adăugată              | `/scan-components`                                       |
| Fonturi schimbate                          | `/setup-fonts`                                           |
| Verificare cod după modificări             | `/validate-code`                                         |
| Audit design generat pentru pattern-uri AI | `/design-quality-check <url>`                            |
| Verificare brief înainte de generare       | `/design-quality-check` (fără URL)                       |
| Developer caută fișierele unui bloc        | `/get-comment-for-frontend <url>`                        |
| Server de dezvoltare                       | `cd frontend && npm run dev`                             |
| Build producție                            | `cd frontend && npm run build`                           |
| Analiză statică PHP                        | `composer phpstan`                                       |

---

## Fișiere cheie

| Fișier                            | Rol                                                                |
| --------------------------------- | ------------------------------------------------------------------ |
| `.wpaikit.json`                   | Metadata proiect (nume, namespace, preset)                         |
| `.wpaikit/design-system.json`     | Cache tokeni — sursa de adevăr pentru toate comenzile              |
| `.wpaikit/components-registry.md` | Index componente — citit de `/figma-to-block`                      |
| `frontend/src/css/main.scss`      | Entry point SCSS — toate importurile sunt aici                     |
| `frontend/tailwind.config.js`     | Config Tailwind — actualizat de `/design-system-to-code`           |
| `acf-json/`                       | ACF field group JSON — sincronizează în wp-admin după fiecare bloc |
| `views/blocks/`                   | Template-uri Twig pentru blocuri                                   |
| `views/components/`               | Componente Twig reutilizabile                                      |
| `views/partials/`                 | Parțiale layout (header, footer)                                   |
| `knowledge/`                      | Reguli, prompturi și skill-uri AI                                  |
| `.claude/commands/`               | Comenzile slash pentru Claude Code                                 |

---

## Actualizare wpaikit

### Pentru tine (autorul)

```bash
# bump versiunea în packages/cli/package.json
pnpm --filter @veaceslav-golden/wp-ai-kit build
cd packages/cli && pnpm publish --no-git-checks --otp=XXXXXX
```

### Pentru alți developeri din echipă

```bash
# 1. Actualizează CLI global
npm install -g @veaceslav-golden/wp-ai-kit-core@latest
npm install -g @veaceslav-golden/wp-ai-kit@latest

# 2. Actualizează knowledge base în proiect (din folderul temei)
cd wp-content/themes/{slug}
wpaikit knowledge install
```
