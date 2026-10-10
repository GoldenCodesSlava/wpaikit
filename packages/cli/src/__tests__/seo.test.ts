import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeConfig } from '@veaceslav-golden/wp-ai-kit-core'
import type { SeoProfile, WpaikitConfig } from '@veaceslav-golden/wp-ai-kit-core'
import { askSeoQuestion } from '../commands/init/prompts.js'
import {
  getStandardConfigureArgs,
  getWooConfigureArgs,
} from '../commands/init/steps/configure-boilerplate.js'
import { SEO_CHOICES, getSeoConfigureArg } from '../seo.js'
import { getProjectPluginRequirements } from '../project-plugins.js'
import { checkProjectPlugins } from '../commands/doctor/checks.js'

describe('SEO init choice', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `wpaikit-seo-test-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  const writeStandardConfig = (seo?: SeoProfile): void => {
    const config: WpaikitConfig = {
      name: 'Site',
      namespace: 'Site',
      textDomain: 'site',
      preset: 'standard',
      ...(seo ? { seo } : {}),
      createdAt: new Date().toISOString(),
    }
    writeConfig(config, dir)
  }

  it('offers the module, Yoast, Rank Math and a choose-later option', () => {
    expect(SEO_CHOICES.map(({ value }) => value)).toEqual(['module', 'yoast', 'rank-math', 'later'])
  })

  it('parses the --seo flag case-insensitively and rejects unknown values', async () => {
    await expect(askSeoQuestion({ seo: 'Rank-Math' })).resolves.toBe('rank-math')
    await expect(askSeoQuestion({ seo: 'aioseo' })).rejects.toThrow(/Invalid SEO value "aioseo"/)
  })

  it('keeps the theme module only for the module choice', () => {
    expect(getSeoConfigureArg('module')).toBe('--seo=module')
    for (const seo of ['yoast', 'rank-math', 'later'] as const) {
      expect(getSeoConfigureArg(seo)).toBe('--seo=none')
    }
  })

  it('passes the SEO choice to both theme initializers', () => {
    expect(getStandardConfigureArgs('yoast')).toEqual([
      'bin/configure.php',
      '--seo=none',
      '--non-interactive',
    ])
    expect(
      getWooConfigureArgs(
        { multilingual: 'none', variantCatalog: 'main-only', wishlist: false },
        'module',
      ),
    ).toContain('--seo=module')
  })

  it('requires the chosen SEO plugin alongside Woo plugins', () => {
    const slugs = (seo: SeoProfile) =>
      getProjectPluginRequirements({
        woocommerce: { multilingual: 'none', variantCatalog: 'main-only', wishlist: false },
        seo,
      }).map(({ slug }) => slug)

    expect(slugs('module')).toEqual(['woocommerce', 'wpaikit-product-catalog-io'])
    expect(slugs('later')).toEqual(['woocommerce', 'wpaikit-product-catalog-io'])
    expect(slugs('yoast')).toContain('wordpress-seo')
    expect(slugs('rank-math')).toContain('seo-by-rank-math')
  })

  it('reports a missing chosen SEO plugin through doctor for the standard preset', async () => {
    writeStandardConfig('yoast')

    const results = await checkProjectPlugins(dir)
    expect(results).toEqual([
      expect.objectContaining({
        name: 'Plugin: Yoast SEO',
        status: 'error',
        message: 'not installed',
      }),
    ])
  })

  it('warns until any SEO plugin is installed when the choice was postponed', async () => {
    writeStandardConfig('later')
    expect(await checkProjectPlugins(dir)).toEqual([
      expect.objectContaining({ name: 'SEO plugin', status: 'warn' }),
    ])

    mkdirSync(join(dir, 'wp-content', 'plugins', 'wp-seopress'), { recursive: true })
    expect(await checkProjectPlugins(dir)).toEqual([
      expect.objectContaining({ name: 'SEO plugin', status: 'ok' }),
    ])
  })

  it('has nothing to check for the built-in module or legacy configs', async () => {
    writeStandardConfig('module')
    expect(await checkProjectPlugins(dir)).toEqual([])

    writeStandardConfig()
    expect(await checkProjectPlugins(dir)).toEqual([])
  })
})
