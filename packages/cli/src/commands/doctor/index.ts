import { intro, outro, logger } from '@veaceslav-golden/wp-ai-kit-core'
import { runAllChecks } from './checks.js'
import type { CheckResult, CheckStatus } from './checks.js'

const ICONS: Record<CheckStatus, string> = {
  ok: '✓',
  warn: '⚠',
  error: '✗',
}

function formatResults(results: CheckResult[]): void {
  for (const r of results) {
    const icon = ICONS[r.status]
    const line = `${icon}  ${r.name}: ${r.message}`
    if (r.status === 'ok') logger.success(line)
    else if (r.status === 'warn') logger.warn(line)
    else logger.error(line)

    if (r.fix && r.status !== 'ok') {
      for (const fixLine of r.fix.split('\n')) {
        logger.message(`   ${fixLine}`)
      }
    }
  }
}

function printJson(results: CheckResult[]): void {
  const hasError = results.some((r) => r.status === 'error')
  process.stdout.write(
    JSON.stringify(
      {
        ok: !hasError,
        checks: results.map(({ name, status, message, fix }) => ({
          name,
          status,
          message,
          ...(fix ? { fix } : {}),
        })),
      },
      null,
      2,
    ) + '\n',
  )
}

export async function runDoctor(options: { json?: boolean }): Promise<void> {
  if (!options.json) intro('wpaikit doctor')

  const results = await runAllChecks(process.cwd())

  if (options.json) {
    printJson(results)
    return
  }

  formatResults(results)

  const errors = results.filter((r) => r.status === 'error')
  const warns = results.filter((r) => r.status === 'warn')

  if (errors.length > 0) {
    outro(`${errors.length} error(s) found — fix them before running wpaikit init`)
    process.exit(1)
  } else if (warns.length > 0) {
    outro(`All required checks passed (${warns.length} warning(s))`)
  } else {
    outro('All checks passed — ready to run wpaikit init')
  }
}
