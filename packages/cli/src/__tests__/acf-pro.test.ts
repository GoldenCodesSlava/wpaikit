import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import {
  ACF_PRO_SLUG,
  isSupportedAcfProVersion,
  readAcfProVersion,
  resolveUserPath,
} from '../acf-pro.js'
import { installAcfPro } from '../commands/init/steps/install-acf-pro.js'
import { askAcfZip } from '../commands/init/prompts.js'
import { checkAcfProVersion } from '../commands/doctor/checks.js'

function writeAcfPlugin(dir: string, version: string): void {
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    join(dir, 'acf.php'),
    `<?php\n/**\n * Plugin Name:       Advanced Custom Fields PRO\n * Version:           ${version}\n */\n`,
  )
}

/** Builds a zip shaped like the official download: advanced-custom-fields-pro/acf.php at the root. */
function makeZip(base: string, version: string | null, folder = ACF_PRO_SLUG): string {
  const source = mkdtempSync(join(base, 'src-'))
  if (version) {
    writeAcfPlugin(join(source, folder), version)
  } else {
    mkdirSync(join(source, folder), { recursive: true })
    writeFileSync(join(source, folder, 'readme.txt'), 'not acf')
  }
  const zipPath = join(base, `acf-${version ?? 'invalid'}-${folder}.zip`)
  execFileSync('zip', ['-qr', zipPath, folder], { cwd: source })
  return zipPath
}

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'wpaikit-acf-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('ACF PRO version helpers', () => {
  it('reads the plugin header version', () => {
    writeAcfPlugin(join(dir, 'acf'), '6.8.10')
    expect(readAcfProVersion(join(dir, 'acf'))).toBe('6.8.10')
    expect(readAcfProVersion(join(dir, 'missing'))).toBeNull()
  })

  it('accepts 6.7+ only', () => {
    expect(isSupportedAcfProVersion('6.7.0')).toBe(true)
    expect(isSupportedAcfProVersion('6.8.10')).toBe(true)
    expect(isSupportedAcfProVersion('7.0')).toBe(true)
    expect(isSupportedAcfProVersion('6.6.2')).toBe(false)
    expect(isSupportedAcfProVersion('6.2.5')).toBe(false)
  })

  it('expands ~ in user-provided paths', () => {
    expect(resolveUserPath('~/acf.zip')).toBe(join(homedir(), 'acf.zip'))
    expect(resolveUserPath('acf.zip', dir)).toBe(join(dir, 'acf.zip'))
  })
})

describe('askAcfZip', () => {
  it('prefers --acf-zip, then WPKIT_ACF_PRO_ZIP', async () => {
    const zip = join(dir, 'acf.zip')
    writeFileSync(zip, '')

    expect(await askAcfZip({ acfZip: zip }, {})).toBe(zip)
    expect(await askAcfZip({}, { WPKIT_ACF_PRO_ZIP: zip })).toBe(zip)
  })

  it('rejects a missing zip passed by flag or env', async () => {
    await expect(askAcfZip({ acfZip: join(dir, 'nope.zip') }, {})).rejects.toThrow('not found')
    await expect(askAcfZip({}, { WPKIT_ACF_PRO_ZIP: join(dir, 'nope.zip') })).rejects.toThrow(
      'not found',
    )
  })
})

describe('installAcfPro', () => {
  const pluginDir = () => join(dir, 'site', 'wp-content', 'plugins', ACF_PRO_SLUG)

  it('unpacks the zip into wp-content/plugins and registers a rollback', async () => {
    const rollback = new Rollback()
    const version = await installAcfPro(join(dir, 'site'), makeZip(dir, '6.8.10'), rollback)

    expect(version).toBe('6.8.10')
    expect(readAcfProVersion(pluginDir())).toBe('6.8.10')
    expect(readdirSync(join(dir, 'site', 'wp-content', 'plugins'))).toEqual([ACF_PRO_SLUG])

    await rollback.run()
    expect(existsSync(pluginDir())).toBe(false)
  })

  it('refuses ACF PRO older than 6.7', async () => {
    await expect(
      installAcfPro(join(dir, 'site'), makeZip(dir, '6.2.5'), new Rollback()),
    ).rejects.toThrow('too old')
    expect(existsSync(pluginDir())).toBe(false)
  })

  it('refuses a zip that is not ACF PRO', async () => {
    await expect(
      installAcfPro(join(dir, 'site'), makeZip(dir, null), new Rollback()),
    ).rejects.toThrow('not an ACF PRO package')
    await expect(
      installAcfPro(join(dir, 'site'), makeZip(dir, '6.8.10', 'acf'), new Rollback()),
    ).rejects.toThrow('not an ACF PRO package')
    expect(readdirSync(join(dir, 'site', 'wp-content', 'plugins'))).toEqual([])
  })

  it('keeps an existing copy', async () => {
    writeAcfPlugin(pluginDir(), '6.8.9')
    const rollback = new Rollback()

    expect(await installAcfPro(join(dir, 'site'), makeZip(dir, '6.8.10'), rollback)).toBe('6.8.9')
    expect(rollback.size).toBe(0)
  })
})

describe('checkAcfProVersion', () => {
  it('has nothing to report without the plugin', () => {
    expect(checkAcfProVersion(dir)).toEqual([])
  })

  it('accepts ACF PRO 6.7+ and flags older copies', () => {
    const plugin = join(dir, 'wp-content', 'plugins', ACF_PRO_SLUG)

    writeAcfPlugin(plugin, '6.8.10')
    expect(checkAcfProVersion(dir)).toEqual([
      expect.objectContaining({ name: 'ACF PRO version', status: 'ok' }),
    ])

    writeAcfPlugin(plugin, '6.2.5')
    expect(checkAcfProVersion(dir)).toEqual([
      expect.objectContaining({ name: 'ACF PRO version', status: 'error' }),
    ])
  })
})
