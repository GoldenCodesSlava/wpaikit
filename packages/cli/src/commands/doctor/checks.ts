import { exec } from '@veaceslav-golden/wp-ai-kit-core'
import { readConfig } from '@veaceslav-golden/wp-ai-kit-core'
import { accessSync, constants, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { getWooPluginRequirements } from '../../woocommerce-plugins.js'

export type CheckStatus = 'ok' | 'warn' | 'error'

export interface CheckResult {
  name: string
  status: CheckStatus
  message: string
  fix?: string
}

export async function checkNode(): Promise<CheckResult> {
  const version = process.version
  const major = parseInt(version.slice(1))
  if (major < 18) {
    return {
      name: 'Node.js',
      status: 'error',
      message: `${version} (minimum: v18)`,
      fix: 'Update Node.js to v18 or later: https://nodejs.org',
    }
  }
  return { name: 'Node.js', status: 'ok', message: version }
}

export async function checkGit(): Promise<CheckResult> {
  try {
    const { stdout } = await exec('git', ['--version'])
    const version = stdout.trim().replace('git version ', '')
    return { name: 'git', status: 'ok', message: version }
  } catch {
    return {
      name: 'git',
      status: 'error',
      message: 'not found',
      fix: 'Install git: https://git-scm.com',
    }
  }
}

export async function checkComposer(): Promise<CheckResult> {
  try {
    const { stdout } = await exec('composer', ['--version', '--no-ansi'])
    const version = stdout.trim().split('\n')[0] ?? 'unknown'
    return { name: 'composer', status: 'ok', message: version }
  } catch {
    return {
      name: 'composer',
      status: 'warn',
      message: 'not found (optional)',
      fix: 'Install Composer: https://getcomposer.org — needed for theme PHP dependencies',
    }
  }
}

export async function checkNpm(): Promise<CheckResult> {
  try {
    const { stdout } = await exec('npm', ['--version'])
    return { name: 'npm', status: 'ok', message: `v${stdout.trim()}` }
  } catch {
    return {
      name: 'npm',
      status: 'warn',
      message: 'not found (optional)',
      fix: 'Install Node.js (includes npm): https://nodejs.org — needed for theme frontend build',
    }
  }
}

export async function checkSsh(): Promise<CheckResult> {
  try {
    await exec('ssh', [
      '-T',
      'git@github.com',
      '-o',
      'BatchMode=yes',
      '-o',
      'ConnectTimeout=5',
      '-o',
      'StrictHostKeyChecking=accept-new',
    ])
    return { name: 'SSH → github.com', status: 'ok', message: 'authenticated' }
  } catch (err) {
    const msg = (err as Error).message ?? ''
    // Exit code 1 with "successfully authenticated" = success (GitHub returns 1 for non-shell access)
    if (msg.includes('successfully authenticated')) {
      return { name: 'SSH → github.com', status: 'ok', message: 'authenticated' }
    }
    if (msg.includes('Permission denied') || msg.includes('publickey')) {
      return {
        name: 'SSH → github.com',
        status: 'error',
        message: 'SSH key not loaded in agent',
        fix: 'macOS: ssh-add --apple-use-keychain ~/.ssh/id_ed25519\nLinux: ssh-add ~/.ssh/id_ed25519',
      }
    }
    return {
      name: 'SSH → github.com',
      status: 'warn',
      message: 'could not connect (check your internet connection)',
    }
  }
}

export function checkWriteAccess(cwd: string): CheckResult {
  try {
    accessSync(cwd, constants.W_OK)
    return { name: 'Write access', status: 'ok', message: cwd }
  } catch {
    return {
      name: 'Write access',
      status: 'error',
      message: `no write permission in ${cwd}`,
      fix: 'Run from a directory where you have write access',
    }
  }
}

export async function checkCatalogPhpRuntime(cwd: string): Promise<CheckResult[]> {
  if (!existsSync(resolve(cwd, 'wp-content', 'plugins', 'wpaikit-product-catalog-io'))) {
    return []
  }

  try {
    const { stdout } = await exec('php', [
      '-r',
      'echo json_encode(["version" => PHP_VERSION, "extensions" => array_values(array_filter(["zip", "xml", "mbstring"], fn($name) => !extension_loaded($name)))]);',
    ])
    const runtime = JSON.parse(stdout.trim()) as { version: string; extensions: string[] }
    const majorMinor = runtime.version.split('.').slice(0, 2).map(Number)
    const compatible = majorMinor[0]! > 8 || (majorMinor[0] === 8 && majorMinor[1]! >= 2)
    return [
      {
        name: 'Catalog PHP CLI',
        status: compatible ? 'ok' : 'error',
        message: runtime.version,
        ...(compatible ? {} : { fix: 'Use PHP 8.2 or later for the catalog plugin.' }),
      },
      {
        name: 'Catalog PHP CLI extensions',
        status: runtime.extensions.length === 0 ? 'ok' : 'error',
        message: runtime.extensions.length === 0 ? 'zip, xml, mbstring available' : `missing: ${runtime.extensions.join(', ')}`,
        ...(runtime.extensions.length === 0 ? {} : { fix: 'Enable the missing extensions in the PHP installation used by WordPress.' }),
      },
    ]
  } catch {
    return [{
      name: 'Catalog PHP CLI',
      status: 'error',
      message: 'PHP CLI unavailable or could not be inspected',
      fix: 'Install PHP 8.2+ with zip, xml and mbstring extensions.',
    }]
  }
}

async function canCheckPluginActivation(cwd: string): Promise<boolean> {
  try {
    await exec('wp', ['core', 'is-installed', `--path=${cwd}`])
    return true
  } catch {
    return false
  }
}

export async function checkProjectPlugins(cwd: string): Promise<CheckResult[]> {
  let config

  try {
    config = readConfig(cwd)
  } catch (error) {
    return [
      {
        name: 'Project config',
        status: 'error',
        message: 'invalid .wpaikit.json',
        fix: error instanceof Error ? error.message : 'Regenerate the project configuration.',
      },
    ]
  }

  if (config?.preset !== 'woo' || !config.woocommerce) return []

  const requirements = getWooPluginRequirements(config.woocommerce)
  const installed = new Map(
    requirements.map((requirement) => [
      requirement.slug,
      existsSync(resolve(cwd, 'wp-content', 'plugins', requirement.slug)),
    ]),
  )
  const hasInstalledPlugin = [...installed.values()].some(Boolean)
  const canCheckActivation = hasInstalledPlugin ? await canCheckPluginActivation(cwd) : false
  const results: CheckResult[] = []

  for (const requirement of requirements) {
    if (!installed.get(requirement.slug)) {
      results.push({
        name: `Plugin: ${requirement.label}`,
        status: 'error',
        message: 'not installed',
        fix:
          requirement.source === 'wordpress-org'
            ? `Install and activate it: wp plugin install ${requirement.slug} --activate`
            : requirement.source === 'licensed'
              ? 'Install the licensed plugin package, then activate it in WordPress.'
              : 'Restore the bundled plugin from the WooCommerce boilerplate, then run composer install in its directory.',
      })
      continue
    }

    if (!canCheckActivation) {
      results.push({
        name: `Plugin: ${requirement.label}`,
        status: 'warn',
        message: 'installed; activation not checked (WP-CLI/database unavailable)',
      })
      continue
    }

    try {
      await exec('wp', ['plugin', 'is-active', requirement.slug, `--path=${cwd}`])
      results.push({
        name: `Plugin: ${requirement.label}`,
        status: 'ok',
        message: 'installed and active',
      })
    } catch {
      results.push({
        name: `Plugin: ${requirement.label}`,
        status: 'error',
        message: 'installed but inactive',
        fix: `Activate it: wp plugin activate ${requirement.slug}`,
      })
    }
  }

  return results
}

export async function runAllChecks(cwd: string): Promise<CheckResult[]> {
  const [node, git, composer, npm, ssh] = await Promise.all([
    checkNode(),
    checkGit(),
    checkComposer(),
    checkNpm(),
    checkSsh(),
  ])
  const write = checkWriteAccess(cwd)
  const plugins = await checkProjectPlugins(cwd)
  const php = await checkCatalogPhpRuntime(cwd)
  return [node, git, composer, npm, ssh, write, ...plugins, ...php]
}
