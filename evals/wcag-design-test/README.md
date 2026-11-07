# wcag-design-test — эталон для прогона

`golden.json` описывает Figma-файл [wpaikit — WCAG test fixtures](https://www.figma.com/design/lQPJj2qNkhHO70ArdD5raV):

- `WCAG Broken` (`2:7`) — 35 заложенных нарушений (`broken.expected`), 3 необязательных (`broken.optional`) и 8 граничных случаев, которые не должны срабатывать (`broken.mustNotFlag`).
- `WCAG Clean` (`3:3`) — исправленная копия: 0 critical/serious (`clean`).

Как оценивать прогон `/wcag-design-test` (или только lint-скрипта):

1. Запустить на `?node-id=2-7` и на `?node-id=3-3`.
2. Сохранить `compact` из результата в файл (по строке `criterion|nodeId|severity|parentId`) и запустить `python3 -I score.py broken FILE` / `python3 -I score.py clean FILE`. Скрипт сопоставляет замечания с `expected` по `criterion` + `nodeId` (или `alsoNodeIds`, или находка на прямом потомке этого узла).
3. Цели: recall группы `lint` ≥ 90 %; 0 попаданий в `mustNotFlag`; на Clean — 0 critical/serious.
4. Проверить, что исходные frame'ы не изменились (сравнить `exportAsync` до/после) и что повторный запуск не плодит отчёты и аннотации.

`runs-2026-11-06-*.txt` — эталонные прогоны lint (Этап 1) и предложенные исправления (Этап 2, `*-fixes.txt`, проверка: `python3 -I score.py fixes FILE`). В файле-фикстуре есть коллекция Variables `Colors` (25 цветов) для подбора токенов.

`runs-2026-11-07-*` — сухой прогон всего скилла (Этап 3): итоговые severity после повышения (`*-broken.txt`, `*-clean.txt`) и образцы отчётов (`*-report.md`).

`spike-text-over-image.js` — проверенный скрипт для `use_figma`: пиксельный контраст текста на изображении (основа для Этапа 1).

Не редактировать frame'ы фикстуры вручную: при изменении — обновить `golden.json` (node ID и значения).

`build-lint.mjs` собирает `knowledge/packs/design/skills/wcag-design-test/scripts/wcag-lint.min.js` из `wcag-lint.js` (esbuild, `CONFIG` остаётся первой строкой). После любой правки исходника: `node evals/wcag-design-test/build-lint.mjs`. Тест `knowledge.test.ts` падает, если сборка устарела.

