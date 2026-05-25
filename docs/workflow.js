const translations = {
  en: {
    'brand.subtitle': 'Workflow Guide',
    'sidebar.statusLabel': 'Docs status',
    'sidebar.statusText': 'Live workflow map',
    'nav.start': 'Start',
    'nav.workflow': 'Workflow',
    'nav.reference': 'Reference library',
    'nav.overview': 'Overview',
    'nav.design': '1. Design',
    'nav.designSystem': '2. Design system',
    'nav.analyze': '3. Analyze Figma',
    'nav.prep': '4. Prep Figma',
    'nav.components': '5. Components',
    'nav.generate': '6. Generate code',
    'nav.verify': '7. Verify',
    'nav.skills': 'Skill registry',
    'hero.kicker': 'Figma -> ACF -> Twig -> Tailwind',
    'hero.title': 'Workflow guide for Figma-built WordPress blocks',
    'hero.description':
      'A working guide for moving from a Figma design to a WordPress ACF block. This page is synced with the current prompts, skills, and rules in the',
    'hero.pathLabel': 'Fast path',
    'hero.pathDesign': 'Design structure is readable.',
    'hero.pathAnalyze': 'Figma readiness is audited.',
    'hero.pathGenerate': 'Code generation has clear targets.',
    'overview.title': 'Overview',
    'overview.description':
      'The process is split into stages so each skill has one clear responsibility.',
    'overview.metricSkillsLabel': 'Active skills',
    'overview.metricSkillsText':
      'Analysis, design system, prep, components, sync, block generation, and code output.',
    'overview.metricInputLabel': 'Primary input',
    'overview.metricInputText':
      'Frame, page-level frame, or multi-selection depending on the stage.',
    'overview.metricTargetLabel': 'Code target',
    'overview.metricTargetValue': 'Theme root',
    'overview.metricTargetText': 'or a renamed project theme.',
    'overview.coreRuleLabel': 'Core rule:',
    'overview.coreRuleText':
      'One top-level Figma frame should map to one ACF block. If the design structure does not reflect the future HTML structure, run analysis and preparation first.',
    'overview.sequenceLabel': 'Run order',
    'overview.sequenceDesign': 'Design structure',
    'overview.sequenceSystem': 'Design system',
    'overview.sequenceAnalyze': 'Analyze and prep',
    'overview.sequenceGenerate': 'Generate and verify',
    'status.foundation': 'Foundation',
    'status.active': 'Active',
    'status.next': 'Next',
    'status.planned': 'Planned',
    'common.prompt': 'Prompt',
    'common.input': 'Input',
    'common.output': 'Output',
    'common.skill': 'Skill',
    'common.openSkill': 'Open skill',
    'common.referenceFiles': 'Reference files',
    'workflow.title': 'Workflow',
    'workflow.description':
      'The execution view keeps the process compact. Each panel shows when to run the step, what command starts it, and which source file defines the behavior.',
    'reference.title': 'Reference library',
    'reference.description':
      'Prompts, rules, and skills are grouped here so the workflow stays short. Every markdown link opens in the built-in reader.',
    'reference.searchLabel': 'Search docs',
    'reference.searchPlaceholder': 'Prompt, rule, skill, path...',
    'reference.filterAll': 'All',
    'reference.filterPrompts': 'Prompts',
    'reference.filterRules': 'Rules',
    'reference.filterSkills': 'Skills',
    'reference.typePrompt': 'Prompt',
    'reference.typeRule': 'Rule',
    'reference.typeSkill': 'Skill',
    'reference.openInViewer': 'Open in viewer',
    'reference.promptDescription': 'Agent-facing command prompt for a workflow step.',
    'reference.ruleDescription': 'Implementation guardrails used by generation and review.',
    'reference.empty': 'No matching documents.',
    'modal.raw': 'Raw',
    'modal.close': 'Close',
    'modal.empty': 'Select a markdown reference.',
    'modal.loading': 'Loading markdown file',
    'modal.errorTitle': 'Markdown file could not be loaded.',
    'modal.errorText':
      'Open the raw file or serve this directory over HTTP if the browser blocks local file reads.',
    'modal.untitled': 'Document',
    'design.title': 'Design',
    'design.description': 'The designer prepares the layout so an agent can read it safely.',
    'design.checkTitle': 'What Figma should contain',
    'design.checkFrame': 'Frames are named after blocks:',
    'design.checkLayers': 'Layers use semantic names:',
    'design.checkAutoLayout': 'Structural layers use Auto Layout.',
    'design.checkTokens': 'Colors, spacing, radius, and typography come from Variables or Styles.',
    'design.checkComponents': 'Repeated elements are built as Figma Components.',
    'designSystem.title': 'Create Design System',
    'designSystem.description':
      'Extracts tokens from representative Figma frames and creates local JSON.',
    'designSystem.input': 'One or more representative Figma frames.',
    'designSystem.output': 'Variables, Text Styles, Design System page.',
    'analyze.title': 'Analyze Figma',
    'analyze.description':
      'Checks implementation readiness. It does not modify design or generate code.',
    'analyze.reportTitle': 'Report format',
    'prep.title': 'Prep Figma',
    'prep.description':
      'Prepares a page-level frame for generation while preserving the visual result.',
    'prep.allowedTitle': 'What can change',
    'prep.allowedNaming': 'Layer naming and block boundaries.',
    'prep.allowedTokens': 'Token bindings for colors, spacing, radius, and typography.',
    'prep.allowedAutoLayout': 'Auto Layout when geometry does not shift.',
    'prep.allowedComponents': 'Component instance replacement without size changes.',
    'prep.guardrailLabel': 'Guardrail',
    'prep.guardrailText': 'If a change may shift pixels, skip it and add it to the report.',
    'components.title': 'Components',
    'components.description':
      'Repeated UI patterns become Figma Components and then Twig includes.',
    'components.tableFigma': 'Figma Component',
    'components.tableCode': 'Code target',
    'components.tablePurpose': 'Purpose',
    'components.buttonPurpose': 'Reusable CTA and link rendering.',
    'components.cardPurpose': 'Repeated repeater row layout.',
    'components.videoPurpose': 'Shared video behavior and markup.',
    'generate.title': 'Generate Code',
    'generate.description': 'Generation runs only after the design-system and prep stages.',
    'generate.blockFiles': 'Block files',
    'generate.styleFiles': 'Style files',
    'generate.styleImport': 'Imported from the main SCSS entry.',
    'generate.rules': 'Rules',
    'generate.rulesText': 'No Tailwind utilities in Twig. Twig uses semantic BEM classes only.',
    'verify.title': 'Verify',
    'verify.description':
      'This is currently a manual stage. Later it can become a dedicated verification skill.',
    'skills.title': 'Skill Registry',
    'skills.description':
      'The current map of skills and prompts. This will grow as wpaikit evolves.',
    'skills.analysis': 'Audit Figma readiness. Output: Ready, Needs cleanup, or Not ready.',
    'skills.designSystem':
      'Extract tokens and create Figma Variables, Text Styles, and local JSON.',
    'skills.prep': 'Prepare Figma structure for generation without changing visual appearance.',
    'skills.components': 'Create reusable component variants from saved design system patterns.',
    'skills.toBlock': 'Generate ACF block PHP, Twig, SCSS, and ACF JSON from a Figma block frame.',
    'skills.sync':
      'Sync local design-system.json after Variables, Text Styles, or Components changed in Figma.',
    'skills.toCode':
      'Generate Twig components, SCSS partials, and Tailwind config from the design system JSON.',
    'skills.verification':
      'Automated post-generation checks for PHP, Twig, styles, and visual regressions.',
    'skills.seeVerify': 'See verify stage',
    'skills.generateDesign':
      'Interactively collect design materials and generate a full UI in Figma from brief, design system, and brand references.',
    'skills.updateDS':
      'Add new Figma frames to an existing design system — merge tokens and update Figma page without deleting existing data.',
    'skills.setupFonts':
      'Audit fonts against design-system.json, remove unused files, convert to woff2/woff, and generate @font-face SCSS.',
    'skills.scanComponents':
      'Scan SCSS and Twig files to build a components registry used by figma-to-block for reuse instead of duplication.',
    'skills.validateCode':
      'Validate SCSS, Twig, and PHP against coding rules. Report violations and fix them — including unknown hex colors.',
    'skills.commentFrontend':
      'Query the WordPress database directly, parse ACF blocks from post_content, and write a developer reference .md with Twig, SCSS, and JS paths.',
    'overview.metricSkillsText':
      'Design generation, analysis, design system, prep, components, sync, fonts, code output, validation, block generation, and developer reference.',
  },
  ru: {
    'brand.subtitle': 'Гид по процессу',
    'sidebar.statusLabel': 'Статус документации',
    'sidebar.statusText': 'Живая карта процесса',
    'nav.start': 'Старт',
    'nav.workflow': 'Workflow',
    'nav.reference': 'Библиотека',
    'nav.overview': 'Обзор',
    'nav.design': '1. Дизайн',
    'nav.designSystem': '2. Дизайн-система',
    'nav.analyze': '3. Анализ Figma',
    'nav.prep': '4. Подготовка Figma',
    'nav.components': '5. Компоненты',
    'nav.generate': '6. Генерация кода',
    'nav.verify': '7. Проверка',
    'nav.skills': 'Реестр skills',
    'hero.kicker': 'Figma -> ACF -> Twig -> Tailwind',
    'hero.title': 'Гид по workflow для WordPress-блоков из Figma',
    'hero.description':
      'Рабочая инструкция для перехода от Figma-дизайна к WordPress ACF блоку. Эта страница синхронизирована с текущими prompts, skills и rules в папке',
    'hero.pathLabel': 'Быстрый путь',
    'hero.pathDesign': 'Структура дизайна читается агентом.',
    'hero.pathAnalyze': 'Готовность Figma проходит аудит.',
    'hero.pathGenerate': 'Генерация кода имеет явные цели.',
    'overview.title': 'Обзор',
    'overview.description':
      'Процесс разбит на этапы, чтобы каждый skill отвечал за одну понятную задачу.',
    'overview.metricSkillsLabel': 'Активные skills',
    'overview.metricSkillsText':
      'Анализ, дизайн-система, подготовка, компоненты, синхронизация, генерация блоков и вывод кода.',
    'overview.metricInputLabel': 'Основной input',
    'overview.metricInputText':
      'Frame, page-level frame или multi-selection в зависимости от этапа.',
    'overview.metricTargetLabel': 'Цель кода',
    'overview.metricTargetValue': 'Корень темы',
    'overview.metricTargetText': 'или переименованная тема проекта.',
    'overview.coreRuleLabel': 'Главное правило:',
    'overview.coreRuleText':
      'Один top-level Figma frame должен соответствовать одному ACF блоку. Если структура дизайна не отражает будущую HTML-структуру, сначала выполняются анализ и подготовка.',
    'overview.sequenceLabel': 'Порядок запуска',
    'overview.sequenceDesign': 'Структура дизайна',
    'overview.sequenceSystem': 'Дизайн-система',
    'overview.sequenceAnalyze': 'Анализ и подготовка',
    'overview.sequenceGenerate': 'Генерация и проверка',
    'status.foundation': 'Основа',
    'status.active': 'Активен',
    'status.next': 'Следующий',
    'status.planned': 'В плане',
    'common.prompt': 'Prompt',
    'common.input': 'Input',
    'common.output': 'Output',
    'common.skill': 'Skill',
    'common.openSkill': 'Открыть skill',
    'common.referenceFiles': 'Файлы-ориентиры',
    'workflow.title': 'Workflow',
    'workflow.description':
      'Рабочий вид оставляет процесс компактным. Каждая панель показывает, когда запускать этап, какой prompt его стартует и какой файл описывает поведение.',
    'reference.title': 'Библиотека документации',
    'reference.description':
      'Prompts, rules и skills собраны отдельно, чтобы workflow оставался коротким. Любая markdown-ссылка открывается во встроенном reader.',
    'reference.searchLabel': 'Поиск по docs',
    'reference.searchPlaceholder': 'Prompt, rule, skill, path...',
    'reference.filterAll': 'Все',
    'reference.filterPrompts': 'Prompts',
    'reference.filterRules': 'Rules',
    'reference.filterSkills': 'Skills',
    'reference.typePrompt': 'Prompt',
    'reference.typeRule': 'Rule',
    'reference.typeSkill': 'Skill',
    'reference.openInViewer': 'Открыть в reader',
    'reference.promptDescription': 'Prompt команды для одного этапа workflow.',
    'reference.ruleDescription': 'Правила реализации для генерации и ревью.',
    'reference.empty': 'Документы не найдены.',
    'modal.raw': 'Raw',
    'modal.close': 'Закрыть',
    'modal.empty': 'Выберите markdown-файл.',
    'modal.loading': 'Загружается markdown-файл',
    'modal.errorTitle': 'Markdown-файл не удалось загрузить.',
    'modal.errorText':
      'Откройте raw-файл или запустите эту папку через HTTP, если браузер блокирует чтение локальных файлов.',
    'modal.untitled': 'Документ',
    'design.title': 'Дизайн',
    'design.description': 'Дизайнер готовит макет так, чтобы агент мог безопасно его прочитать.',
    'design.checkTitle': 'Что должно быть в Figma',
    'design.checkFrame': 'Frames названы по блокам:',
    'design.checkLayers': 'Слои имеют семантические имена:',
    'design.checkAutoLayout': 'Structural layers используют Auto Layout.',
    'design.checkTokens': 'Colors, spacing, radius и typography берутся из Variables или Styles.',
    'design.checkComponents': 'Повторяющиеся элементы собраны как Figma Components.',
    'designSystem.title': 'Создание дизайн-системы',
    'designSystem.description':
      'Извлекает токены из representative Figma frames и создает локальный JSON.',
    'designSystem.input': 'Один или несколько representative Figma frames.',
    'designSystem.output': 'Variables, Text Styles, Design System page.',
    'analyze.title': 'Анализ Figma',
    'analyze.description':
      'Проверяет готовность к реализации. Не меняет дизайн и не генерирует код.',
    'analyze.reportTitle': 'Формат отчета',
    'prep.title': 'Подготовка Figma',
    'prep.description': 'Готовит page-level frame к генерации, сохраняя визуальный результат.',
    'prep.allowedTitle': 'Что можно менять',
    'prep.allowedNaming': 'Layer naming и block boundaries.',
    'prep.allowedTokens': 'Token bindings для colors, spacing, radius и typography.',
    'prep.allowedAutoLayout': 'Auto Layout, если геометрия не сдвигается.',
    'prep.allowedComponents': 'Component instance replacement без изменения размера.',
    'prep.guardrailLabel': 'Ограничение',
    'prep.guardrailText':
      'Если изменение может сдвинуть пиксели, оно пропускается и попадает в отчет.',
    'components.title': 'Компоненты',
    'components.description':
      'Повторяющиеся UI patterns становятся Figma Components, а затем Twig includes.',
    'components.tableFigma': 'Figma Component',
    'components.tableCode': 'Цель в коде',
    'components.tablePurpose': 'Назначение',
    'components.buttonPurpose': 'Переиспользуемый CTA и link rendering.',
    'components.cardPurpose': 'Layout для повторяющейся repeater row.',
    'components.videoPurpose': 'Общая video behavior и markup.',
    'generate.title': 'Генерация кода',
    'generate.description': 'Генерация запускается только после этапов design-system и prep.',
    'generate.blockFiles': 'Файлы блока',
    'generate.styleFiles': 'Файлы стилей',
    'generate.styleImport': 'Импортируется из основного SCSS entry.',
    'generate.rules': 'Правила',
    'generate.rulesText':
      'В Twig нет Tailwind utilities. Twig использует только semantic BEM classes.',
    'verify.title': 'Проверка',
    'verify.description':
      'Пока это ручной этап. Позже его можно вынести в отдельный verification skill.',
    'skills.title': 'Реестр skills',
    'skills.description': 'Текущая карта skills и prompts. Она будет расти вместе с wpaikit.',
    'skills.analysis': 'Аудит готовности Figma. Output: Ready, Needs cleanup или Not ready.',
    'skills.designSystem': 'Извлекает токены и создает Figma Variables, Text Styles и local JSON.',
    'skills.prep': 'Готовит структуру Figma к генерации без изменения визуального результата.',
    'skills.components':
      'Создает переиспользуемые component variants из сохраненных design system patterns.',
    'skills.toBlock': 'Генерирует ACF block PHP, Twig, SCSS и ACF JSON из Figma block frame.',
    'skills.sync':
      'Синхронизирует local design-system.json после изменений Variables, Text Styles или Components в Figma.',
    'skills.toCode':
      'Генерирует Twig components, SCSS partials и Tailwind config из design system JSON.',
    'skills.verification':
      'Автоматические post-generation проверки для PHP, Twig, стилей и visual regressions.',
    'skills.seeVerify': 'Смотреть этап проверки',
    'skills.generateDesign':
      'Интерактивный сбор материалов и генерация полного UI в Figma из brief, design system и бренд-референсов.',
    'skills.updateDS':
      'Добавляет новые Figma frames в существующую дизайн-систему — мержит токены и обновляет Figma page без удаления данных.',
    'skills.setupFonts':
      'Аудит шрифтов по design-system.json, удаление неиспользуемых, конвертация в woff2/woff, генерация @font-face SCSS.',
    'skills.scanComponents':
      'Сканирует SCSS и Twig для построения реестра компонентов, который figma-to-block использует для переиспользования.',
    'skills.validateCode':
      'Валидирует SCSS, Twig и PHP по правилам кодирования. Находит нарушения и исправляет — включая неизвестные hex-цвета.',
    'skills.commentFrontend':
      'Запрашивает БД WordPress напрямую, парсит ACF блоки из post_content и записывает developer reference .md с путями Twig, SCSS и JS.',
    'overview.metricSkillsText':
      'Генерация дизайна, анализ, дизайн-система, подготовка, компоненты, синхронизация, шрифты, вывод кода, валидация, генерация блоков и developer reference.',
  },
  ro: {
    'brand.subtitle': 'Ghid de workflow',
    'sidebar.statusLabel': 'Status documentatie',
    'sidebar.statusText': 'Harta workflow live',
    'nav.start': 'Start',
    'nav.workflow': 'Workflow',
    'nav.reference': 'Biblioteca',
    'nav.overview': 'Prezentare',
    'nav.design': '1. Design',
    'nav.designSystem': '2. Sistem de design',
    'nav.analyze': '3. Analiza Figma',
    'nav.prep': '4. Pregatire Figma',
    'nav.components': '5. Componente',
    'nav.generate': '6. Generare cod',
    'nav.verify': '7. Verificare',
    'nav.skills': 'Registru skills',
    'hero.kicker': 'Figma -> ACF -> Twig -> Tailwind',
    'hero.title': 'Ghid workflow pentru blocuri WordPress din Figma',
    'hero.description':
      'Un ghid de lucru pentru trecerea de la design Figma la un bloc WordPress ACF. Pagina este sincronizata cu prompts, skills si rules curente din',
    'hero.pathLabel': 'Traseu rapid',
    'hero.pathDesign': 'Structura designului poate fi citita.',
    'hero.pathAnalyze': 'Pregatirea Figma este auditata.',
    'hero.pathGenerate': 'Generarea codului are tinte clare.',
    'overview.title': 'Prezentare',
    'overview.description':
      'Procesul este impartit in etape, astfel incat fiecare skill are o responsabilitate clara.',
    'overview.metricSkillsLabel': 'Skills active',
    'overview.metricSkillsText':
      'Analiza, sistem de design, pregatire, componente, sincronizare, generare de blocuri si output de cod.',
    'overview.metricInputLabel': 'Input principal',
    'overview.metricInputText': 'Frame, page-level frame sau multi-selection in functie de etapa.',
    'overview.metricTargetLabel': 'Tinta codului',
    'overview.metricTargetValue': 'Radacina temei',
    'overview.metricTargetText': 'sau o tema de proiect redenumita.',
    'overview.coreRuleLabel': 'Regula principala:',
    'overview.coreRuleText':
      'Un top-level Figma frame trebuie sa corespunda unui singur bloc ACF. Daca structura designului nu reflecta viitoarea structura HTML, ruleaza mai intai analiza si pregatirea.',
    'overview.sequenceLabel': 'Ordine de rulare',
    'overview.sequenceDesign': 'Structura designului',
    'overview.sequenceSystem': 'Sistem de design',
    'overview.sequenceAnalyze': 'Analiza si pregatire',
    'overview.sequenceGenerate': 'Generare si verificare',
    'status.foundation': 'Fundatie',
    'status.active': 'Activ',
    'status.next': 'Urmator',
    'status.planned': 'Planificat',
    'common.prompt': 'Prompt',
    'common.input': 'Input',
    'common.output': 'Output',
    'common.skill': 'Skill',
    'common.openSkill': 'Deschide skill',
    'common.referenceFiles': 'Fisiere reper',
    'workflow.title': 'Workflow',
    'workflow.description':
      'Vizualizarea de executie pastreaza procesul compact. Fiecare panou arata cand rulezi pasul, ce prompt il porneste si ce fisier defineste comportamentul.',
    'reference.title': 'Biblioteca documentatie',
    'reference.description':
      'Prompts, rules si skills sunt grupate aici pentru ca workflow-ul sa ramana scurt. Fiecare link markdown se deschide in reader-ul integrat.',
    'reference.searchLabel': 'Cauta in docs',
    'reference.searchPlaceholder': 'Prompt, rule, skill, path...',
    'reference.filterAll': 'Toate',
    'reference.filterPrompts': 'Prompts',
    'reference.filterRules': 'Rules',
    'reference.filterSkills': 'Skills',
    'reference.typePrompt': 'Prompt',
    'reference.typeRule': 'Rule',
    'reference.typeSkill': 'Skill',
    'reference.openInViewer': 'Deschide in reader',
    'reference.promptDescription': 'Prompt de comanda pentru un pas din workflow.',
    'reference.ruleDescription': 'Reguli de implementare folosite la generare si review.',
    'reference.empty': 'Nu exista documente potrivite.',
    'modal.raw': 'Raw',
    'modal.close': 'Inchide',
    'modal.empty': 'Selecteaza un fisier markdown.',
    'modal.loading': 'Se incarca fisierul markdown',
    'modal.errorTitle': 'Fisierul markdown nu a putut fi incarcat.',
    'modal.errorText':
      'Deschide fisierul raw sau serveste acest director prin HTTP daca browserul blocheaza fisierele locale.',
    'modal.untitled': 'Document',
    'design.title': 'Design',
    'design.description':
      'Designerul pregateste layout-ul astfel incat agentul sa il poata citi in siguranta.',
    'design.checkTitle': 'Ce trebuie sa contina Figma',
    'design.checkFrame': 'Frame-urile sunt numite dupa blocuri:',
    'design.checkLayers': 'Layer-ele au nume semantice:',
    'design.checkAutoLayout': 'Structural layers folosesc Auto Layout.',
    'design.checkTokens': 'Colors, spacing, radius si typography vin din Variables sau Styles.',
    'design.checkComponents': 'Elementele repetate sunt construite ca Figma Components.',
    'designSystem.title': 'Creare sistem de design',
    'designSystem.description':
      'Extrage token-uri din representative Figma frames si creeaza JSON local.',
    'designSystem.input': 'Unul sau mai multe representative Figma frames.',
    'designSystem.output': 'Variables, Text Styles, Design System page.',
    'analyze.title': 'Analiza Figma',
    'analyze.description':
      'Verifica pregatirea pentru implementare. Nu modifica designul si nu genereaza cod.',
    'analyze.reportTitle': 'Format raport',
    'prep.title': 'Pregatire Figma',
    'prep.description':
      'Pregateste un page-level frame pentru generare pastrand rezultatul vizual.',
    'prep.allowedTitle': 'Ce se poate schimba',
    'prep.allowedNaming': 'Layer naming si block boundaries.',
    'prep.allowedTokens': 'Token bindings pentru colors, spacing, radius si typography.',
    'prep.allowedAutoLayout': 'Auto Layout cand geometria nu se deplaseaza.',
    'prep.allowedComponents': 'Component instance replacement fara schimbari de dimensiune.',
    'prep.guardrailLabel': 'Limita',
    'prep.guardrailText':
      'Daca o schimbare poate muta pixelii, sari peste ea si adaug-o in raport.',
    'components.title': 'Componente',
    'components.description': 'UI patterns repetate devin Figma Components si apoi Twig includes.',
    'components.tableFigma': 'Figma Component',
    'components.tableCode': 'Tinta in cod',
    'components.tablePurpose': 'Scop',
    'components.buttonPurpose': 'Randare reutilizabila pentru CTA si link.',
    'components.cardPurpose': 'Layout pentru repeater row repetat.',
    'components.videoPurpose': 'Video behavior si markup comune.',
    'generate.title': 'Generare cod',
    'generate.description': 'Generarea ruleaza doar dupa etapele design-system si prep.',
    'generate.blockFiles': 'Fisiere bloc',
    'generate.styleFiles': 'Fisiere stil',
    'generate.styleImport': 'Importat din SCSS entry principal.',
    'generate.rules': 'Reguli',
    'generate.rulesText':
      'Fara Tailwind utilities in Twig. Twig foloseste doar semantic BEM classes.',
    'verify.title': 'Verificare',
    'verify.description':
      'Momentan este o etapa manuala. Mai tarziu poate deveni un verification skill dedicat.',
    'skills.title': 'Registru skills',
    'skills.description':
      'Harta curenta de skills si prompts. Va creste pe masura ce evolueaza wpaikit.',
    'skills.analysis': 'Audit pentru pregatirea Figma. Output: Ready, Needs cleanup sau Not ready.',
    'skills.designSystem':
      'Extrage token-uri si creeaza Figma Variables, Text Styles si JSON local.',
    'skills.prep':
      'Pregateste structura Figma pentru generare fara schimbarea rezultatului vizual.',
    'skills.components':
      'Creeaza component variants reutilizabile din design system patterns salvate.',
    'skills.toBlock': 'Genereaza ACF block PHP, Twig, SCSS si ACF JSON dintr-un Figma block frame.',
    'skills.sync':
      'Sincronizeaza local design-system.json dupa schimbari in Variables, Text Styles sau Components in Figma.',
    'skills.toCode':
      'Genereaza Twig components, SCSS partials si Tailwind config din design system JSON.',
    'skills.verification':
      'Verificari post-generation automate pentru PHP, Twig, stiluri si visual regressions.',
    'skills.seeVerify': 'Vezi etapa de verificare',
    'skills.generateDesign':
      'Colecteaza interactiv materiale de design si genereaza un UI complet in Figma din brief, sistem de design si referinte de brand.',
    'skills.updateDS':
      'Adauga frame-uri Figma noi la un sistem de design existent — imbina token-uri si actualizeaza pagina Figma fara a sterge datele existente.',
    'skills.setupFonts':
      'Auditeaza fonturile fata de design-system.json, elimina fisierele neutilizate, converteste in woff2/woff si genereaza SCSS cu @font-face.',
    'skills.scanComponents':
      'Scaneaza SCSS si Twig pentru a construi un registru de componente folosit de figma-to-block pentru reutilizare.',
    'skills.validateCode':
      'Valideaza SCSS, Twig si PHP conform regulilor de codare. Raporteaza si repara violari — inclusiv culori hex necunoscute.',
    'skills.commentFrontend':
      'Interogheaza direct baza de date WordPress, parseaza blocuri ACF din post_content si scrie un fisier .md de referinta pentru developer cu cai Twig, SCSS si JS.',
    'overview.metricSkillsText':
      'Generare design, analiza, sistem de design, pregatire, componente, sincronizare, fonturi, output cod, validare, generare blocuri si referinta developer.',
  },
}

