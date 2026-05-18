import { resolve } from 'node:path'
import { intro, outro, note, spinner, logger, Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import { askInitQuestions } from './prompts.js'
import { createProjectDir } from './steps/create-dir.js'
import { downloadWordPress } from './steps/download-wp.js'
import { cloneBoilerplate } from './steps/clone-boilerplate.js'
import { renameBoilerplate } from './steps/rename.js'
import { runPostInstall } from './steps/post-install.js'
import { writeProjectConfig } from './steps/write-config.js'

export async function runInit(): Promise<void> {
  intro('wpaikit init')

  const answers = await askInitQuestions()

  const { location, projectName, slug, namespace, textDomain, preset } = answers

  const cwd = process.cwd()
  const rollback = new Rollback()

  try {
    // 1. Resolve target directory
    const targetDir = createProjectDir(cwd, slug, location === 'current-dir', rollback)

    // 2. Download WordPress
    const s = spinner()
    s.start('Downloading WordPress...')
    try {
      await downloadWordPress(targetDir)
      s.stop('WordPress downloaded')
    } catch (err) {
      s.stop('Download failed')
      throw err
    }

    // 3. Clone boilerplate wp-content
    const s2 = spinner()
    s2.start('Cloning boilerplate...')
    try {
      await cloneBoilerplate(targetDir)
      s2.stop('Boilerplate cloned')
    } catch (err) {
      s2.stop('Clone failed')
      throw err
    }

    // 4. Rename theme + namespace + text domain
    renameBoilerplate(targetDir, projectName, slug, namespace, textDomain)

    // 5. Post-install (composer install, npm install, npm run build)
    await runPostInstall(targetDir, slug)

    // 6. Write .wpaikit.json
    writeProjectConfig(targetDir, { name: projectName, namespace, textDomain, preset })

    // Done — clear rollback stack (no need to clean up on success)
    rollback.clear()

    const isCurrentDir = location === 'current-dir'
    const relativePath = isCurrentDir ? '.' : slug

    const nextSteps: string[] = [
      `Theme:       wp-content/themes/${slug}/`,
      `Namespace:   ${namespace}\\\\Theme`,
      `Text domain: ${textDomain}`,
      '',
      'Next steps:',
    ]

    let stepNum = 1
    if (!isCurrentDir) nextSteps.push(`  ${stepNum++}. cd ${slug}`)
    nextSteps.push(`  ${stepNum++}. Create a local database (Herd, MAMP, TablePlus, or CLI)`)
    nextSteps.push(`  ${stepNum++}. Configure wp-config.php (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)`)
    nextSteps.push(`  ${stepNum++}. Open the site in a browser and complete WordPress setup`)
    nextSteps.push(`  ${stepNum}. Activate the "${slug}" theme in wp-admin`)

    note(nextSteps.join('\n'), 'Project scaffolded')

    outro(`Done! Project "${projectName}" is ready.`)
  } catch (err) {
    if (rollback.size > 0) {
      logger.warn('Scaffolding failed — rolling back...')
      await rollback.run()
    }
    throw err
  }
}
