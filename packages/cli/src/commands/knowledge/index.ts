import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { lstat, mkdir, readFile, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  intro,
  outro,
  spinner,
  logger,
  readConfig,
  hasConfig,
  select,
  multiselect,
} from '@veaceslav-golden/wp-ai-kit-core'
import { z } from 'zod'
import type { PresetId } from '../../presets.js'
import {
  PACK_IDS,
  WORDPRESS_PROFILES,
  buildPackFiles,
  formatSelection,
  loadPackCatalog,
  normalizePacks,
  parsePacksOption,
} from './packs.js'
import type { KnowledgeSelection, PackCatalog, PackId } from './packs.js'

export { PACK_IDS, parsePacksOption } from './packs.js'
export type { KnowledgeSelection, PackId } from './packs.js'

const MANIFEST_RELATIVE_PATH = '.wpaikit/knowledge-manifest.json'

const ManagedPathSchema = z
  .string()
  .min(1)
  .refine((value) => !isAbsolute(value), 'Managed path must be relative')
  .refine((value) => !value.includes('\\'), 'Managed path must use forward slashes')
  .refine(
    (value) => !value.split('/').some((segment) => ['.', '..', ''].includes(segment)),
    'Managed path contains an invalid segment',
  )

const KnowledgeVersionSchema = z.object({
  schemaVersion: z.literal(1),
  version: z.string().min(1),
})

const ManagedFilesSchema = z.record(ManagedPathSchema, z.string().regex(/^[a-f0-9]{64}$/))

const KnowledgeManifestV1Schema = z.object({
  schemaVersion: z.literal(1),
  knowledgeVersion: z.string().min(1),
  profile: z.enum(WORDPRESS_PROFILES),
  layers: z.array(z.string().min(1)),
  files: ManagedFilesSchema,
})

const KnowledgeManifestV2Schema = z.object({
  schemaVersion: z.literal(2),
  knowledgeVersion: z.string().min(1),
  packs: z.array(z.enum(PACK_IDS)).min(1),
  wordpressProfile: z.enum(WORDPRESS_PROFILES).optional(),
  files: ManagedFilesSchema,
})

type KnowledgeManifest = z.infer<typeof KnowledgeManifestV2Schema>

/** v1 manifests always contained the full kit for a WordPress profile. */
const KnowledgeManifestSchema = z
  .union([KnowledgeManifestV2Schema, KnowledgeManifestV1Schema])
  .transform(
    (manifest): KnowledgeManifest =>
      manifest.schemaVersion === 2
        ? manifest
        : {
            schemaVersion: 2,
            knowledgeVersion: manifest.knowledgeVersion,
            packs: [...PACK_IDS],
            wordpressProfile: manifest.profile,
            files: manifest.files,
          },
  )

interface ExistingFile {
  kind: 'missing' | 'file' | 'other'
  hash?: string
}

interface AppliedFile {
  destination: string
  backup?: string
}

export type KnowledgeChange = { path: string; action: 'add' | 'update' | 'remove' }

export interface KnowledgeInstallOptions extends KnowledgeSelection {
  targetDir: string
  knowledgeSource?: string
  force?: boolean
  dryRun?: boolean
}

export interface KnowledgeInstallResult extends KnowledgeSelection {
  version: string
  previousVersion: string | null
  commands: string[]
  changes: KnowledgeChange[]
  written: number
  removed: number
  unchanged: number
  dryRun: boolean
}

export interface KnowledgeCommandOptions {
  packs?: string
  wpProfile?: string
  force?: boolean
  dryRun?: boolean
}

function findProjectRoot(startDir: string): string | null {
  let current = resolve(startDir)

  while (true) {
    if (hasConfig(current)) return current

    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
}

export function resolveKnowledgeTargetDir(startDir: string): string {
  return findProjectRoot(startDir) ?? resolve(startDir)
}

export function bundledKnowledgeSource(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), 'knowledge')
}

function hash(contents: Buffer): string {
  return createHash('sha256').update(contents).digest('hex')
}

function managedDestination(targetDir: string, managedPath: string): string {
  const validated = ManagedPathSchema.parse(managedPath)
  return resolve(targetDir, ...validated.split('/'))
}

async function readJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(path, 'utf-8')
  return schema.parse(JSON.parse(raw))
}

async function inspectFile(path: string): Promise<ExistingFile> {
  try {
    const info = await lstat(path)
    if (!info.isFile()) return { kind: 'other' }
    return { kind: 'file', hash: hash(await readFile(path)) }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { kind: 'missing' }
    throw error
  }
}

