import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { exec, logger } from '@veaceslav-golden/wp-ai-kit-core'
import type { Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import {
  ACF_PRO_MIN_VERSION,
  ACF_PRO_SLUG,
  isSupportedAcfProVersion,
  readAcfProVersion,
} from '../../../acf-pro.js'

/**
 * Unpacks the licensed ACF PRO zip into wp-content/plugins/advanced-custom-fields-pro.
 * Activation happens later in wp-admin (no database at scaffold time). Returns the installed version.
 */
export async function installAcfPro(
  targetDir: string,
  zipPath: string,
  rollback: Rollback,
): Promise<string> {
  const pluginsDir = resolve(targetDir, 'wp-content', 'plugins')
  const pluginDir = resolve(pluginsDir, ACF_PRO_SLUG)

  if (existsSync(pluginDir)) {
    const version = readAcfProVersion(pluginDir) ?? 'unknown version'
    logger.warn(`ACF PRO already present (${version}), keeping the existing copy`)
    return version
  }

  if (!existsSync(zipPath)) {
    throw new Error(`ACF PRO zip not found: ${zipPath}`)
  }

  mkdirSync(pluginsDir, { recursive: true })
  // Stage next to the target so the final rename never crosses filesystems.
  const stagingDir = mkdtempSync(join(pluginsDir, '.acf-pro-'))

  try {
    await exec('unzip', ['-q', zipPath, '-d', stagingDir])

    const extractedDir = resolve(stagingDir, ACF_PRO_SLUG)
    const version = readAcfProVersion(extractedDir)

    if (!version) {
      throw new Error(
        `${zipPath} is not an ACF PRO package (expected ${ACF_PRO_SLUG}/acf.php inside the zip)`,
      )
    }

    if (!isSupportedAcfProVersion(version)) {
      throw new Error(
        `ACF PRO ${version} is too old: theme blocks need ACF Blocks v3 (ACF PRO ${ACF_PRO_MIN_VERSION}+)`,
      )
    }

    renameSync(extractedDir, pluginDir)
    rollback.add(() => {
      rmSync(pluginDir, { recursive: true, force: true })
    })

    logger.step(`ACF PRO ${version} installed in wp-content/plugins/${ACF_PRO_SLUG}`)
    return version
  } finally {
    rmSync(stagingDir, { recursive: true, force: true })
  }
}
