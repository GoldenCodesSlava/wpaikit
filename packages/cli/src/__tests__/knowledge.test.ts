import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeConfig } from '@veaceslav-golden/wp-ai-kit-core'
import {
  installKnowledge,
  parsePacksOption,
  resolveKnowledgeSelection,
  resolveKnowledgeTargetDir,
} from '../commands/knowledge/index.js'
import type { KnowledgePrompts } from '../commands/knowledge/index.js'
import { loadPackCatalog } from '../commands/knowledge/packs.js'
import type { KnowledgeSelection, PackId } from '../commands/knowledge/packs.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const knowledgeSource = resolve(repositoryRoot, 'knowledge')

function listFiles(root: string, current: string = root): string[] {
  if (!existsSync(current)) return []
  return readdirSync(current).flatMap((entry) => {
    const path = join(current, entry)
    return statSync(path).isDirectory()
      ? listFiles(root, path)
      : [relative(root, path).split('\\').join('/')]
  })
}

function commandFiles(dir: string): string[] {
  return listFiles(join(dir, '.claude', 'commands')).sort()
}

function read(dir: string, path: string): string {
  return readFileSync(join(dir, ...path.split('/')), 'utf-8')
}

const SELECTIONS: KnowledgeSelection[] = [
  { packs: ['design'] },
  { packs: ['slicing'] },
  { packs: ['design', 'slicing'] },
  ...(['standard', 'woo'] as const).flatMap((wordpressProfile) =>
    (
      [
        ['wordpress'],
        ['design', 'wordpress'],
        ['slicing', 'wordpress'],
        ['design', 'slicing', 'wordpress'],
      ] as PackId[][]
    ).map((packs) => ({ packs, wordpressProfile })),
  ),
]

