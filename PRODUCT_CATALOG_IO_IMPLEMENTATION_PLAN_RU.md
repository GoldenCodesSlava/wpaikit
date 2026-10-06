# WPAIKit Product Catalog I/O — план реализации

## 1. Решение

Реализовать импорт и экспорт каталога как отдельный first-party WordPress plugin
`wpaikit-product-catalog-io`, а не как сервис темы.

Причины:

- импорт относится к данным магазина, а не к presentation layer темы;
- смена темы не должна отключать импорт, экспорт, журнал заданий или идентификаторы;
- тяжёлая XLSX-зависимость не должна загружаться на storefront;
- plugin можно тестировать и обновлять независимо от boilerplate;
- сохраняется действующее правило boilerplate: товарные импортёры не находятся в theme core;
- один и тот же модуль сможет обслуживать все WooCommerce-проекты WPAIKit.

Модуль является WooCommerce-only. Переключателя WooCommerce не требуется. Он должен поддерживать
оба multilingual-профиля boilerplate: `wpml` и `none`.

## 2. Что взять из SkinCareBoutique

Полезные идеи:

- импорт категорий, брендов и `product_attribute` до товаров;
- поддержка RO/RU/EN и связей WPML;
- импорт featured image и gallery;
- поддержка `variant_parent`, `is_main`, `variant_label`;
- отчёт о количестве созданных, обновлённых и пропущенных объектов;
- отдельный узкий экспорт для массового редактирования.

Что нельзя переносить как основу:

- один `ImportService.php` размером более 3500 строк;
- файлы данных внутри активной темы;
- жёстко заданный default language `ro` и список `ro/ru/en` в runtime-коде;
- жёстко заданные term IDs брендов;
- поиск товаров по title;
- прямой доступ к `$sitepress` и таблицам WPML из domain layer;
- обработку всего файла за один AJAX-запрос;
- обновление без отдельного preflight;
- удаление всех ID последнего импорта как псевдо-rollback;
- экспорт через raw SQL только четырёх колонок, который нельзя импортировать обратно без потерь.

## 3. Границы первой версии

### Входит в v1

- XLSX import/export;
- standalone simple products;
- custom variant groups boilerplate, где каждый вариант является simple product;
- цены, sale price, SKU, stock, backorders, dimensions и tax class;
- статусы `draft`, `publish`, `private`;
- WPML-переводы товаров и терминов;
- профиль без WPML;
- категории `product_cat`;
- WooCommerce brands, если taxonomy зарегистрирована;
- custom hierarchical taxonomy `product_attribute`;
- featured image и gallery из Media Library, относительного upload path или разрешённого HTTPS URL;
- dry-run/preflight;
- пакетная фоновая обработка;
- журнал, downloadable error report и безопасный rollback созданных объектов/изменённых полей;
- полный round-trip export;
- быстрый import/export цен и остатков.
- упрощённый клиентский XLSX с автогенерацией SKU, `variant_of_sku` и тремя понятными режимами
  остатка;
- серверная выдача клиентского шаблона с атомарно зарезервированным диапазоном SKU.

### Не входит в v1

- native WooCommerce variable products и `product_variation`;
- заказы, клиенты, купоны и отзывы;
- arbitrary post meta без allowlist;
- автоматический перевод контента;
- удаление отсутствующих в файле товаров;
- синхронизация с ERP/API по расписанию;
- CSV/JSON как публичный пользовательский формат;
- импорт PHP-формул или вычисление Excel-формул.

## 4. Формат файлов

### 4.1 Полный каталог

Файл `wpaikit-products-full-import.xlsx` содержит листы:

1. `README` — версия схемы, порядок работы, правила пустых значений.
2. `Products` — одна строка на один продаваемый simple product.
3. `Translations` — локализованный контент по `product_key + language`.
4. `Terms` — определения категорий, брендов и custom attributes.
5. `Product Terms` — назначения терминов товарам.
6. `Media` — featured/gallery изображения.
7. `Custom Fields` — только логические имена полей из allowlist проекта.
8. `Lists` — служебные значения для Excel validation; лист скрывается в production template.

`product_key` является обязательным стабильным внешним идентификатором. Он сохраняется в
`_wpaikit_product_key` и не зависит от WordPress ID, title или slug. Для переводов одного товара
используется один `product_key`.

