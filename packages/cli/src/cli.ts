import { createRequire } from 'node:module'
import { Command } from 'commander'
import { runInit } from './commands/init/index.js'
import { runDoctor } from './commands/doctor/index.js'
import { runKnowledgeInstall } from './commands/knowledge/index.js'
import type { InitCommandOptions } from './commands/init/prompts.js'
import type { KnowledgeCommandOptions } from './commands/knowledge/index.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

export const program = new Command()
  .name('wpaikit')
  .description('CLI for scaffolding and developing WordPress sites with custom boilerplates')
  .version(version, '-v, --version', 'output the current version')

program
  .command('init')
  .description('Scaffold a new WordPress project from a selected boilerplate')
  .option('--preset <preset>', 'boilerplate preset: standard or woo')
  .option('--multilingual <profile>', 'Woo multilingual profile: wpml or none')
  .option('--variant-catalog <mode>', 'Woo catalog mode: main-only or all')
  .option('--wishlist <value>', 'Woo wishlist: yes or no')
  .option('--seo <choice>', 'SEO: module (built-in), yoast, rank-math or later')
  .option('--packs <list>', 'knowledge packs: all (default) or design,slicing,wordpress')
  .action(async (options: InitCommandOptions) => {
    try {
      await runInit(options)
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

const knowledge = program
  .command('knowledge')
  .description('Manage wpaikit knowledge base in your project')

knowledge
  .command('install')
  .alias('update')
  .description('Install or update knowledge packs for the current project')
  .option('--packs <list>', 'all or a comma-separated list of: design, slicing, wordpress')
  .option('--wp-profile <profile>', 'WordPress profile (standard or woo) for the WordPress pack')
  .option('--force', 'replace locally modified WPAIKit-managed files')
  .option('--dry-run', 'show the planned changes without writing files')
  .action(async (options: KnowledgeCommandOptions) => {
    try {
      await runKnowledgeInstall(options)
    } catch (err) {
      process.stderr.write(`\nError: ${(err as Error).message}\n`)
      process.exit(1)
    }
  })
