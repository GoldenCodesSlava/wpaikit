import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { exec, logger } from '@veaceslav-golden/wp-ai-kit-core'
import type { WooCommerceProjectConfig } from '@veaceslav-golden/wp-ai-kit-core'

export function getWooConfigureArgs(config: WooCommerceProjectConfig): string[] {
  return [
    'bin/configure.php',
    `--multilingual=${config.multilingual}`,
    `--variant-catalog=${config.variantCatalog}`,
    `--wishlist=${config.wishlist ? 'yes' : 'no'}`,
    '--non-interactive',
  ]
}

export async function configureWooBoilerplate(
  targetDir: string,
  slug: string,
  config: WooCommerceProjectConfig,
): Promise<void> {
  const themeDir = resolve(targetDir, 'wp-content', 'themes', slug)
  const configureScript = resolve(themeDir, 'bin', 'configure.php')

  if (!existsSync(configureScript)) {
    throw new Error(`WooCommerce initializer not found: ${configureScript}`)
  }

  logger.step('Configuring WooCommerce boilerplate...')
  await exec('php', getWooConfigureArgs(config), { cwd: themeDir, verbose: false })
  logger.step('WooCommerce boilerplate configured')
}
