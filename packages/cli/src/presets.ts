export type PresetId = 'standard' | 'woo'

export interface PresetDefinition {
  id: PresetId
  name: string
  description: string
  repo: string
  branch: string
}

export const PRESETS: readonly PresetDefinition[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Timber + ACF + Vite + Tailwind',
    repo: 'git@github.com:GoldenCodesSlava/boilerplate-wp-standard.git',
    branch: 'master',
  },
  {
    id: 'woo',
    name: 'WooCommerce',
    description: 'Required WooCommerce + custom storefront components',
    repo: 'git@github.com:GoldenCodesSlava/WP-Boilerplate-Woocommerce.git',
    branch: 'master',
  },
]

export function getPreset(id: string): PresetDefinition {
  const preset = PRESETS.find((candidate) => candidate.id === id)

  if (!preset) {
    throw new Error(`Unknown preset "${id}". Use standard or woo.`)
  }

  return preset
}
