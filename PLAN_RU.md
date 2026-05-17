# wpaikit — План разработки (обзор)

## Что это такое

`wpaikit` — инструмент командной строки для быстрого разворачивания WordPress-сайтов на основе нашего boilerplate, а также для разработки блоков и дизайн-систем с помощью AI-агентов (Claude Code, Codex).

**Пакет в npm**: `@golden/wp-ai-kit`  
**Команда в терминале**: `wpaikit`

---

## Главная идея

Всё делится на два слоя:

**Слой 1 — AI агенты** (Claude Code, Codex)
Команды типа `/create-block`, `/init-site` — AI читает правила, генерирует код, принимает решения.

**Слой 2 — wpaikit CLI**
Детерминированные операции: скачать WP, переименовать файлы, создать структуру блока по шаблону, обновить токены. Никакого AI здесь — только надёжная работа с файловой системой.

**Правило**: если операцию можно описать алгоритмом — делает CLI. Если нужна интерпретация (Figma → код, описание → поля блока) — делает AI.

---

## Фазы разработки

### Фаза 0 — Настройка репозитория
Инициализируем pnpm монорепо, настраиваем TypeScript, тесты, линтер, GitHub Actions. После этой фазы команда `wpaikit --version` должна работать локально.

---

### Фаза 1 — Ядро (`packages/core`)
Вспомогательные модули, которые используют все остальные части:
- **logger** — красивый вывод в терминал со спиннерами
- **exec** — запуск shell-команд с маскировкой паролей в логах
- **prompts** — интерактивные вопросы в терминале
- **config** — чтение/запись `.wpaikit.json` в корне проекта
- **errors** — типизированные ошибки
- **rollback** — стек отката: если что-то пошло не так, всё возвращается назад

---

### Фаза 2 — `wpaikit init` ⭐
Главная команда. Разворачивает новый WP-проект одной командой.

**Что происходит при запуске `wpaikit init --name my-project`:**

