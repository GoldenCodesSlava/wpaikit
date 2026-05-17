import { writeConfig, logger } from '@golden/wp-ai-kit-core'
import type { WpaikitConfig } from '@golden/wp-ai-kit-core'

export function writeProjectConfig(
  targetDir: string,
  data: Omit<WpaikitConfig, 'createdAt'>,
): void {
  const config: WpaikitConfig = {
    ...data,
    createdAt: new Date().toISOString(),
  }
  writeConfig(config, targetDir)
  logger.step('Created .wpaikit.json')
}