const fullDocumentationTranslations = {
  en: {
    'nav.install': '1. Installation',
    'nav.init': '2. wpaikit init',
    'nav.knowledge': '3. Knowledge Base',
    'nav.commands': '4. Commands',
    'nav.fullWorkflows': '5. Full workflows',
    'nav.situations': '6. Common cases',
    'nav.keyFiles': '7. Key files',
    'nav.update': '8. Update',
    'nav.figmaWorkflow': 'Figma -> Block',
    'fullHero.kicker': 'wpaikit -> WordPress -> Figma -> ACF -> Twig',
    'fullHero.title': 'Complete wpaikit workflow',
    'fullHero.description':
      'A detailed path from CLI installation and <code>wpaikit init</code> to design generation, Design System, ACF blocks, code validation, and knowledge base updates.',
    'fullHero.sources': 'Primary sources',
    'fullHero.fastPath': 'Fast path',
    'fullHero.pathInstall': 'Install the CLI and pass <code>wpaikit doctor</code>.',
    'fullHero.pathInit': 'Run <code>wpaikit init</code> and configure WordPress.',
    'fullHero.pathKnowledge': 'Install the knowledge base and run slash commands from the theme.',
    'full.install.title': 'Install wpaikit',
    'full.install.description':
      'Start by checking the local environment. The CLI is installed globally and then used to create the WordPress project, install the knowledge base, and update commands.',
    'full.install.requirements': 'Minimum requirements',
    'full.install.fonttools':
      '<code>Python + fonttools</code> for the <code>/setup-fonts</code> command',
    'full.install.global': 'Global install',
    'full.install.check': 'Check',
    'full.install.doctorTitle': 'What doctor checks',
    'full.install.doctorText':
      'Checks Node, Git, Composer, npm, and write access in the current directory. If something is missing, the command shows what must be installed before starting the project.',
    'full.init.description':
      'The main starting command. It downloads WordPress, attaches the boilerplate, renames the theme, and prepares the project for manual database setup.',
    'full.init.questions': 'Interactive questions',
    'full.init.projectName': '<code>Project name</code> is the human-readable project name.',
    'full.init.slug': '<code>Slug</code> is the kebab-case theme folder name.',
    'full.init.namespace': '<code>Namespace</code> is the PHP namespace in PascalCase.',
    'full.init.location': '<code>Location</code> is a new subdirectory or the current directory.',
    'full.init.automatic': 'Automatic steps',
    'full.init.stepDownload': 'Downloads the latest stable WordPress build.',
    'full.init.stepClone': 'Clones the boilerplate into <code>wp-content/</code>.',
    'full.init.stepRename': 'Renames the theme, namespace, and text domain.',
    'full.init.stepInstall': 'Runs <code>composer install</code> and the frontend build.',
    'full.init.stepMetadata': 'Creates <code>.wpaikit.json</code> with project metadata.',
    'full.init.flags': 'Useful flags',
    'full.init.manualTitle': 'Manual steps after init',
    'full.init.manualDb': 'Create a local database with Herd, MAMP, TablePlus, or CLI.',
    'full.init.manualConfig': 'Fill in credentials in <code>wp-config.php</code>.',
    'full.init.manualWizard': 'Open the site in a browser and complete the WordPress wizard.',
    'full.init.manualTheme': 'Activate the theme in <code>wp-admin -> Appearance -> Themes</code>.',
    'full.knowledge.title': 'Install the Knowledge Base',
    'full.knowledge.description':
      'After creating the project, move into the theme root. All AI commands below should be run from there so agents can see the correct rules, prompts, and skills.',
    'full.knowledge.copiedTitle': 'What gets copied',
    'full.knowledge.copiedKnowledge':
      '<code>knowledge/</code> contains rules, prompts, and skills.',
    'full.knowledge.copiedClaude': '<code>CLAUDE.md</code> contains instructions for Claude Code.',
    'full.knowledge.copiedAgents': '<code>AGENTS.md</code> contains instructions for Codex/OpenAI.',
    'full.knowledge.copiedCommands': '<code>.claude/commands/</code> contains slash commands.',
    'full.knowledge.updateTitle': 'When to update',
    'full.knowledge.updateText':
      'After updating the global CLI or when a command receives a new prompt or skill.',
    'full.knowledge.ruleTitle': 'Working rule',
    'full.knowledge.ruleText':
      'The CLI performs deterministic operations. AI commands interpret Figma, briefs, block structure, and design decisions.',
    'full.commands.title': 'Commands and when to run them',
    'full.commands.description':
      'Commands run in Claude Code from the theme root. Each command reads the required files from <code>knowledge/</code> first.',
    'full.commands.generateDesign':
      'Interactively collects the brief, Figma project URL, references, Design System, brand assets, icon library, and Pexels API key, then generates UI in Figma.',
    'full.commands.designQuality':
      'Checks a brief or Figma frames for category reflex, banned patterns, color strategy, register consistency, theme logic, typography, and layout rhythm.',
    'full.commands.analyzeFigma':
      'Audits a Figma frame for implementation readiness: Auto Layout, tokens, responsive variants, reusable components, and semantic naming.',
    'full.commands.figmaDesignSystem':
      'Extracts colors, typography, spacing, radius, and UI patterns from 4-6 representative frames. Creates a Design System page, Variables, Text Styles, and <code>.wpaikit/design-system.json</code>.',
    'full.commands.figmaComponents':
      'Creates Figma Component Sets with Type x Size x State variants from patterns in <code>design-system.json</code>.',
    'full.commands.updateDesignSystem':
      'Adds new frames to an existing Design System without deleting old tokens. It makes a diff, appends in Figma, and merges JSON.',
    'full.commands.syncTokens':
      'Synchronizes <code>design-system.json</code> when a designer manually changes Variables or Text Styles. Deleted tokens are marked <code>deprecated</code>.',
    'full.commands.prepFigma':
      'Creates a Dev Ready page, semantically renames layers, binds styles to tokens, replaces detached elements with components, and adds Auto Layout.',
    'full.commands.setupFonts':
      'Compares required font families and weights with files in <code>frontend/src/fonts/</code>, removes unused files, converts TTF/OTF to woff2/woff, and generates <code>_fonts.scss</code>.',
    'full.commands.designSystemToCode':
      'Generates Twig components and SCSS partials, updates Tailwind config, and adds imports to <code>main.scss</code>.',
    'full.commands.scanComponents':
      'Indexes Twig and SCSS components plus BEM blocks/elements/modifiers, then writes <code>.wpaikit/components-registry.md</code> for reuse.',
    'full.commands.figmaToBlock':
      'Generates one ACF block per run: PHP class, Twig template, SCSS partial, and ACF JSON. After each block, sync it in wp-admin Custom Fields.',
    'full.commands.validateCode':
      'Checks SCSS, Twig, and PHP against the rules. It can fix BEM, raw CSS, hardcoded hex colors, autoescape mistakes, namespaces, and image fields.',
    'full.commands.commentFrontend':
      'Reads the WordPress database directly, parses ACF blocks from <code>post_content</code>, and generates a developer reference with Twig, SCSS, PHP, and JS paths.',
    'full.workflows.title': 'Full workflows',
    'full.workflows.description':
      'Two base scenarios: a project with an existing design and a project where the design is generated in Figma first.',
    'full.workflows.aTitle': 'Workflow A - design already exists in Figma',
    'full.workflows.aCode': `npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor
wpaikit init

# manual:
# create DB, configure wp-config.php,
# complete WordPress wizard, activate theme

cd wp-content/themes/{slug}
wpaikit knowledge install

/analyze-figma &lt;url&gt;
/figma-design-system &lt;url&gt;
/figma-components
/prep-figma &lt;url&gt;
/setup-fonts
/design-system-to-code
cd frontend && npm run build
/scan-components
/figma-to-block &lt;url&gt;
/validate-code`,
    'full.workflows.bTitle': 'Workflow B - project without a design',
    'full.workflows.bCode': `npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor
wpaikit init
cd wp-content/themes/{slug}
wpaikit knowledge install

/generate-design
/design-quality-check &lt;figma-url&gt;
/figma-design-system &lt;url&gt;
/figma-components
/prep-figma &lt;url&gt;

# then continue like Workflow A:
/setup-fonts
/design-system-to-code
/scan-components
/figma-to-block &lt;url&gt;
/validate-code`,
    'full.workflows.importantTitle': 'Important',
    'full.workflows.importantText':
      'One <code>/figma-to-block</code> run generates one block. Repeat the command separately for each page section and sync ACF JSON in WordPress admin after every block.',
    'full.situations.title': 'Common cases',
    'full.situations.description': 'A short decision map for day-to-day project work.',
    'full.situations.colSituation': 'Situation',
    'full.situations.colRun': 'What to run',
    'full.situations.colComment': 'Comment',
    'full.situations.newBlock': 'New block from Figma',
    'full.situations.newBlockComment':
      'Prep can be skipped only if the frame is already dev-ready.',
    'full.situations.tokensChanged': 'Designer changed colors or fonts',
    'full.situations.tokensChangedComment': 'After that, check Tailwind and the build.',
    'full.situations.pagesAdded': 'New pages were added in Figma',
    'full.situations.pagesAddedComment': 'New tokens are added, old tokens are not deleted.',
    'full.situations.componentAdded': 'A new Twig/SCSS component was added',
    'full.situations.componentAddedComment': 'Updates the registry for future block generation.',
    'full.situations.afterGeneration': 'Post-generation check is needed',
    'full.situations.afterGenerationComment': 'Checks SCSS, Twig, and PHP against the rules.',
    'full.situations.findFiles': 'A developer needs to find page files',
    'full.situations.findFilesComment': 'Writes a markdown reference for the page blocks.',
    'full.keyFiles.title': 'Key project files',
    'full.keyFiles.description':
      'These files and folders are most often needed during development and debugging.',
    'full.keyFiles.metadataTitle': 'Metadata and AI',
    'full.keyFiles.metadataConfig': '<code>.wpaikit.json</code> - name, namespace, preset.',
    'full.keyFiles.metadataDesignSystem': '<code>.wpaikit/design-system.json</code> - token cache.',
    'full.keyFiles.metadataRegistry':
      '<code>.wpaikit/components-registry.md</code> - component index.',
    'full.keyFiles.metadataKnowledge': '<code>knowledge/</code> - rules, prompts, skills.',
    'full.keyFiles.frontendMain': '<code>frontend/src/css/main.scss</code> - SCSS entry.',
    'full.keyFiles.frontendTailwind': '<code>frontend/tailwind.config.js</code> - Tailwind tokens.',
    'full.keyFiles.frontendComponents':
      '<code>frontend/src/css/components/</code> - component partials.',
    'full.keyFiles.frontendBlocks': '<code>frontend/src/css/blocks/</code> - block partials.',
    'full.keyFiles.themeTitle': 'WordPress theme',
    'full.keyFiles.themeBlocks': '<code>blocks/</code> - PHP classes for ACF blocks.',
    'full.keyFiles.themeViews': '<code>views/blocks/</code> - Twig block templates.',
    'full.keyFiles.themeComponents': '<code>views/components/</code> - reusable Twig components.',
    'full.keyFiles.themeAcf': '<code>acf-json/</code> - ACF field groups to sync in admin.',
    'full.update.title': 'Update wpaikit',
    'full.update.description':
      'The CLI is updated globally, while the knowledge base is updated separately in each theme.',
    'full.update.projectDevelopers': 'For project developers',
    'full.update.packageAuthor': 'For the package author',
    'full.figmaIntro.title': 'Figma -> ACF block: detailed stages',
    'full.figmaIntro.description':
      'The detailed Figma-to-block process map remains below. It is useful after the project is initialized and the work moves specifically to design and blocks.',
  },
  ru: {
    'nav.install': '1. Установка',
    'nav.init': '2. wpaikit init',
    'nav.knowledge': '3. Knowledge Base',
    'nav.commands': '4. Команды',
    'nav.fullWorkflows': '5. Полные workflow',
    'nav.situations': '6. Частые ситуации',
    'nav.keyFiles': '7. Ключевые файлы',
    'nav.update': '8. Обновление',
    'nav.figmaWorkflow': 'Figma -> Block',
    'fullHero.kicker': 'wpaikit -> WordPress -> Figma -> ACF -> Twig',
    'fullHero.title': 'Полный workflow wpaikit',
    'fullHero.description':
      'Развернутый путь от установки CLI и <code>wpaikit init</code> до генерации дизайна, Design System, ACF-блоков, проверки кода и обновления knowledge base.',
    'fullHero.sources': 'Основные источники',
    'fullHero.fastPath': 'Быстрый путь',
    'fullHero.pathInstall': 'Установить CLI и пройти <code>wpaikit doctor</code>.',
    'fullHero.pathInit': 'Запустить <code>wpaikit init</code> и настроить WordPress.',
    'fullHero.pathKnowledge': 'Установить knowledge base и запускать slash-команды из темы.',
    'full.install.title': 'Установка wpaikit',
    'full.install.description':
      'Начинайте с проверки окружения. CLI ставится глобально и дальше используется для создания WordPress-проекта, установки knowledge base и обновления команд.',
    'full.install.requirements': 'Минимальные требования',
    'full.install.fonttools':
      '<code>Python + fonttools</code> для команды <code>/setup-fonts</code>',
    'full.install.global': 'Глобальная установка',
    'full.install.check': 'Проверка',
    'full.install.doctorTitle': 'Что делает doctor',
    'full.install.doctorText':
      'Проверяет доступность Node, Git, Composer, npm и права записи в текущей директории. Если чего-то не хватает, команда показывает, что надо установить до старта проекта.',
    'full.init.description':
      'Главная стартовая команда. Она скачивает WordPress, подключает boilerplate, переименовывает тему и готовит проект к ручной настройке базы данных.',
    'full.init.questions': 'Интерактивные вопросы',
    'full.init.projectName': '<code>Project name</code> — человекочитаемое имя проекта.',
    'full.init.slug': '<code>Slug</code> — kebab-case для папки темы.',
    'full.init.namespace': '<code>Namespace</code> — PHP namespace в PascalCase.',
    'full.init.location': '<code>Location</code> — новый подкаталог или текущая директория.',
    'full.init.automatic': 'Автоматические шаги',
    'full.init.stepDownload': 'Скачивает последнюю стабильную WordPress-сборку.',
    'full.init.stepClone': 'Клонирует boilerplate в <code>wp-content/</code>.',
    'full.init.stepRename': 'Переименовывает тему, namespace и text domain.',
    'full.init.stepInstall': 'Запускает <code>composer install</code> и frontend build.',
    'full.init.stepMetadata': 'Создает <code>.wpaikit.json</code> с метаданными проекта.',
    'full.init.flags': 'Полезные flags',
    'full.init.manualTitle': 'Ручные шаги после init',
    'full.init.manualDb': 'Создайте локальную базу данных через Herd, MAMP, TablePlus или CLI.',
    'full.init.manualConfig': 'Заполните доступы в <code>wp-config.php</code>.',
    'full.init.manualWizard': 'Откройте сайт в браузере и пройдите WordPress wizard.',
    'full.init.manualTheme': 'Активируйте тему в <code>wp-admin -> Appearance -> Themes</code>.',
    'full.knowledge.title': 'Установка Knowledge Base',
    'full.knowledge.description':
      'После создания проекта перейдите в корень темы. Все AI-команды ниже должны запускаться именно оттуда, чтобы агенты видели правильные rules, prompts и skills.',
    'full.knowledge.copiedTitle': 'Что копируется',
    'full.knowledge.copiedKnowledge': '<code>knowledge/</code> — rules, prompts, skills.',
    'full.knowledge.copiedClaude': '<code>CLAUDE.md</code> — инструкции для Claude Code.',
    'full.knowledge.copiedAgents': '<code>AGENTS.md</code> — инструкции для Codex/OpenAI.',
    'full.knowledge.copiedCommands': '<code>.claude/commands/</code> — slash-команды.',
    'full.knowledge.updateTitle': 'Когда обновлять',
    'full.knowledge.updateText':
      'После обновления глобального CLI или когда команда получила новый prompt/skill.',
    'full.knowledge.ruleTitle': 'Рабочее правило',
    'full.knowledge.ruleText':
      'CLI делает детерминированные операции. AI-команды интерпретируют Figma, brief, структуру блоков и решения по дизайну.',
    'full.commands.title': 'Команды и когда их запускать',
    'full.commands.description':
      'Команды запускаются в Claude Code из корня темы. Каждая команда предварительно читает нужные файлы из <code>knowledge/</code>.',
    'full.commands.generateDesign':
      'Интерактивно собирает brief, Figma project URL, референсы, Design System, brand assets, icon library и Pexels API key, затем генерирует UI в Figma.',
    'full.commands.designQuality':
      'Проверяет brief или Figma frames на category reflex, banned patterns, цветовую стратегию, register consistency, theme logic, typography и layout rhythm.',
    'full.commands.analyzeFigma':
      'Аудитирует Figma frame на готовность к реализации: Auto Layout, токены, responsive variants, reusable components и semantic naming.',
    'full.commands.figmaDesignSystem':
      'Извлекает colors, typography, spacing, radius и UI patterns из 4-6 representative frames. Создает Design System page, Variables, Text Styles и <code>.wpaikit/design-system.json</code>.',
    'full.commands.figmaComponents':
      'Создает Figma Component Sets с вариантами Type x Size x State на основе patterns из <code>design-system.json</code>.',
    'full.commands.updateDesignSystem':
      'Добавляет новые frames в существующий Design System без удаления старых токенов. Делает diff, append в Figma и merge JSON.',
    'full.commands.syncTokens':
      'Синхронизирует <code>design-system.json</code>, когда дизайнер вручную меняет Variables или Text Styles. Удаленные токены помечаются <code>deprecated</code>.',
    'full.commands.prepFigma':
      'Создает страницу Dev Ready, семантически переименовывает layers, связывает styles с tokens, заменяет detached элементы компонентами и добавляет Auto Layout.',
    'full.commands.setupFonts':
      'Сравнивает нужные font families/weights с файлами в <code>frontend/src/fonts/</code>, удаляет лишнее, конвертирует TTF/OTF в woff2/woff и генерирует <code>_fonts.scss</code>.',
    'full.commands.designSystemToCode':
      'Генерирует Twig components, SCSS partials, обновляет Tailwind config и добавляет imports в <code>main.scss</code>.',
    'full.commands.scanComponents':
      'Индексирует Twig и SCSS компоненты, BEM blocks/elements/modifiers и пишет <code>.wpaikit/components-registry.md</code> для повторного использования.',
    'full.commands.figmaToBlock':
      'Генерирует один ACF block за запуск: PHP class, Twig template, SCSS partial и ACF JSON. После каждого блока надо sync в wp-admin Custom Fields.',
    'full.commands.validateCode':
      'Проверяет SCSS, Twig и PHP по rules. Может чинить BEM, raw CSS, hardcoded hex, autoescape mistakes, namespaces и image fields.',
    'full.commands.commentFrontend':
      'Читает базу WordPress напрямую, парсит ACF blocks из <code>post_content</code> и генерирует developer reference с путями Twig, SCSS, PHP и JS.',
    'full.workflows.title': 'Полные workflow',
    'full.workflows.description':
      'Два базовых сценария: проект с готовым дизайном и проект, где дизайн сначала генерируется в Figma.',
    'full.workflows.aTitle': 'Workflow A — дизайн уже есть в Figma',
    'full.workflows.aCode': `npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor
wpaikit init

# вручную:
# создайте DB, настройте wp-config.php,
# завершите WordPress wizard, активируйте тему

cd wp-content/themes/{slug}
wpaikit knowledge install

/analyze-figma &lt;url&gt;
/figma-design-system &lt;url&gt;
/figma-components
/prep-figma &lt;url&gt;
/setup-fonts
/design-system-to-code
cd frontend && npm run build
/scan-components
/figma-to-block &lt;url&gt;
/validate-code`,
    'full.workflows.bTitle': 'Workflow B — проект без дизайна',
    'full.workflows.bCode': `npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor
wpaikit init
cd wp-content/themes/{slug}
wpaikit knowledge install

/generate-design
/design-quality-check &lt;figma-url&gt;
/figma-design-system &lt;url&gt;
/figma-components
/prep-figma &lt;url&gt;

# дальше как Workflow A:
/setup-fonts
/design-system-to-code
/scan-components
/figma-to-block &lt;url&gt;
/validate-code`,
    'full.workflows.importantTitle': 'Важно',
    'full.workflows.importantText':
      'Один запуск <code>/figma-to-block</code> генерирует один блок. Для каждой секции страницы повторяйте команду отдельно и после каждого блока синхронизируйте ACF JSON в WordPress admin.',
    'full.situations.title': 'Частые ситуации',
    'full.situations.description': 'Короткая карта решений для ежедневной работы с проектом.',
    'full.situations.colSituation': 'Ситуация',
    'full.situations.colRun': 'Что запускать',
    'full.situations.colComment': 'Комментарий',
    'full.situations.newBlock': 'Новый блок из Figma',
    'full.situations.newBlockComment': 'Prep можно пропустить только если frame уже dev-ready.',
    'full.situations.tokensChanged': 'Дизайнер поменял цвета или шрифты',
    'full.situations.tokensChangedComment': 'После этого проверьте Tailwind и build.',
    'full.situations.pagesAdded': 'В Figma добавились страницы',
    'full.situations.pagesAddedComment': 'Новые токены добавляются, старые не удаляются.',
    'full.situations.componentAdded': 'Добавлена новая Twig/SCSS компонента',
    'full.situations.componentAddedComment': 'Обновляет registry для будущей генерации блоков.',
    'full.situations.afterGeneration': 'Нужна проверка после генерации',
    'full.situations.afterGenerationComment': 'Проверяет SCSS, Twig и PHP против rules.',
    'full.situations.findFiles': 'Разработчику надо найти файлы страницы',
    'full.situations.findFilesComment': 'Пишет markdown-референс по блокам страницы.',
    'full.keyFiles.title': 'Ключевые файлы проекта',
    'full.keyFiles.description': 'Эти файлы и папки чаще всего нужны при разработке и отладке.',
    'full.keyFiles.metadataTitle': 'Metadata и AI',
    'full.keyFiles.metadataConfig': '<code>.wpaikit.json</code> — имя, namespace, preset.',
    'full.keyFiles.metadataDesignSystem':
      '<code>.wpaikit/design-system.json</code> — cache токенов.',
    'full.keyFiles.metadataRegistry':
      '<code>.wpaikit/components-registry.md</code> — индекс компонентов.',
    'full.keyFiles.metadataKnowledge': '<code>knowledge/</code> — rules, prompts, skills.',
    'full.keyFiles.frontendMain': '<code>frontend/src/css/main.scss</code> — SCSS entry.',
    'full.keyFiles.frontendTailwind': '<code>frontend/tailwind.config.js</code> — Tailwind tokens.',
    'full.keyFiles.frontendComponents':
      '<code>frontend/src/css/components/</code> — component partials.',
    'full.keyFiles.frontendBlocks': '<code>frontend/src/css/blocks/</code> — block partials.',
    'full.keyFiles.themeTitle': 'WordPress theme',
    'full.keyFiles.themeBlocks': '<code>blocks/</code> — PHP classes for ACF blocks.',
    'full.keyFiles.themeViews': '<code>views/blocks/</code> — Twig block templates.',
    'full.keyFiles.themeComponents': '<code>views/components/</code> — reusable Twig components.',
    'full.keyFiles.themeAcf': '<code>acf-json/</code> — ACF field groups to sync in admin.',
    'full.update.title': 'Обновление wpaikit',
    'full.update.description':
      'CLI обновляется глобально, knowledge base обновляется отдельно в каждой теме.',
    'full.update.projectDevelopers': 'Для разработчиков проекта',
    'full.update.packageAuthor': 'Для автора пакета',
    'full.figmaIntro.title': 'Figma -> ACF block: подробные этапы',
    'full.figmaIntro.description':
      'Ниже остается прежняя детальная карта Figma-to-block процесса. Она полезна, когда проект уже инициализирован и нужно работать именно с дизайном и блоками.',
  },
  ro: {
    'nav.install': '1. Instalare',
    'nav.init': '2. wpaikit init',
    'nav.knowledge': '3. Knowledge Base',
    'nav.commands': '4. Comenzi',
    'nav.fullWorkflows': '5. Workflow-uri complete',
    'nav.situations': '6. Situatii frecvente',
    'nav.keyFiles': '7. Fisiere cheie',
    'nav.update': '8. Actualizare',
    'nav.figmaWorkflow': 'Figma -> Block',
    'fullHero.kicker': 'wpaikit -> WordPress -> Figma -> ACF -> Twig',
    'fullHero.title': 'Workflow complet wpaikit',
    'fullHero.description':
      'Traseu detaliat de la instalarea CLI si <code>wpaikit init</code> pana la generare de design, Design System, blocuri ACF, validare cod si actualizarea knowledge base.',
    'fullHero.sources': 'Surse principale',
    'fullHero.fastPath': 'Traseu rapid',
    'fullHero.pathInstall': 'Instaleaza CLI-ul si treci de <code>wpaikit doctor</code>.',
    'fullHero.pathInit': 'Ruleaza <code>wpaikit init</code> si configureaza WordPress.',
    'fullHero.pathKnowledge': 'Instaleaza knowledge base si ruleaza slash commands din tema.',
    'full.install.title': 'Instalare wpaikit',
    'full.install.description':
      'Incepe cu verificarea mediului local. CLI-ul se instaleaza global si apoi este folosit pentru crearea proiectului WordPress, instalarea knowledge base si actualizarea comenzilor.',
    'full.install.requirements': 'Cerinte minime',
    'full.install.fonttools':
      '<code>Python + fonttools</code> pentru comanda <code>/setup-fonts</code>',
    'full.install.global': 'Instalare globala',
    'full.install.check': 'Verificare',
    'full.install.doctorTitle': 'Ce verifica doctor',
    'full.install.doctorText':
      'Verifica Node, Git, Composer, npm si drepturile de scriere in directorul curent. Daca lipseste ceva, comanda arata ce trebuie instalat inainte de startul proiectului.',
    'full.init.description':
      'Comanda principala de start. Descarca WordPress, conecteaza boilerplate-ul, redenumeste tema si pregateste proiectul pentru configurarea manuala a bazei de date.',
    'full.init.questions': 'Intrebari interactive',
    'full.init.projectName': '<code>Project name</code> este numele lizibil al proiectului.',
    'full.init.slug': '<code>Slug</code> este numele folderului temei in kebab-case.',
    'full.init.namespace': '<code>Namespace</code> este namespace-ul PHP in PascalCase.',
    'full.init.location': '<code>Location</code> este un subdirector nou sau directorul curent.',
    'full.init.automatic': 'Pasi automati',
    'full.init.stepDownload': 'Descarca ultima versiune stabila WordPress.',
    'full.init.stepClone': 'Cloneaza boilerplate-ul in <code>wp-content/</code>.',
    'full.init.stepRename': 'Redenumeste tema, namespace-ul si text domain-ul.',
    'full.init.stepInstall': 'Ruleaza <code>composer install</code> si frontend build.',
    'full.init.stepMetadata': 'Creeaza <code>.wpaikit.json</code> cu metadatele proiectului.',
    'full.init.flags': 'Flag-uri utile',
    'full.init.manualTitle': 'Pasi manuali dupa init',
    'full.init.manualDb': 'Creeaza o baza de date locala prin Herd, MAMP, TablePlus sau CLI.',
    'full.init.manualConfig': 'Completeaza credentialele in <code>wp-config.php</code>.',
    'full.init.manualWizard': 'Deschide site-ul in browser si finalizeaza WordPress wizard.',
    'full.init.manualTheme': 'Activeaza tema in <code>wp-admin -> Appearance -> Themes</code>.',
    'full.knowledge.title': 'Instalare Knowledge Base',
    'full.knowledge.description':
      'Dupa crearea proiectului, intra in radacina temei. Toate comenzile AI de mai jos trebuie rulate de acolo, ca agentii sa vada rules, prompts si skills corecte.',
    'full.knowledge.copiedTitle': 'Ce se copiaza',
    'full.knowledge.copiedKnowledge': '<code>knowledge/</code> contine rules, prompts si skills.',
    'full.knowledge.copiedClaude':
      '<code>CLAUDE.md</code> contine instructiuni pentru Claude Code.',
    'full.knowledge.copiedAgents':
      '<code>AGENTS.md</code> contine instructiuni pentru Codex/OpenAI.',
    'full.knowledge.copiedCommands': '<code>.claude/commands/</code> contine slash commands.',
    'full.knowledge.updateTitle': 'Cand se actualizeaza',
    'full.knowledge.updateText':
      'Dupa actualizarea CLI-ului global sau cand o comanda primeste un prompt/skill nou.',
    'full.knowledge.ruleTitle': 'Regula de lucru',
    'full.knowledge.ruleText':
      'CLI-ul face operatii deterministe. Comenzile AI interpreteaza Figma, brief-ul, structura blocurilor si deciziile de design.',
    'full.commands.title': 'Comenzi si cand se ruleaza',
    'full.commands.description':
      'Comenzile ruleaza in Claude Code din radacina temei. Fiecare comanda citeste inainte fisierele necesare din <code>knowledge/</code>.',
    'full.commands.generateDesign':
      'Colecteaza interactiv brief-ul, Figma project URL, referinte, Design System, brand assets, icon library si Pexels API key, apoi genereaza UI in Figma.',
    'full.commands.designQuality':
      'Verifica brief-ul sau Figma frames pentru category reflex, banned patterns, strategie de culoare, register consistency, theme logic, typography si layout rhythm.',
    'full.commands.analyzeFigma':
      'Auditeaza un Figma frame pentru readiness de implementare: Auto Layout, token-uri, responsive variants, reusable components si semantic naming.',
    'full.commands.figmaDesignSystem':
      'Extrage colors, typography, spacing, radius si UI patterns din 4-6 representative frames. Creeaza Design System page, Variables, Text Styles si <code>.wpaikit/design-system.json</code>.',
    'full.commands.figmaComponents':
      'Creeaza Figma Component Sets cu variante Type x Size x State pe baza patterns din <code>design-system.json</code>.',
    'full.commands.updateDesignSystem':
      'Adauga frame-uri noi in Design System existent fara a sterge token-urile vechi. Face diff, append in Figma si merge JSON.',
    'full.commands.syncTokens':
      'Sincronizeaza <code>design-system.json</code> cand designerul modifica manual Variables sau Text Styles. Token-urile sterse sunt marcate <code>deprecated</code>.',
    'full.commands.prepFigma':
      'Creeaza pagina Dev Ready, redenumeste semantic layers, leaga styles de tokens, inlocuieste elemente detached cu componente si adauga Auto Layout.',
    'full.commands.setupFonts':
      'Compara font families/weights necesare cu fisierele din <code>frontend/src/fonts/</code>, elimina ce nu se foloseste, converteste TTF/OTF in woff2/woff si genereaza <code>_fonts.scss</code>.',
    'full.commands.designSystemToCode':
      'Genereaza Twig components, SCSS partials, actualizeaza Tailwind config si adauga imports in <code>main.scss</code>.',
    'full.commands.scanComponents':
      'Indexeaza componente Twig si SCSS, BEM blocks/elements/modifiers si scrie <code>.wpaikit/components-registry.md</code> pentru reutilizare.',
    'full.commands.figmaToBlock':
      'Genereaza un bloc ACF per rulare: PHP class, Twig template, SCSS partial si ACF JSON. Dupa fiecare bloc trebuie sync in wp-admin Custom Fields.',
    'full.commands.validateCode':
      'Verifica SCSS, Twig si PHP conform rules. Poate repara BEM, raw CSS, hardcoded hex, autoescape mistakes, namespaces si image fields.',
    'full.commands.commentFrontend':
      'Citeste direct baza de date WordPress, parseaza blocuri ACF din <code>post_content</code> si genereaza developer reference cu cai Twig, SCSS, PHP si JS.',
    'full.workflows.title': 'Workflow-uri complete',
    'full.workflows.description':
      'Doua scenarii de baza: proiect cu design existent si proiect in care designul se genereaza mai intai in Figma.',
    'full.workflows.aTitle': 'Workflow A - designul exista deja in Figma',
    'full.workflows.aCode': `npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor
wpaikit init

# manual:
# creeaza DB, configureaza wp-config.php,
# finalizeaza WordPress wizard, activeaza tema

cd wp-content/themes/{slug}
wpaikit knowledge install

/analyze-figma &lt;url&gt;
/figma-design-system &lt;url&gt;
/figma-components
/prep-figma &lt;url&gt;
/setup-fonts
/design-system-to-code
cd frontend && npm run build
/scan-components
/figma-to-block &lt;url&gt;
/validate-code`,
    'full.workflows.bTitle': 'Workflow B - proiect fara design',
    'full.workflows.bCode': `npm install -g @veaceslav-golden/wp-ai-kit-core
npm install -g @veaceslav-golden/wp-ai-kit
wpaikit doctor
wpaikit init
cd wp-content/themes/{slug}
wpaikit knowledge install

/generate-design
/design-quality-check &lt;figma-url&gt;
/figma-design-system &lt;url&gt;
/figma-components
/prep-figma &lt;url&gt;

# apoi continua ca in Workflow A:
/setup-fonts
/design-system-to-code
/scan-components
/figma-to-block &lt;url&gt;
/validate-code`,
    'full.workflows.importantTitle': 'Important',
    'full.workflows.importantText':
      'O rulare <code>/figma-to-block</code> genereaza un singur bloc. Repeta comanda separat pentru fiecare sectiune de pagina si sincronizeaza ACF JSON in WordPress admin dupa fiecare bloc.',
    'full.situations.title': 'Situatii frecvente',
    'full.situations.description': 'Harta scurta de decizii pentru lucrul zilnic cu proiectul.',
    'full.situations.colSituation': 'Situatie',
    'full.situations.colRun': 'Ce rulezi',
    'full.situations.colComment': 'Comentariu',
    'full.situations.newBlock': 'Bloc nou din Figma',
    'full.situations.newBlockComment':
      'Prep poate fi sarit doar daca frame-ul este deja dev-ready.',
    'full.situations.tokensChanged': 'Designerul a schimbat culori sau fonturi',
    'full.situations.tokensChangedComment': 'Dupa asta verifica Tailwind si build-ul.',
    'full.situations.pagesAdded': 'In Figma au fost adaugate pagini',
    'full.situations.pagesAddedComment': 'Token-urile noi se adauga, cele vechi nu se sterg.',
    'full.situations.componentAdded': 'A fost adaugata o componenta Twig/SCSS noua',
    'full.situations.componentAddedComment':
      'Actualizeaza registry-ul pentru generari viitoare de blocuri.',
    'full.situations.afterGeneration': 'Este necesara verificarea dupa generare',
    'full.situations.afterGenerationComment': 'Verifica SCSS, Twig si PHP conform rules.',
    'full.situations.findFiles': 'Developerul trebuie sa gaseasca fisierele paginii',
    'full.situations.findFilesComment': 'Scrie un markdown reference pentru blocurile paginii.',
    'full.keyFiles.title': 'Fisiere cheie ale proiectului',
    'full.keyFiles.description':
      'Aceste fisiere si foldere sunt cel mai des necesare la dezvoltare si debugging.',
    'full.keyFiles.metadataTitle': 'Metadata si AI',
    'full.keyFiles.metadataConfig': '<code>.wpaikit.json</code> - nume, namespace, preset.',
    'full.keyFiles.metadataDesignSystem':
      '<code>.wpaikit/design-system.json</code> - cache token-uri.',
    'full.keyFiles.metadataRegistry':
      '<code>.wpaikit/components-registry.md</code> - index componente.',
    'full.keyFiles.metadataKnowledge': '<code>knowledge/</code> - rules, prompts, skills.',
    'full.keyFiles.frontendMain': '<code>frontend/src/css/main.scss</code> - SCSS entry.',
    'full.keyFiles.frontendTailwind': '<code>frontend/tailwind.config.js</code> - Tailwind tokens.',
    'full.keyFiles.frontendComponents':
      '<code>frontend/src/css/components/</code> - component partials.',
    'full.keyFiles.frontendBlocks': '<code>frontend/src/css/blocks/</code> - block partials.',
    'full.keyFiles.themeTitle': 'Tema WordPress',
    'full.keyFiles.themeBlocks': '<code>blocks/</code> - clase PHP pentru blocuri ACF.',
    'full.keyFiles.themeViews': '<code>views/blocks/</code> - template-uri Twig pentru blocuri.',
    'full.keyFiles.themeComponents':
      '<code>views/components/</code> - componente Twig reutilizabile.',
    'full.keyFiles.themeAcf': '<code>acf-json/</code> - field groups ACF pentru sync in admin.',
    'full.update.title': 'Actualizare wpaikit',
    'full.update.description':
      'CLI-ul se actualizeaza global, iar knowledge base se actualizeaza separat in fiecare tema.',
    'full.update.projectDevelopers': 'Pentru developerii proiectului',
    'full.update.packageAuthor': 'Pentru autorul pachetului',
    'full.figmaIntro.title': 'Figma -> ACF block: etape detaliate',
    'full.figmaIntro.description':
      'Mai jos ramane harta detaliata a procesului Figma-to-block. Este utila dupa initializarea proiectului, cand lucrul se muta specific pe design si blocuri.',
  },
}

