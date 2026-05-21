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
  },
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
