# WPAIKit Knowledge Packs: план реализации

> **Статус: реализовано** (knowledge 2.0.0, CLI 0.5.0). Отличия от плана:
> - WooCommerce ставится в `knowledge/woocommerce/…`, а не в `knowledge/wordpress/woocommerce/…`: каждый каталог из `packs/` ставится в одноимённый `knowledge/<dir>/`.
> - Каталог проще, чем в разделе 4: набор ставит **весь** свой каталог `packs/<pack>/`, поэтому списки skills не нужны. В `packs.json` у набора есть `commands`, `sharedCommands` и `sharedFiles`, а метаданные команд (`usage`, `description`, `constraint`) используются для генерации `context.md`.

Цель: `wpaikit knowledge install` ставит AI kit по ролям. Каждая роль выбирает только своё:
**All**, **Design**, **Slicing**, **WordPress**.

- **Design** — для дизайнера. Только Figma-сценарии, без команд генерации кода и без правил WordPress и WooCommerce. Профиль (standard/woo) не спрашивается. ACF-ready именование блоков и слоёв в Figma остаётся: это правильный стандарт именования для любого проекта, а не привязка к WordPress.
- **Slicing** — вёрстка без привязки к CMS: HTML + SCSS + Tailwind + JS. Первая команда — `/figma-to-block-html`. Новые команды для вёрстки будут добавляться сюда. Отдельный boilerplate для вёрстки пока не делаем: верстальщик работает в своём проекте.
- **WordPress** — текущие WP-команды без изменений поведения, в том числе `/figma-to-block` (PHP + Twig + SCSS + ACF JSON). Только здесь выбирается профиль `standard` / `woo`.

---

## 1. Как устроено сейчас и что мешает

Сейчас knowledge собирается из **слоёв по стеку** (`common` → `wordpress` → `woocommerce`), и любой профиль включает WordPress.

| Проблема | Пример |
|---|---|
| Figma-команды читают правило, которое лежит в WP-слое рядом с кодогенерацией | `analyze-figma`, `figma-design-system`, `prep-figma` и их skills читают `rules/figma-to-block.md` (стандарт блоков и слоёв в Figma). Правило нужно дизайнеру, но лежит в слое `wordpress` и названо по команде кодогенерации |
| `figma-seo-structure` ссылается на правила кода | читает `rules/figma-to-code.md` (BEM, SCSS, Twig, PHP) |
| `context.md` и `AGENTS.*.md` статичные | перечисляют все 17 команд и все `rules/boilerplate/*` |
| `.claude/commands` ставятся все 17 сразу | без фильтра |
| Профиль обязателен всегда | `resolveKnowledgeProfile` спрашивает standard/woo даже у дизайнера |
| `plugins.json` и `presets.json` нигде не используются | но ставятся в каждый проект |

Что можно переиспользовать без изменений: сверку по sha256, защиту локальных правок, удаление устаревших файлов, атомарную запись с откатом и `--dry-run` из `packages/cli/src/commands/knowledge/index.ts`. Когда набор снимают, его файлы становятся obsolete и удаляются существующим механизмом.

---

## 2. Модель: наборы как самостоятельные продукты

```
knowledge/
├── version.json
├── packs.json                     ← каталог наборов, команд и вариантов
└── packs/
    ├── base/                      ← ставится всегда: фрагменты context/AGENTS, CLAUDE.md
    ├── shared/                    ← то, что нужно нескольким наборам (см. ниже)
    ├── design/
    ├── slicing/
    ├── wordpress/
    └── woocommerce/               ← вариант wordpress, включается профилем woo
```

### Принципы

1. **Набор не зависит от других наборов.** Design, Slicing и WordPress ставятся по одному или в любой комбинации, и ни в одной комбинации нет битых ссылок.
2. **Стек — это вариант набора WordPress, а не глобальный профиль.** `standard` и `woo` спрашиваются только тогда, когда выбран WordPress.
3. **В проекте каждый набор живёт в своём пространстве имён:** `knowledge/design/…`, `knowledge/slicing/…`, `knowledge/wordpress/…`, `knowledge/shared/…`. Так сразу видно, кому принадлежит файл.
4. **Имена slash-команд уникальны во всём kit.** Если команда нужна нескольким наборам (`/setup-fonts`, `/scan-project`), она лежит в `shared/` и подключается каждым набором, которому нужна.
5. **Наборы общаются через файлы-контракты, а не через чужие правила:**
   - `.wpaikit/design-system.json` пишет Design (`/figma-design-system`), читают Slicing и WordPress;
   - `.wpaikit/project.md` пишет `/scan-project`, читают skills вёрстки.

   Формат контрактов описан в `knowledge/shared/contracts/*.md`. Если файла-контракта нет, это штатная ситуация: команда берёт токены из Figma Variables через MCP или просит файл у дизайнера.

