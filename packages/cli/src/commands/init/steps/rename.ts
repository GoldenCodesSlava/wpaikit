import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
} from 'node:fs'
import { resolve, join } from 'node:path'
import { logger } from '@golden/wp-ai-kit-core'
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
  '.js',
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

function replaceInFile(filePath: string, replacements: Array<[string, string]>): void {
  let content = readFileSync(filePath, 'utf-8')
  let changed = false
  for (const [from, to] of replacements) {
    const next = content.replaceAll(from, to)
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
    // Skip hidden dirs and vendor/node_modules
    if (entry.startsWith('.') || entry === 'vendor' || entry === 'node_modules') continue
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
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

  if (!existsSync(boilerplateThemeDir)) {
    throw new Error(`Expected theme folder "themes/${BOILERPLATE_THEME_SLUG}" not found`)
  }

  // Replacements applied to file contents (order matters — most specific first)
  const replacements: Array<[string, string]> = [
    // PHP namespace: "namespace Boilerplate\" → "namespace {Namespace}\"
    [`namespace ${BOILERPLATE_NAMESPACE}\\`, `namespace ${namespace}\\`],
    // PHP use statements: "use Boilerplate\" → "use {Namespace}\"
    [`use ${BOILERPLATE_NAMESPACE}\\`, `use ${namespace}\\`],
    // Composer autoload PSR-4 key: "Boilerplate\\" → "{Namespace}\\"
    [`${BOILERPLATE_NAMESPACE}\\\\`, `${namespace}\\\\`],
    // composer.json name: "boilerplate/wordpress-theme" → "{slug}/wordpress-theme"
    [BOILERPLATE_COMPOSER_NAME, `${slug}/wordpress-theme`],
    // style.css Theme Name
    [`Theme Name: ${BOILERPLATE_THEME_NAME}`, `Theme Name: ${projectName}`],
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

  // Rename theme folder last
  renameSync(boilerplateThemeDir, newThemeDir)

  logger.step(`Theme renamed: themes/${BOILERPLATE_THEME_SLUG} → themes/${slug}`)
}
