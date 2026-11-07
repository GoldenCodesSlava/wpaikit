# WCAG 2.2 AA — WCAG Clean

[Frame в Figma](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=3-3) · 2026-11-07 · lint: 25 цветовых токенов

**0 критичных · 0 серьёзных · 0 умеренных · 4 совета** · 1 вопрос к вам · 7 групп проверок в браузере

## Замечания

### 1. 1.3.1 Info and Relationships — Совет · Измерено
- Слой: WCAG Clean — [3:3](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=3-3)
- Сейчас: ни у одного из 50 текстовых слоёв нет Text Style, поэтому уровни заголовков нигде не заданы
- Исправить: создать и применить Text Styles. Предложение, уровни подтвердите: H1 56px, H2 40px, H3 32px, H4 28px, Body 16px.

### 2. 2.5.5 Target Size (Enhanced, AAA) — Совет · Измерено
- Слой: Signup Form / Checkbox Row / Checkbox — [3:70](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=3-70)
- Сейчас: 20×20; проходит 2.5.8 только за счёт исключения по отступам
- Исправить: область нажатия 44×44 — 12px отступа вокруг (например, кликабельна вся строка с подписью).

### 3. 1.4.12 Text Spacing — Совет · Измерено · 2 слоя
- Слои: Signup Form / Legal Text — [3:74](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=3-74) (13px, line-height 15.6px) и Helper Text — [3:75](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=3-75) (14px, line-height 16.8px)
- Исправить: line-height 20px и 21px соответственно (1.5).

## Нужен ваш ответ

1. **«Terms of Service» и «Privacy Policy» в Legal Text — ссылки?** ([3:74](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV/?node-id=3-74)). На скриншоте они того же цвета, что и текст, и без подчёркивания. Если это ссылки, это нарушение 1.4.1: их нужно подчеркнуть.

## Не проверено

- **Логотип «Acme».** Слой не назван как ссылка, поэтому размер цели и фокус не измерялись.
- **1.4.10 Reflow.** Мобильного frame нет.
- **2.4.13 Focus Appearance.** Качество обводки фокуса не измеряется.

## Проверить в браузере

- **Фокус** у элементов без варианта Focus в Figma: навигация, Icon Button Search/Close/Share, Button Ghost, поля Email/Name/Min/Max, Checkbox, Submit Button, Slider Thumb Min/Max, Carousel Prev/Next/Pause, ссылки на соцсети.
- **Клавиатура (2.1.1, 2.4.3).** Порядок Tab; ползунки двигаются стрелками; Pause доступна с клавиатуры.
- **Доступные имена (4.1.2, 2.5.3).** Search, Close, Share, Prev («Предыдущий отзыв»), Next, Pause/Play (имя меняется вместе с состоянием), соцсети.
- **Статусные сообщения (4.1.3).** Ошибка поля Name объявляется скринридеру; смена слайда «1 / 3».
- **Zoom 200 % и ширина 320px (1.4.4, 1.4.10).**
- **Анимации (2.2.2, 2.3.3).** Автопрокрутка останавливается по Pause и при `prefers-reduced-motion`.
- **Страница (3.1.1, 2.4.2).** `lang`, `title`.

## Для разработки

**Заголовки.** h1 «Build faster with Acme» (3:19); h2 «Summer sale — up to 40% off» (3:27), «Everything you need» (3:32), «Create your account» (3:62), «Loved by agencies» (3:85); h3 — Plan / Build / Launch. «12k / 98% / 4.9» (3:48, 3:51, 3:54) — не заголовки, а список с подписями.

**Изображения.** Promo Banner (3:26) — фон, `alt=""`.

**Формы.** Name: текст ошибки связан с полем через `aria-describedby`, плюс `aria-invalid`. Поля Min и Max связаны со слайдером.

## Измерено

| Критерий | Проверено | Не прошло |
|---|---|---|
| 1.4.3 Contrast (Minimum) | 50 | 0 |
| 2.5.8 Target Size (Minimum) | 22 | 0 |
| 1.4.11 Non-text Contrast | 17 | 0 |
| 3.3.2 Labels or Instructions | 4 | 0 |
| 1.4.1 Use of Color | 1 | 0 |
| 2.4.7 Focus Visible | 1 | 0 |
| 3.3.1 Error Identification | 1 | 0 |
| 1.3.2 Meaningful Sequence | 1 | 0 |

Все измеренные критерии пройдены. Это не значит, что frame полностью доступен: см. «Не проверено» и «Проверить в браузере».
