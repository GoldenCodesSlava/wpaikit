import type { WooCommerceProjectConfig } from '@veaceslav-golden/wp-ai-kit-core'

export interface PluginRequirement {
  slug: string
  label: string
  source: 'wordpress-org' | 'licensed' | 'bundled'
}

const WOOCOMMERCE: PluginRequirement = {
  slug: 'woocommerce',
  label: 'WooCommerce',
  source: 'wordpress-org',
}

const PRODUCT_CATALOG_IO: PluginRequirement = {
  slug: 'wpaikit-product-catalog-io',
  label: 'WPAIKit Product Catalog I/O',
  source: 'bundled',
}

const WPML_PLUGINS: readonly PluginRequirement[] = [
  {
    slug: 'sitepress-multilingual-cms',
    label: 'WPML Multilingual CMS',
    source: 'licensed',
  },
  {
    slug: 'wpml-string-translation',
    label: 'WPML String Translation',
    source: 'licensed',
  },
  {
    slug: 'acfml',
    label: 'Advanced Custom Fields Multilingual',
    source: 'licensed',
  },
  {
    slug: 'woocommerce-multilingual',
    label: 'WooCommerce Multilingual & Multicurrency',
    source: 'licensed',
  },
]

export function getWooPluginRequirements(config: WooCommerceProjectConfig): PluginRequirement[] {
  return config.multilingual === 'wpml'
    ? [WOOCOMMERCE, PRODUCT_CATALOG_IO, ...WPML_PLUGINS]
    : [WOOCOMMERCE, PRODUCT_CATALOG_IO]
}
