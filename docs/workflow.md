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
6. Instalează automat profilul Knowledge Base în rădăcina temei

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

## Knowledge Base

`wpaikit init` instalează automat profilul potrivit. Pentru actualizare sau reparare, navighează în
**folderul rădăcină al temei**:

```bash
cd wp-content/themes/salon-frumusete
```

Verifică schimbările și apoi actualizează knowledge base-ul:

```bash
wpaikit knowledge install --dry-run
wpaikit knowledge install
```

### Pachete knowledge

Knowledge base-ul este împărțit în pachete independente. Fiecare rol instalează doar ce îi trebuie:

| Pachet | Pentru cine | Conține |
|---|---|---|
| `design` | designer | Comenzile Figma: analiză, design system, componente, prep, generare, SEO, mockup-uri pentru studii de caz. Fără reguli WordPress. |
| `slicing` | integrator (fără CMS) | `/figma-to-block-html` — HTML + SCSS (Tailwind `@apply`) + JS, plus `/scan-project` și `/setup-fonts` |
| `wordpress` | dezvoltator WordPress | `/figma-to-block` (PHP + Twig + SCSS + ACF JSON), regulile boilerplate-ului; profilul `woo` adaugă WooCommerce |

```bash
wpaikit knowledge install                                   # întreabă ce pachete să instaleze
wpaikit knowledge install --packs design                    # designer: profilul WordPress nu este cerut
wpaikit knowledge install --packs slicing
wpaikit knowledge install --packs slicing,wordpress --wp-profile woo
wpaikit knowledge install --packs all                       # design + slicing + wordpress
```

- Fără `--packs`, comanda refolosește selecția salvată în `.wpaikit/knowledge-manifest.json`;
  la prima instalare întreabă (sau instalează `all` fără terminal interactiv).
- Profilul WordPress (`standard` / `woo`) se alege doar pentru pachetul `wordpress` și se ia din
  `.wpaikit.json`, dacă există.
- Dacă scoți un pachet, fișierele lui gestionate de WPAIKit sunt șterse; fișierele modificate local
  opresc instalarea. Folosește `--dry-run` pentru a vedea lista `+ / ~ / -` înainte.
- `wpaikit init` instalează `all`; folosește `wpaikit init --packs <list>` pentru altă selecție.

Ce se copiază în proiectul tău:

- `knowledge/<pachet>/` — prompturi, skill-uri și reguli ale pachetelor selectate;
  `knowledge/shared/` — reguli și comenzi comune; `knowledge/context.md` — lista comenzilor instalate
- `CLAUDE.md` — instrucțiuni pentru Claude Code (încărcat automat)
- `AGENTS.md` — instrucțiuni pentru Codex/OpenAI
- `.agents/skills/` — skill-urile pachetelor selectate, apelabile în Codex cu `$nume-skill`
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

**Scop:** Cercetează piața și referințele, stabilește cu designerul tonul, fundațiile, fonturile, blocurile și textele cheie, explorează concepte distincte, apoi construiește direcția aleasă în Figma pe tokeni aprobați și o verifică cu screenshot-uri și un lint mecanic.

```
/generate-design
```

**Fără argumente** — comanda este interactivă. Minimul de care are nevoie: URL-ul fișierului Figma țintă și descrierea proiectului.

**Nouă etape, patru porți.** O poartă (gate) este o oprire: asistentul prezintă deciziile, fiecare cu o recomandare, și așteaptă un răspuns explicit. Între porți lucrează fără să ceară permisiune la fiecare pas.

