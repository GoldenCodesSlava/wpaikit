import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { lstat, mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from 'node:fs/promises'
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
} from '@veaceslav-golden/wp-ai-kit-core'
import { z } from 'zod'
import { getPreset } from '../../presets.js'
import type { PresetId } from '../../presets.js'

const PROFILE_IDS = ['standard', 'woo'] as const
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

const KnowledgeProfileSchema = z.object({
  id: z.enum(PROFILE_IDS),
  layers: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/)).min(1),
})

const KnowledgeManifestSchema = z.object({
  schemaVersion: z.literal(1),
  knowledgeVersion: z.string().min(1),
  profile: z.enum(PROFILE_IDS),
  layers: z.array(z.string().min(1)),
  files: z.record(ManagedPathSchema, z.string().regex(/^[a-f0-9]{64}$/)),
})

type KnowledgeManifest = z.infer<typeof KnowledgeManifestSchema>

interface DesiredFile {
  contents: Buffer
  hash: string
}

interface ExistingFile {
  kind: 'missing' | 'file' | 'other'
  hash?: string
}

interface AppliedFile {
  destination: string
  backup?: string
}

export interface KnowledgeInstallOptions {
  targetDir: string
  profile: PresetId
  knowledgeSource?: string
  claudeCommandsSource?: string | null
  force?: boolean
  dryRun?: boolean
}

export interface KnowledgeInstallResult {
  profile: PresetId
  version: string
  previousVersion: string | null
  layers: string[]
  written: number
  removed: number
  unchanged: number
  dryRun: boolean
}

export interface KnowledgeCommandOptions {
  profile?: string
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

function bundledSources(): { knowledge: string; claudeCommands: string } {
  const distDir = dirname(fileURLToPath(import.meta.url))
  return {
    knowledge: resolve(distDir, 'knowledge'),
    claudeCommands: resolve(distDir, 'claude-commands'),
  }
}

function hash(contents: Buffer): string {
  return createHash('sha256').update(contents).digest('hex')
}

function toManagedPath(...parts: string[]): string {
  return parts.join('/').split(sep).join('/')
}

function managedDestination(targetDir: string, managedPath: string): string {
  const validated = ManagedPathSchema.parse(managedPath)
  return resolve(targetDir, ...validated.split('/'))
}

async function readJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(path, 'utf-8')
  return schema.parse(JSON.parse(raw))
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
      const nested = await collectFiles(root, source)
      for (const [relativePath, contents] of nested) files.set(relativePath, contents)
      continue
    }

    if (!entry.isFile()) continue

    const relativePath = source
      .slice(root.length + 1)
      .split(sep)
      .join('/')
    files.set(relativePath, await readFile(source))
  }

  return files
}

function addDesiredFile(
  desired: Map<string, DesiredFile>,
  managedPath: string,
  contents: Buffer,
): void {
  const validated = ManagedPathSchema.parse(managedPath)
  if (desired.has(validated)) {
    throw new Error(`Knowledge layers contain the same target file: ${validated}`)
  }
  desired.set(validated, { contents, hash: hash(contents) })
}