Для custom variants:

- каждый вариант имеет собственный `product_key` и строку в `Products`;
- все варианты имеют общий `variant_group_key`;
- ровно один вариант группы имеет `is_main = yes`;
- anchor получает `variant_parent = own translated ID` и `is_main = 1`;
- sibling получает `variant_parent = translated anchor ID` и `is_main = 0`;
- все участники остаются WooCommerce simple products;
- importer отклоняет chained anchors, несколько main-вариантов и cross-language links.

### 4.2 Быстрое обновление цен и остатков

Файл `wpaikit-products-price-stock-import.xlsx` содержит один рабочий лист:

- `operation`;
- `product_key`;
- `sku` как диагностический и опциональный fallback identifier;
- `regular_price`;
- `sale_price`;
- `manage_stock`;
- `stock_quantity`;
- `stock_status`;
- `backorders`;
- `notes` — игнорируется импортёром.

Это отдельный безопасный режим: он не меняет title, translations, taxonomy, media, status или
custom variation links.

### 4.3 Термины каталога

Файл `wpaikit-product-terms-import.xlsx` предназначен для подготовки категорий, брендов и
`product_attribute` до импорта товаров. Он содержит `README`, `Terms` и `Lists`.

### 4.4 Упрощённый клиентский импорт

Файл `wpaikit-products-client-import.xlsx` предназначен для владельца магазина, которому не
нужно видеть внутренние `product_key`, `variant_group_key`, `is_main`, `manage_stock` и
WooCommerce meta. Его базовые листы — `README`, `Settings`, `Products` и `Lists`. Отдельного листа
`Variant Groups` нет. Production-шаблон дополнительно генерирует `Product Content`, `Categories`,
`Brands`, обязательный `Product Attributes` и отдельный лист для каждой разрешённой проектной
таксономии.

Рабочие колонки листа `Products`:

- `operation` — `create`, `update` или `skip`;
- `product_name` — понятное название физического товара/варианта;
- `sku_override` — необязательный собственный SKU клиента;
- `_sku_index` — защищённый порядковый номер, записанный в шаблон как значение;
- `sku` — защищённая формула: `sku_override`, если он заполнен, иначе
  `<sku_prefix>-<reserved_start + _sku_index>`;
- `variant_of_sku` — пусто для самостоятельного/главного товара либо SKU главного варианта,
  выбранный из dropdown;
- `variant_label` — подпись варианта, например `50 ml` или `Light`;
- `stock_mode` — `unlimited`, `track` или `out_of_stock`;
- `stock_quantity` — обязательно только для `track`;
- `regular_price`, `sale_price`;
- защищённые диагностические колонки `stock_check`, `sku_check`, `variation_role`, `link_check`.

Правила вариаций:

- строка с непустым `variant_of_sku` является `VARIANT`;
- строка, на SKU которой ссылается хотя бы один вариант, автоматически является `MAIN`;
- строка без ссылки и без входящих ссылок является `STANDALONE`;
- checkbox главного варианта и ручной `variant_group_key` клиент не заполняет;
- self-reference, ссылка на отсутствующий SKU, цепочка `variant -> variant`, цикл и duplicate SKU
  являются preflight errors;
- импортёр преобразует `variant_of_sku` во внутренние `product_key`, `variant_parent` и `is_main`.

Правила таксономий:

- каждый taxonomy sheet содержит таблицу терминов и отдельную таблицу назначений по SKU;
- один SKU можно повторять в assignments и назначать ему несколько `category_key`, `brand_key`,
  attribute values или ключей другой таксономии;
- отдельного `primary = yes/no` нет: первое назначение данного типа для SKU по порядку строк
  считается primary, остальные — дополнительными;
- порядок строк является частью import contract и сохраняется при client export;
- повтор одной и той же пары `SKU + taxonomy key` является preflight error;
- `Product Attributes` всегда присутствует в WooCommerce-проекте, потому что его значения
  используются custom variations и storefront-фильтрами;
- `variant_of_sku` остаётся источником группировки, а attributes с `used_for_variations = yes`
  определяют различия между физическими simple products;
- для каждого custom variant importer проверяет наличие variation attributes и уникальность их
  комбинации внутри группы.

Правила SKU:

- production-шаблон генерируется сервером при скачивании, а диапазон номеров резервируется
  атомарно, чтобы два одновременно выданных файла не получили одинаковые SKU;
