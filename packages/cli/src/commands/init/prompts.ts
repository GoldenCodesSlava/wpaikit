import { promptText, confirm, select } from '@veaceslav-golden/wp-ai-kit-core'
import type { WooCommerceProjectConfig } from '@veaceslav-golden/wp-ai-kit-core'
import {
  MultilingualProfileSchema,
  VariantCatalogProfileSchema,
} from '@veaceslav-golden/wp-ai-kit-core'
import { toSlug, toPascalCase } from './normalize-name.js'
import { getPreset, PRESETS } from '../../presets.js'
import type { PresetId } from '../../presets.js'

export type LocationChoice = 'new-folder' | 'current-dir'

export interface InitCommandOptions {
  preset?: string
  multilingual?: string
  variantCatalog?: string
  wishlist?: string
  packs?: string
}

export interface InitAnswers {
  location: LocationChoice
  projectName: string
  slug: string
  namespace: string
  textDomain: string
  preset: PresetId
  woocommerce?: WooCommerceProjectConfig
}

function parseWishlist(value: string): boolean {
  const normalized = value.toLowerCase()

  if (['yes', 'true', '1'].includes(normalized)) return true
  if (['no', 'false', '0'].includes(normalized)) return false

  throw new Error(`Invalid wishlist value "${value}". Use yes or no.`)
}

function assertNoWooOptions(options: InitCommandOptions): void {
  if (options.multilingual || options.variantCatalog || options.wishlist) {
    throw new Error(
      '--multilingual, --variant-catalog and --wishlist are only valid with --preset woo.',
    )
  }
}

export async function askWooCommerceQuestions(
  preset: PresetId,
  options: InitCommandOptions,
): Promise<WooCommerceProjectConfig | undefined> {
  if (preset === 'standard') {
    assertNoWooOptions(options)
    return undefined
  }

  const multilingual = options.multilingual
    ? MultilingualProfileSchema.parse(options.multilingual.toLowerCase())
    : await select<WooCommerceProjectConfig['multilingual']>({
        message: 'Multilingual profile:',
        options: [
          { value: 'wpml', label: 'WPML', hint: 'recommended' },
          { value: 'none', label: 'None' },
        ],
        initialValue: 'wpml',
      })

  const variantCatalog = options.variantCatalog
    ? VariantCatalogProfileSchema.parse(options.variantCatalog.toLowerCase())
    : await select<WooCommerceProjectConfig['variantCatalog']>({
        message: 'Products shown in the catalog:',
        options: [
          { value: 'main-only', label: 'Main variant only', hint: 'recommended' },
          { value: 'all', label: 'All variants' },
        ],
        initialValue: 'main-only',
      })

  const wishlist = options.wishlist
    ? parseWishlist(options.wishlist)
    : await select<boolean>({
        message: 'Enable wishlist:',
        options: [
          { value: false, label: 'No', hint: 'default' },
          { value: true, label: 'Yes' },
        ],
        initialValue: false,
      })

  return { multilingual, variantCatalog, wishlist }
}

export async function askInitQuestions(options: InitCommandOptions = {}): Promise<InitAnswers> {
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

  const preset = options.preset
    ? getPreset(options.preset.toLowerCase()).id
    : await select<PresetId>({
        message: 'Preset:',
        options: PRESETS.map((definition) => ({
          value: definition.id,
          label: definition.name,
          hint: definition.description,
        })),
        initialValue: 'standard',
      })

  const woocommerce = await askWooCommerceQuestions(preset, options)

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
    ...(woocommerce ? { woocommerce } : {}),
  }
}