for (const [language, dictionary] of Object.entries(fullDocumentationTranslations)) {
  Object.assign(translations[language], dictionary)
}

const fallbackLanguage = 'en'
const storageKey = 'wpaikit.workflow.language'
let activeLanguage = fallbackLanguage

function resolveLanguage(language) {
  return Object.prototype.hasOwnProperty.call(translations, language) ? language : fallbackLanguage
}

function readStoredLanguage() {
  try {
    return localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

function storeLanguage(language) {
  try {
    localStorage.setItem(storageKey, language)
  } catch {
    // Language switching should still work for the current page load if storage is unavailable.
  }
}

function applyLanguage(language) {
  const resolvedLanguage = resolveLanguage(language)
  const dictionary = translations[resolvedLanguage]

  activeLanguage = resolvedLanguage
  document.documentElement.lang = resolvedLanguage

  for (const element of document.querySelectorAll('[data-i18n]')) {
    const key = element.getAttribute('data-i18n')
    if (key && dictionary[key]) {
      element.textContent = dictionary[key]
    }
  }

  for (const element of document.querySelectorAll('[data-i18n-html]')) {
    const key = element.getAttribute('data-i18n-html')
    if (key && dictionary[key]) {
      element.innerHTML = dictionary[key]
    }
  }

  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) {
    const key = element.getAttribute('data-i18n-placeholder')
    if (key && dictionary[key]) {
      element.setAttribute('placeholder', dictionary[key])
    }
  }

  for (const button of document.querySelectorAll('[data-lang]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === resolvedLanguage))
  }

  storeLanguage(resolvedLanguage)
}

for (const button of document.querySelectorAll('[data-lang]')) {
  button.addEventListener('click', () => {
    applyLanguage(button.dataset.lang)
    filterReferenceCards()
  })
}

applyLanguage(readStoredLanguage() || fallbackLanguage)

const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'))
const navTargets = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean)

function setActiveNav(sectionId) {
  for (const link of navLinks) {
    const isActive = link.getAttribute('href') === `#${sectionId}`
    link.classList.toggle('is-active', isActive)

    if (isActive) {
      link.setAttribute('aria-current', 'true')
    } else {
      link.removeAttribute('aria-current')
    }
  }
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visibleEntry) {
        setActiveNav(visibleEntry.target.id)
      }
    },
    {
      rootMargin: '-20% 0px -55%',
      threshold: [0.12, 0.32, 0.56],
    },
  )

  for (const target of navTargets) {
    observer.observe(target)
  }
} else if (navTargets[0]) {
  setActiveNav(navTargets[0].id)
}