async function buildDesiredFiles(
  knowledgeSource: string,
  claudeCommandsSource: string | null,
  profile: PresetId,
  layers: string[],
): Promise<Map<string, DesiredFile>> {
  const desired = new Map<string, DesiredFile>()

  for (const layer of layers) {
    const layerRoot = resolve(knowledgeSource, 'layers', layer)
    if (!existsSync(layerRoot)) throw new Error(`Knowledge layer not found: ${layer}`)

    for (const [relativePath, contents] of await collectFiles(layerRoot)) {
      addDesiredFile(desired, toManagedPath('knowledge', relativePath), contents)
    }
  }

  const agents = await readFile(resolve(knowledgeSource, 'templates', `AGENTS.${profile}.md`))
  const claude = await readFile(resolve(knowledgeSource, 'templates', 'CLAUDE.md'))
  addDesiredFile(desired, 'AGENTS.md', agents)
  addDesiredFile(desired, 'CLAUDE.md', claude)

  if (claudeCommandsSource && existsSync(claudeCommandsSource)) {
    for (const [relativePath, contents] of await collectFiles(claudeCommandsSource)) {
      addDesiredFile(desired, toManagedPath('.claude', 'commands', relativePath), contents)
    }
  }

  return new Map([...desired.entries()].sort(([left], [right]) => left.localeCompare(right)))
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
  const bundled = bundledSources()
  const knowledgeSource = resolve(options.knowledgeSource ?? bundled.knowledge)
  const claudeCommandsSource =
    options.claudeCommandsSource === null
      ? null
      : resolve(options.claudeCommandsSource ?? bundled.claudeCommands)

  if (!existsSync(knowledgeSource)) {
    throw new Error(
      'knowledge/ not found in the package.\n' +
        'If you are running from source, build the CLI first: pnpm build',
    )
  }

  const version = await readJson(resolve(knowledgeSource, 'version.json'), KnowledgeVersionSchema)
  const profile = await readJson(
    resolve(knowledgeSource, 'profiles', `${options.profile}.json`),
    KnowledgeProfileSchema,
  )

  if (profile.id !== options.profile) {
    throw new Error(
      `Knowledge profile file declares "${profile.id}", expected "${options.profile}"`,
    )
  }

  const desired = await buildDesiredFiles(
    knowledgeSource,
    claudeCommandsSource,
    options.profile,
    profile.layers,
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
    schemaVersion: 1,
    knowledgeVersion: version.version,
    profile: options.profile,
    layers: profile.layers,
    files: Object.fromEntries([...desired].map(([managedPath, file]) => [managedPath, file.hash])),
  }
  const manifestContents = serializeManifest(manifest)
  const manifestChanged = previous.raw !== manifestContents

  const result: KnowledgeInstallResult = {
    profile: options.profile,
    version: version.version,
    previousVersion: previous.manifest?.knowledgeVersion ?? null,
    layers: profile.layers,
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

export async function resolveKnowledgeProfile(
  targetDir: string,
  requestedProfile?: string,
): Promise<PresetId> {
  const projectRoot = findProjectRoot(targetDir)
  const config = projectRoot ? readConfig(projectRoot) : null

  const requested = requestedProfile ? getPreset(requestedProfile.toLowerCase()).id : undefined

  if (config) {
    if (requested && requested !== config.preset) {
      throw new Error(
        `Knowledge profile "${requested}" does not match .wpaikit.json preset "${config.preset}".`,
      )
    }
    return config.preset
  }

  if (requested) return requested

  return select<PresetId>({
    message: 'Knowledge profile:',
    options: [
      { value: 'standard', label: 'WordPress Standard', hint: 'Common + WordPress' },
      { value: 'woo', label: 'WooCommerce', hint: 'Common + WordPress + WooCommerce' },
    ],
    initialValue: 'standard',
  })
}

export async function runKnowledgeInstall(options: KnowledgeCommandOptions = {}): Promise<void> {
  intro('wpaikit knowledge install')

  const cwd = process.cwd()
  const targetDir = resolveKnowledgeTargetDir(cwd)
  const profile = await resolveKnowledgeProfile(cwd, options.profile)
  const s = spinner()
  s.start(options.dryRun ? 'Inspecting knowledge installation...' : 'Installing knowledge...')

  try {
    const result = await installKnowledge({
      targetDir,
      profile,
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
    logger.step(`Profile:   ${result.profile}`)
    logger.step(`Layers:    ${result.layers.join(' + ')}`)
    logger.step(`Written:   ${result.written}`)
    logger.step(`Removed:   ${result.removed}`)
    logger.step(`Unchanged: ${result.unchanged}`)
  } catch (error) {
    s.stop(options.dryRun ? 'Inspection failed' : 'Install failed')
    throw error
  }

  outro(options.dryRun ? 'Dry run complete. No files were changed.' : 'Knowledge is ready.')
}
