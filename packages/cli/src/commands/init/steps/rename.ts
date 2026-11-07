import { readdirSync, statSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { logger } from '@veaceslav-golden/wp-ai-kit-core'
import {
  BOILERPLATE_THEME_SLUG,
  BOILERPLATE_NAMESPACE,
  BOILERPLATE_TEXT_DOMAIN,
  BOILERPLATE_THEME_NAME,
  BOILERPLATE_COMPOSER_NAME,
} from '../../../constants.js'

const TEXT_EXTENSIONS = new Set([
  '.php',
  '.json',
  '.css',
  '.scss',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.twig',
  '.html',
  '.txt',
  '.md',
  '.xml',
  '.neon',
  '.yml',
  '.yaml',
])

type Replacement = [string | RegExp, string]

function replaceInFile(filePath: string, replacements: Replacement[]): void {
  let content = readFileSync(filePath, 'utf-8')
  let changed = false
  for (const [from, to] of replacements) {
    const next = typeof from === 'string' ? content.replaceAll(from, to) : content.replace(from, to)
    if (next !== content) {
      changed = true
      content = next
    }
  }
  if (changed) {
    writeFileSync(filePath, content, 'utf-8')
  }
}

function walkDir(dir: string, callback: (filePath: string) => void): void {
  for (const entry of readdirSync(dir)) {
    // Skip vendor/node_modules and hidden dirs; hidden files (.eslintrc.cjs) are still renamed
    if (entry === 'vendor' || entry === 'node_modules') continue
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (entry.startsWith('.')) continue
      walkDir(fullPath, callback)
    } else {
      callback(fullPath)
    }
  }
}

export function renameBoilerplate(
  targetDir: string,
  projectName: string,
  slug: string,
  namespace: string,
  textDomain: string,
): void {
  logger.step('Renaming boilerplate identifiers...')

  const themesDir = resolve(targetDir, 'wp-content', 'themes')
  const boilerplateThemeDir = resolve(themesDir, BOILERPLATE_THEME_SLUG)
  const newThemeDir = resolve(themesDir, slug)
  const javascriptPrefix = `${namespace.charAt(0).toLowerCase()}${namespace.slice(1)}`
  const javascriptGlobal = `${javascriptPrefix}Theme`
  // PHP functions, hooks, option/meta keys and nonces cannot reuse a hyphenated slug.
  const snakeSlug = slug.replace(/-/g, '_')

  if (!existsSync(boilerplateThemeDir)) {
    throw new Error(`Expected theme folder "themes/${BOILERPLATE_THEME_SLUG}" not found`)
  }

  // Replacements applied to file contents (order matters — most specific first)
  const replacements: Replacement[] = [
    // JavaScript identifiers cannot contain the hyphens allowed in a project slug.
    ['boilerplateTheme', javascriptGlobal],
    // Other camelCase JavaScript globals: window.boilerplateToast → window.mySiteToast
    [/(?<![A-Za-z0-9])boilerplate(?=[A-Z])/g, javascriptPrefix],
    // snake_case identifiers: boilerplate_sync_wishlist, _boilerplate_get_variant
    [/boilerplate_/g, `${snakeSlug}_`],
    [/_boilerplate(?![A-Za-z0-9])/g, `_${snakeSlug}`],
    // PHP namespace: "namespace Boilerplate\" → "namespace {Namespace}\"
    [`namespace ${BOILERPLATE_NAMESPACE}\\`, `namespace ${namespace}\\`],
    // PHP use statements: "use Boilerplate\" → "use {Namespace}\"
    [`use ${BOILERPLATE_NAMESPACE}\\`, `use ${namespace}\\`],
    // Fully-qualified PHP references: "\Boilerplate\" → "\{Namespace}\"
    [`\\${BOILERPLATE_NAMESPACE}\\`, `\\${namespace}\\`],
    // Composer autoload PSR-4 key: "Boilerplate\\" → "{Namespace}\\"
    [`${BOILERPLATE_NAMESPACE}\\\\`, `${namespace}\\\\`],
    // composer.json name: "boilerplate/wordpress-theme" → "{slug}/wordpress-theme"
    [BOILERPLATE_COMPOSER_NAME, `${slug}/wordpress-theme`],
    // style.css Theme Name (the preset boilerplates prefix it, e.g. "WooCommerce Boilerplate")
    [/^Theme Name:.*$/m, `Theme Name: ${projectName}`],
    // Remaining namespace references without a leading backslash: new Boilerplate\Theme\...
    [new RegExp(`(?<![A-Za-z0-9_\\\\])${BOILERPLATE_NAMESPACE}\\\\(?=[A-Z])`, 'g'), `${namespace}\\`],
    // File docblocks
    [`@package ${BOILERPLATE_NAMESPACE}`, `@package ${namespace}`],
    // Human-facing block category names
    [`${BOILERPLATE_THEME_NAME} Blocks`, `${projectName} Blocks`],
    // Text domain in PHP: 'boilerplate' → '{textDomain}'
    [`'${BOILERPLATE_TEXT_DOMAIN}'`, `'${textDomain}'`],
    // Text domain in JSON/twig: "boilerplate" → "{textDomain}"
    [`"${BOILERPLATE_TEXT_DOMAIN}"`, `"${textDomain}"`],
    // ACF JSON field keys that reference the theme slug
    [BOILERPLATE_THEME_SLUG, slug],
  ]

  // Process all text files inside the theme folder
  walkDir(boilerplateThemeDir, (filePath) => {
    const ext = filePath.slice(filePath.lastIndexOf('.'))
    if (TEXT_EXTENSIONS.has(ext)) {
      replaceInFile(filePath, replacements)
    }
  })

  const boilerplateConfig = resolve(boilerplateThemeDir, 'boilerplate-config.php')
  if (existsSync(boilerplateConfig)) {
    renameSync(boilerplateConfig, resolve(boilerplateThemeDir, `${slug}-config.php`))
  }

  // Rename theme folder last
  renameSync(boilerplateThemeDir, newThemeDir)

  logger.step(`Theme renamed: themes/${BOILERPLATE_THEME_SLUG} → themes/${slug}`)
}
