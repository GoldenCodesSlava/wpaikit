import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readConfig, writeConfig, hasConfig } from '../config.js'
import type { WpaikitConfig } from '../config.js'

const makeConfig = (name: string): WpaikitConfig => ({
  name,
  namespace: 'TestProject',
  textDomain: name,
  preset: 'standard',
  createdAt: new Date().toISOString(),
})

describe('config', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `wpaikit-config-test-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('readConfig returns null when no config file exists', () => {
    expect(readConfig(dir)).toBeNull()
  })

  it('hasConfig returns false when no config file exists', () => {
    expect(hasConfig(dir)).toBe(false)
  })

  it('writeConfig creates the config file', () => {
    writeConfig(makeConfig('my-project'), dir)
    expect(hasConfig(dir)).toBe(true)
  })

  it('readConfig returns the written config', () => {
    const config = makeConfig('my-project')
    writeConfig(config, dir)
    expect(readConfig(dir)).toEqual(config)
  })

  it('writeConfig overwrites an existing config', () => {
    writeConfig(makeConfig('first'), dir)
    writeConfig(makeConfig('second'), dir)
    expect(readConfig(dir)?.name).toBe('second')
  })

  it('writes and reads a WooCommerce profile', () => {
    const config: WpaikitConfig = {
      ...makeConfig('shop'),
      preset: 'woo',
      woocommerce: {
        multilingual: 'wpml',
        variantCatalog: 'main-only',
        wishlist: false,
      },
    }

    writeConfig(config, dir)
    expect(readConfig(dir)).toEqual(config)
  })

  it('writes and reads the SEO choice', () => {
    const config: WpaikitConfig = { ...makeConfig('site'), seo: 'rank-math' }

    writeConfig(config, dir)
    expect(readConfig(dir)?.seo).toBe('rank-math')
  })

  it('keeps configs written before the SEO choice valid', () => {
    writeConfig(makeConfig('legacy'), dir)
    expect(readConfig(dir)?.seo).toBeUndefined()
  })

  it('rejects an unknown SEO choice', () => {
    expect(() =>
      writeConfig({ ...makeConfig('site'), seo: 'aioseo' } as unknown as WpaikitConfig, dir),
    ).toThrow()
  })

  it('rejects a woo preset without WooCommerce configuration', () => {
    expect(() =>
      writeConfig(
        {
          ...makeConfig('shop'),
          preset: 'woo',
        } as WpaikitConfig,
        dir,
      ),
    ).toThrow(/WooCommerce configuration is required/)
  })
})
