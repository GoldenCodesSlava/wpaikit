import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { intro, outro, spinner, logger } from '@veaceslav-golden/wp-ai-kit-core'

export async function runKnowledgeInstall(): Promise<void> {
  intro('wpaikit knowledge install')

  const distDir = dirname(fileURLToPath(import.meta.url))
  const knowledgeSrc = resolve(distDir, 'knowledge')
  const claudeCommandsSrc = resolve(distDir, 'claude-commands')

  if (!existsSync(knowledgeSrc)) {
    throw new Error(
      'knowledge/ not found in the package.\n' +
        'If you are running from source, build the CLI first: pnpm build',
    )
  }

  const cwd = process.cwd()
  const s = spinner()
  s.start('Installing knowledge...')

  try {
    // 1. Copy knowledge/ → project/knowledge/
    await cp(knowledgeSrc, resolve(cwd, 'knowledge'), { recursive: true, force: true })

    // 2. Copy root-level AI context files
    await cp(resolve(knowledgeSrc, 'AGENTS.md'), resolve(cwd, 'AGENTS.md'))
    await cp(resolve(knowledgeSrc, 'CLAUDE.md'), resolve(cwd, 'CLAUDE.md'))

    // 3. Copy Claude Code slash commands → project/.claude/commands/
    if (existsSync(claudeCommandsSrc)) {
      await mkdir(resolve(cwd, '.claude', 'commands'), { recursive: true })
      await cp(claudeCommandsSrc, resolve(cwd, '.claude', 'commands'), {
        recursive: true,
        force: true,
      })
    }

    s.stop('Knowledge installed')
  } catch (err) {
    s.stop('Install failed')
    throw err
  }

  logger.step('knowledge/              →  project/knowledge/')
  logger.step('AGENTS.md              →  project root')
  logger.step('CLAUDE.md              →  project root')
  logger.step('.claude/commands/      →  project/.claude/commands/')

  outro('Done! Run /analyze-figma <url> in Claude Code or Codex to get started.')
}
