import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeConfig } from '@veaceslav-golden/wp-ai-kit-core'
import {
  installKnowledge,
  resolveKnowledgeProfile,
  resolveKnowledgeTargetDir,
} from '../commands/knowledge/index.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const knowledgeSource = resolve(repositoryRoot, 'knowledge')
const claudeCommandsSource = resolve(repositoryRoot, '.claude', 'commands')

describe('knowledge profiles', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'wpaikit-knowledge-test-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('installs Common and WordPress files for the standard profile', async () => {
    const result = await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource,
    })

    expect(result.layers).toEqual(['common', 'wordpress'])
    expect(existsSync(join(dir, 'knowledge', 'rules', 'boilerplate', 'architecture.md'))).toBe(true)
    expect(existsSync(join(dir, 'knowledge', 'rules', 'boilerplate', 'cookie-consent.md'))).toBe(
      true,
    )
    expect(existsSync(join(dir, 'knowledge', 'rules', 'boilerplate', 'analytics.md'))).toBe(true)
    expect(existsSync(join(dir, 'knowledge', 'rules', 'boilerplate', 'theme-foundation.md'))).toBe(
      true,
    )
    expect(existsSync(join(dir, 'knowledge', 'rules', 'woocommerce'))).toBe(false)
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8')).toContain('Standard profile')
    const manifest = JSON.parse(
      readFileSync(join(dir, '.wpaikit', 'knowledge-manifest.json'), 'utf-8'),
    )
    expect(manifest.profile).toBe('standard')
    expect(manifest.layers).toEqual(['common', 'wordpress'])
    expect(manifest.files['AGENTS.md']).toMatch(/^[a-f0-9]{64}$/)
  })

  it('adds WooCommerce rules, checks and recipes for the woo profile', async () => {
    const result = await installKnowledge({
      targetDir: dir,
      profile: 'woo',
      knowledgeSource,
      claudeCommandsSource: null,
    })

    expect(result.layers).toEqual(['common', 'wordpress', 'woocommerce'])
    expect(existsSync(join(dir, 'knowledge', 'rules', 'woocommerce', 'custom-variations.md'))).toBe(
      true,
    )
    expect(existsSync(join(dir, 'knowledge', 'rules', 'woocommerce', 'cookie-consent.md'))).toBe(
      true,
    )
    expect(existsSync(join(dir, 'knowledge', 'rules', 'woocommerce', 'analytics.md'))).toBe(true)
    expect(existsSync(join(dir, 'knowledge', 'rules', 'woocommerce', 'storefront.md'))).toBe(true)
    expect(
      existsSync(join(dir, 'knowledge', 'checklists', 'woocommerce', 'runtime-smoke.md')),
    ).toBe(true)
    for (const template of [
      'wpaikit-product-terms-import.xlsx',
      'wpaikit-products-client-import.xlsx',
      'wpaikit-products-full-import.xlsx',
      'wpaikit-products-price-stock-import.xlsx',
    ]) {
      expect(
        existsSync(
          join(dir, 'knowledge', 'templates', 'woocommerce', 'product-catalog-io', template),
        ),
      ).toBe(true)
    }
    expect(
      existsSync(
        join(
          dir,
          'knowledge',
          'recipes',
          'woocommerce',
          'checkout-delivery',
          'ExampleDeliveryPolicy.php',
        ),
      ),
    ).toBe(true)
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8')).toContain('WooCommerce profile')
  })

  it('removes obsolete managed WooCommerce files when switching to standard', async () => {
    await installKnowledge({
      targetDir: dir,
      profile: 'woo',
      knowledgeSource,
      claudeCommandsSource: null,
    })
    const result = await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource: null,
    })

    expect(result.removed).toBeGreaterThan(0)
    expect(existsSync(join(dir, 'knowledge', 'rules', 'woocommerce'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'recipes', 'woocommerce'))).toBe(false)
  })

  it('protects locally modified managed files unless force is used', async () => {
    await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource: null,
    })
    appendFileSync(join(dir, 'AGENTS.md'), '\nLocal project rule.\n')

    await expect(
      installKnowledge({
        targetDir: dir,
        profile: 'standard',
        knowledgeSource,
        claudeCommandsSource: null,
      }),
    ).rejects.toThrow(/contains local changes/)

    await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource: null,
      force: true,
    })
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8')).not.toContain('Local project rule')
  })

  it('reports the previous knowledge version on update', async () => {
    const first = await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource,
    })
    expect(first.previousVersion).toBeNull()
    expect(existsSync(join(dir, '.claude', 'commands', 'figma-seo-structure.md'))).toBe(true)

    const second = await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource,
    })
    expect(second.previousVersion).toBe(first.version)
    expect(second.written).toBe(0)
  })

  it('does not write files during a dry run', async () => {
    const result = await installKnowledge({
      targetDir: dir,
      profile: 'standard',
      knowledgeSource,
      claudeCommandsSource: null,
      dryRun: true,
    })

    expect(result.dryRun).toBe(true)
    expect(result.written).toBeGreaterThan(0)
    expect(existsSync(join(dir, 'knowledge'))).toBe(false)
    expect(existsSync(join(dir, '.wpaikit'))).toBe(false)
  })

  it('detects the profile from config and rejects a mismatched override', async () => {
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

    const themeDir = join(dir, 'wp-content', 'themes', 'shop')

    await expect(resolveKnowledgeProfile(themeDir)).resolves.toBe('woo')
    await expect(resolveKnowledgeProfile(themeDir, 'standard')).rejects.toThrow(/does not match/)
    expect(resolveKnowledgeTargetDir(themeDir)).toBe(dir)
  })
})
