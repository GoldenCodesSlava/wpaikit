import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { z } from 'zod'
import type { PresetId } from '../../presets.js'

export const PACK_IDS = ['design', 'slicing', 'wordpress'] as const
export type PackId = (typeof PACK_IDS)[number]

export const WORDPRESS_PROFILES = ['standard', 'woo'] as const satisfies readonly PresetId[]

const NameSchema = z.string().regex(/^[a-z][a-z0-9-]*$/)
const RelativeFileSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      !value.startsWith('/') &&
      !value.includes('\\') &&
      !value.split('/').some((segment) => ['.', '..', ''].includes(segment)),
    'Path must be relative and use forward slashes',
  )

const VariantSchema = z.object({
  label: z.string().min(1),
  hint: z.string().min(1),
  extraDirs: z.array(NameSchema),
})

const PackSchema = z.object({
  label: z.string().min(1),
  hint: z.string().min(1),
  commands: z.array(NameSchema),
  sharedCommands: z.array(NameSchema),
  sharedFiles: z.array(RelativeFileSchema),
  variants: z.record(z.enum(WORDPRESS_PROFILES), VariantSchema).optional(),
})

const CommandSchema = z.object({
  usage: z.string().min(1),
  description: z.string().min(1),
  constraint: z.string().min(1).optional(),
})

const PackCatalogSchema = z.object({
  schemaVersion: z.literal(1),
  packs: z.object({
    design: PackSchema,
    slicing: PackSchema,
    wordpress: PackSchema.extend({
      variants: z.object({ standard: VariantSchema, woo: VariantSchema }),
    }),
  }),
  commands: z.record(NameSchema, CommandSchema),
})

export type PackCatalog = z.infer<typeof PackCatalogSchema>
type CommandSource = PackId | 'shared'

export interface KnowledgeSelection {
  packs: PackId[]
  wordpressProfile?: PresetId
}

export interface PackFiles {
  files: Map<string, Buffer>
  commands: string[]
}

const PacksOptionSchema = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0),
  )
  .pipe(z.array(z.enum(['all', ...PACK_IDS])).min(1, 'Specify at least one pack'))
  .refine(
    (items) => !items.includes('all') || items.length === 1,
    '"all" cannot be combined with other packs',
  )

export function parsePacksOption(value: string): PackId[] {
  const parsed = PacksOptionSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error(
      `Invalid --packs value "${value}": ${parsed.error.issues[0]?.message ?? 'invalid'}. ` +
        `Use all or a comma-separated list of: ${PACK_IDS.join(', ')}.`,
    )
  }
  return parsed.data.includes('all') ? [...PACK_IDS] : normalizePacks(parsed.data as PackId[])
}

export function normalizePacks(packs: readonly PackId[]): PackId[] {
  return PACK_IDS.filter((pack) => packs.includes(pack))
}

export function formatSelection(selection: KnowledgeSelection, catalog?: PackCatalog): string {
  return selection.packs
    .map((pack) => {
      const label = catalog?.packs[pack].label ?? pack
      if (pack !== 'wordpress' || !selection.wordpressProfile) return label
      const variant = catalog?.packs.wordpress.variants[selection.wordpressProfile].label
      return `${label} (${variant ?? selection.wordpressProfile})`
    })
    .join(' + ')
}

async function collectFiles(root: string, current: string = root): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>()
  const entries = await readdir(current, { withFileTypes: true })
  entries.sort((left, right) => left.name.localeCompare(right.name))

  for (const entry of entries) {
    const source = resolve(current, entry.name)

    if (entry.isSymbolicLink()) {
      throw new Error(`Knowledge source must not contain symbolic links: ${source}`)
    }

    if (entry.isDirectory()) {
      for (const [relativePath, contents] of await collectFiles(root, source)) {
        files.set(relativePath, contents)
      }
      continue
    }

    if (!entry.isFile() || entry.name === '.DS_Store') continue

    files.set(
      source
        .slice(root.length + 1)
        .split(sep)
        .join('/'),
      await readFile(source),
    )
  }

  return files
}

async function listNames(dir: string, suffix = ''): Promise<string[]> {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((entry) =>
      suffix ? entry.isFile() && entry.name.endsWith(suffix) : entry.isDirectory(),
    )
    .map((entry) => (suffix ? entry.name.slice(0, -suffix.length) : entry.name))
}

