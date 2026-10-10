import { intro, outro, note, spinner, logger, Rollback } from '@veaceslav-golden/wp-ai-kit-core'
import { askInitQuestions } from './prompts.js'
import { createProjectDir } from './steps/create-dir.js'
import { downloadWordPress } from './steps/download-wp.js'
import { cloneBoilerplate } from './steps/clone-boilerplate.js'
import { renameBoilerplate } from './steps/rename.js'
import { runPostInstall } from './steps/post-install.js'
import { writeProjectConfig } from './steps/write-config.js'
import {
  configureBoilerplate,
  getStandardConfigureArgs,
  getWooConfigureArgs,
} from './steps/configure-boilerplate.js'
import { getPreset } from '../../presets.js'
import type { InitCommandOptions } from './prompts.js'
import { getProjectPluginRequirements } from '../../project-plugins.js'
import { PACK_IDS, installKnowledge, parsePacksOption } from '../knowledge/index.js'

export async function runInit(options: InitCommandOptions = {}): Promise<void> {
  intro('wpaikit init')

  const knowledgePacks = options.packs ? parsePacksOption(options.packs) : [...PACK_IDS]
  const answers = await askInitQuestions(options)

  const { location, projectName, slug, namespace, textDomain, preset, woocommerce, seo } = answers
  const presetDefinition = getPreset(preset)

  const cwd = process.cwd()
  const rollback = new Rollback()

  try {
    // 1. Resolve target directory
    const targetDir = createProjectDir(cwd, slug, location === 'current-dir', rollback, preset)

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
      await cloneBoilerplate(targetDir, presetDefinition)
      s2.stop('Boilerplate cloned')
    } catch (err) {
      s2.stop('Clone failed')
      throw err
    }

    // 4. Rename theme + namespace + text domain
    renameBoilerplate(targetDir, projectName, slug, namespace, textDomain)

    // 5. Apply init choices to the theme (Woo profile, SEO module kept or removed)
    if (preset === 'woo' && !woocommerce) {
      throw new Error('WooCommerce configuration is required for the woo preset')
    }
    await configureBoilerplate(
      targetDir,
      slug,
      preset,
      woocommerce ? getWooConfigureArgs(woocommerce, seo) : getStandardConfigureArgs(seo),
    )

    // 6. Post-install (composer install, npm install, npm run build)
    await runPostInstall(targetDir, slug)

    // 7. Write .wpaikit.json
    writeProjectConfig(targetDir, {
      name: projectName,
      namespace,
      textDomain,
      preset,
      ...(woocommerce ? { woocommerce } : {}),
      seo,
    })

    // 8. Install the profile-aware AI knowledge base
    const s3 = spinner()
    s3.start('Installing project knowledge...')
    try {
      const knowledge = await installKnowledge({
        targetDir,
        packs: knowledgePacks,
        wordpressProfile: preset,
      })
      s3.stop(`Knowledge installed (${knowledge.packs.join(' + ')})`)
    } catch (err) {
      s3.stop('Knowledge install failed')
      throw err
    }

    // Done — clear rollback stack (no need to clean up on success)
    rollback.clear()

    const isCurrentDir = location === 'current-dir'

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
    nextSteps.push(
      `  ${stepNum++}. Configure wp-config.php (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)`,
    )
    nextSteps.push(`  ${stepNum++}. Open the site in a browser and complete WordPress setup`)
    nextSteps.push(`  ${stepNum}. Activate the "${slug}" theme in wp-admin`)

    const requiredPlugins = getProjectPluginRequirements({ woocommerce, seo })

    if (requiredPlugins.length > 0) {
      nextSteps.push('', 'Required plugins:')
      for (const plugin of requiredPlugins) {
        const source =
          plugin.source === 'licensed'
            ? ' (licensed package)'
            : plugin.source === 'bundled'
              ? ' (bundled)'
              : ''
        nextSteps.push(`  - ${plugin.label}${source}`)
      }
      nextSteps.push('', 'Run `wpaikit doctor` after WordPress and the database are configured.')
    }

    if (seo === 'later') {
      nextSteps.push(
        '',
        'SEO: the built-in module was removed. Install an SEO plugin (e.g. Yoast SEO or Rank Math).',
      )
    }

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
