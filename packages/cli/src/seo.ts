import type { SeoProfile } from '@veaceslav-golden/wp-ai-kit-core'
import type { PluginRequirement } from './woocommerce-plugins.js'

export interface SeoChoice {
  value: SeoProfile
  label: string
  hint: string
}

export const SEO_CHOICES: readonly SeoChoice[] = [
  { value: 'module', label: 'Built-in SEO module', hint: 'recommended, no plugin needed' },
  { value: 'yoast', label: 'Yoast SEO', hint: 'plugin; removes the built-in module' },
  { value: 'rank-math', label: 'Rank Math SEO', hint: 'plugin; removes the built-in module' },
  {
    value: 'later',
    label: 'An SEO plugin I choose later',
    hint: 'removes the built-in module',
  },
]

const SEO_PLUGINS: Partial<Record<SeoProfile, PluginRequirement>> = {
  yoast: { slug: 'wordpress-seo', label: 'Yoast SEO', source: 'wordpress-org' },
  'rank-math': { slug: 'seo-by-rank-math', label: 'Rank Math SEO', source: 'wordpress-org' },
}

/** The theme only knows whether to keep its SEO module; which plugin replaces it is wpaikit's concern. */
export function getSeoConfigureArg(seo: SeoProfile): string {
  return `--seo=${seo === 'module' ? 'module' : 'none'}`
}

export function getSeoPluginRequirements(seo: SeoProfile | undefined): PluginRequirement[] {
  const plugin = seo ? SEO_PLUGINS[seo] : undefined
  return plugin ? [plugin] : []
}