| Etapă                  | Rezultat                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0 Setup                | Acces, paginile Final Design / Ideas / Archive / Design System / Flows, fonturile disponibile în Figma                                    |
| 1 Brief                | Audiență, acțiune principală, register, scenă, must-have-uri → `.wpaikit/design-brief.md` (cu `/design-quality-check` în brief mode)       |
| 2 Cercetare            | 3–5 concurenți, tonul vocii, 3–5 referințe → **Gate A**                                                                                   |
| 3 Fundații             | Paletă cu perechi de contrast, 2–3 perechi de fonturi, set de iconițe, tratarea imaginilor → **Gate B** → Variables și Text Styles        |
| 4 Structură și texte   | Planul de blocuri, piese utilitare (stări, overlay-uri, 404, stări goale), textele cheie → **Gate C** → `.wpaikit/status.md`              |
| 5 Concepte             | 2–3 concepte pe pagina Ideas, diferite pe cel puțin două axe → **Gate D** → Design Direction                                               |
| 6 Construcție          | Un ciclu pentru fiecare element din status: alegere, variante sau construcție directă, lint + layout check + screenshot, prezentare, plasare, înregistrare |
| 7 Verificare           | Lint, screenshot-uri, comparație cu conceptul aprobat, `/design-quality-check` în design mode                                              |
| 8 Handoff              | Linkuri, înregistrări, elemente deschise, verificări rămase pentru browser, notă în `.wpaikit/project.md`                                  |

**Înregistrări în `.wpaikit/`** (în folderul proiectului clientului):

| Fișier                            | Ce conține                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `project.md`                      | Nota de handoff: ce este proiectul, unde sunt toate, regulile agreate cu designerul                            |
| `status.md`                       | Toate blocurile și stările cu statusul lor: `todo`, `in progress`, `review`, `done`, `deferred`, `waiting client` |
| `design-direction.md`             | Sistemul actual: reguli globale și câte o secțiune pentru fiecare tip de pagină                                |
| `decision-log.md`                 | Istoria deciziilor: ce s-a arătat, ce s-a ales și de ce                                                        |
| `figma-ledger.json`               | Harta de la nume semantice la ID-urile din Figma                                                               |
| `design-brief.md`, `copy-deck.md` | Brief-ul, must-have-urile, tonul; textele aprobate                                                             |

**Note:**

- Textele sunt reale sau draft, marcate `approved` / `draft`, nu Lorem ipsum. Recenziile, logo-urile și cifrele inventate nu se prezintă ca fapte.
- Mobile se face doar la cerere, după aprobarea versiunilor desktop.
- Variantele respinse merg pe pagina Archive, nu se șterg.
- Generarea plătită de imagini (Figma AI) se anunță înainte, cu numărul de generări.
- La reluare, asistentul citește `project.md`, `status.md`, ledger-ul și Design Direction înainte să continue. La întrebarea „ce a rămas?” răspunde din `status.md`.

**Când se folosește:** La începutul proiectului, când nu există încă machetă.

---

### `/design-quality-check`

**Scop:** Verifică un brief de design sau frame-uri Figma: potrivirea cu scopul proiectului, originalitatea, coerența și defectele vizibile.

```
/design-quality-check
/design-quality-check <figma-url>
```

**Două moduri detectate automat:**

- **Brief mode** (fără URL) — audiența, sarcina principală, register-ul, limba textelor, constrângerile și presupunerile care pot schimba designul. Verifică dacă scena și cuvintele vocii brandului sunt concrete. Pattern-urile familiare sunt întrebări pentru proiect, nu interdicții automate.
- **Design mode** (cu URL Figma) — screenshot-uri la fiecare viewport cerut și lint read-only. Verifică fundațiile și lock-urile aprobate, blocurile cerute și textele, apoi conținutul, ierarhia, compoziția, coerența sistemului, accesibilitatea vizibilă, responsive, iconițele, stările și caracterul distinctiv. Pentru magazine: produs, preț, acțiune de cumpărare și coș.

**Output:** pentru fiecare problemă — frame-ul, dovada, impactul și cea mai mică corecție utilă, împărțite în defecte critice, îmbunătățiri importante și preferințe stilistice. Verificările posibile doar în browser sunt raportate ca neverificate.

**Note:**

- Ca audit separat rămâne read-only, dacă nu ceri corecturi.
- Din `/generate-design` corectează defectele cu impact mare în frame-urile generate, apoi rulează din nou lint-ul și verifică screenshot-uri noi.
- La final oferă treceri de rafinare (bolder, quieter, distill, clarify, polish), fără să le ruleze nechemat.

