# layout-lint — эталон для прогона

Скрипт: `knowledge/packs/design/skills/generate-design/scripts/layout-lint.js` (проверка макета для `/generate-design`, только чтение).

`golden.json` описывает страницу `Layout lint` (`69:6`) в Figma-файле [wpaikit — WCAG test fixtures](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV):

- `Layout Broken` (`69:7`) — 12 заложенных дефектов (`broken.expected`) и элементы, которые не должны срабатывать (`broken.mustNotFlag`): бейдж внутри карточки, однострочный ряд с иконкой, вкладки вплотную в группе `Tabs`, текст под лентой.
- `Layout Clean` (`69:42`) — исправленная копия: 0 находок.

Как проверить после правки скрипта:

1. Вставить скрипт в `use_figma` с `targets: ['69:7', '69:42']`.
2. Сравнить `findings` (строки `check|nodeId|severity|name|detail`) с `broken.expected` по `check` + `name`; на `69:42` находок быть не должно.
3. Прогнать на живом макете из `realDesign` и сравнить с описанием: новые находки проверить скриншотом, прежде чем считать их шумом или дефектом.

Не редактировать кадры фикстуры вручную: при изменении обновить `golden.json`.