async function readManifest(
  manifestPath: string,
): Promise<{ manifest: KnowledgeManifest | null; raw: string | null }> {
  try {
    const raw = await readFile(manifestPath, 'utf-8')
    return {
      manifest: KnowledgeManifestSchema.parse(JSON.parse(raw)),
      raw,
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { manifest: null, raw: null }
    }
    throw new Error(`Cannot read ${MANIFEST_RELATIVE_PATH}: ${(error as Error).message}`)
  }
}

async function removeEmptyParents(path: string, targetDir: string): Promise<void> {
  let current = dirname(path)
  while (current !== targetDir && current.startsWith(`${targetDir}${sep}`)) {
    try {
      await rmdir(current)
    } catch {
      return
    }
    current = dirname(current)
  }
}

function serializeManifest(manifest: KnowledgeManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}

export async function installKnowledge(
  options: KnowledgeInstallOptions,
): Promise<KnowledgeInstallResult> {
  const targetDir = resolve(options.targetDir)
  const knowledgeSource = resolve(options.knowledgeSource ?? bundledKnowledgeSource())

  if (!existsSync(knowledgeSource)) {
    throw new Error(
      'knowledge/ not found in the package.\n' +
        'If you are running from source, build the CLI first: pnpm build',
    )
  }

  const selection = normalizeSelection(options)
  const version = await readJson(resolve(knowledgeSource, 'version.json'), KnowledgeVersionSchema)
  const catalog = await loadPackCatalog(knowledgeSource)
  const built = await buildPackFiles(knowledgeSource, catalog, selection)
  const desired = new Map(
    [...built.files].map(([managedPath, contents]) => [
      ManagedPathSchema.parse(managedPath),
      { contents, hash: hash(contents) },
    ]),
  )
  const manifestPath = resolve(targetDir, MANIFEST_RELATIVE_PATH)
  const previous = await readManifest(manifestPath)
  const previousFiles = previous.manifest?.files ?? {}
  const writes: string[] = []
  const stale: string[] = []
  const staleExisting: string[] = []
  const conflicts: string[] = []

  for (const [managedPath, file] of desired) {
    const existing = await inspectFile(managedDestination(targetDir, managedPath))
    if (existing.kind === 'missing') {
      writes.push(managedPath)
      continue
    }
    if (existing.kind !== 'file') {
      conflicts.push(`${managedPath} is not a regular file`)
      continue
    }
    if (existing.hash === file.hash) continue

    const previousHash = previousFiles[managedPath]
    if (options.force || (previousHash && existing.hash === previousHash)) {
      writes.push(managedPath)
    } else {
      conflicts.push(`${managedPath} contains local changes`)
    }
  }

  for (const [managedPath, previousHash] of Object.entries(previousFiles)) {
    if (desired.has(managedPath)) continue
    stale.push(managedPath)

    const existing = await inspectFile(managedDestination(targetDir, managedPath))
    if (existing.kind === 'missing') continue
    if (existing.kind !== 'file') {
      conflicts.push(`${managedPath} is not a regular file`)
      continue
    }
    if (options.force || existing.hash === previousHash) {
      staleExisting.push(managedPath)
    } else {
      conflicts.push(`${managedPath} is obsolete but contains local changes`)
    }
  }

  if (conflicts.length > 0) {
    throw new Error(
      `Knowledge installation stopped to protect local files:\n- ${conflicts.join(
        '\n- ',
      )}\nRun again with --force to replace managed files.`,
    )
  }

  const manifest: KnowledgeManifest = {
    schemaVersion: 2,
    knowledgeVersion: version.version,
    packs: selection.packs,
    ...(selection.wordpressProfile ? { wordpressProfile: selection.wordpressProfile } : {}),
    files: Object.fromEntries([...desired].map(([managedPath, file]) => [managedPath, file.hash])),
  }
  const manifestContents = serializeManifest(manifest)
  const manifestChanged = previous.raw !== manifestContents

  const result: KnowledgeInstallResult = {
    ...selection,
    version: version.version,
    previousVersion: previous.manifest?.knowledgeVersion ?? null,
    commands: built.commands,
    changes: [
      ...writes.map(
        (path): KnowledgeChange => ({
          path,
          action:
            previousFiles[path] || existsSync(managedDestination(targetDir, path))
              ? 'update'
              : 'add',
        }),
      ),
      ...staleExisting.map((path): KnowledgeChange => ({ path, action: 'remove' })),
    ].sort((left, right) => left.path.localeCompare(right.path)),
    written: writes.length,
    removed: staleExisting.length,
    unchanged: desired.size - writes.length,
    dryRun: options.dryRun ?? false,
  }

  if (options.dryRun || (writes.length === 0 && staleExisting.length === 0 && !manifestChanged)) {
    return result
  }

  const stageDir = resolve(targetDir, '.wpaikit', `.knowledge-stage-${randomUUID()}`)
  const applied: AppliedFile[] = []
  let manifestTouched = false

  await mkdir(stageDir, { recursive: true })

  try {
    for (const managedPath of writes) {
      const staged = managedDestination(resolve(stageDir, 'files'), managedPath)
      await mkdir(dirname(staged), { recursive: true })
      await writeFile(staged, desired.get(managedPath)!.contents)
    }

    for (const managedPath of [...staleExisting, ...writes]) {
      const destination = managedDestination(targetDir, managedPath)
      const existing = await inspectFile(destination)
      let backup: string | undefined

      if (existing.kind !== 'missing') {
        backup = managedDestination(resolve(stageDir, 'backup'), managedPath)
        await mkdir(dirname(backup), { recursive: true })
        await rename(destination, backup)
      }

      applied.push({ destination, backup })

      if (desired.has(managedPath)) {
        const staged = managedDestination(resolve(stageDir, 'files'), managedPath)
        await mkdir(dirname(destination), { recursive: true })
        await rename(staged, destination)
      }
    }

    await mkdir(dirname(manifestPath), { recursive: true })
    const manifestTemp = resolve(dirname(manifestPath), `.knowledge-manifest-${randomUUID()}.tmp`)
    await writeFile(manifestTemp, manifestContents)
    manifestTouched = true
    await rm(manifestPath, { force: true })
    await rename(manifestTemp, manifestPath)
  } catch (error) {
    for (const item of applied.reverse()) {
      await rm(item.destination, { force: true })
      if (item.backup) {
        await mkdir(dirname(item.destination), { recursive: true })
        await rename(item.backup, item.destination)
      }
    }

    if (manifestTouched) {
      if (previous.raw === null) {
        await rm(manifestPath, { force: true })
      } else {
        await writeFile(manifestPath, previous.raw)
      }
    }
    throw error
  } finally {
    await rm(stageDir, { recursive: true, force: true })
  }

  for (const managedPath of stale) {
    await removeEmptyParents(managedDestination(targetDir, managedPath), targetDir)
  }

  return result
}

