import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import type { PluginRequirement } from './woocommerce-plugins.js'

export const ACF_PRO_SLUG = 'advanced-custom-fields-pro'

/** Theme blocks are ACF Blocks v3 with inline editing, available since ACF PRO 6.7. */
export const ACF_PRO_MIN_VERSION = '6.7.0'

/** Path to the licensed ACF PRO zip used by `wpaikit init` when `--acf-zip` is not passed. */
export const ACF_PRO_ZIP_ENV = 'WPKIT_ACF_PRO_ZIP'

/** ACF PRO is licensed, so every project installs its own copy in wp-content/plugins. */
export const ACF_PRO: PluginRequirement = {
  slug: ACF_PRO_SLUG,
  label: 'Advanced Custom Fields PRO',
  source: 'licensed',
}

/** Reads the `Version:` header of an ACF PRO plugin directory, or null when it is not ACF. */
export function readAcfProVersion(pluginDir: string): string | null {
  const mainFile = resolve(pluginDir, 'acf.php')
  if (!existsSync(mainFile)) return null

  const match = readFileSync(mainFile, 'utf-8').match(/^\s*\*\s*Version:\s*(\d[\w.-]*)/m)
  return match?.[1] ?? null
}

function versionParts(version: string): number[] {
  return version
    .split(/[.-]/)
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10) || 0)
}

export function isSupportedAcfProVersion(version: string): boolean {
  const actual = versionParts(version)
  const minimum = versionParts(ACF_PRO_MIN_VERSION)

  for (let i = 0; i < minimum.length; i++) {
    const a = actual[i] ?? 0
    const m = minimum[i] ?? 0
    if (a !== m) return a > m
  }

  return true
}

/** Expands a leading `~/` so prompt and env values behave like shell paths. */
export function resolveUserPath(path: string, cwd: string = process.cwd()): string {
  const trimmed = path.trim()
  if (trimmed === '~') return homedir()
  if (trimmed.startsWith('~/')) return resolve(homedir(), trimmed.slice(2))
  return resolve(cwd, trimmed)
}