### `shared/`

| Содержимое | Источник | Подключают |
|---|---|---|
| `rules/figma-blocks.md` | текущий `rules/figma-to-block.md`, **содержимое без изменений**: меняются только имя и место | design, slicing, wordpress |
| `/setup-fonts` (prompt + skill) | переезжает как есть (в skill нет WP-упоминаний) | slicing, wordpress |
| `/scan-project` (prompt + skill) | переезжает как есть | slicing, wordpress |
| `contracts/design-system.md` | **новый**: формат `.wpaikit/design-system.json` (собирается из текущих skills) | design, slicing, wordpress |

---

## 3. Содержимое наборов

### Design (дизайнер), 10 команд

`/figma-to-block`, `/figma-to-block-html`, их prompts, skills и правила кода (`figma-to-code.md`) **в Design не попадают**.

| Команда | Что меняется |
|---|---|
| `/analyze-figma` | **правила без изменений** (ACF-ready блоки, поля, repeaters, кандидаты в компоненты). Меняется только путь к правилу: `knowledge/shared/rules/figma-blocks.md` |
| `/prep-figma` | **правила без изменений** (ACF-ready semantic names, Auto Layout, токены). Меняется только путь к правилу |
| `/figma-design-system` | меняется только путь к правилу |
| `/figma-components`, `/figma-sync-tokens`, `/figma-update-design-system` | без изменений |
| `/generate-design`, `/design-quality-check` | без изменений |
| `/figma-seo-structure` | убрать ссылку на `figma-to-code.md`; `components-registry.md` и `project.md` читать опционально, если они есть |
| `/figma-seo-texts` | без изменений |

Правила: `design/rules/design-system-layout.md` переезжает как есть. Плюс `shared/rules/figma-blocks.md`.

### Slicing (верстальщик, без CMS)

Первая версия:

| Команда | Источник | Результат |
|---|---|---|
| `/figma-to-block-html` | **новая**. Блоки в Figma читаются по `shared/rules/figma-blocks.md`: тот же стандарт, по которому их готовят `analyze-figma` и `prep-figma` | `{block}.html` + `{block}.scss` + `{block}.js` (при необходимости) + подключение в главный SCSS |
| `/setup-fonts` | `shared/` | `@font-face` SCSS, woff/woff2 |
| `/scan-project` | `shared/` | `.wpaikit/project.md` |

Правила:

- `slicing/rules/markup.md` — **новый**. Написан по нейтральной части текущего `figma-to-code.md`: BEM, один SCSS-partial на блок, mobile-first, токены вместо сырых значений, модификаторы вариантов, шапка файла, container pattern, цикл валидации SCSS/HTML/JS. Правило 1 формулируется так: «никаких Tailwind-утилит в разметке, только `@apply` в SCSS». Сам `figma-to-code.md` остаётся в WordPress без изменений. Пересечение двух правил — осознанная плата за независимость наборов.
- `slicing/rules/structure.md` — **новый**. Задаёт, куда класть файлы в проекте верстальщика: значения по умолчанию (`src/blocks/{name}/`, `src/components/`, `src/scss/main.scss`, `src/js/`) переопределяются через `.wpaikit/project.md` (Key Directories), как уже сделано в WP-skills. Boilerplate не нужен.

Кандидаты на следующие команды Slicing добавляются в `packs/slicing/` и в `packs.json`, установщик менять не нужно:

- `/design-system-to-code-html` — `tailwind.config.js`, SCSS-токены и HTML-компоненты из `design-system.json`;
- `/scan-components-html` — реестр SCSS- и HTML-компонентов;
- `/validate-code-html` — проверка SCSS, HTML и JS по `markup.md`.

### WordPress, поведение без изменений

| Команда | Что меняется |
|---|---|
| `/figma-to-block` | переезжает как есть; путь к правилу блоков → `shared/rules/figma-blocks.md` |
| `/design-system-to-code`, `/scan-components`, `/validate-code`, `/get-comment-for-frontend` | переезжают как есть |
| `/setup-fonts`, `/scan-project` | из `shared/` |

Правила:

