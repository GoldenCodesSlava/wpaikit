import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { exec, logger } from '@veaceslav-golden/wp-ai-kit-core'

async function runIfExists(
  cmd: string,
  args: string[],
  cwd: string,
  label: string,
): Promise<void> {
  try {
    await exec(cmd, ['--version'], { cwd })
  } catch {
    logger.warn(`${label}: "${cmd}" not found, skipping`)
    return
  }

  logger.step(`Running ${label}...`)
  try {
    await exec(cmd, args, { cwd, verbose: false })
    logger.step(`${label} complete`)
  } catch (err) {
    logger.warn(`${label} failed: ${(err as Error).message}`)
  }
}

export async function runPostInstall(targetDir: string, slug: string): Promise<void> {
  const themeDir = resolve(targetDir, 'wp-content', 'themes', slug)

  if (!existsSync(themeDir)) {
    logger.warn('Theme directory not found, skipping post-install')
    return
  }

  const hasComposer = existsSync(resolve(themeDir, 'composer.json'))
  const hasPackageJson = existsSync(resolve(themeDir, 'package.json'))

  if (hasComposer) {
    await runIfExists('composer', ['install', '--no-interaction'], themeDir, 'composer install')
  }

  if (hasPackageJson) {
    await runIfExists('npm', ['install'], themeDir, 'npm install')
    await runIfExists('npm', ['run', 'build'], themeDir, 'npm run build')
  }
}