- `Settings.sku_prefix` и `Settings.reserved_start` являются служебными значениями шаблона;
- `_sku_index` хранится как стабильное значение, поэтому сортировка строк не меняет SKU;
- `sku_override` имеет приоритет и должен быть уникальным;
- при `update` пустой SKU означает «не менять существующий», а не генерировать новый;
- importer не доверяет cached result Excel: он повторно вычисляет ожидаемый SKU из разрешённой
  формулы и сверяет его с файлом;
- после изменения `sku_override` главного товара пользователь должен заново выбрать его в
  `variant_of_sku`; preflight показывает конкретные строки с устаревшей ссылкой.

Правила остатков:

- `unlimited` -> `manage_stock = false`, `stock_status = instock`, количество пустое;
- `track` -> `manage_stock = true`, количество обязательно и неотрицательно;
- `out_of_stock` -> `manage_stock = false`, `stock_status = outofstock`, количество пустое;
- при `create` пустой `stock_mode` нормализуется в `unlimited`;
- при `update` пустой `stock_mode` означает «не менять»;
- `backorders` остаётся только в полном техническом и price/stock форматах.

Статический файл в knowledge является демонстрационным образцом. Реальный шаблон для клиента
скачивается из admin UI и содержит зарезервированный диапазон конкретного сайта.

## 5. Семантика обновления

- `operation = create` — ошибка, если `product_key` уже существует;
- `operation = update` — ошибка, если объект не найден;
- `operation = upsert` — создать или обновить;
- `operation = skip` — строка игнорируется;
- `operation = archive` — перевести товар в `draft`, но не удалять;
- пустая ячейка при update означает «не менять»;
- значение `__CLEAR__` явно очищает nullable text/price/media field;
- импорт никогда не удаляет объект только потому, что его нет в файле;
- SKU не является главным ключом, но должен быть уникальным, если заполнен;
- WordPress ID экспортируется как справочное read-only поле и не является переносимым ключом.

Формулы в data sheets запрещены, кроме точного набора системных формул в защищённых колонках
клиентского шаблона. Importer проверяет текст разрешённых формул, пересчитывает их серверной
логикой и не доверяет cached result Excel. Любая другая formula cell является ошибкой.

## 6. Архитектура plugin

```text
wpaikit-product-catalog-io/
├── wpaikit-product-catalog-io.php
├── composer.json
├── assets/admin/
├── templates/
│   ├── wpaikit-products-full-import.xlsx
│   ├── wpaikit-products-price-stock-import.xlsx
│   ├── wpaikit-product-terms-import.xlsx
│   └── wpaikit-products-client-import.xlsx
├── src/
│   ├── Admin/
│   │   ├── CatalogIoPage.php
│   │   └── JobListTable.php
│   ├── Application/
│   │   ├── ImportCoordinator.php
│   │   ├── ExportCoordinator.php
│   │   ├── PreflightService.php
│   │   ├── ClientTemplateService.php
│   │   ├── SkuReservationService.php
│   │   └── RollbackService.php
│   ├── Contract/
│   │   ├── MultilingualAdapter.php
│   │   ├── ProductExtension.php
│   │   └── CatalogSchema.php
│   ├── Domain/
│   │   ├── ProductRecord.php
│   │   ├── TranslationRecord.php
│   │   ├── TermRecord.php
│   │   ├── MediaRecord.php
│   │   └── ValidationIssue.php
│   ├── Infrastructure/
│   │   ├── Spreadsheet/
│   │   │   ├── XlsxReader.php
│   │   │   ├── XlsxWriter.php
│   │   │   ├── ClientWorkbookAdapter.php
│   │   │   └── WorkbookSchemaValidator.php
│   │   ├── WooCommerce/
│   │   │   ├── ProductRepository.php
│   │   │   ├── TermRepository.php
│   │   │   └── CustomVariantRepository.php
│   │   ├── Multilingual/
│   │   │   ├── WpmlAdapter.php
│   │   │   └── NullAdapter.php
│   │   ├── Media/MediaImporter.php
│   │   └── Jobs/ActionSchedulerJobRunner.php
│   └── Support/
│       ├── Capability.php
│       ├── ImportLimits.php
│       └── FormulaInjectionGuard.php
└── tests/
    ├── Unit/
    ├── Integration/
    └── Fixtures/
```

