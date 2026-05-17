import { promptText, confirm, select } from '@golden/wp-ai-kit-core'
import { toSlug, toPascalCase } from './normalize-name.js'

export type LocationChoice = 'new-folder' | 'current-dir'

export interface InitAnswers {
  location: LocationChoice
  projectName: string
  slug: string
  namespace: string
  textDomain: string
  preset: string
}

export async function askInitQuestions(): Promise<InitAnswers> {
  const location = await select<LocationChoice>({
    message: 'Where do you want to set up the project?',
    options: [
      { value: 'new-folder', label: 'Create a new folder', hint: 'recommended' },
      { value: 'current-dir', label: 'Use the current directory' },
    ],
  })

  const projectName = await promptText({
    message: 'Project name:',
    placeholder: 'my-wordpress-site',
    validate: (v) => {
      if (!v.trim()) return 'Project name is required'
      if (!/^[a-zA-Z0-9 _-]+$/.test(v.trim()))
        return 'Only letters, numbers, spaces, hyphens, and underscores are allowed'
    },
  })

  const defaultSlug = toSlug(projectName)
  const slug = await promptText({
    message: 'Slug (folder name / text domain):',
    placeholder: defaultSlug,
    defaultValue: defaultSlug,
    validate: (v) => {
      if (!v.trim()) return 'Slug is required'
      if (!/^[a-z0-9-]+$/.test(v.trim()))
        return 'Slug must be lowercase letters, numbers, and hyphens only'
    },
  })

  const defaultNamespace = toPascalCase(slug)
  const namespace = await promptText({
    message: 'PHP namespace (PascalCase):',
    placeholder: defaultNamespace,
    defaultValue: defaultNamespace,
    validate: (v) => {
      if (!v.trim()) return 'Namespace is required'
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(v.trim()))
        return 'Namespace must start with uppercase letter, letters and numbers only'
    },
  })

  const textDomain = slug

  const preset = await select<string>({
    message: 'Preset:',
    options: [{ value: 'standard', label: 'Standard', hint: 'Timber + ACF + Vite + Tailwind' }],
    initialValue: 'standard',
  })

  const ready = await confirm(
    `Ready to scaffold "${projectName}"${location === 'new-folder' ? ` in ./${slug}/` : ' in the current directory'}?`,
  )

  if (!ready) {
    process.exit(0)
  }

  return {
    location,
    projectName,
    slug,
    namespace,
    textDomain,
    preset,
  }
}