function normalizeSelection(selection: KnowledgeSelection): KnowledgeSelection {
  const packs = normalizePacks(selection.packs)
  if (packs.length === 0) throw new Error('Select at least one knowledge pack')

  if (!packs.includes('wordpress')) return { packs }
  if (!selection.wordpressProfile)
    throw new Error('The WordPress pack requires a WordPress profile')
  return { packs, wordpressProfile: z.enum(WORDPRESS_PROFILES).parse(selection.wordpressProfile) }
}

function parseWordpressProfile(value: string): PresetId {
  const parsed = z.enum(WORDPRESS_PROFILES).safeParse(value.toLowerCase())
  if (!parsed.success) {
    throw new Error(`Unknown WordPress profile "${value}". Use ${WORDPRESS_PROFILES.join(' or ')}.`)
  }
  return parsed.data
}

export interface KnowledgePrompts {
  select: typeof select
  multiselect: typeof multiselect
}

export interface ResolveSelectionOptions {
  packs?: string
  wpProfile?: string
  /** Ask questions when nothing else decides the selection. Defaults to a TTY check. */
  interactive?: boolean
  prompts?: KnowledgePrompts
  catalog?: PackCatalog
}

async function promptPacks(prompts: KnowledgePrompts, catalog?: PackCatalog): Promise<PackId[]> {
  const mode = await prompts.select<'all' | 'choose'>({
    message: 'Which knowledge packs do you want to install?',
    options: [
      { value: 'all', label: 'All', hint: 'Design + Slicing + WordPress' },
      { value: 'choose', label: 'Choose packs' },
    ],
    initialValue: 'all',
  })
  if (mode === 'all') return [...PACK_IDS]

  return prompts.multiselect<PackId>({
    message: 'Select packs:',
    options: PACK_IDS.map((pack) => ({
      value: pack,
      label: catalog?.packs[pack].label ?? pack,
      hint: catalog?.packs[pack].hint,
    })),
    required: true,
  })
}