Parser dependency: `phpoffice/phpspreadsheet`, загружаемая только на admin/CLI import/export path.
Composer autoload plugin должен быть изолирован от theme vendor.

## 7. Поток импорта

1. Пользователь загружает `.xlsx` в **WooCommerce → Catalog Import/Export**.
2. Сервер проверяет capability `manage_woocommerce`, nonce, extension, MIME и лимиты ZIP.
3. Файл копируется в private temporary directory, а не в публичную Media Library.
4. Reader проверяет `schema_version`, имена/заголовки листов и недопустимые formula cells.
5. Client adapter проверяет системные формулы, SKU/stock/link checks и преобразует упрощённые
   строки в тот же канонический typed record, который использует полный формат.
6. Preflight проверяет весь набор и создаёт отчёт с error/warning/info.
7. Commit становится доступен только при отсутствии ошибок.
8. Action Scheduler обрабатывает небольшие batch-и и хранит cursor.
9. На каждый batch записываются before-snapshots изменяемых полей и IDs созданных объектов.
10. После товаров запускается group integrity check custom variations.
11. Пользователь получает итоговый XLSX error report и summary.

Повторный запуск того же файла идемпотентен благодаря `product_key`, `term_key` и content hash.
Для клиентского формата внутренний `product_key` создаётся один раз и сохраняется в WordPress;
Client export переносит его в защищённой скрытой колонке. Если файл создан не через export, update
может сопоставляться по текущему уникальному SKU, но никогда по title. Изменение SKU существующего
товара разрешено только в export-based файле с внутренним ключом.

## 8. Порядок записи данных

1. Terms без parent.
2. Child terms.
3. Term translations и WPML translation groups.
4. Standalone products и будущие anchors.
5. Product translations.
6. Sibling custom variants.
7. `variant_parent`, `is_main`, `variant_label` для каждого языка.
8. Product-term assignments через translated term IDs.
9. Media.
10. Allowlisted custom fields.
11. Lookup tables WooCommerce и cache invalidation.
12. Final integrity checks.

Все изменения товаров выполняются через `WC_Product_Simple` API. Прямое обновление WooCommerce
meta и lookup tables не допускается.

## 9. WPML и профиль `none`

Multilingual adapter должен предоставлять:

- список активных языков и default language;
- создание/поиск translation group товара;
- создание/поиск translation group термина;
- преобразование logical term key в term ID нужного языка;
- проверку, что все члены custom variant group находятся в одном языке;
- восстановление исходного admin language после операции.

Runtime-код не содержит жёсткого списка языков. XLSX-template использует RO/RU/EN только как
понятный пример. Preflight принимает любые языки, активные в конкретном WPML-проекте.

В профиле `none` разрешён только один язык. Лишние translation rows считаются ошибкой, а не молча
игнорируются.

## 10. Расширения проекта

Base plugin не должен знать о `composition`, `usage` или других полях SkinCareBoutique.

Проект регистрирует allowlist через typed extension contract:

```php
add_filter('wpaikit_catalog_io_product_fields', static function (array $fields): array {
    $fields['composition'] = [
        'type' => 'html',
        'translatable' => true,
        'sanitize' => 'wp_kses_post',
        'write' => static function (int $productId, string $value): void {
            update_field('composition', $value, $productId);
        },
    ];

    return $fields;
});
```

Неизвестное поле в `Custom Fields` является preflight error. Произвольный `meta_key` импортировать
нельзя.

## 11. Экспорт

### Full export

- выдаёт тот же schema version и те же листы, что full import;
- экспортирует logical keys, все активные переводы, taxonomy assignments и media URLs;
- при выборе одного custom variant включает всю группу;
- поддерживает фильтры по status, category, language, modified date и product key;
- экранирует значения, начинающиеся с `=`, `+`, `-`, `@`, от formula injection;
- не экспортирует secrets, private meta и технические WooCommerce caches.

### Price/stock export

- одна строка на физический simple product;
- включает `product_key`, SKU, title для контроля и текущие price/stock fields;
- результат можно изменить и импортировать тем же узким режимом.

### Client export

