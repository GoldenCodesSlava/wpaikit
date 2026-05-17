import { createRequire } from 'node:module'
import { Command } from 'commander'
import { runInit } from './commands/init/index.js'
import { runDoctor } from './commands/doctor/index.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

export const program = new Command()
  .name('wpaikit')
  .description('CLI for scaffolding and developing WordPress sites with custom boilerplates')
  .version(version, '-v, --version', 'output the current version')

program
  .command('init')
  .description('Scaffold a new WordPress project from the standard boilerplate')
  .action(async () => {
    try {
      await runInit()
    } catch (err) {
      process.stderr.write(`\nError: ${(err as Error).message}\n`)
      process.exit(1)
    }
  })

program
  .command('doctor')
  .description('Check that your environment is ready to use wpaikit')
  .option('--json', 'output results as JSON')
  .action(async (opts: { json?: boolean }) => {
    try {
      await runDoctor(opts)
    } catch (err) {
      process.stderr.write(`\nError: ${(err as Error).message}\n`)
      process.exit(1)
    }
  })
