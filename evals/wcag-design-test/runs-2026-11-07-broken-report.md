# WCAG 2.2 AA — WCAG Broken

[Frame в Figma](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-7) · 2026-11-07 · lint: 25 цветовых токенов

**11 критичных · 11 серьёзных · 6 умеренных · 4 совета** · 2 вопроса к вам · 7 групп проверок в браузере

Повторяющиеся замечания сгруппированы: 32 пункта вместо 44.

## Замечания

### 1. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Hero / Hero Subtitle — [2:24](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-24)
- Сейчас: #9CA3AF на #FFFFFF = 2.54:1 (20px/400)
- Нужно: ≥ 4.5:1
- Исправить: текст → gray/500 #6B7280 → 4.83:1. Вариант: #717782 → 4.50:1 (точный минимум; при ручной правке округляйте в сторону большего контраста).
- Кого касается: пользователей со слабым зрением и всех, кто читает с телефона на улице.

### 2. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Hero / Hero Actions / Button Primary / Label — [2:26](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-26)
- Сейчас: #FFFFFF на #60A5FA = 2.54:1 (16px/600)
- Нужно: ≥ 4.5:1
- Исправить: заливка кнопки → blue/600 #2563EB → 5.17:1, белый текст остаётся. Менять в главном компоненте `Button` (State=Default), а не в экземпляре. Вариант: #3377C9 → 4.54:1.
- Кого касается: главное действие страницы — его не прочитает пользователь со слабым зрением.

### 3. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Hero / Hero Actions / Button Ghost / Label — [2:29](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-29)
- Сейчас: #93C5FD на #FFFFFF = 1.8:1 (16px/600)
- Нужно: ≥ 4.5:1
- Исправить: текст → blue/600 #2563EB → 5.17:1. Вариант: #4A79AD → 4.54:1.
- Кого касается: вторую кнопку почти не видно даже при обычном зрении.

### 4. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Hero / Hero Note — [2:30](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-30)
- Сейчас: #111827 с opacity слоя 35 % → видимый #ACAEB3 на #FFFFFF = 2.22:1 (14px/400)
- Нужно: ≥ 4.5:1
- Исправить: opacity слоя 35 % → 100 %: #111827 даёт 17.74:1. Если нужен более светлый тон, задайте цвет токеном, а не прозрачностью.

### 5. 1.4.3 Contrast (Minimum) — Критично · Измерено (пиксели изображения)
- Слои: Promo Banner / Promo Title — [2:32](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-32) и Promo Caption — [2:33](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-33)
- Сейчас: белый текст на светлой части фото. Заголовок: p5 1.04:1 (40px/700, крупный). Подпись: p5 1.04:1 (16px/400).
- Нужно: ≥ 3:1 для заголовка, ≥ 4.5:1 для подписи
- Исправить: подложка slate/900 #0F172A под текстом. Для подписи нужно 60 % (худший случай 4.7:1), для заголовка хватает 50 % (3.41:1). Одна подложка 60 % под обоими слоями. Или поставить текст на сплошную плашку либо на тёмную часть изображения.

### 6. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Gradient CTA / Gradient Text — [2:35](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-35)
- Сейчас: #FFFFFF на градиенте, худшая точка #FFFBEB = 1.04:1 (28px/700, крупный)
- Нужно: ≥ 3:1 на всех точках градиента
- Исправить: подложка slate/900 #0F172A 45 % под текстом → 3.03:1. Или цвет текста gray/500 #6B7280 → 3.88:1 на обеих точках (#FDE68A, #FFFBEB); вариант #848484 → 3.00:1.

### 7. 1.4.3 Contrast (Minimum) — Критично (повышено: заголовок раздела) · Измерено
- Слой: Features / Section Title — [2:37](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-37)
- Сейчас: #A8A8A8 на #F5F5F5 = 2.18:1 (32px/600, крупный)
- Нужно: ≥ 3:1
- Исправить: текст → gray/500 #6B7280 → 4.43:1. Вариант: #8E8E8E → 3.01:1.
- Почему критично: по заголовкам раздела пользователь ориентируется на странице. Lint дал «серьёзно».

### 8. 3.3.2 Labels or Instructions — Критично · Измерено
- Слой: Signup Form / Input Email — [2:69](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-69)
- Сейчас: подписи нет, только placeholder «Email». Он исчезает при вводе.
- Нужно: постоянная видимая подпись над полем или слева от него
- Исправить: подпись «Email» над полем в стиле подписи «Name» (14px/500); placeholder оставить только как пример значения.

### 9. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Signup Form / Input Email / Placeholder — [2:70](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-70)
- Сейчас: #C4C4C4 на #FFFFFF = 1.74:1 (16px/400)
- Нужно: ≥ 4.5:1
- Исправить: текст → gray/500 #6B7280 → 4.83:1. Вариант: #777676 → 4.53:1.

