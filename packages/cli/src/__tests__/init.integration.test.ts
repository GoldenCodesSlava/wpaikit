import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import { createProjectDir } from '../commands/init/steps/create-dir.js'
import { renameBoilerplate } from '../commands/init/steps/rename.js'
import { writeProjectConfig } from '../commands/init/steps/write-config.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeBoilerplateTheme(base: string): void {
  const themeDir = join(base, 'wp-content', 'themes', 'boilerplate')
  mkdirSync(join(themeDir, 'src', 'Theme'), { recursive: true })
  mkdirSync(join(themeDir, 'blocks'), { recursive: true })
  writeFileSync(
    join(themeDir, 'style.css'),
    '/*\nTheme Name: Boilerplate\nText Domain: boilerplate\n*/',
  )
  writeFileSync(
    join(themeDir, 'functions.php'),
    "<?php\nuse Boilerplate\\Theme\\ThemeSetup;\nnew ThemeSetup();\n",
  )
  writeFileSync(
    join(themeDir, 'composer.json'),
    JSON.stringify({
      name: 'boilerplate/wordpress-theme',
      autoload: { 'psr-4': { 'Boilerplate\\': 'src/' } },
    }),
  )
}

// ─── createProjectDir ────────────────────────────────────────────────────────

describe('createProjectDir', () => {
  let tmpBase: string

  beforeEach(() => {
    tmpBase = join(tmpdir(), `wpaikit-init-test-${Date.now()}`)
    mkdirSync(tmpBase, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpBase, { recursive: true, force: true })
  })

  it('creates a new folder and returns its path', () => {
    const rollback = new Rollback()
    const dir = createProjectDir(tmpBase, 'my-site', false, rollback)
    expect(existsSync(dir)).toBe(true)
    expect(dir).toContain('my-site')
    expect(rollback.size).toBe(1)
  })

  it('returns cwd when useCurrentDir is true', () => {
    const rollback = new Rollback()
    const dir = createProjectDir(tmpBase, 'my-site', true, rollback)
    expect(dir).toBe(tmpBase)
    expect(rollback.size).toBe(0)
  })

  it('throws if target folder already exists', () => {
    const rollback = new Rollback()
    mkdirSync(join(tmpBase, 'existing'))
    expect(() => createProjectDir(tmpBase, 'existing', false, rollback)).toThrow(
      /already exists/,
    )
  })

  it('rollback removes the created folder', async () => {
    const rollback = new Rollback()
    const dir = createProjectDir(tmpBase, 'my-site', false, rollback)
    expect(existsSync(dir)).toBe(true)
    await rollback.run()
    expect(existsSync(dir)).toBe(false)
  })
})

// ─── full init pipeline (mocked network steps) ──────────────────────────────

describe('init pipeline (without network)', () => {
  let tmpBase: string

  beforeEach(() => {
    tmpBase = join(tmpdir(), `wpaikit-pipeline-test-${Date.now()}`)
    mkdirSync(tmpBase, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpBase, { recursive: true, force: true })
  })

  it('creates dir → renames theme → writes config', () => {
    const rollback = new Rollback()
    const slug = 'golden-wp'
    const namespace = 'GoldenWp'
    const textDomain = 'golden-wp'

    // 1. create project dir
    const projectDir = createProjectDir(tmpBase, slug, false, rollback)

    // 2. simulate boilerplate clone by creating the structure manually
    makeBoilerplateTheme(projectDir)

    // 3. rename
    renameBoilerplate(projectDir, 'Golden WP', slug, namespace, textDomain)

    // 4. write config
    writeProjectConfig(projectDir, {
      name: 'Golden WP',
      namespace,
      textDomain,
      preset: 'standard',
    })

    // assertions
    const themeDir = join(projectDir, 'wp-content', 'themes', slug)
    expect(existsSync(themeDir)).toBe(true)
    expect(existsSync(join(projectDir, '.wpaikit.json'))).toBe(true)

    const css = readFileSync(join(themeDir, 'style.css'), 'utf-8')
    expect(css).toContain('Theme Name: Golden WP')
    expect(css).toContain(`Text Domain: ${textDomain}`)

    const php = readFileSync(join(themeDir, 'functions.php'), 'utf-8')
    expect(php).toContain(`use ${namespace}\\Theme\\ThemeSetup`)

    const config = JSON.parse(readFileSync(join(projectDir, '.wpaikit.json'), 'utf-8'))
    expect(config.name).toBe('Golden WP')
    expect(config.namespace).toBe(namespace)
    expect(config.preset).toBe('standard')
  })

  it('rollback removes project dir on failure', async () => {
    const rollback = new Rollback()
    const projectDir = createProjectDir(tmpBase, 'fail-site', false, rollback)

    expect(existsSync(projectDir)).toBe(true)

    // simulate error → run rollback
    await rollback.run()

    expect(existsSync(projectDir)).toBe(false)
  })
})

// ─── writeProjectConfig ──────────────────────────────────────────────────────

describe('writeProjectConfig', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `wpaikit-config-test-${Date.now()}`)
    mkdirSync(dir)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('writes .wpaikit.json with createdAt', () => {
    writeProjectConfig(dir, {
      name: 'Test Site',
      namespace: 'TestSite',
      textDomain: 'test-site',
      preset: 'standard',
    })
    const raw = readFileSync(join(dir, '.wpaikit.json'), 'utf-8')
    const config = JSON.parse(raw)
    expect(config.name).toBe('Test Site')
    expect(config.createdAt).toBeDefined()
    expect(new Date(config.createdAt).getFullYear()).toBeGreaterThanOrEqual(2024)
  })
})