/**
 * Decides which packs (and which WordPress profile) to install.
 * Order: --packs → previous manifest → prompt (TTY) → all.
 * The WordPress profile is only resolved when the WordPress pack is selected:
 * .wpaikit.json → --wp-profile → previous manifest → prompt (TTY) → standard.
 */
export async function resolveKnowledgeSelection(
  startDir: string,
  options: ResolveSelectionOptions = {},
): Promise<KnowledgeSelection> {
  const projectRoot = findProjectRoot(startDir)
  const targetDir = projectRoot ?? resolve(startDir)
  const config = projectRoot ? readConfig(projectRoot) : null
  const previous = (await readManifest(resolve(targetDir, MANIFEST_RELATIVE_PATH))).manifest
  const interactive = options.interactive ?? Boolean(process.stdin.isTTY && process.stdout.isTTY)
  const prompts = options.prompts ?? { select, multiselect }

  let packs: PackId[]
  if (options.packs !== undefined) packs = parsePacksOption(options.packs)
  else if (previous) packs = normalizePacks(previous.packs)
  else if (interactive) packs = normalizePacks(await promptPacks(prompts, options.catalog))
  else packs = [...PACK_IDS]

  const requested = options.wpProfile ? parseWordpressProfile(options.wpProfile) : undefined

  if (!packs.includes('wordpress')) {
    if (requested) {
      throw new Error('--wp-profile requires the WordPress pack. Add wordpress to --packs.')
    }
    return { packs }
  }

  if (config) {
    if (requested && requested !== config.preset) {
      throw new Error(
        `WordPress profile "${requested}" does not match .wpaikit.json preset "${config.preset}".`,
      )
    }
    return { packs, wordpressProfile: config.preset }
  }

  if (requested) return { packs, wordpressProfile: requested }
  if (previous?.wordpressProfile) return { packs, wordpressProfile: previous.wordpressProfile }

  if (!interactive) return { packs, wordpressProfile: 'standard' }

  const variants = options.catalog?.packs.wordpress.variants
  const wordpressProfile = await prompts.select<PresetId>({
    message: 'WordPress profile:',
    options: WORDPRESS_PROFILES.map((profile) => ({
      value: profile,
      label: variants?.[profile].label ?? profile,
      hint: variants?.[profile].hint,
    })),
    initialValue: 'standard',
  })
  return { packs, wordpressProfile }
}

function selectionNotes(selection: KnowledgeSelection): string[] {
  const notes: string[] = []
  if (!selection.packs.includes('design') && selection.packs.length > 0) {
    notes.push(
      '.wpaikit/design-system.json is created by /figma-design-system (Design pack) ' +
        'or delivered by the designer.',
    )
  }
  return notes
}

const CHANGE_MARKS: Record<KnowledgeChange['action'], string> = {
  add: '+',
  update: '~',
  remove: '-',
}

export async function runKnowledgeInstall(options: KnowledgeCommandOptions = {}): Promise<void> {
  intro('wpaikit knowledge install')

  const cwd = process.cwd()
  const targetDir = resolveKnowledgeTargetDir(cwd)
  const catalog = await loadPackCatalog(bundledKnowledgeSource()).catch(() => undefined)
  const selection = await resolveKnowledgeSelection(cwd, {
    packs: options.packs,
    wpProfile: options.wpProfile,
    catalog,
  })
  const s = spinner()
  s.start(options.dryRun ? 'Inspecting knowledge installation...' : 'Installing knowledge...')

  try {
    const result = await installKnowledge({
      targetDir,
      ...selection,
      force: options.force,
      dryRun: options.dryRun,
    })
    s.stop(options.dryRun ? 'Inspection complete' : 'Knowledge installed')

    logger.step(
      `Version:   ${
        result.previousVersion && result.previousVersion !== result.version
          ? `${result.previousVersion} → ${result.version}`
          : result.version
      }`,
    )
    logger.step(`Packs:     ${formatSelection(result, catalog)}`)
    logger.step(`Commands:  ${result.commands.length}`)
    logger.step(`Written:   ${result.written}`)
    logger.step(`Removed:   ${result.removed}`)
    logger.step(`Unchanged: ${result.unchanged}`)

    if (options.dryRun && result.changes.length > 0) {
      logger.message(
        result.changes.map((change) => `${CHANGE_MARKS[change.action]} ${change.path}`).join('\n'),
      )
    }
    for (const note of selectionNotes(result)) logger.info(note)
  } catch (error) {
    s.stop(options.dryRun ? 'Inspection failed' : 'Install failed')
    throw error
  }

  outro(options.dryRun ? 'Dry run complete. No files were changed.' : 'Knowledge is ready.')
}