**Când se folosește:**

- Automat în `/generate-design`: brief mode la etapa 1, design mode la etapa 7
- Manual, pentru a audita un design existent în Figma

---

### `/wcag-design-test`

**Scop:** Verifică un frame Figma după WCAG 2.2 (AA implicit, AAA cu flag) și pune lângă el un raport cu ce trebuie reparat. Fiecare problemă are o corecție calculată: culoare (token sau cea mai apropiată nuanță care trece), opacitate, padding sau text.

```
/wcag-design-test <figma-url>
/wcag-design-test <figma-url-desktop> <figma-url-mobile> --level AAA --lang ro --no-annotations
```

**Trei grupuri de verificări, separate în raport:**

| Grup                    | Ce include                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Măsurat (lint)          | Contrast text (inclusiv opacitate, gradient, pixeli de imagine), contrast non-text, mărimea țintelor, variante Focus, label-uri, erori, text cu înălțime fixă, ordinea de citire |
| Din screenshot          | Text în imagini, informație doar prin culoare, ierarhia titlurilor, drag fără alternativă, carusele fără pauză, controale nedetectate                                            |
| De verificat în browser | Tastatură, nume accesibile, mesaje de stare, zoom 200 % și 320px, `prefers-reduced-motion`, `lang` și `title`                                                                    |

**Ce apare:**

- un frame `WCAG Report — <nume>` lângă frame-ul verificat: snapshot cu pini numerotați, întrebări, liste de verificare și câte un card pentru fiecare problemă;
- adnotări Accessibility pe straturile cu probleme (vizibile în Dev Mode; se pot dezactiva cu `--no-annotations`);
- `.wpaikit/wcag/<frame>.md` pentru handoff și un rezumat în chat.

**Note:**

- Designul verificat nu se modifică. O nouă rulare înlocuiește raportul și adnotările anterioare.
- Toate cifrele vin din lint. Ce e evaluat după screenshot e marcat ca atare; ce nu poate fi verificat în Figma nu e raportat ca trecut.
- Controalele fără nume de strat sunt detectate după formă și confirmate pe screenshot. Numirea straturilor (`Button`, `Input`, `Link`) dă cel mai precis rezultat.

**Când se folosește:** Înainte de handoff-ul unui design către dezvoltare și după corecturi, pentru a vedea ce s-a rezolvat.

---

### `/figma-seo-structure`

**Scop:** Auditează o pagină Figma din punct de vedere SEO structural — ce blocuri lipsesc, cum leagă pagina alte pagini, E-E-A-T, SEO local, Schema.org și stările de layout. După aprobarea planului, construiește blocurile lipsă direct în Figma și adaugă adnotări SEO pentru developeri.

```
/figma-seo-structure <figma-url>
/figma-seo-structure <figma-url> --lang ro
```

**Brief (întrebări la început):**

