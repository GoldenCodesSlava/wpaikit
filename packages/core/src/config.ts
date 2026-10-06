import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

export const MultilingualProfileSchema = z.enum(['wpml', 'none'])
export const VariantCatalogProfileSchema = z.enum(['main-only', 'all'])

export const WooCommerceProjectConfigSchema = z.object({
  multilingual: MultilingualProfileSchema,
  variantCatalog: VariantCatalogProfileSchema,
  wishlist: z.boolean(),
})

export type WooCommerceProjectConfig = z.infer<typeof WooCommerceProjectConfigSchema>

export const WpaikitConfigSchema = z
  .object({
    name: z.string().min(1),
    namespace: z.string().min(1),
    textDomain: z.string().min(1),
    preset: z.enum(['standard', 'woo']),
    woocommerce: WooCommerceProjectConfigSchema.optional(),
    createdAt: z.string().datetime(),
  })
  .superRefine((config, context) => {
    if (config.preset === 'woo' && !config.woocommerce) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['woocommerce'],
        message: 'WooCommerce configuration is required for the woo preset',
      })
    }

    if (config.preset === 'standard' && config.woocommerce) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['woocommerce'],
        message: 'WooCommerce configuration is only valid for the woo preset',
      })
    }
  })

export type WpaikitConfig = z.infer<typeof WpaikitConfigSchema>

const CONFIG_FILE = '.wpaikit.json'

export function readConfig(cwd: string = process.cwd()): WpaikitConfig | null {
  const configPath = join(cwd, CONFIG_FILE)
  if (!existsSync(configPath)) return null
  return WpaikitConfigSchema.parse(JSON.parse(readFileSync(configPath, 'utf-8')))
}

export function writeConfig(config: WpaikitConfig, cwd: string = process.cwd()): void {
  const configPath = join(cwd, CONFIG_FILE)
  const validated = WpaikitConfigSchema.parse(config)
  writeFileSync(configPath, JSON.stringify(validated, null, 2) + '\n', 'utf-8')
}

export function hasConfig(cwd: string = process.cwd()): boolean {
  return existsSync(join(cwd, CONFIG_FILE))
}