const referenceSearch = document.querySelector('[data-reference-search]')
const referenceCards = Array.from(document.querySelectorAll('[data-doc-card]'))
const referenceFilterButtons = Array.from(document.querySelectorAll('[data-doc-filter]'))
const referenceEmpty = document.querySelector('[data-reference-empty]')
let activeReferenceFilter = 'all'

function normalizeSearchText(value) {
  return value.toLocaleLowerCase().trim()
}

function filterReferenceCards() {
  const query = normalizeSearchText(referenceSearch?.value || '')
  let visibleCount = 0

  for (const card of referenceCards) {
    const matchesFilter =
      activeReferenceFilter === 'all' || card.dataset.docType === activeReferenceFilter
    const matchesSearch = !query || normalizeSearchText(card.textContent).includes(query)
    const isVisible = matchesFilter && matchesSearch

    card.hidden = !isVisible

    if (isVisible) {
      visibleCount += 1
    }
  }

  if (referenceEmpty) {
    referenceEmpty.hidden = visibleCount > 0
  }
}

for (const button of referenceFilterButtons) {
  button.addEventListener('click', () => {
    activeReferenceFilter = button.dataset.docFilter || 'all'

    for (const filterButton of referenceFilterButtons) {
      filterButton.setAttribute(
        'aria-pressed',
        String(filterButton.dataset.docFilter === activeReferenceFilter),
      )
    }

    filterReferenceCards()
  })
}