- выдаёт те же понятные колонки, что клиентский import;
- записывает текущие SKU как значения и формирует `variant_of_sku` из фактического SKU anchor;
- переносит `product_key` только в защищённой скрытой системной колонке для безопасного update;
- не показывает клиенту WordPress ID, `variant_parent`, `is_main` или ручные group keys;
- включает всю custom variant group при выборе любого её участника;
- подходит для повторного редактирования и импорта с сохранением internal product identity.

## 12. Безопасность и эксплуатационные лимиты

- capability: `manage_woocommerce`;
- nonce для upload, preflight, commit, cancel, rollback и download report;
- только `.xlsx`, без `.xlsm`;
- проверка ZIP entry count и суммарного uncompressed size до PhpSpreadsheet;
- лимиты на размер файла, листы, строки, колонки, длину ячейки и remote media;
- запрет formula cells, кроме allowlist системных формул клиентского шаблона; полный запрет
  external workbook links и macros;
- remote media: только HTTPS, блокировка localhost/private/link-local IP после DNS resolution,
  ограничение redirects, MIME, content length и timeout;
- экспорт защищён от CSV/XLSX formula injection;
- temporary files автоматически удаляются;
- логи не содержат весь импортируемый HTML или персональные данные;
- cancel останавливает будущие batch-и, но не делает вид, что уже записанных изменений нет;
- rollback доступен ограниченное время и восстанавливает только поля, изменённые этим job.

## 13. Хранение заданий

Использовать отдельные таблицы, создаваемые через `dbDelta`:

- `{prefix}wpaikit_catalog_jobs` — статус, schema version, filename hash, counts, cursor, timestamps;
- `{prefix}wpaikit_catalog_issues` — sheet, row, field, severity, code, message;
- `{prefix}wpaikit_catalog_changes` — object type/id, operation, before snapshot, created flag.

Большие отчёты нельзя хранить одним serialized option. Исходный XLSX и generated report хранятся
как private files с токенизированной admin download route.

## 14. Admin UX

Страница **WooCommerce → Catalog Import/Export**:

- tabs: Import, Export, Jobs, Settings;
- отдельный выбор Client products / Full catalog / Price & stock / Terms;
- ссылка Download template для каждого режима;
- Download client template атомарно резервирует SKU range и показывает его пользователю;
- upload dropzone;
- preflight summary: create/update/archive/skipped/errors/warnings;
- таблица ошибок с sheet, row, field и понятным объяснением;
- Commit неактивен при errors;
- progress по batch-ам с возможностью безопасно закрыть страницу;
- Cancel и Rollback — разные явно подписанные действия;
- история jobs с download original/report/log.

## 15. WP-CLI

```bash
wp wpaikit catalog validate file.xlsx --format=table
wp wpaikit catalog import file.xlsx --dry-run
wp wpaikit catalog import file.xlsx --yes
wp wpaikit catalog status <job-id>
wp wpaikit catalog cancel <job-id>
wp wpaikit catalog rollback <job-id> --yes
wp wpaikit catalog export full output.xlsx
wp wpaikit catalog export price-stock output.xlsx
wp wpaikit catalog export client output.xlsx
wp wpaikit catalog template client output.xlsx
```

CLI и admin используют один application layer; отдельной логики импорта в command classes нет.

## 16. Проверки preflight

Минимальный обязательный набор:

- schema version поддерживается;
- обязательные sheets/columns существуют;
- нет неизвестных/дублирующихся headers;
- нет formula cells вне точного allowlist системных формул клиентского шаблона;
- `product_key` и `term_key` имеют допустимый формат и уникальны в своём scope;
- language активен;
- operation допустима;
- `create/update` соответствует существованию объекта;
- SKU уникален;
- клиентский SKU соответствует `sku_override` либо зарезервированному диапазону;
- price/stock имеют корректный тип и диапазон;
- sale price не выше regular price, если оба заданы;
- referenced terms существуют в workbook или WordPress;
- category parent graph не содержит циклов;
- custom attribute value ссылается на parent attribute type;
- variant group содержит минимум два продукта и ровно один main;
- standalone product не содержит `variant_group_key/is_main`;
- `variant_of_sku` ссылается на существующий SKU, не на себя и не образует chain/cycle;
- каждая ссылка `variant_of_sku` однозначно нормализуется в одну custom variant group;
- member нельзя одновременно включить в две группы;
- все translated members и anchors могут быть связаны без cross-language ID;
- media source безопасен и имеет поддерживаемый MIME;
- custom field зарегистрирован и значение прошло sanitizer/validator.