function commandSources(catalog: PackCatalog): Map<string, CommandSource> {
  const sources = new Map<string, CommandSource>()

  for (const pack of PACK_IDS) {
    for (const command of catalog.packs[pack].commands) {
      if (sources.has(command)) {
        throw new Error(`Command "${command}" is owned by more than one pack`)
      }
      sources.set(command, pack)
    }
  }

  for (const pack of PACK_IDS) {
    for (const command of catalog.packs[pack].sharedCommands) {
      const owner = sources.get(command)
      if (owner && owner !== 'shared') {
        throw new Error(`Command "${command}" is owned by "${owner}" and cannot be shared`)
      }
      sources.set(command, 'shared')
    }
  }

  return sources
}

/** Reads packs.json and checks it against the pack directories. */
export async function loadPackCatalog(knowledgeSource: string): Promise<PackCatalog> {
  const raw = await readFile(resolve(knowledgeSource, 'packs.json'), 'utf-8')
  const catalog = PackCatalogSchema.parse(JSON.parse(raw))
  const packsRoot = resolve(knowledgeSource, 'packs')
  const sources = commandSources(catalog)
  const problems: string[] = []

  for (const command of Object.keys(catalog.commands)) {
    if (!sources.has(command)) problems.push(`Command "${command}" is not used by any pack`)
  }

  for (const [command, source] of sources) {
    if (!catalog.commands[command]) problems.push(`Command "${command}" has no catalog entry`)
    for (const path of [`prompts/${command}.md`, `claude-commands/${command}.md`]) {
      if (!existsSync(resolve(packsRoot, source, path))) {
        problems.push(`Command "${command}" is missing packs/${source}/${path}`)
      }
    }
    if (source === 'shared' && !existsSync(resolve(packsRoot, 'shared', 'skills', command))) {
      problems.push(`Shared command "${command}" is missing packs/shared/skills/${command}/`)
    }
  }

  for (const source of [...PACK_IDS, 'shared'] as const) {
    for (const dir of ['prompts', 'claude-commands']) {
      for (const name of await listNames(resolve(packsRoot, source, dir), '.md')) {
        if (sources.get(name) !== source) {
          problems.push(`packs/${source}/${dir}/${name}.md does not belong to a ${source} command`)
        }
      }
    }
  }

  for (const skill of await listNames(resolve(packsRoot, 'shared', 'skills'))) {
    if (sources.get(skill) !== 'shared') {
      problems.push(`packs/shared/skills/${skill}/ does not belong to a shared command`)
    }
  }

  for (const pack of PACK_IDS) {
    if (!existsSync(resolve(packsRoot, pack))) problems.push(`Pack directory not found: ${pack}`)
    for (const file of catalog.packs[pack].sharedFiles) {
      if (!existsSync(resolve(packsRoot, 'shared', ...file.split('/')))) {
        problems.push(`Shared file not found: packs/shared/${file}`)
      }
    }
  }

  for (const variant of Object.values(catalog.packs.wordpress.variants)) {
    for (const dir of variant.extraDirs) {
      if (!existsSync(resolve(packsRoot, dir))) problems.push(`Variant directory not found: ${dir}`)
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid knowledge catalog:\n- ${problems.join('\n- ')}`)
  }

  return catalog
}

function render(template: Buffer, selectionLabel: string): string {
  return template.toString('utf-8').replaceAll('{{packs}}', selectionLabel).trimEnd()
}

async function readBase(packsRoot: string, ...parts: string[]): Promise<Buffer> {
  return readFile(resolve(packsRoot, 'base', ...parts))
}

function renderCommandTable(catalog: PackCatalog, commands: string[]): string {
  const sources = commandSources(catalog)
  const rows = commands.map((command) => {
    const meta = catalog.commands[command]!
    const source = sources.get(command)!
    const cell = (value: string): string => value.replaceAll('|', '\\|')
    return `| \`${cell(meta.usage)}\` | \`knowledge/${source}/prompts/${command}.md\` | ${cell(meta.description)} |`
  })
  return [
    '## Commands',
    '',
    '| Command | Prompt file | Description |',
    '|---|---|---|',
    ...rows,
  ].join('\n')
}

function renderConstraints(catalog: PackCatalog, commands: string[]): string | null {
  const lines = commands
    .filter((command) => catalog.commands[command]!.constraint)
    .map((command) => `- \`/${command}\` — ${catalog.commands[command]!.constraint}`)
  return lines.length > 0 ? ['## Constraints', '', ...lines].join('\n') : null
}

function renderRules(managedPaths: string[]): string | null {
  const rules = managedPaths.filter(
    (path) =>
      path.startsWith('knowledge/') &&
      path.endsWith('.md') &&
      /\/(rules|contracts|checklists)\//.test(path),
  )
  return rules.length > 0
    ? ['## Rules and contracts', '', ...rules.map((path) => `- \`${path}\``)].join('\n')
    : null
}