referenceSearch?.addEventListener('input', filterReferenceCards)
filterReferenceCards()

const markdownViewer = document.querySelector('.md-viewer')
const markdownViewerTitle = document.querySelector('[data-md-viewer-title]')
const markdownViewerPath = document.querySelector('[data-md-viewer-path]')
const markdownViewerContent = document.querySelector('[data-md-viewer-content]')
const markdownViewerRaw = document.querySelector('[data-md-viewer-raw]')
const markdownViewerClose = document.querySelector('[data-md-viewer-close]')

function translate(key) {
  return translations[activeLanguage]?.[key] || translations[fallbackLanguage]?.[key] || key
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  )
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

function sanitizeHref(href) {
  try {
    const url = new URL(href, window.location.href)
    const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'file:'])

    return allowedProtocols.has(url.protocol) ? escapeAttribute(url.href) : '#'
  } catch {
    return '#'
  }
}

function formatInlineWithoutLinks(text) {
  const codeFragments = []
  let formatted = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    const index = codeFragments.push(`<code>${code}</code>`) - 1

    return `@@CODE_FRAGMENT_${index}@@`
  })

  formatted = formatted
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')

  return formatted.replace(/@@CODE_FRAGMENT_(\d+)@@/g, (_, index) => codeFragments[Number(index)])
}