## 17. Тестовая стратегия

### Unit

- reader/schema mapping;
- empty vs `__CLEAR__` semantics;
- money/stock/boolean parsers;
- formula-cell rejection и allowlist системных формул клиентского шаблона;
- атомарное резервирование SKU range и повторная серверная проверка SKU;
- нормализация `variant_of_sku` в internal group model;
- нормализация `unlimited/track/out_of_stock` в WooCommerce stock fields;
- product/term key validation;
- variant group validator;
- SSRF and formula-injection guards.

### WordPress integration

- create/update/idempotent rerun standalone product;
- create/update translations with WPML adapter;
- same fixture with Null adapter;
- category/brand/custom attribute terms and translations;
- custom variant anchor/sibling meta for every language;
- product reassignment to another group;
- media reuse by source hash;
- interrupted job resume;
- rollback created and updated objects;
- WooCommerce product lookup tables remain correct.

### Acceptance fixtures

- valid full catalog RO/RU/EN;
- valid no-WPML catalog;
- valid client workbook с auto SKU, custom SKU и `variant_of_sku`;
- price/stock update;
- duplicate keys/SKU;
- missing translation;
- invalid variant group;
- missing/self/chained/cyclic `variant_of_sku`;
- taxonomy cycle;
- malicious media URL;
- formula-injection export values;
- 10k-product performance fixture.

## 18. Этапы реализации

### Этап 1 — Контракт и parser

- зафиксировать full schema `1.0` и client schema `1.4`;
- добавить DTO, readers, validators и fixtures;
- обеспечить чтение четырёх template types;
- добавить client adapter, allowlist формул и генератор шаблона с SKU reservation;
- результат: `wp ... validate` работает без записи в WordPress.

Статус на 2026-09-01: first-party plugin, client schema `1.4`, безопасный XLSX reader,
server-side preflight, admin upload/download, тестовый client template и подключение Composer через
WooCommerce preset реализованы. Запись в WordPress, dynamic SKU reservation, WP-CLI validate и
остальные три формата файлов переходят в следующие итерации; Commit в admin UI пока намеренно
отсутствует.

### Этап 2 — Terms и standalone products

- repositories через WP/WooCommerce API;
- upsert terms/products;
- Null multilingual adapter;
- dry-run, job storage, batched runner.

Статус на 2026-09-01: реализованы DB-aware preflight и повторная проверка перед Commit,
stable-key repositories для категорий, брендов и `product_attribute`, запись только
`WC_Product_Simple` в режиме `STANDALONE`, Null multilingual adapter, persistent jobs,
пакеты через Action Scheduler с fallback на WP-Cron, snapshots и ручной rollback. Payload этапа
хранится в non-autoload WordPress options, поэтому один Commit ограничен 2000 локализованными
записями товаров и терминов, а история — 50 последними заданиями. Custom variants и
project-specific fields остаются блокирующими до этапов 4–5.

### Этап 3 — WPML

- WPML adapter без прямых вызовов из domain layer;
- product/term translation groups;
- тесты RO/RU/EN и произвольного набора языков.

Статус на 2026-09-01: реализованы профили `wpml` и `none`, обязательная проверка WPML +
WooCommerce Multilingual, получение default/active languages через публичные WPML hooks,
translation groups товаров и терминов, локализованные деревья таксономий и назначения товаров.
Runner записывает источник первым, затем переводы каждого объекта; rollback различает shared
WooCommerce data источника и локализованный content переводов. Client schema `1.4` добавляет
опциональный лист `Term Translations` для языков вне стандартных RO/RU/EN. Integration fixtures
покрывают RO/RU/EN, произвольный набор RO/DE, create/update и rollback.

### Этап 4 — Custom variations

- group planning до записи;
- преобразование `variant_of_sku` в anchor/sibling plan без клиентских group keys;
- создание translated anchors и siblings;
- integration с существующим Variant Integrity;
- запрет частичного commit невалидной группы.

