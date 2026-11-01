import type { WpaikitConfig } from '@veaceslav-golden/wp-ai-kit-core'
import { getWooPluginRequirements } from './woocommerce-plugins.js'
import type { PluginRequirement } from './woocommerce-plugins.js'
import { getSeoPluginRequirements } from './seo.js'
import { ACF_PRO } from './acf-pro.js'

/** Slugs of SEO plugins that satisfy the "choose later" option. */
export const KNOWN_SEO_PLUGIN_SLUGS = [
  'wordpress-seo',
  'seo-by-rank-math',
  'wp-seopress',
  'all-in-one-seo-pack',
] as const

export function getProjectPluginRequirements(
  config: Pick<WpaikitConfig, 'woocommerce' | 'seo'>,
): PluginRequirement[] {
  return [
    ACF_PRO,
    ...(config.woocommerce ? getWooPluginRequirements(config.woocommerce) : []),
    ...getSeoPluginRequirements(config.seo),
  ]
}