function formatInline(text) {
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let cursor = 0
  let formatted = ''

  for (const match of text.matchAll(linkPattern)) {
    formatted += formatInlineWithoutLinks(text.slice(cursor, match.index))
    formatted += `<a href="${sanitizeHref(match[2])}" target="_blank" rel="noopener noreferrer">${formatInlineWithoutLinks(match[1])}</a>`
    cursor = match.index + match[0].length
  }

  return formatted + formatInlineWithoutLinks(text.slice(cursor))
}

function isTableDivider(line) {
  return /^\s*\|?[\s:-]+\|[\s|:-]+\|?\s*$/.test(line)
}

function isTableStart(lines, index) {
  return lines[index]?.includes('|') && isTableDivider(lines[index + 1] || '')
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderTable(lines, startIndex) {
  const headers = splitTableRow(lines[startIndex])
  const rows = []
  let cursor = startIndex + 2

  while (cursor < lines.length && lines[cursor].includes('|') && lines[cursor].trim() !== '') {
    rows.push(splitTableRow(lines[cursor]))
    cursor += 1
  }

  const headerHtml = headers.map((cell) => `<th>${formatInline(cell)}</th>`).join('')
  const rowsHtml = rows
    .map(
      (row) =>
        `<tr>${headers.map((_, index) => `<td>${formatInline(row[index] || '')}</td>`).join('')}</tr>`,
    )
    .join('')

  return {
    html: `<div class="md-table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`,
    nextIndex: cursor,
  }
}

function isBlockStart(lines, index) {
  const line = lines[index] || ''

  return (
    line.startsWith('```') ||
    /^#{1,6}\s+/.test(line) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    /^>\s?/.test(line) ||
    isTableStart(lines, index)
  )
}

function renderList(lines, startIndex, ordered) {
  const pattern = ordered ? /^\s*\d+\.\s+(.+)/ : /^\s*[-*]\s+(.+)/
  const tag = ordered ? 'ol' : 'ul'
  const items = []
  let cursor = startIndex

  while (cursor < lines.length) {
    const match = lines[cursor].match(pattern)

    if (!match) {
      break
    }

    items.push(`<li>${formatInline(match[1])}</li>`)
    cursor += 1
  }

  return {
    html: `<${tag}>${items.join('')}</${tag}>`,
    nextIndex: cursor,
  }
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim() === '') {
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const language = line.replace(/^```/, '').trim() || 'text'
      const codeLines = []
      index += 1

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      index += 1
      blocks.push(
        `<pre class="md-code"><span class="md-code__label">${escapeHtml(language)}</span><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
      )
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)/)
    if (heading) {
      const level = Math.min(heading[1].length, 5)
      blocks.push(`<h${level}>${formatInline(heading[2])}</h${level}>`)
      index += 1
      continue
    }

    if (isTableStart(lines, index)) {
      const table = renderTable(lines, index)
      blocks.push(table.html)
      index = table.nextIndex
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const list = renderList(lines, index, false)
      blocks.push(list.html)
      index = list.nextIndex
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const list = renderList(lines, index, true)
      blocks.push(list.html)
      index = list.nextIndex
      continue
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = []

      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }

      blocks.push(`<blockquote>${formatInline(quoteLines.join(' '))}</blockquote>`)
      continue
    }

    const paragraphLines = []

    while (index < lines.length && lines[index].trim() !== '' && !isBlockStart(lines, index)) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push(`<p>${formatInline(paragraphLines.join(' '))}</p>`)
  }

  return `<article class="md-document">${blocks.join('')}</article>`
}