Статус на 2026-09-10: реализован канонический `VariationGroupPlanner`, который строит группы из
`variant_of_sku`, проверяет MAIN/VARIANT-связи, полный набор активных строк, одинаковый набор
variation attributes и уникальность комбинаций. Runner записывает точный контракт темы
`variant_parent` / `is_main` / `variant_label` для `WC_Product_Simple`, использует локальный anchor
каждого языка WPML, умеет переносить товар в другую группу и очищать метаданные при переходе в
`STANDALONE`. Запись одной локализованной группы атомарна; snapshots вариаций откатываются до
товаров и терминов. Integration tests покрывают none/WPML, валидацию, reassignment и rollback.

### Этап 5 — Media и custom fields

Статус: **выполнен 11 сентября 2026**.

- безопасные источники (`attachment:<id>`, uploads-relative path, public HTTPS), SSRF-защита,
  MIME/size/redirect limits и deduplication по source hash;
- featured image и упорядоченная gallery с атомарным rollback и удалением созданных attachments;
- typed extension allowlist с sanitize/validate/read/write callbacks и translation policy;
- project fixture по типу SkinCareBoutique через theme filter без project-specific кода в plugin;
- клиентская схема и шаблон обновлены до `client-1.5`, старые `client-1.4` остаются читаемыми.

### Этап 6 — Export и round-trip

Статус: **выполнен 11 сентября 2026**.

- full/price-stock/client export;
- импорт собственного экспорта без изменений;
- formula injection tests.

Реализация `0.6.0` экспортирует все поля, поддерживаемые текущей канонической моделью plugin.
Full использует отдельные технические листы `Products`, `Translations`, `Terms`, `Product Terms`,
`Media` и `Custom Fields`; client сохраняет понятный клиентский формат и скрытый
`_wpaikit_product_key`. Для старых товаров без ключа создаётся переносимый `legacy-sku:<sku>` с
безопасным fallback по уникальному SKU. Price/stock соответствует установленному knowledge
template с листом `Price Stock` и завершает job сразу после product phase.

### Этап 7 — Admin UI, rollback и release

- preflight/commit/jobs UI;
- cancel/resume/rollback;
- runtime smoke на чистых WPML и none installations;
- packaging plugin и подключение через WooCommerce preset WPAIKit.

Статус на 2026-10-06: управление заданиями, история, отчёт об ошибке и воспроизводимая
production-сборка реализованы в `0.7.0`. WooCommerce preset уже включает plugin; `wpaikit init`
теперь останавливается при ошибке установки его Composer-зависимостей, а `wpaikit doctor`
проверяет PHP 8.2+ и расширения `zip`, `xml`, `mbstring`. Выпуск `1.0.0` остаётся отдельным
релизным барьером: текущий options-backed runner ограничен 2000 локализованными записями,
тогда как Definition of Done требует 10 000 физических товаров.

## 19. Интеграция с WPAIKit

- исходники plugin хранить как отдельный versioned package/repository, а не в theme;
- `wpaikit init` для WooCommerce устанавливает plugin package, но не активирует импорт без
  явного решения проекта, пока модуль не достигнет stable release;
- knowledge layer устанавливает schema contract, prompt и templates только для profile `woo`;
- knowledge layer содержит четыре шаблона, включая клиентский образец без зарезервированного
  production-диапазона;
- `wpaikit doctor` проверяет PHP extensions `zip`, `xml`, `mbstring` и совместимую версию PHP;
- boilerplate theme не получает `ImportService` и не зависит от PhpSpreadsheet;
- правило `Do not add product importers to theme` остаётся в `AGENTS.md`, но уточняется:
  product I/O реализуется через first-party plugin.

## 20. Definition of Done v1

- один и тот же full XLSX импортируется в WPML и none profile;
- клиентский XLSX создаёт standalone и custom variant товары без ручных group keys и main flags;
- два параллельно скачанных клиентских шаблона получают непересекающиеся SKU ranges;
- экспорт полного каталога импортируется обратно без потери поддерживаемых данных;
- client export повторно импортируется с сохранением internal product identity и variant links;
- повторный импорт не создаёт дубликаты;
- custom variant links соответствуют boilerplate contract во всех языках;
- файл с ошибками не меняет базу до Commit;
- 10 000 физических товаров обрабатываются resumable batches без HTTP timeout;
- cancel, resume и rollback имеют integration tests;
- security tests покрывают upload, ZIP bomb limits, formulas, formula injection и remote media SSRF;
- storefront, checkout и Product Variation Integrity продолжают проходить свои checks.