### 10. 3.3.1 Error Identification — Критично · Измерено
- Слой: Signup Form / Input Name — [2:72](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-72)
- Сейчас: ошибка показана только красной рамкой #EF4444, текста ошибки нет. Это также 1.4.1.
- Нужно: ошибка названа текстом рядом с полем
- Исправить: под полем текст ошибки цветом red/600 #DC2626 (4.83:1) с иконкой ошибки: что не так и как исправить. Красную рамку оставить.
- Кого касается: людей, не различающих красный, и пользователей скринридеров.

### 11. 1.4.3 Contrast (Minimum) — Критично · Измерено
- Слой: Signup Form / Submit Button / Label — [2:78](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-78)
- Сейчас: #FFFFFF на #22C55E = 2.28:1 (16px/600)
- Нужно: ≥ 4.5:1
- Исправить: заливка «Submit Button» → green/700 #15803D → 5.02:1, белый текст остаётся. Вариант: #208843 → 4.50:1.

### 12. 2.4.7 Focus Visible — Серьёзно · Измерено
- Слой: компонент `Button` — [2:6](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-6) (используется в Button Primary)
- Сейчас: есть только варианты State=Default и State=Hover, состояния фокуса нет
- Нужно: видимое состояние фокуса (≥ 2px, ≥ 3:1)
- Исправить: вариант State=Focus с обводкой 2px и отступом 2px цветом blue/500 #3B82F6 (3.68:1 на #FFFFFF). Ту же обводку — для остальных интерактивных элементов в коде.

### 13. 1.4.11 Non-text Contrast — Серьёзно · Измерено
- Слой: Header / Header Actions / Icon Button Search — [2:15](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-15)
- Сейчас: иконка #D1D5DB на #FFFFFF = 1.47:1
- Нужно: ≥ 3:1
- Исправить: цвет иконки → gray/500 #6B7280 → 4.83:1. Вариант: #92959B → 3.00:1.

### 14. 1.4.3 Contrast (Minimum) — Серьёзно · Измерено
- Слой: Features / Features Intro — [2:38](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-38)
- Сейчас: #767676 на #F5F5F5 = 4.17:1 (16px/400)
- Нужно: ≥ 4.5:1
- Исправить: текст → gray/600 #4B5563 → 6.93:1. Вариант с минимальным сдвигом: #717070 → 4.53:1.

### 15. 1.4.1 Use of Color — Серьёзно · Измерено
- Слой: Features / Inline Link Paragraph, ссылка «accessibility statement» — [2:40](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-40)
- Сейчас: #2563EB против текста #374151 = 1.99:1, без подчёркивания
- Нужно: подчёркивание или ≥ 3:1 к окружающему тексту
- Исправить: подчеркнуть ссылку. Цвета, который дал бы одновременно 3:1 к тексту и 4.5:1 к фону, здесь нет.

### 16. 1.4.3 Contrast (Minimum) — Серьёзно · Измерено
- Слой: Stats / Stat 3 / Stat Label Regular — [2:60](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-60)
- Сейчас: #8A8A8A на #FFFFFF = 3.45:1 (18.67px/400 — не «крупный»: при 400 крупным считается ≥ 24px)
- Нужно: ≥ 4.5:1
- Исправить: текст → gray/500 #6B7280 → 4.83:1. Вариант: #777676 → 4.53:1.

### 17. 1.4.11 Non-text Contrast — Серьёзно · Измерено
- Слой: Signup Form / Input Email — [2:69](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-69)
- Сейчас: граница поля #E5E7EB, заливка #FFFFFF на #FFFFFF; лучшее значение 1.24:1
- Нужно: ≥ 3:1 для границы поля
- Исправить: рамка → gray/500 #6B7280 → 4.83:1. Вариант: #939599 → 3.00:1.

### 18. 1.4.11 Non-text Contrast — Серьёзно · Измерено · 3 слоя
- Слои: Checkbox Row / Checkbox — [2:75](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-75), Slider Thumb Min — [2:86](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-86), Slider Thumb Max — [2:87](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-87)
- Сейчас: рамка #D1D5DB, заливка #FFFFFF на #FFFFFF; лучшее значение 1.47:1
- Нужно: ≥ 3:1
- Исправить: рамка → gray/500 #6B7280 → 4.83:1 у всех трёх. Вариант: #92959B → 3.00:1.

### 19. 2.5.7 Dragging Movements — Серьёзно · По скриншоту
- Слой: Price Filter / Price Range Slider — [2:83](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-83)
- Сейчас: диапазон цен меняется только перетаскиванием ползунков. Рядом только текст «$20 — $80», полей ввода нет.
- Нужно: способ задать диапазон одним нажатием или кликом
- Исправить: поля «Min» и «Max» (или кнопки ±) рядом со слайдером; ползунки оставить.
- Кого касается: людей с тремором, пользователей switch-устройств и голосового управления.