function renderMarkdownLoading() {
  return `<div class="md-skeleton" aria-label="${escapeAttribute(translate('modal.loading'))}"><span></span><span></span><span></span><span></span></div>`
}

function renderMarkdownError() {
  return `<div class="md-viewer__error"><strong>${escapeHtml(translate('modal.errorTitle'))}</strong><span>${escapeHtml(translate('modal.errorText'))}</span></div>`
}

function loadMarkdownFrameFallback(sourceUrl) {
  if (!markdownViewerContent) {
    return
  }

  markdownViewerContent.innerHTML = `<iframe class="md-viewer__frame" src="${escapeAttribute(sourceUrl.href)}" title="${escapeAttribute(markdownViewerTitle?.textContent || translate('modal.untitled'))}"></iframe>`
  const frame = markdownViewerContent.querySelector('.md-viewer__frame')

  frame?.addEventListener('load', () => {
    try {
      const frameText =
        frame.contentDocument?.body?.innerText ||
        frame.contentDocument?.documentElement?.innerText ||
        ''

      if (frameText.trim()) {
        markdownViewerContent.innerHTML = renderMarkdown(frameText)
      }
    } catch {
      // Some browsers isolate file:// frames. In that case the iframe still shows the raw file.
    }
  })
}

function getMarkdownFileName(link) {
  const href = link.getAttribute('href') || ''
  const parts = href.split('/')

  return parts[parts.length - 1] || translate('modal.untitled')
}