1. Создаётся папка `my-project/`
2. Скачивается последняя стабильная версия WordPress с официального сайта
3. Клонируется наш boilerplate репо, `wp-content/` копируется в проект
4. Всё переименовывается автоматически:
   - Папка темы: `boilerplate` → `my-project`
   - PHP namespace: `Boilerplate\` → `MyProject\`
   - Text domain: `boilerplate` → `my-project`
   - ACF ключи, CSS, JSON — тоже обновляются везде
5. Создаётся `wp-config.php` с уже заполненным `DB_NAME`
6. Запускается `composer install` и `npm install && npm run build` (если доступны)
7. Выводятся инструкции: настрой БД, настрой сервер — готово

**Сервер и база данных** — каждый разработчик настраивает сам (nginx, MAMP, Herd — кто как хочет). `wpaikit init` занимается только файлами.

**Флаги:**
```bash
wpaikit init --name my-project           # запуск с вопросами
wpaikit init --name my-project --yes     # без вопросов (для CI)
wpaikit init --name my-project --dry-run # показать что будет сделано, без изменений
wpaikit init --name my-project --skip-install  # пропустить composer/npm
```

---

### Фаза 3 — `wpaikit doctor` + публикация v0.1.0
- `wpaikit doctor` — проверяет окружение: node, git, composer, npm, права на запись
- Пишем тесты для всего что сделали
- Публикуем первую версию `@golden/wp-ai-kit@0.1.0` в npm

---

### Фаза 4 — Knowledge Base (база знаний)
Набор markdown-файлов в `knowledge/rules/` — нейтральные правила без привязки к конкретному AI-инструменту. Адаптеры (Claude Code, Codex) превращают их в skills/rules для своей среды.

**Что пишем:**

- **`wp-boilerplate.md`** — структура темы, конвенции именования, build pipeline, стандарты PHP/JS/CSS
- **`acf-blocks.md`** — анатомия ACF блока: PHP класс + Twig шаблон + ACF JSON, правила sanitize, autoescape в Twig
- **`figma-to-block.md`** — как превратить Figma-дизайн в блок: маппинг переменных, auto-layout → flex/grid, типографика, что нельзя делать
- **`design-system.md`** — структура `tailwind.config.js`, токены, синхронизация с Figma

**Шаблоны блоков** (`knowledge/templates/block/`):
Три Handlebars-шаблона под нашу архитектуру (ACF блоки, не нативный Gutenberg):
- `BlockName.php.hbs` — PHP класс
- `BlockName.twig.hbs` — Twig шаблон
- `group_block_name.json.hbs` — ACF JSON группа

---

### Фаза 5 — Команды для работы с блоками + v0.2.0

**`wpaikit create-block <name>`** — создаёт новый ACF блок из шаблонов:
```bash
wpaikit create-block Hero
# Создаёт:
# blocks/HeroBlock/HeroBlock.php
# views/blocks/HeroBlock/HeroBlock.twig
# acf-json/group_myproject_hero_block.json
```

**Вспомогательные команды:**
```bash
wpaikit list-blocks --json      # список всех блоков в проекте
wpaikit theme-info --json       # информация о теме (пути, namespace, версии)
wpaikit list-tokens --json      # дизайн-токены из tailwind.config.js
wpaikit apply-tokens tokens.json # обновить токены (с бэкапом перед изменением)
```

---

### Фаза 6 — Универсальные промпты
Файлы в `knowledge/prompts/` — инструкции для AI агентов. Написаны нейтрально, без привязки к Claude Code или Codex. Адаптеры потом превращают их в команды для конкретной среды.

**Что пишем:**
- `init-site.md` — как запустить `wpaikit init`
- `create-block.md` — создать ACF блок по описанию
- `create-block-by-figma.md` — создать блок из Figma дизайна
- `create-design-system.md` — синхронизировать дизайн-систему с Figma

---

### Фаза 7 — Claude Code адаптер + v0.3.0
Генерирует из `knowledge/` файлы для Claude Code:

- `.claude/commands/*.md` — slash-команды (`/create-block`, `/init-site`)
- `.claude/skills/*/SKILL.md` — skills (правила которые AI читает автоматически когда нужно)

```bash
wpaikit install claude-code           # установить в текущий проект
wpaikit install claude-code --global  # установить глобально в ~/.claude/
wpaikit sync claude-code              # обновить после новой версии пакета
```

**Готово когда**: `/create-block Hero` в Claude Code создаёт рабочий блок.

---

### Фаза 8 — Codex адаптер + v0.4.0
Генерирует из `knowledge/` файлы для Codex:

- `AGENTS.md` — индекс с описанием команд и ссылками на правила
- `docs/rules/*.md` — скопированные правила из knowledge (Codex читает их по ссылке)
- `~/.codex/prompts/*.md` — промпты адаптированные под Codex

```bash
wpaikit install codex
wpaikit sync codex
```

**Готово когда**: тот же сценарий `/create-block Hero` работает в Codex с тем же результатом.

---

### Фаза 9 — Figma интеграция + v0.5.0
- Тестируем и финализируем промпт `create-block-by-figma`
- Добавляем 5+ примеров в `knowledge/examples/figma-pairs/` (скриншот Figma + готовый блок + пояснения)
- Документируем ограничения Figma MCP

**Цель качества**: менее 30% сгенерированных блоков требуют ручных правок.

---

### Фаза 10 — Design System + v0.6.0
- Тестируем промпт `create-design-system` на реальных Figma-дизайнах
- Финализируем `wpaikit apply-tokens` с полноценным rollback

---

### Фаза 11 — Документация + релиз v1.0.0
- Пишем документацию: setup для Claude Code, Codex, архитектура, как добавить свою команду
- QA на macOS, Linux, WSL
- Публикуем `@golden/wp-ai-kit@1.0.0`

---

## Версии и что в них входит

| Версия | Что появляется |
|---|---|
| **0.1.0** | `wpaikit init` — разворачивает WP-проект одной командой |
| **0.2.0** | `wpaikit create-block` — создаёт ACF блок из шаблонов |
| **0.3.0** | `/create-block` работает в Claude Code |
| **0.4.0** | `/create-block` работает в Codex |
| **0.5.0** | `/create-block-by-figma` — блок из Figma дизайна |
| **0.6.0** | `/create-design-system` — дизайн-система из Figma |
| **1.0.0** | Полный релиз с документацией |

---

## После версии 1.0 (roadmap)

- MCP сервер — более глубокая интеграция с AI через стандартный протокол
- `wpaikit create-cpt` — создание Custom Post Types
- `wpaikit create-pattern` — Gutenberg block patterns
- `wpaikit deploy` — деплой на staging/production
- Адаптеры для Cursor и Windsurf
- Пресет для WooCommerce (`boilerplate-wp-woo`)
- VS Code расширение

---

## Безопасность

- Пароли только через интерактивный ввод или переменные окружения — никогда через флаги в командной строке
- Пароли маскируются в логах
- Токены не хранятся в `.wpaikit.json`
- Телеметрия только с явного согласия
