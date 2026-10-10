import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { exec, logger } from '@veaceslav-golden/wp-ai-kit-core'
import type { SeoProfile, WooCommerceProjectConfig } from '@veaceslav-golden/wp-ai-kit-core'
import type { PresetId } from '../../../presets.js'
import { getSeoConfigureArg } from '../../../seo.js'

export function getWooConfigureArgs(config: WooCommerceProjectConfig, seo: SeoProfile): string[] {
  return [
    'bin/configure.php',
    `--multilingual=${config.multilingual}`,
    `--variant-catalog=${config.variantCatalog}`,
    `--wishlist=${config.wishlist ? 'yes' : 'no'}`,
    getSeoConfigureArg(seo),
    '--non-interactive',
  ]
}

export function getStandardConfigureArgs(seo: SeoProfile): string[] {
  return ['bin/configure.php', getSeoConfigureArg(seo), '--non-interactive']
}

/** Runs the theme's own bin/configure.php, which applies the init choices to the cloned theme. */
export async function configureBoilerplate(
  targetDir: string,
  slug: string,
  preset: PresetId,
  args: string[],
): Promise<void> {
  const themeDir = resolve(targetDir, 'wp-content', 'themes', slug)
  const configureScript = resolve(themeDir, 'bin', 'configure.php')
  const label = preset === 'woo' ? 'WooCommerce' : 'Standard'

  if (!existsSync(configureScript)) {
    throw new Error(`${label} initializer not found: ${configureScript}`)
  }

  logger.step(`Configuring ${label} boilerplate...`)
  await exec('php', args, { cwd: themeDir, verbose: false })
  logger.step(`${label} boilerplate configured`)
}
