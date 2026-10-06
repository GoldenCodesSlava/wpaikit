import { createHash } from 'node:crypto'
import {
  mkdirSync,
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { logger } from '@veaceslav-golden/wp-ai-kit-core'
import type { Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import { rmSync } from 'node:fs'

const KNOWLEDGE_MANIFEST = '.wpaikit/knowledge-manifest.json'

interface KnowledgeManifestFiles {
  files: Record<string, string>
}

type KnowledgeProfile = 'standard' | 'woo'

function isSafeManagedPath(path: string): boolean {
  return (
    path.length > 0 &&
    !isAbsolute(path) &&
    !path.includes('\\') &&
    !path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  )
}

function readKnowledgeManifest(cwd: string): KnowledgeManifestFiles | null {
  const manifestPath = resolve(cwd, KNOWLEDGE_MANIFEST)
  if (!existsSync(manifestPath)) return null

  try {
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf-8')) as unknown
    if (!parsed || typeof parsed !== 'object' || !('files' in parsed)) throw new Error('files missing')

    const files = (parsed as { files: unknown }).files
    if (!files || typeof files !== 'object' || Array.isArray(files)) throw new Error('files invalid')

    for (const [path, checksum] of Object.entries(files)) {
      if (!isSafeManagedPath(path) || typeof checksum !== 'string' || !/^[a-f0-9]{64}$/.test(checksum)) {
        throw new Error('managed path or checksum invalid')
      }
    }

    return { files: files as Record<string, string> }
  } catch {
    throw new Error(
      `Cannot initialize in the current directory because ${KNOWLEDGE_MANIFEST} is invalid.`,
    )
  }
}

function checksum(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function collectLegacyFiles(cwd: string, relativePath: string): Record<string, string> {
  const absolutePath = resolve(cwd, ...relativePath.split('/'))
  const info = lstatSync(absolutePath)

  if (info.isSymbolicLink()) {
    throw new Error(`Legacy knowledge base contains a symbolic link: ${relativePath}`)
  }

  if (info.isFile()) return { [relativePath]: checksum(absolutePath) }
  if (!info.isDirectory()) {
    throw new Error(`Legacy knowledge entry is not a regular file or directory: ${relativePath}`)
  }

  const files: Record<string, string> = {}
  for (const entry of readdirSync(absolutePath)) {
    Object.assign(files, collectLegacyFiles(cwd, `${relativePath}/${entry}`))
  }
  return files
}

function adoptLegacyKnowledge(cwd: string, profile: KnowledgeProfile): KnowledgeManifestFiles | null {
  const visibleEntries = readdirSync(cwd)
    .filter((entry) => !entry.startsWith('.'))
    .sort()
  const legacyEntries = ['AGENTS.md', 'CLAUDE.md', 'knowledge']

  if (
    visibleEntries.length !== legacyEntries.length ||
    !legacyEntries.every((entry, index) => visibleEntries[index] === entry)
  ) {
    return null
  }

  const contextPath = resolve(cwd, 'knowledge', 'context.md')
  const agentsPath = resolve(cwd, 'AGENTS.md')
  const claudePath = resolve(cwd, 'CLAUDE.md')
  if (
    !existsSync(contextPath) ||
    !readFileSync(contextPath, 'utf-8').toLowerCase().includes('wpaikit knowledge') ||
    !readFileSync(agentsPath, 'utf-8').includes('knowledge/context.md') ||
    !readFileSync(claudePath, 'utf-8').includes('AGENTS.md') &&
      !readFileSync(claudePath, 'utf-8').includes('knowledge/context.md')
  ) {
    return null
  }

  const files = {
    ...collectLegacyFiles(cwd, 'AGENTS.md'),
    ...collectLegacyFiles(cwd, 'CLAUDE.md'),
    ...collectLegacyFiles(cwd, 'knowledge'),
  }
  const commandsDir = resolve(cwd, '.claude', 'commands')
  if (existsSync(commandsDir)) {
    Object.assign(files, collectLegacyFiles(cwd, '.claude/commands'))
  }

  const manifestDir = resolve(cwd, '.wpaikit')
  mkdirSync(manifestDir, { recursive: true })
  writeFileSync(
    resolve(cwd, KNOWLEDGE_MANIFEST),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        knowledgeVersion: 'legacy-adopted',
        profile,
        layers: profile === 'woo' ? ['common', 'wordpress', 'woocommerce'] : ['common', 'wordpress'],
        files,
      },
      null,
      2,
    )}\n`,
    'utf-8',
  )
  logger.step('Adopted legacy WPAIKit knowledge base')

  return { files }
}

function assertKnowledgeFilesUnmodified(cwd: string, manifest: KnowledgeManifestFiles): void {
  const changed: string[] = []

  for (const [managedPath, expectedChecksum] of Object.entries(manifest.files)) {
    const path = resolve(cwd, ...managedPath.split('/'))
    if (!existsSync(path)) continue

    const info = lstatSync(path)
    if (!info.isFile() || info.isSymbolicLink() || checksum(path) !== expectedChecksum) {
      changed.push(managedPath)
    }
  }

  if (changed.length > 0) {
    throw new Error(
      `Installed knowledge base contains local changes (${changed.join(', ')}). ` +
        'Move those changes or use an empty directory before running init.',
    )
  }
}

function findUnmanagedVisibleEntries(
  cwd: string,
  relativeDir: string,
  managedPaths: Set<string>,
): string[] {
  const directory = relativeDir === '' ? cwd : resolve(cwd, ...relativeDir.split('/'))
  const unmanaged: string[] = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue

    const relativePath = relativeDir === '' ? entry.name : `${relativeDir}/${entry.name}`
    if (entry.isSymbolicLink()) {
      unmanaged.push(relativePath)
      continue
    }

    if (entry.isDirectory()) {
      const ownsDirectory = [...managedPaths].some((path) => path.startsWith(`${relativePath}/`))
      if (!ownsDirectory) {
        unmanaged.push(relativePath)
        continue
      }
      unmanaged.push(...findUnmanagedVisibleEntries(cwd, relativePath, managedPaths))
      continue
    }

    if (!entry.isFile() || !managedPaths.has(relativePath)) unmanaged.push(relativePath)
  }

  return unmanaged
}

function assertCurrentDirectoryCanBeInitialized(cwd: string, profile: KnowledgeProfile): void {
  const visibleEntries = readdirSync(cwd).filter((entry) => !entry.startsWith('.'))
  if (visibleEntries.length === 0) return

  const manifest = readKnowledgeManifest(cwd) ?? adoptLegacyKnowledge(cwd, profile)
  if (manifest === null) {
    throw new Error(
      `Current directory is not empty (${visibleEntries.length} visible item(s) found). ` +
        'Use an empty directory to avoid overwriting files.',
    )
  }

  assertKnowledgeFilesUnmodified(cwd, manifest)
  const unmanaged = findUnmanagedVisibleEntries(cwd, '', new Set(Object.keys(manifest.files)))

  if (unmanaged.length > 0) {
    throw new Error(
      `Current directory is not empty (${unmanaged.length} unmanaged visible item(s): ` +
        `${unmanaged.join(', ')}). Only an installed WPAIKit knowledge base may already exist.`,
    )
  }
}

export function createProjectDir(
  cwd: string,
  slug: string,
  useCurrentDir: boolean,
  rollback: Rollback,
  knowledgeProfile: KnowledgeProfile = 'standard',
): string {
  if (useCurrentDir) {
    const entries = readdirSync(cwd)
    assertCurrentDirectoryCanBeInitialized(cwd, knowledgeProfile)

    const initialEntries = new Set(entries)
    rollback.add(() => {
      for (const entry of readdirSync(cwd)) {
        if (!initialEntries.has(entry)) {
          rmSync(resolve(cwd, entry), { recursive: true, force: true })
        }
      }
      logger.step('Removed files created in the current directory')
    })

    logger.step('Using current directory')
    return cwd
  }

  const targetDir = resolve(cwd, slug)

  if (existsSync(targetDir)) {
    throw new Error(`Directory "${slug}" already exists in the current folder.`)
  }

  mkdirSync(targetDir, { recursive: true })
  rollback.add(() => {
    rmSync(targetDir, { recursive: true, force: true })
    logger.step(`Removed directory: ${slug}`)
  })

  logger.step(`Created directory: ${slug}/`)
  return targetDir
}
