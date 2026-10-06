import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import { createProjectDir } from '../commands/init/steps/create-dir.js'
import { renameBoilerplate } from '../commands/init/steps/rename.js'
import { writeProjectConfig } from '../commands/init/steps/write-config.js'
import { configureWooBoilerplate } from '../commands/init/steps/configure-boilerplate.js'

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
    '<?php\nuse Boilerplate\\Theme\\ThemeSetup;\nnew ThemeSetup();\n',
  )
  writeFileSync(
    join(themeDir, 'composer.json'),
    JSON.stringify({
      name: 'boilerplate/wordpress-theme',
      autoload: { 'psr-4': { 'Boilerplate\\': 'src/' } },
    }),
  )
}

function installManagedKnowledge(base: string): void {
  const files: Record<string, string> = {
    'AGENTS.md': '# Managed agents\n',
    'CLAUDE.md': '# Managed Claude\n',
    'knowledge/context.md': '# Managed knowledge\n',
  }
  const checksums: Record<string, string> = {}

  for (const [relativePath, contents] of Object.entries(files)) {
    const path = join(base, ...relativePath.split('/'))
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, contents)
    checksums[relativePath] = createHash('sha256').update(contents).digest('hex')
  }

  mkdirSync(join(base, '.wpaikit'), { recursive: true })
  writeFileSync(
    join(base, '.wpaikit', 'knowledge-manifest.json'),
    JSON.stringify({
      schemaVersion: 1,
      knowledgeVersion: 'test',
      profile: 'standard',
      layers: ['common', 'wordpress'],
      files: checksums,
    }),
  )
}

function installLegacyKnowledge(base: string): void {
  mkdirSync(join(base, 'knowledge'), { recursive: true })
  writeFileSync(join(base, 'AGENTS.md'), 'Read knowledge/context.md before WPAIKit commands.\n')
  writeFileSync(join(base, 'CLAUDE.md'), '@AGENTS.md\n')
  writeFileSync(join(base, 'knowledge', 'context.md'), '# WPAIKit Knowledge\n')
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
    expect(rollback.size).toBe(1)
  })

  it('rolls back generated files in the current directory and preserves hidden files', async () => {
    writeFileSync(join(tmpBase, '.gitignore'), 'vendor/\n')
    const rollback = new Rollback()
    createProjectDir(tmpBase, 'my-site', true, rollback)
    writeFileSync(join(tmpBase, 'wp-settings.php'), '<?php\n')

    await rollback.run()

    expect(existsSync(join(tmpBase, '.gitignore'))).toBe(true)
    expect(existsSync(join(tmpBase, 'wp-settings.php'))).toBe(false)
  })

  it('rejects a non-empty current directory', () => {
    writeFileSync(join(tmpBase, 'existing.txt'), 'keep me')
    const rollback = new Rollback()

    expect(() => createProjectDir(tmpBase, 'my-site', true, rollback)).toThrow(/not empty/)
    expect(readFileSync(join(tmpBase, 'existing.txt'), 'utf-8')).toBe('keep me')
  })

  it('accepts a current directory containing only managed knowledge', () => {
    installManagedKnowledge(tmpBase)
    const rollback = new Rollback()

    expect(createProjectDir(tmpBase, 'my-site', true, rollback)).toBe(tmpBase)
    expect(rollback.size).toBe(1)
  })

  it('adopts a legacy knowledge-only current directory', () => {
    installLegacyKnowledge(tmpBase)
    const rollback = new Rollback()

    expect(createProjectDir(tmpBase, 'my-site', true, rollback, 'woo')).toBe(tmpBase)
    const manifest = JSON.parse(
      readFileSync(join(tmpBase, '.wpaikit', 'knowledge-manifest.json'), 'utf-8'),
    ) as { profile: string; files: Record<string, string> }
    expect(manifest.profile).toBe('woo')
    expect(Object.keys(manifest.files)).toEqual([
      'AGENTS.md',
      'CLAUDE.md',
      'knowledge/context.md',
    ])
  })

  it('does not adopt an unrelated directory with legacy-shaped names', () => {
    mkdirSync(join(tmpBase, 'knowledge'))
    writeFileSync(join(tmpBase, 'AGENTS.md'), 'Personal notes\n')
    writeFileSync(join(tmpBase, 'CLAUDE.md'), 'Personal notes\n')
    writeFileSync(join(tmpBase, 'knowledge', 'context.md'), 'Personal notes\n')
    const rollback = new Rollback()

    expect(() => createProjectDir(tmpBase, 'my-site', true, rollback)).toThrow(
      /Current directory is not empty \(3 visible item/,
    )
    expect(existsSync(join(tmpBase, '.wpaikit', 'knowledge-manifest.json'))).toBe(false)
  })

  it('rejects unmanaged files next to managed knowledge', () => {
    installManagedKnowledge(tmpBase)
    writeFileSync(join(tmpBase, 'notes.txt'), 'keep me')
    const rollback = new Rollback()

    expect(() => createProjectDir(tmpBase, 'my-site', true, rollback)).toThrow(
      /unmanaged visible item.*notes\.txt/,
    )
  })

  it('rejects locally modified managed knowledge', () => {
    installManagedKnowledge(tmpBase)
    writeFileSync(join(tmpBase, 'AGENTS.md'), '# Local edit\n')
    const rollback = new Rollback()

    expect(() => createProjectDir(tmpBase, 'my-site', true, rollback)).toThrow(
      /knowledge base contains local changes.*AGENTS\.md/,
    )
  })

  it('preserves managed knowledge when current-directory rollback runs', async () => {
    installManagedKnowledge(tmpBase)
    const rollback = new Rollback()
    createProjectDir(tmpBase, 'my-site', true, rollback)
    writeFileSync(join(tmpBase, 'wp-settings.php'), '<?php\n')

    await rollback.run()

    expect(readFileSync(join(tmpBase, 'AGENTS.md'), 'utf-8')).toBe('# Managed agents\n')
    expect(existsSync(join(tmpBase, 'knowledge', 'context.md'))).toBe(true)
    expect(existsSync(join(tmpBase, 'wp-settings.php'))).toBe(false)
  })

  it('throws if target folder already exists', () => {
    const rollback = new Rollback()
    mkdirSync(join(tmpBase, 'existing'))
    expect(() => createProjectDir(tmpBase, 'existing', false, rollback)).toThrow(/already exists/)
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

  it('rolls back when the WooCommerce initializer is missing', async () => {
    const rollback = new Rollback()
    const projectDir = createProjectDir(tmpBase, 'shop', false, rollback)
    makeBoilerplateTheme(projectDir)
    renameBoilerplate(projectDir, 'Shop', 'shop', 'Shop', 'shop')

    await expect(
      configureWooBoilerplate(projectDir, 'shop', {
        multilingual: 'wpml',
        variantCatalog: 'main-only',
        wishlist: false,
      }),
    ).rejects.toThrow(/initializer not found/)

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

  it('writes the selected WooCommerce profile', () => {
    writeProjectConfig(dir, {
      name: 'Shop',
      namespace: 'Shop',
      textDomain: 'shop',
      preset: 'woo',
      woocommerce: {
        multilingual: 'none',
        variantCatalog: 'all',
        wishlist: true,
      },
    })

    const config = JSON.parse(readFileSync(join(dir, '.wpaikit.json'), 'utf-8'))
    expect(config.woocommerce).toEqual({
      multilingual: 'none',
      variantCatalog: 'all',
      wishlist: true,
    })
  })
})
