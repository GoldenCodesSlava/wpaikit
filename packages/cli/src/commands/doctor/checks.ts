import { exec } from '@veaceslav-golden/wp-ai-kit-core'
import { accessSync, constants } from 'node:fs'

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

export async function runAllChecks(cwd: string): Promise<CheckResult[]> {
  const [node, git, composer, npm, ssh] = await Promise.all([
    checkNode(),
    checkGit(),
    checkComposer(),
    checkNpm(),
    checkSsh(),
  ])
  const write = checkWriteAccess(cwd)
  return [node, git, composer, npm, ssh, write]
}