function addFile(files: Map<string, Buffer>, managedPath: string, contents: Buffer): void {
  const existing = files.get(managedPath)
  if (existing && !existing.equals(contents)) {
    throw new Error(`Knowledge packs contain different files for the same target: ${managedPath}`)
  }
  files.set(managedPath, contents)
}

/**
 * Builds the complete set of managed files for a selection: pack files, shared files,
 * Claude commands and the generated AGENTS.md / CLAUDE.md / knowledge/context.md.
 */
export async function buildPackFiles(
  knowledgeSource: string,
  catalog: PackCatalog,
  selection: KnowledgeSelection,
): Promise<PackFiles> {
  const packsRoot = resolve(knowledgeSource, 'packs')
  const files = new Map<string, Buffer>()
  const commands: string[] = []
  const sharedCommands = new Set<string>()
  const sharedFiles = new Set<string>()

  for (const pack of selection.packs) {
    const definition = catalog.packs[pack]
    commands.push(...definition.commands)
    definition.sharedCommands.forEach((command) => sharedCommands.add(command))
    definition.sharedFiles.forEach((file) => sharedFiles.add(file))

    for (const [relativePath, contents] of await collectFiles(resolve(packsRoot, pack))) {
      const managedPath = relativePath.startsWith('claude-commands/')
        ? `.claude/commands/${relativePath.slice('claude-commands/'.length)}`
        : `knowledge/${pack}/${relativePath}`
      addFile(files, managedPath, contents)
    }
  }

  if (selection.packs.includes('wordpress')) {
    if (!selection.wordpressProfile) throw new Error('WordPress pack requires a WordPress profile')
    for (const dir of catalog.packs.wordpress.variants[selection.wordpressProfile].extraDirs) {
      for (const [relativePath, contents] of await collectFiles(resolve(packsRoot, dir))) {
        addFile(files, `knowledge/${dir}/${relativePath}`, contents)
      }
    }
  }

  for (const command of [...sharedCommands].sort()) {
    commands.push(command)
    addFile(
      files,
      `knowledge/shared/prompts/${command}.md`,
      await readFile(resolve(packsRoot, 'shared', 'prompts', `${command}.md`)),
    )
    addFile(
      files,
      `.claude/commands/${command}.md`,
      await readFile(resolve(packsRoot, 'shared', 'claude-commands', `${command}.md`)),
    )
    for (const [relativePath, contents] of await collectFiles(
      resolve(packsRoot, 'shared', 'skills', command),
    )) {
      addFile(files, `knowledge/shared/skills/${command}/${relativePath}`, contents)
    }
  }

  for (const file of [...sharedFiles].sort()) {
    addFile(
      files,
      `knowledge/shared/${file}`,
      await readFile(resolve(packsRoot, 'shared', ...file.split('/'))),
    )
  }

  const label = formatSelection(selection, catalog)
  const managedPaths = [...files.keys()].sort()

  const context = [
    render(await readBase(packsRoot, 'context', 'header.md'), label),
    renderCommandTable(catalog, commands),
    ...(await Promise.all(
      selection.packs.map(async (pack) =>
        render(await readBase(packsRoot, 'context', `${pack}.md`), label),
      ),
    )),
    renderRules(managedPaths),
    renderConstraints(catalog, commands),
    render(await readBase(packsRoot, 'context', 'footer.md'), label),
  ].filter((section): section is string => section !== null)

  const agentFragments = selection.packs.map((pack) =>
    pack === 'wordpress' ? `wordpress.${selection.wordpressProfile}.md` : `${pack}.md`,
  )
  const agents = [
    render(await readBase(packsRoot, 'agents', 'header.md'), label),
    ...(await Promise.all(
      agentFragments.map(async (fragment) =>
        render(await readBase(packsRoot, 'agents', fragment), label),
      ),
    )),
    render(await readBase(packsRoot, 'agents', 'footer.md'), label),
  ]

  addFile(files, 'knowledge/context.md', Buffer.from(`${context.join('\n\n')}\n`))
  addFile(files, 'AGENTS.md', Buffer.from(`${agents.join('\n\n')}\n`))
  addFile(files, 'CLAUDE.md', await readBase(packsRoot, 'CLAUDE.md'))

  return {
    files: new Map([...files.entries()].sort(([left], [right]) => left.localeCompare(right))),
    commands,
  }
}
