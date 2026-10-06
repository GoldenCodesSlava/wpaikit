import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeConfig } from '@veaceslav-golden/wp-ai-kit-core'
import { getPreset } from '../presets.js'
import { getCloneArgs } from '../commands/init/steps/clone-boilerplate.js'
import { getWooConfigureArgs } from '../commands/init/steps/configure-boilerplate.js'
import { getPostInstallTasks } from '../commands/init/steps/post-install.js'
import { askWooCommerceQuestions } from '../commands/init/prompts.js'
import { getWooPluginRequirements } from '../woocommerce-plugins.js'
import { checkCatalogPhpRuntime, checkProjectPlugins } from '../commands/doctor/checks.js'

describe('WooCommerce init contracts', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `wpaikit-woo-test-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('resolves the WooCommerce repository and branch', () => {
    const preset = getPreset('woo')
    expect(preset.repo).toContain('WP-Boilerplate-Woocommerce.git')
    expect(preset.branch).toBe('master')
    expect(getCloneArgs(preset, '/tmp/boilerplate')).toEqual([
      'clone',
      '--depth',
      '1',
      '--branch',
      'master',
      preset.repo,
      '/tmp/boilerplate',
    ])
  })

  it('resolves the Standard repository from the master branch', () => {
    const preset = getPreset('standard')
    expect(preset.repo).toContain('boilerplate-wp-standard.git')
    expect(preset.branch).toBe('master')
    expect(getCloneArgs(preset, '/tmp/boilerplate')).toContain('master')
  })

  it('maps non-interactive Woo options to the theme initializer', async () => {
    const config = await askWooCommerceQuestions('woo', {
      multilingual: 'none',
      variantCatalog: 'all',
      wishlist: 'yes',
    })

    expect(config).toEqual({ multilingual: 'none', variantCatalog: 'all', wishlist: true })
    expect(getWooConfigureArgs(config!)).toEqual([
      'bin/configure.php',
      '--multilingual=none',
      '--variant-catalog=all',
      '--wishlist=yes',
      '--non-interactive',
    ])
  })

  it('does not create Woo configuration for the standard preset', async () => {
    await expect(askWooCommerceQuestions('standard', {})).resolves.toBeUndefined()
    await expect(askWooCommerceQuestions('standard', { wishlist: 'yes' })).rejects.toThrow(
      /only valid with --preset woo/,
    )
  })

  it('runs frontend npm tasks from the frontend directory', () => {
    const themeDir = join(dir, 'wp-content', 'themes', 'shop')
    const frontendDir = join(themeDir, 'frontend')
    mkdirSync(frontendDir, { recursive: true })
    writeFileSync(join(themeDir, 'composer.json'), '{}')
    writeFileSync(join(frontendDir, 'package.json'), '{}')

    const tasks = getPostInstallTasks(themeDir)
    expect(tasks).toHaveLength(3)
    expect(tasks[0]?.cwd).toBe(themeDir)
    expect(tasks[1]?.cwd).toBe(frontendDir)
    expect(tasks[2]?.cwd).toBe(frontendDir)
  })

  it('installs Composer dependencies for the bundled catalog plugin', () => {
    const themeDir = join(dir, 'wp-content', 'themes', 'shop')
    const pluginDir = join(dir, 'wp-content', 'plugins', 'wpaikit-product-catalog-io')
    mkdirSync(themeDir, { recursive: true })
    mkdirSync(pluginDir, { recursive: true })
    writeFileSync(join(themeDir, 'composer.json'), '{}')
    writeFileSync(join(pluginDir, 'composer.json'), '{}')

    const tasks = getPostInstallTasks(themeDir, [pluginDir])
    expect(tasks).toHaveLength(2)
    expect(tasks[1]).toMatchObject({
      cwd: pluginDir,
      label: 'composer install (wpaikit-product-catalog-io)',
      args: ['install', '--no-dev', '--no-interaction', '--prefer-dist'],
      required: true,
    })
  })

  it('checks the bundled plugin PHP runtime when the plugin is present', async () => {
    mkdirSync(join(dir, 'wp-content', 'plugins', 'wpaikit-product-catalog-io'), { recursive: true })
    const checks = await checkCatalogPhpRuntime(dir)
    expect(checks.map(({ name }) => name)).toEqual(['Catalog PHP', 'Catalog PHP extensions'])
  })

  it('requires only WooCommerce when WPML is disabled', () => {
    const requirements = getWooPluginRequirements({
      multilingual: 'none',
      variantCatalog: 'main-only',
      wishlist: false,
    })
    expect(requirements.map(({ slug }) => slug)).toEqual([
      'woocommerce',
      'wpaikit-product-catalog-io',
    ])
  })

  it('reports all missing WPML-profile plugins through doctor', async () => {
    writeConfig(
      {
        name: 'Shop',
        namespace: 'Shop',
        textDomain: 'shop',
        preset: 'woo',
        woocommerce: {
          multilingual: 'wpml',
          variantCatalog: 'main-only',
          wishlist: false,
        },
        createdAt: new Date().toISOString(),
      },
      dir,
    )

    const results = await checkProjectPlugins(dir)
    expect(results).toHaveLength(6)
    expect(results.every(({ status }) => status === 'error')).toBe(true)
    expect(results.map(({ name }) => name)).toContain('Plugin: WooCommerce')
    expect(results.map(({ name }) => name)).toContain('Plugin: WPML Multilingual CMS')
  })
})