### 20. 2.5.8 Target Size (Minimum) — Серьёзно · Измерено · 3 слоя
- Слои: Testimonials / Carousel / Carousel Dots / Dot 1–3 — [2:96](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-96), [2:97](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-97), [2:98](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-98)
- Сейчас: цели 8×8; 24px-круг каждой задевает соседнюю точку
- Нужно: ≥ 24×24 или 24px между центрами маленьких целей
- Исправить: область нажатия ≥ 24×24 — по 8px отступа с каждой стороны, видимая точка 8×8 может остаться. Или увеличить расстояние на 8px. Для касаний лучше 44×44.

### 21. 1.4.3 Contrast (Minimum) — Серьёзно · Измерено
- Слой: Footer / Footer Text — [2:100](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-100)
- Сейчас: #6B7280 на #1F2937 = 3.04:1 (14px/400)
- Нужно: ≥ 4.5:1
- Исправить: текст → gray/400 #9CA3AF → 5.78:1. Вариант: #878F9D → 4.51:1.

### 22. 2.5.8 Target Size (Minimum) — Серьёзно · Измерено · 3 слоя
- Слои: Footer / Social Links / Social Link X — [2:102](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-102), LinkedIn — [2:105](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-105), GitHub — [2:108](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-108)
- Сейчас: цели 16×16; 24px-круги задевают соседние иконки
- Нужно: ≥ 24×24 или 24px между центрами
- Исправить: по 4px отступа с каждой стороны (область нажатия 24×24) или увеличить расстояние на 4px.

### 23. 1.3.2 Meaningful Sequence — Умеренно · Измерено
- Слой: Features / Feature Cards — [2:41](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-41)
- Сейчас: порядок слоёв Card 3, Card 1, Card 2, а на экране Card 1, Card 2, Card 3
- Исправить: переставить слои в порядок Card 1, Card 2, Card 3 или включить для «Feature Cards» auto layout.

### 24. 1.3.3 Sensory Characteristics — Умеренно · Измерено
- Слой: Signup Form / Form Instruction — [2:68](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-68)
- Сейчас: «Fill in the form and click the green button to continue.»
- Исправить: называть кнопку по её тексту: «…select “Continue”…».

### 25. 1.4.12 Text Spacing (и 1.4.4) — Умеренно · Измерено
- Слой: Signup Form / Helper Text — [2:80](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-80)
- Сейчас: текстовый блок фиксированного размера 400×20; при увеличенных интервалах или зуме текст обрежется
- Исправить: Auto height (textAutoResize HEIGHT).

### 26. 1.4.11 Non-text Contrast — Умеренно · Измерено
- Слой: Price Filter / Price Range Slider / Range — [2:85](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-85)
- Сейчас: индикатор выбранного диапазона #60A5FA на #FFFFFF = 2.54:1
- Исправить: заливка → blue/500 #3B82F6 → 3.68:1. Вариант: #5397EB → 3.00:1.

### 27. 1.3.1 Info and Relationships (и 2.4.6) — Умеренно · Измерено
- Слой: Testimonials / Testimonials Title — [2:90](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-90)
- Сейчас: «Loved by agencies» оформлен как H1 (56px), хотя H1 уже есть — «Build faster with Acme»
- Исправить: оформить как H2, 32px, как «Everything you need».

### 28. 1.4.11 Non-text Contrast — Умеренно · Измерено · 2 слоя
- Слои: Carousel Dots / Dot 2 — [2:97](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-97), Dot 3 — [2:98](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-98)
- Сейчас: неактивные точки #D1D5DB на #FFFFFF = 1.47:1
- Исправить: заливка → gray/500 #6B7280 → 4.83:1. Вариант: #92959B → 3.00:1.

### 29. 1.3.1 Info and Relationships — Совет · Измерено
- Слой: WCAG Broken — [2:7](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-7)
- Сейчас: ни у одного из 44 текстовых слоёв нет Text Style, поэтому уровни заголовков нигде не заданы
- Исправить: создать и применить Text Styles. Предложение, уровни подтвердите: H1 56px, H2 40px, H3 32px, H4 28px, Body 16px. Карта заголовков — в разделе «Для разработки».

### 30. 2.5.5 Target Size (Enhanced, AAA) — Совет · Измерено · 4 слоя
- Слои: Icon Button Close 20×20 — [2:19](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-19), Checkbox 16×16 — [2:75](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-75), Slider Thumb Min/Max 20×20 — [2:86](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-86), [2:87](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-87)
- Сейчас: проходят 2.5.8 только за счёт исключения по отступам
- Исправить: область нажатия 44×44 — 12px отступа вокруг элементов 20×20, 14px вокруг чекбокса 16×16.