- `wordpress/rules/boilerplate/*` и `wordpress/rules/figma-to-code.md` переезжают как есть;
- плюс `shared/rules/figma-blocks.md`.

Варианты:

- `standard` → `packs/wordpress`;
- `woo` → `packs/wordpress` + `packs/woocommerce`. Rules, checklists, recipes и xlsx-шаблоны ставятся в `knowledge/woocommerce/…`.

### Base (всегда)

`AGENTS.md`, `CLAUDE.md` и `knowledge/context.md` генерируются из фрагментов выбранных наборов. Дизайнер получает `AGENTS.md` и `context.md`, где есть только Figma-команды.

```
knowledge/packs/base/
├── CLAUDE.md
├── context/   header.md, design.md, slicing.md, wordpress.md, footer.md
└── agents/    header.md, wordpress.standard.md, wordpress.woo.md, slicing.md, footer.md
```

- Фрагмент каждого набора содержит строки таблицы команд, ограничения и рекомендуемый порядок запуска.
- Дерево файлов в `context.md` не пишется руками, а генерируется из итогового списка путей.
- Подстановка `{{profile}}` и `{{packs}}` делается через `replaceAll`, без Handlebars.
- Порядок склейки фиксированный (design → slicing → wordpress), поэтому хэши стабильны между запусками.

---

## 4. Каталог `knowledge/packs.json`

```json
{
  "schemaVersion": 1,
  "packs": {
    "design": {
      "label": "Design",
      "hint": "Figma: analysis, design system, components, generation, SEO",
      "shared": ["rules/figma-blocks.md", "contracts/design-system.md"],
      "commands": ["analyze-figma", "figma-design-system", "figma-components", "prep-figma",
                   "figma-sync-tokens", "figma-update-design-system", "generate-design",
                   "design-quality-check", "figma-seo-structure", "figma-seo-texts"]
    },
    "slicing": {
      "label": "Slicing",
      "hint": "Figma → HTML + SCSS + Tailwind + JS",
      "shared": ["rules/figma-blocks.md", "contracts/design-system.md"],
      "commands": ["figma-to-block-html", "setup-fonts", "scan-project"]
    },
    "wordpress": {
      "label": "WordPress",
      "hint": "ACF blocks, Twig, PHP, boilerplate rules",
      "shared": ["rules/figma-blocks.md", "contracts/design-system.md"],
      "variants": {
        "standard": { "label": "WordPress Standard", "extraPacks": [] },
        "woo": { "label": "WooCommerce", "extraPacks": ["woocommerce"] }
      },
      "commands": ["figma-to-block", "design-system-to-code", "scan-components",
                   "validate-code", "get-comment-for-frontend", "setup-fonts", "scan-project"]
    }
  },
  "commands": {
    "analyze-figma": { "pack": "design", "skills": ["figma-design-analysis"] },
    "figma-design-system": { "pack": "design", "skills": ["figma-create-design-system"] },
    "prep-figma": { "pack": "design", "skills": ["figma-prep"] },
    "generate-design": { "pack": "design", "skills": ["generate-design", "design-quality-check"] },
    "setup-fonts": { "pack": "shared" },
    "scan-project": { "pack": "shared" }
  }
}
```

Правила разрешения:

- Команда `X`, у которой источник `S` (имя набора или `shared`), раскрывается в три пути:
  - `knowledge/S/prompts/X.md`;
  - `knowledge/S/skills/<skill>/**` (по умолчанию skill называется так же, как команда);
  - `.claude/commands/X.md`.

  Исходники `.claude/commands` переезжают в `packs/S/claude-commands/`, и `copy-knowledge.mjs` копирует один каталог `knowledge`.
- `packs/P/rules/**` ставится вместе с набором целиком.
- Записи `shared` и shared-команды раскрываются из `packs/shared/` в `knowledge/shared/…`. Дубликаты между наборами схлопываются.
- Zod-валидация каталога:
  - имя команды уникально;
  - у каждой команды есть prompt, skill и claude-command;
  - команда с источником-набором указана только в своём наборе;
  - shared-команда может быть в нескольких наборах.

---

## 5. CLI и UX

```bash
wpaikit knowledge install                          # интерактивно или из manifest
wpaikit knowledge install --packs design           # дизайнер: профиль не спрашивается
wpaikit knowledge install --packs slicing
wpaikit knowledge install --packs slicing,wordpress --wp-profile woo
wpaikit knowledge install --packs all              # = design,slicing,wordpress
```