async function openMarkdownViewer(link) {
  if (!markdownViewer || !markdownViewerContent || !markdownViewerTitle || !markdownViewerPath) {
    return
  }

  const href = link.getAttribute('href')
  const fileName = getMarkdownFileName(link)
  const sourceUrl = new URL(href, window.location.href)

  markdownViewerTitle.textContent = fileName
  markdownViewerPath.textContent = href.replace(/^\.\.\//, '')
  markdownViewerContent.innerHTML = renderMarkdownLoading()

  if (markdownViewerRaw) {
    markdownViewerRaw.href = sourceUrl.href
  }

  if (!markdownViewer.open) {
    markdownViewer.showModal()
  }

  try {
    const response = await fetch(sourceUrl.href, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`)
    }

    const markdown = await response.text()
    markdownViewerContent.innerHTML = renderMarkdown(markdown)
  } catch {
    if (window.location.protocol === 'file:' || sourceUrl.protocol === 'file:') {
      loadMarkdownFrameFallback(sourceUrl)
    } else {
      markdownViewerContent.innerHTML = renderMarkdownError()
    }
  }
}

if (markdownViewer && typeof markdownViewer.showModal === 'function') {
  for (const link of document.querySelectorAll('a[href$=".md"]')) {
    link.classList.add('md-link')
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      event.preventDefault()
      openMarkdownViewer(link)
    })
  }

  markdownViewerClose?.addEventListener('click', () => markdownViewer.close())

  markdownViewer.addEventListener('click', (event) => {
    if (event.target === markdownViewer) {
      markdownViewer.close()
    }
  })
}
