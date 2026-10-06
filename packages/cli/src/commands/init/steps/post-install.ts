import { existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { exec, logger } from '@veaceslav-golden/wp-ai-kit-core'

export interface PostInstallTask {
  command: string
  args: string[]
  cwd: string
  label: string
  required?: boolean
}

async function runIfExists(task: PostInstallTask): Promise<void> {
  const { command: cmd, args, cwd, label, required } = task
  try {
    await exec(cmd, ['--version'], { cwd })
  } catch {
    if (required) throw new Error(`${label}: "${cmd}" is required for the bundled plugin`)
    logger.warn(`${label}: "${cmd}" not found, skipping`)
    return
  }

  logger.step(`Running ${label}...`)
  try {
    await exec(cmd, args, { cwd, verbose: false })
    logger.step(`${label} complete`)
  } catch (err) {
    if (required) throw new Error(`${label} failed: ${(err as Error).message}`)
    logger.warn(`${label} failed: ${(err as Error).message}`)
  }
}

export async function runPostInstall(targetDir: string, slug: string): Promise<void> {
  const themeDir = resolve(targetDir, 'wp-content', 'themes', slug)
  const catalogIoPluginDir = resolve(
    targetDir,
    'wp-content',
    'plugins',
    'wpaikit-product-catalog-io',
  )

  if (!existsSync(themeDir)) {
    logger.warn('Theme directory not found, skipping post-install')
    return
  }

  for (const task of getPostInstallTasks(themeDir, [catalogIoPluginDir])) {
    await runIfExists(task)
  }
}

export function getPostInstallTasks(
  themeDir: string,
  pluginDirs: string[] = [],
): PostInstallTask[] {
  const tasks: PostInstallTask[] = []
  const frontendDir = resolve(themeDir, 'frontend')

  if (existsSync(resolve(themeDir, 'composer.json'))) {
    tasks.push({
      command: 'composer',
      args: ['install', '--no-interaction'],
      cwd: themeDir,
      label: 'composer install',
    })
  }

  if (existsSync(resolve(frontendDir, 'package.json'))) {
    tasks.push(
      {
        command: 'npm',
        args: ['install'],
        cwd: frontendDir,
        label: 'npm install',
      },
      {
        command: 'npm',
        args: ['run', 'build'],
        cwd: frontendDir,
        label: 'npm run build',
      },
    )
  }

  for (const pluginDir of pluginDirs) {
    if (!existsSync(resolve(pluginDir, 'composer.json'))) continue

    tasks.push({
      command: 'composer',
      args: ['install', '--no-dev', '--no-interaction', '--prefer-dist'],
      cwd: pluginDir,
      label: `composer install (${basename(pluginDir)})`,
      required: true,
    })
  }

  return tasks
}