Как определяется выбор:

1. **Наборы.** Сначала `--packs`. Если его нет, берутся наборы из manifest: обновление ничего не спрашивает. Если нет и manifest, в TTY задаются вопросы, а без TTY (в CI) ставится `all`.
   Вопросы в TTY:
   1. `select`: **All** / **Choose packs**;
   2. `multiselect` (`required: true`): Design, Slicing, WordPress, с подсказками из `packs.json`.
2. **Вариант WordPress** (только если выбран WordPress):
   1. `.wpaikit.json` (`preset`); конфликт с флагом даёт ошибку, как сейчас;
   2. флаг `--wp-profile`;
   3. значение из manifest;
   4. `select`: Standard / WooCommerce.

   Если WordPress не выбран, а передан `--wp-profile`, это ошибка: «WordPress pack is not selected».
3. **Подсказка после установки** (не ошибка): если Slicing или WordPress стоят без Design, выводится сообщение: «`.wpaikit/design-system.json` создаётся командой /figma-design-system (набор Design) или передаётся дизайнером».

Итоговый вывод:

```
Packs:      design + slicing + wordpress (woo)
Commands:   18
Written: 12  Removed: 3  Unchanged: 40
```

В `--dry-run` выводится список путей с пометками `+`, `~`, `-`. При сужении набора важно заранее видеть, что удалится.

`wpaikit init` по умолчанию ставит `all` с вариантом WordPress из `--preset`, как и сейчас. Флаг `--packs` нужен, чтобы это переопределить.

---

## 6. Manifest v2 и миграция существующих проектов

```json
{
  "schemaVersion": 2,
  "knowledgeVersion": "2.0.0",
  "packs": ["design", "slicing", "wordpress"],
  "wordpressProfile": "woo",
  "files": { "knowledge/design/prompts/analyze-figma.md": "sha256…" }
}
```

- `wordpressProfile` есть только при выбранном WordPress, иначе поля нет.
- **Чтение v1:** `profile: X` превращается в `packs: [design, slicing, wordpress]` и `wordpressProfile: X`. Существующие WP-проекты получают всё, что было, плюс Slicing.
- **Переход путей.** Старые пути (`knowledge/prompts/…`, `knowledge/rules/…`) не входят в новый набор, поэтому существующий механизм удалит их как obsolete. Новые запишутся в namespaced-пути. Файлы с локальными правками остановят установку с понятным сообщением, как сейчас.
- **Поведение команд не меняется:** `/figma-to-block` по-прежнему генерирует ACF-блок. Меняются только пути к файлам knowledge, поэтому `knowledge/version.json` получает **2.0.0**.
- `init/steps/create-dir.ts`:
  - `adoptLegacyKnowledge` пишет manifest v2;
  - `readKnowledgeManifest` читает только `files`, менять его не нужно.

---

## 7. Изменения по файлам

| Файл | Изменение |
|---|---|
| `knowledge/packs.json` | **новый** каталог |
| `knowledge/layers/**`, `knowledge/profiles/**`, `knowledge/templates/**` | переезжают в `knowledge/packs/**` по таблицам из раздела 3; затем удаляются |
| `.claude/commands/*.md` | переезжают в `knowledge/packs/<S>/claude-commands/` |
| prompts и skills `analyze-figma`, `prep-figma`, `figma-design-system`, `figma-create-design-system`, `figma-prep`, `figma-to-block` | обновить пути к правилам (`knowledge/shared/rules/figma-blocks.md`, `knowledge/wordpress/rules/…`) |
| все остальные prompts и skills | механически обновить пути `knowledge/…` на namespaced |
| `knowledge/layers/common/{plugins,presets}.json` | удалить: не используются (отдельный коммит) |
| `packages/cli/src/commands/knowledge/packs.ts` | **новый**: схемы, `loadPackCatalog`, `resolvePacks`, `expandPackFiles`, `renderContext`, `renderAgents` |
| `packages/cli/src/commands/knowledge/index.ts` | `buildDesiredFiles` по наборам; manifest v2 и чтение v1; `resolveKnowledgePacks`, `resolveWordpressProfile` вместо `resolveKnowledgeProfile`; вывод `Packs:`; детальный dry-run |
| `packages/cli/scripts/copy-knowledge.mjs` | копировать только `knowledge/` |
| `packages/cli/src/cli.ts` | `--packs`, `--wp-profile` для `knowledge install`; `--packs` для `init` |
| `packages/cli/src/commands/init/index.ts` | проброс `packs` и `wordpressProfile` |
| `packages/cli/src/commands/init/steps/create-dir.ts` | legacy-manifest → v2 |
| `docs/workflow.md`, `docs/index.html` | описать наборы и флаги |