### 31. 1.4.12 Text Spacing — Совет · Измерено
- Слой: Features / Features Body — [2:39](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-39)
- Сейчас: 16px, line-height 17.6px (1.1)
- Исправить: line-height 24px (1.5).

### 32. Best practice — Совет · Измерено
- Слой: Signup Form / Legal Text — [2:79](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-79)
- Сейчас: текст 11px
- Исправить: не меньше 12px; для юридического текста и подписей — 13–14px.

## Нужен ваш ответ

1. **Карусель отзывов листается сама?** (2.2.2 Pause, Stop, Hide — [2:91](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-91)). Если да, это нарушение: нужна видимая кнопка Pause/Play (≥ 24×24, с подписью) рядом со слайдами. Если нет, отметьте в handoff, что карусель листается только вручную.
2. **«Terms of Service» и «Privacy Policy» в Legal Text — ссылки?** ([2:79](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=2-79)). На скриншоте они того же цвета, что и текст, и без подчёркивания. Если это ссылки, это нарушение 1.4.1: их нужно подчеркнуть.

## Не проверено

- **Логотип «Acme» в шапке.** Обычно это ссылка на главную, но слой не назван как ссылка, поэтому размер цели (2.5.8) и фокус не измерялись. Назовите слой, например `Logo Link`.
- **1.4.10 Reflow.** Мобильного frame нет, поэтому адаптивность не проверена. Это не нарушение, а непроверенный пункт.
- **2.4.13 Focus Appearance.** Качество обводки фокуса (толщина, контраст) в Figma не измеряется.

## Проверить в браузере

- **Фокус** у элементов без варианта Focus в Figma: Nav Link Products/Pricing/About, Icon Button Search/Close/Share, Button Ghost, Input Email, Input Name, Checkbox, Submit Button, Slider Thumb Min/Max, Dot 1–3, Social Link X/LinkedIn/GitHub.
- **Клавиатура (2.1.1, 2.4.3).** Порядок Tab: навигация → поиск → закрыть → Get started → Learn more → форма → слайдер → точки карусели → соцсети. Ползунки двигаются стрелками. Перед навигацией есть skip link.
- **Доступные имена (4.1.2, 2.5.3)** у кнопок-иконок: Search → «Поиск», Close → «Закрыть» (и что именно закрывает), Share → «Поделиться», соцсети → «Acme в X / LinkedIn / GitHub», точки карусели → «Отзыв 1 из 3».
- **Статусные сообщения (4.1.3).** Успешная отправка формы и ошибки полей объявляются скринридеру.
- **Zoom 200 % и ширина 320px (1.4.4, 1.4.10).** Hero, форма и слайдер не обрезаются.
- **Анимации (2.2.2, 2.3.3).** Карусель уважает `prefers-reduced-motion`.
- **Страница (3.1.1, 2.4.2).** Задан `lang`, у страницы осмысленный `title`.

## Для разработки

**Структура заголовков (предложение).**
- h1 «Build faster with Acme» (2:23)
- h2 «Summer sale — up to 40% off» (2:32)
- h2 «Everything you need» (2:37); h3 — заголовки карточек Plan / Build / Launch
- h2 «Create your account» (2:67)
- h2 «Loved by agencies» (2:90)
- «Join 10,000 teams building with Acme» (2:35) — абзац-призыв, не заголовок.
- «12k», «98%», «4.9» (2:53, 2:56, 2:59) — не заголовки: разметить как список или `<dl>` с подписями.

**Изображения.** Promo Banner (2:31, 1440×360) — фон. Текст поверх него живой, поэтому `alt=""` или CSS-фон.

**Кнопки-иконки** — имена из раздела «Проверить в браузере».

**Формы.**
- Email: подпись «Email», `type="email"`, `autocomplete="email"`.
- Name: подпись есть; ошибка, например «Введите имя полностью», связана с полем через `aria-describedby`, плюс `aria-invalid`.
- Чекбокс: «I agree to the terms» — `<label>` чекбокса.
- Слайдер: два `input type="range"` с подписями «Минимальная цена» / «Максимальная цена», плюс поля Min/Max (см. п. 19).

## Измерено

| Критерий | Проверено | Не прошло |
|---|---|---|
| 1.4.3 Contrast (Minimum) | 44 | 13 |
| 1.4.11 Non-text Contrast | 15 | 8 |
| 2.5.8 Target Size (Minimum) | 20 | 6 |
| 3.3.2 Labels or Instructions | 2 | 1 |
| 1.4.1 Use of Color | 1 | 1 |
| 1.4.12 Text Spacing | 1 | 1 |
| 2.4.7 Focus Visible | 1 | 1 |
| 3.3.1 Error Identification | 1 | 1 |
| 1.3.2 Meaningful Sequence | 1 | 1 |

Ни один измеренный критерий не прошёл полностью.