describe('knowledge packs', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'wpaikit-knowledge-test-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it.each(SELECTIONS.map((selection) => [JSON.stringify(selection), selection] as const))(
    'resolves every knowledge reference for %s',
    async (_name, selection) => {
      await installKnowledge({ targetDir: dir, knowledgeSource, ...selection })

      const missing: string[] = []
      for (const file of listFiles(dir).filter((path) => path.endsWith('.md'))) {
        for (const match of read(dir, file).matchAll(/knowledge\/[A-Za-z0-9_./-]*[A-Za-z0-9_/]/g)) {
          const reference = match[0]
          if (!existsSync(join(dir, ...reference.split('/'))))
            missing.push(`${file} → ${reference}`)
        }
      }

      expect(missing).toEqual([])
    },
  )

  it('keeps the Design pack free of code generation and other packs', async () => {
    await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design'] })

    expect(existsSync(join(dir, 'knowledge', 'slicing'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'wordpress'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'woocommerce'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'shared', 'prompts'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'shared', 'rules', 'figma-blocks.md'))).toBe(true)
    expect(commandFiles(dir)).toEqual([
      'analyze-figma.md',
      'design-quality-check.md',
      'figma-components.md',
      'figma-design-system.md',
      'figma-seo-structure.md',
      'figma-seo-texts.md',
      'figma-sync-tokens.md',
      'figma-update-design-system.md',
      'generate-design.md',
      'prep-figma.md',
    ])

    for (const file of listFiles(dir).filter((path) => path.endsWith('.md'))) {
      const contents = read(dir, file)
      expect(contents, file).not.toMatch(/knowledge\/(slicing|wordpress|woocommerce)\//)
      expect(contents, file).not.toContain('figma-to-code.md')
    }
    expect(read(dir, 'AGENTS.md')).not.toContain('boilerplate')
    expect(read(dir, 'knowledge/context.md')).not.toMatch(/\| `\/figma-to-block/)
  })

  it('keeps the Slicing pack free of WordPress specifics', () => {
    const slicingRoot = join(knowledgeSource, 'packs', 'slicing')
    const forbidden = /\b(ACF|Twig|WordPress|WooCommerce|PHP|wp-content)\b|\.twig\b/i

    for (const file of listFiles(slicingRoot)) {
      expect(readFileSync(join(slicingRoot, file), 'utf-8'), file).not.toMatch(forbidden)
    }
  })

  it('installs Slicing with shared commands and without WordPress', async () => {
    const result = await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['slicing'] })

    expect(result.wordpressProfile).toBeUndefined()
    expect(commandFiles(dir)).toEqual([
      'figma-to-block-html.md',
      'scan-project.md',
      'setup-fonts.md',
    ])
    expect(existsSync(join(dir, 'knowledge', 'slicing', 'rules', 'markup.md'))).toBe(true)
    expect(existsSync(join(dir, 'knowledge', 'shared', 'skills', 'setup-fonts', 'SKILL.md'))).toBe(
      true,
    )
    const manifest = JSON.parse(read(dir, '.wpaikit/knowledge-manifest.json'))
    expect(manifest.schemaVersion).toBe(2)
    expect(manifest.packs).toEqual(['slicing'])
    expect(manifest.wordpressProfile).toBeUndefined()
  })

  it('installs the WordPress commands and rules for the standard profile', async () => {
    const result = await installKnowledge({
      targetDir: dir,
      knowledgeSource,
      packs: ['wordpress'],
      wordpressProfile: 'standard',
    })

    expect(result.commands).toContain('figma-to-block')
    expect(commandFiles(dir)).toEqual([
      'design-system-to-code.md',
      'figma-to-block.md',
      'get-comment-for-frontend.md',
      'scan-components.md',
      'scan-project.md',
      'setup-fonts.md',
      'validate-code.md',
    ])
    for (const rule of ['architecture', 'cookie-consent', 'analytics', 'theme-foundation']) {
      expect(
        existsSync(join(dir, 'knowledge', 'wordpress', 'rules', 'boilerplate', `${rule}.md`)),
      ).toBe(true)
    }
    expect(existsSync(join(dir, 'knowledge', 'woocommerce'))).toBe(false)
    expect(read(dir, 'AGENTS.md')).toContain('WordPress profile: Standard')
  })

  it('adds WooCommerce rules, checks, recipes and templates for the woo profile', async () => {
    await installKnowledge({
      targetDir: dir,
      knowledgeSource,
      packs: ['wordpress'],
      wordpressProfile: 'woo',
    })

    const woo = join(dir, 'knowledge', 'woocommerce')
    for (const rule of ['custom-variations', 'cookie-consent', 'analytics', 'storefront']) {
      expect(existsSync(join(woo, 'rules', `${rule}.md`))).toBe(true)
    }
    expect(existsSync(join(woo, 'checklists', 'runtime-smoke.md'))).toBe(true)
    expect(existsSync(join(woo, 'recipes', 'checkout-delivery', 'ExampleDeliveryPolicy.php'))).toBe(
      true,
    )
    for (const template of [
      'wpaikit-product-terms-import.xlsx',
      'wpaikit-products-client-import.xlsx',
      'wpaikit-products-full-import.xlsx',
      'wpaikit-products-price-stock-import.xlsx',
    ]) {
      expect(existsSync(join(woo, 'templates', 'product-catalog-io', template))).toBe(true)
    }
    expect(read(dir, 'AGENTS.md')).toContain('WordPress profile: WooCommerce')
  })

  it('installs shared commands once when Slicing and WordPress are combined', async () => {
    const result = await installKnowledge({
      targetDir: dir,
      knowledgeSource,
      packs: ['slicing', 'wordpress'],
      wordpressProfile: 'standard',
    })

    expect(result.commands.filter((command) => command === 'setup-fonts')).toHaveLength(1)
    expect(read(dir, 'knowledge/context.md').match(/\| `\/setup-fonts`/g)).toHaveLength(1)
  })

  it('removes managed files of deselected packs', async () => {
    await installKnowledge({
      targetDir: dir,
      knowledgeSource,
      packs: ['design', 'slicing', 'wordpress'],
      wordpressProfile: 'woo',
    })
    const result = await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design'] })

    expect(result.removed).toBeGreaterThan(0)
    expect(existsSync(join(dir, 'knowledge', 'slicing'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'wordpress'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'woocommerce'))).toBe(false)
    expect(existsSync(join(dir, '.claude', 'commands', 'figma-to-block.md'))).toBe(false)
  })

  it('protects locally modified files of a deselected pack', async () => {
    await installKnowledge({
      targetDir: dir,
      knowledgeSource,
      packs: ['wordpress'],
      wordpressProfile: 'standard',
    })
    appendFileSync(
      join(dir, 'knowledge', 'wordpress', 'rules', 'boilerplate', 'php.md'),
      '\nLocal\n',
    )

    await expect(
      installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design'] }),
    ).rejects.toThrow(/obsolete but contains local changes/)
  })

  it('protects locally modified managed files unless force is used', async () => {
    await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design'] })
    appendFileSync(join(dir, 'AGENTS.md'), '\nLocal project rule.\n')

    await expect(
      installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design'] }),
    ).rejects.toThrow(/contains local changes/)

    await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design'], force: true })
    expect(read(dir, 'AGENTS.md')).not.toContain('Local project rule')
  })

  it('is idempotent and reports the previous version', async () => {
    const first = await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['slicing'] })
    const agents = read(dir, 'AGENTS.md')
    const context = read(dir, 'knowledge/context.md')
    const second = await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['slicing'] })

    expect(first.previousVersion).toBeNull()
    expect(second.previousVersion).toBe(first.version)
    expect(second.written).toBe(0)
    expect(read(dir, 'AGENTS.md')).toBe(agents)
    expect(read(dir, 'knowledge/context.md')).toBe(context)
  })

  it('does not write files during a dry run and lists the planned changes', async () => {
    const result = await installKnowledge({
      targetDir: dir,
      knowledgeSource,
      packs: ['design'],
      dryRun: true,
    })

    expect(result.dryRun).toBe(true)
    expect(result.written).toBeGreaterThan(0)
    expect(result.changes).toContainEqual({ path: 'AGENTS.md', action: 'add' })
    expect(existsSync(join(dir, 'knowledge'))).toBe(false)
    expect(existsSync(join(dir, '.wpaikit'))).toBe(false)
  })

  it('migrates a v1 manifest and removes files at the old paths', async () => {
    const oldFiles: Record<string, string> = {
      'knowledge/prompts/figma-to-block.md': 'old prompt\n',
      'knowledge/rules/figma-to-block.md': 'old rule\n',
      '.claude/commands/figma-to-block.md': 'old command\n',
    }
    const checksums: Record<string, string> = {}
    for (const [path, contents] of Object.entries(oldFiles)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true })
      writeFileSync(join(dir, path), contents)
      checksums[path] = createHash('sha256').update(contents).digest('hex')
    }
    mkdirSync(join(dir, '.wpaikit'))
    writeFileSync(
      join(dir, '.wpaikit', 'knowledge-manifest.json'),
      JSON.stringify({
        schemaVersion: 1,
        knowledgeVersion: '1.8.0',
        profile: 'woo',
        layers: ['common', 'wordpress', 'woocommerce'],
        files: checksums,
      }),
    )

    const selection = await resolveKnowledgeSelection(dir, { interactive: false })
    expect(selection).toEqual({
      packs: ['design', 'slicing', 'wordpress'],
      wordpressProfile: 'woo',
    })

    const result = await installKnowledge({ targetDir: dir, knowledgeSource, ...selection })
    expect(result.previousVersion).toBe('1.8.0')
    expect(existsSync(join(dir, 'knowledge', 'prompts'))).toBe(false)
    expect(existsSync(join(dir, 'knowledge', 'rules'))).toBe(false)
    expect(read(dir, '.claude/commands/figma-to-block.md')).toContain('knowledge/wordpress/prompts')
    expect(JSON.parse(read(dir, '.wpaikit/knowledge-manifest.json')).schemaVersion).toBe(2)
  })
})

describe('knowledge selection', () => {
  let dir: string
  const neverPrompt: KnowledgePrompts = {
    select: vi.fn(() => {
      throw new Error('unexpected prompt')
    }),
    multiselect: vi.fn(() => {
      throw new Error('unexpected prompt')
    }),
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'wpaikit-knowledge-selection-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('parses --packs values', () => {
    expect(parsePacksOption('all')).toEqual(['design', 'slicing', 'wordpress'])
    expect(parsePacksOption('wordpress, design')).toEqual(['design', 'wordpress'])
    expect(() => parsePacksOption('all,design')).toThrow(/cannot be combined/)
    expect(() => parsePacksOption('figma')).toThrow(/Invalid --packs/)
    expect(() => parsePacksOption('')).toThrow(/Invalid --packs/)
  })

  it('never asks a designer for a WordPress profile', async () => {
    await expect(
      resolveKnowledgeSelection(dir, { packs: 'design', interactive: true, prompts: neverPrompt }),
    ).resolves.toEqual({ packs: ['design'] })
  })

  it('asks for packs and the WordPress profile interactively', async () => {
    const prompts: KnowledgePrompts = {
      select: vi
        .fn()
        .mockResolvedValueOnce('choose')
        .mockResolvedValueOnce('woo') as KnowledgePrompts['select'],
      multiselect: vi
        .fn()
        .mockResolvedValue(['wordpress', 'slicing']) as KnowledgePrompts['multiselect'],
    }

    await expect(resolveKnowledgeSelection(dir, { interactive: true, prompts })).resolves.toEqual({
      packs: ['slicing', 'wordpress'],
      wordpressProfile: 'woo',
    })
  })

  it('defaults to all packs with the standard profile without a TTY', async () => {
    await expect(
      resolveKnowledgeSelection(dir, { interactive: false, prompts: neverPrompt }),
    ).resolves.toEqual({ packs: ['design', 'slicing', 'wordpress'], wordpressProfile: 'standard' })
  })

  it('reuses the selection stored in the manifest', async () => {
    await installKnowledge({ targetDir: dir, knowledgeSource, packs: ['design', 'slicing'] })

    await expect(
      resolveKnowledgeSelection(dir, { interactive: true, prompts: neverPrompt }),
    ).resolves.toEqual({ packs: ['design', 'slicing'] })
  })

  it('rejects --wp-profile without the WordPress pack', async () => {
    await expect(
      resolveKnowledgeSelection(dir, { packs: 'design', wpProfile: 'woo', interactive: false }),
    ).rejects.toThrow(/requires the WordPress pack/)
  })

  it('takes the WordPress profile from .wpaikit.json and rejects a mismatched override', async () => {
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

    await expect(
      resolveKnowledgeSelection(themeDir, { packs: 'wordpress', interactive: false }),
    ).resolves.toEqual({ packs: ['wordpress'], wordpressProfile: 'woo' })
    await expect(
      resolveKnowledgeSelection(themeDir, {
        packs: 'wordpress',
        wpProfile: 'standard',
        interactive: false,
      }),
    ).rejects.toThrow(/does not match/)
    expect(resolveKnowledgeTargetDir(themeDir)).toBe(dir)
  })
})

describe('knowledge catalog', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'wpaikit-knowledge-catalog-'))
    cpSync(knowledgeSource, dir, { recursive: true })
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  type EditableCatalog = { packs: Record<string, { commands: string[] }> }

  function editCatalog(edit: (catalog: EditableCatalog) => void): void {
    const path = join(dir, 'packs.json')
    const catalog = JSON.parse(readFileSync(path, 'utf-8')) as EditableCatalog
    edit(catalog)
    writeFileSync(path, JSON.stringify(catalog))
  }

  it('accepts the bundled catalog', async () => {
    await expect(loadPackCatalog(knowledgeSource)).resolves.toBeDefined()
  })

  it('rejects a command owned by two packs', async () => {
    editCatalog((catalog) => catalog.packs.slicing.commands.push('figma-to-block'))
    await expect(loadPackCatalog(dir)).rejects.toThrow(/owned by more than one pack/)
  })

  it('rejects a command without a prompt file', async () => {
    rmSync(join(dir, 'packs', 'slicing', 'prompts', 'figma-to-block-html.md'))
    await expect(loadPackCatalog(dir)).rejects.toThrow(/missing packs\/slicing\/prompts/)
  })

  it('rejects a prompt that no command owns', async () => {
    writeFileSync(join(dir, 'packs', 'design', 'prompts', 'orphan.md'), '# Orphan\n')
    await expect(loadPackCatalog(dir)).rejects.toThrow(/orphan\.md does not belong/)
  })
})