---

## 8. Тесты

1. **Изоляция наборов (главный тест).** Для каждой из 7 непустых комбинаций наборов × вариантов WordPress установить во временную папку. Проверить, что каждое упоминание `knowledge/…` в установленных `.md` указывает на существующий файл.
2. **Границы наборов.**
   - **Design:** нет команд и prompts кодогенерации и нет ссылок на `knowledge/slicing/…`, `knowledge/wordpress/…`, `figma-to-code.md`. ACF-ready именование упоминать можно: это стандарт Figma.
   - **Slicing:** в `packs/slicing/**` нет слов `ACF`, `Twig`, `WordPress`, `WooCommerce`, `PHP`, `wp-content`, `.twig`. Исключения ведутся явно, если понадобятся. Файлы `shared/` под эту проверку не попадают.
3. `--packs design`:
   - нет `knowledge/slicing`, `knowledge/wordpress`, `/setup-fonts`, `/scan-project`;
   - есть `knowledge/shared/rules/figma-blocks.md`;
   - в `.claude/commands` ровно 10 файлов, нет `figma-to-block*.md`;
   - `AGENTS.md` и `context.md` не упоминают правила boilerplate и команды кодогенерации;
   - профиль не запрашивался (prompt замокан и не вызван).
4. `--packs slicing`:
   - есть `figma-to-block-html`, `setup-fonts`, `scan-project`;
   - нет `figma-to-block`;
   - manifest без `wordpressProfile`.
5. `--packs wordpress --wp-profile woo`: набор команд и правил совпадает с текущей установкой профиля `woo` с поправкой на новые пути. Это регрессия «ничего не потеряли».
6. `--packs slicing,wordpress`: `setup-fonts` и `scan-project` установлены по одному разу, нет конфликта путей.
7. Сужение `all` → `design` удаляет slicing и wordpress. При локально изменённом файле установка останавливается.
8. Повторный install без флагов берёт наборы и вариант из manifest, `written === 0`.
9. Миграция с manifest v1 (фикстура со старыми путями): старые файлы удалены, новые на месте, manifest v2.
10. Валидация:
    - каталог: дубли имён команд, отсутствующий prompt или skill, набор-команда в чужом наборе дают ошибку;
    - CLI: `--wp-profile` без wordpress и `--packs all,design` — ошибки.
11. Детерминизм: `context.md` и `AGENTS.md` дают одинаковые хэши при повторной сборке.

---

## 9. Этапы

| Этап | Содержание | Результат |
|---|---|---|
| **1. Каркас** | `packs.json`; переезд в `packs/` с namespaced-путями; `figma-blocks.md` в `shared/`; `setup-fonts` и `scan-project` в `shared/`; обновление путей в prompts и skills; установщик, manifest v2, миграция v1, `--packs`, `--wp-profile`, генерация `context.md`/`AGENTS.md`, фильтр `.claude/commands`. Тесты 1, 3, 5, 7–11 | Выбор Design и WordPress работает; WP-проекты работают как раньше |
| **2. Design** | Убрать из `figma-seo-structure` ссылку на `figma-to-code.md`; `components-registry.md` и `project.md` сделать опциональными. Тест 2 для design включён | **Можно отдавать дизайнерам** |
| **3. Slicing** | `slicing/rules/markup.md` и `structure.md`; `/figma-to-block-html` (prompt + skill + claude-command); фрагменты `context`/`agents` для slicing. Тесты 2 (slicing), 4, 6 | Верстальщик работает без WP |
| **4. Релиз** | Документация, changelog (новые пути, наборы, флаги), knowledge 2.0.0, minor-версия CLI, удаление `plugins.json`/`presets.json` | Публикация |

---

## 10. Принятые решения

- `/figma-to-block` остаётся за WordPress и не меняет поведения. Статическая вёрстка — `/figma-to-block-html` в Slicing.
- Boilerplate для вёрстки пока не делаем. Структура задаётся в `slicing/rules/structure.md` и в `.wpaikit/project.md` проекта.
- `analyze-figma` и `prep-figma` сохраняют ACF-ready правила именования как стандарт Figma для любого проекта.
- `/get-comment-for-frontend` остаётся в WordPress: команда читает БД WP.
