import { mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { logger } from '@veaceslav-golden/wp-ai-kit-core'
import type { Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import { rmSync } from 'node:fs'

export function createProjectDir(
  cwd: string,
  slug: string,
  useCurrentDir: boolean,
  rollback: Rollback,
): string {
  if (useCurrentDir) {
    const entries = readdirSync(cwd)
    const nonHidden = entries.filter((e) => !e.startsWith('.'))
    if (nonHidden.length > 0) {
      logger.warn(
        `Current directory is not empty (${nonHidden.length} item(s) found). Continuing anyway.`,
      )
    }
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
