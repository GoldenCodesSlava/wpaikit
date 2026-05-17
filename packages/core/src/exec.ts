import { execa, ExecaError } from 'execa'
import { logger } from './logger.js'

const secrets = new Set<string>()

export function addSecret(value: string): void {
  if (value.trim().length > 0) secrets.add(value)
}

export function clearSecrets(): void {
  secrets.clear()
}

function mask(str: string): string {
  let result = str
  for (const secret of secrets) {
    result = result.replaceAll(secret, '***')
  }
  return result
}

export interface ExecResult {
  stdout: string
  stderr: string
}

export interface ExecOptions {
  cwd?: string
  verbose?: boolean
  env?: Record<string, string>
}

export async function exec(
  cmd: string,
  args: string[] = [],
  options: ExecOptions = {},
): Promise<ExecResult> {
  const { cwd, verbose = false, env } = options

  if (verbose) {
    const displayArgs = args.map((a) => mask(a))
    logger.step(`$ ${cmd} ${displayArgs.join(' ')}`.trim())
  }

  try {
    const result = await execa(cmd, args, { cwd, env })
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
    }
  } catch (err) {
    if (err instanceof ExecaError) {
      throw new Error(mask(err.message))
    }
    if (err instanceof Error) {
      throw new Error(mask(err.message))
    }
    throw err
  }
}