- Nișa + piața principală (țară, oraș) — contează pentru intenția locală
- Interogarea țintă a paginii (ex: „dermatolog Chișinău") sau `[auto]`
- Mod: `[audit]` — doar raport · `[build]` — audit → aprobare → construire în Figma (implicit)
- Unde se construiește: `[copy]` — duplicat al frame-ului (implicit) · `[in-place]`

**Ce verifică:**

| Zonă                   | Exemple                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Structura landing-ului | Un singur H1 pe interogare, filtrele sunt link-uri către landing-uri indexabile, paginare  |
| Link-uri interne       | Carduri → pagini de entitate, legături încrucișate, bloc „similare", breadcrumbs          |
| E-E-A-T                | Profil expert, certificate, recenzii cu rating agregat, fotografii reale                   |
| SEO local              | Adresă, telefon `tel:`, program, hartă, NAP identic cu Google Business Profile             |
| Conținut               | Text SEO unic, „Citește mai mult" prezent în HTML, FAQ onest (fără promisiuni rich snippet) |
| Schema.org             | `ItemList`, `BreadcrumbList`, `Person`, `LocalBusiness`, `Product`/`Service` + `Offer`     |
| Stări de layout        | Ce se întâmplă cu 0 / 1 / 2 / 3 / 4 / multe elemente în fiecare bloc repetitiv             |

Fiecare punct: ✅ / ⚠️ / ❌ + motiv + prioritate (P1/P2/P3).

**Output:**

- Raport + plan → `seo-structure-{page-slug}.md` în directorul curent (se oprește și așteaptă aprobarea)
- După aprobare: blocuri noi în copia paginii Figma, secțiune „Layout states", o pagină landing exemplu (pentru listări)
- Adnotări în categoria `SEO`: ce trebuie să fie link și unde, canonical, schema + exemplu JSON-LD, reguli de layout
- Lista datelor placeholder de înlocuit înainte de lansare (program, prețuri, recenzii, certificate)

**Note:**

- Auditul este read-only; nimic nu se construiește fără aprobare explicită
- Frame-urile originale nu se modifică (dacă nu ai ales `[in-place]`); conținutul editat manual nu se suprascrie
- Refolosește componentele și stilurile existente din fișier — nu inventează un limbaj vizual nou

**Când se folosește:** Înainte de `/figma-seo-texts` și de implementare, pentru fiecare tip de pagină (listare, entitate, serviciu, contacte).

---

### `/figma-seo-texts`

**Scop:** Generează texte SEO multilingve pentru blocurile editoriale ale unei pagini Figma.

```
/figma-seo-texts <figma-url>
```

**Brief (întrebări la început):** limbi + țară pentru fiecare, nișa, piața (țară/oraș), ce se generează (`[meta]` / `[copy]` / `[all]`), cuvinte cheie (`[auto]` / `[manual]`), ton (`[sales]` / `[informational]` / `[expert]`).

**Ce face:**

1. Citește pagina Figma și construiește harta blocurilor
2. Clasifică fiecare bloc: `editorial` (se generează) sau `dynamic` (se sare — carduri produse, categorii, recenzii, footer)
3. Afișează clasificarea și așteaptă confirmarea
4. Generează 10–15 cuvinte cheie localizate per limbă (dacă `[auto]`) și așteaptă confirmarea
5. Generează meta title/description, H1 și textele blocurilor — localizate, nu traduse mecanic
6. Scrie `seo-texts-{page-slug}.md` în directorul curent

**Note:**

- Read-only din Figma — nu modifică straturi sau texte
- Textele din Figma sunt considerate placeholder și sunt înlocuite complet

**Când se folosește:** După ce structura paginii a fost aprobată (`/figma-seo-structure`), înainte de a completa conținutul în CMS.

---

### `/case-study-mockups`

**Scop:** Generează cele 4 imagini cu mockup-uri pentru o pagină de studiu de caz (case study) direct dintr-un site live și le pune în Figma.

```
/case-study-mockups <site-url> [<figma-url>]
/case-study-mockups <site-url> [<figma-url>] --auth user:parola
/case-study-mockups <site-url> [<figma-url>] --login-url <pagina-de-login> --user <login> --pass <parola>
```

- `<site-url>` — site-ul din care se fac capturile (obligatoriu)
- `<figma-url>` — cadrul studiului de caz care trebuie actualizat (opțional). Dacă linkul duce la o pagină goală sau lipsește, comanda copiază acolo șablonul studiului de caz (Desktop + Mobile)
- `--auth` / `--login-url --user --pass` — acces pentru site-uri închise (staging cu parolă sau pagină de login). La început comanda amintește mereu cum se transmite accesul; dacă site-ul e închis și accesul lipsește, se oprește și îl cere

**Ce imagini se generează (structura e fixă):**

| Șablon | Locul în case study | Dimensiune | Fundal | Conținut |
|---|---|---|---|---|
| **A** Overview | imaginea din `OverviewBlock` | 1312×940 | deschis | browser lat cu pagina principală + iPhone frontal + logo orizontal (icon + text) sub browser |
| **B** Showcase lat | prima imagine din `ShowcaseBlock` | 1312×720 | deschis | browser mare cu o secție + browser mic (versiunea de tabletă, 834 px) |
| **C** Grilă izometrică | stânga în `Two Shots` | 644×556 | închis | grilă de iPhone 15 Pro izometrice cu 9 ecrane diferite |
| **D** Browser + telefoane | dreapta în `Two Shots` | 644×556 | închis | browser cu o secție + două iPhone frontale |

De la un site la altul se schimbă doar capturile de ecran, logo-ul și culorile de fundal. Compozițiile, dispozitivele și dimensiunile rămân aceleași.

**Ce face:**

1. Parcurge site-ul (meniu + `sitemap.xml`): pagini, titluri de secțiuni, blocuri cu carduri, logo-ul și culorile
2. Propune paleta: fundal închis (footer-ul, dacă e închis, altfel cea mai închisă culoare neutră), fundal deschis (cea mai deschisă culoare de fundal), glow (culoarea butoanelor)
3. Afișează paginile și secțiunile alese pentru fiecare șablon, paleta, logo-ul și domeniul din bara browserului — **și așteaptă confirmarea** (singura oprire)
4. Face capturile în trei dimensiuni: desktop 1440×900 (2x), mobil 390×844 (3x), tabletă 834×1194 (3x). Derulează toată pagina pentru animații și imagini lazy, așteaptă terminarea animațiilor, ascunde bannerele de cookie și pune secția imediat sub header-ul sticky
5. Separă logo-ul în icon + text pentru șablonul A
6. Pune ecranele în iPhone 15 Pro (frontal și izometric); corpurile dispozitivelor sunt salvate în skill (`assets/devices/`)
7. Randează cele 4 imagini la 3x și le verifică vizual
8. Le încarcă în sloturile Desktop și Mobile ale studiului de caz și le copiază în `assets/generated/case-studies/<domeniu>/`

**Pentru secțiunile din B și D** se alege: o hartă sau o listă; dacă nu există — orice bloc cu carduri; altfel — cea mai interesantă secție vizual. B și D arată secțiuni diferite.

**Cerințe:** Google Chrome, Node 20, Python 3 cu Pillow și numpy. O singură dată, în folderul skill-ului (`knowledge/design/skills/case-study-mockups/`): `npm i`.

**Note:**

- Doar capturi reale ale site-ului — fără imagini generate de AI
- Nu modifică compozițiile; schimbă doar capturile, logo-ul și culorile
- Datele de acces se folosesc doar de scripturi și nu apar în răspunsuri, fișiere sau Figma
- Textele studiului de caz nu se schimbă — dacă s-a copiat șablonul, ele rămân din exemplu și trebuie completate separat

**Când se folosește:** Când pregătești un studiu de caz nou pe site-ul CreativSoft sau când site-ul clientului s-a schimbat și imaginile trebuie refăcute.

---

### `/case-study-app-mockups`

**Scop:** Generează imaginile cu mockup-uri pentru studiul de caz al unei aplicații mobile din ecranele aplicației din Figma și le pune în Figma. Este varianta pentru aplicații a `/case-study-mockups`: nu există un site de capturat, așa că ecranele se iau din designul aplicației.

```
/case-study-app-mockups <figma-url-cu-ecranele-aplicației> [<figma-url-studiu-de-caz>]
```

- `<figma-url-cu-ecranele-aplicației>` — pagina, secțiunea sau cadrul cu ecranele aplicației, ca frame-uri de mărimea unui telefon (lățime 360–430 px) (obligatoriu)
- `<figma-url-studiu-de-caz>` — cadrul studiului de caz care trebuie actualizat (opțional). Dacă lipsește sau duce la o pagină goală, comanda copiază acolo șablonul studiului de caz

**Ce imagini se generează (structura e fixă):**

| Șablon | Locul în case study | Dimensiune | Conținut |
|---|---|---|---|
| **A** Overview | imaginea din `OverviewBlock` | 1312×940 | logo-ul aplicației în stânga, trei iPhone frontale în evantai în dreapta, cel din mijloc deasupra |
| **B** Showcase lat | imaginea din `ShowcaseBlock` | 1312×720 | cinci iPhone frontale într-un rând decalat, care arată fluxul utilizatorului de la stânga la dreapta |

Fundalul e un gradient gri-deschis, dispozitivul e iPhone 15 Pro frontal. De la o aplicație la alta se schimbă doar ecranele și logo-ul. Studiul de caz al unei aplicații nu are rândul `Two Shots`: dacă șablonul îl are, comanda îl șterge în Desktop și Mobile.

**Ce face:**

1. Găsește în nodul dat frame-urile de mărimea unui telefon și notează care au deja status bar iOS
2. Afișează ce ecrane intră în A și B, logo-ul și dacă se adaugă status bar-ul — **și așteaptă confirmarea** (singura oprire)
3. Exportă ecranele din Figma la rezoluție completă prin noduri temporare, pe care apoi le șterge
4. Adaugă status bar-ul iOS doar ecranelor care nu îl au, separă logo-ul în icon + text și pune ecranele în iPhone 15 Pro
5. Randează cele 2 imagini la 3x și le verifică vizual: Dynamic Island nu acoperă conținutul, nu există ecrane goale
6. Le încarcă în sloturile Desktop și Mobile ale studiului de caz și le copiază în `assets/generated/case-studies/<aplicație>/`

**Alegerea ecranelor:** A — cele 3 ecrane cheie (home, funcția principală, profil sau rezultat); B — 5 ecrane care arată fluxul utilizatorului. Fără stări goale, loadere sau dialoguri de sistem. A și B au cel mult un ecran comun.

**Cerințe:** Google Chrome, Node 20, Python 3 cu Pillow și numpy. O singură dată, în folderul skill-ului (`knowledge/design/skills/case-study-app-mockups/`): `npm i`.

**Note:**

- Doar ecranele reale ale aplicației din Figma — fără imagini generate de AI
- Nu modifică compozițiile, modelul dispozitivului sau dimensiunile; schimbă doar ecranele și logo-ul
- Nu lasă noduri temporare de export în fișierul Figma

**Când se folosește:** Când pregătești studiul de caz al unei aplicații mobile pe site-ul CreativSoft.

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

- **Settings** — întotdeauna prezent (`is_active`); ancora se setează în sidebar-ul blocului (HTML anchor), `block_custom_id` nu se mai adaugă blocurilor noi
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

cd {slug}                          # dacă init a creat un folder nou; knowledge este în rădăcina proiectului

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
/figma-seo-structure <url>        # audit SEO structural + blocuri lipsă în Figma
/figma-seo-texts <url>            # texte SEO multilingve pentru blocurile editoriale
/case-study-mockups <site-url>    # imagini mockup pentru un studiu de caz, din site-ul live
/case-study-app-mockups <figma-url> # imagini mockup pentru studiul de caz al unei aplicații mobile
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

/generate-design                  # cercetare, fundații, concepte → design în Figma
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
| Audit de accesibilitate WCAG 2.2 în Figma  | `/wcag-design-test <url>`                                |
| Audit SEO structural al unei pagini        | `/figma-seo-structure <url>`                             |
| Texte SEO pentru o pagină                  | `/figma-seo-texts <url>`                                 |
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

# 2. Actualizează knowledge base în proiect (din rădăcina proiectului sau a temei)
cd wp-content/themes/{slug}
wpaikit knowledge update --dry-run   # arată ce se schimbă
wpaikit knowledge update             # alias pentru `wpaikit knowledge install`
```

Output-ul afișează versiunea knowledge (ex: `Version: 1.8.0 → 2.0.0`), pachetele instalate și numărul de fișiere
scrise/șterse. Fișierele modificate local nu sunt suprascrise — comanda se oprește și le listează.
Pentru a le înlocui oricum: `wpaikit knowledge update --force`.

Verifică versiunea CLI instalată: `wpaikit --version`.
