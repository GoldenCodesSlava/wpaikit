import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export interface WpaikitConfig {
  name: string
  namespace: string
  textDomain: string
  preset: string
  createdAt: string
}

const CONFIG_FILE = '.wpaikit.json'

export function readConfig(cwd: string = process.cwd()): WpaikitConfig | null {
  const configPath = join(cwd, CONFIG_FILE)
  if (!existsSync(configPath)) return null
  return JSON.parse(readFileSync(configPath, 'utf-8')) as WpaikitConfig
}

export function writeConfig(config: WpaikitConfig, cwd: string = process.cwd()): void {
  const configPath = join(cwd, CONFIG_FILE)
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

export function hasConfig(cwd: string = process.cwd()): boolean {
  return existsSync(join(cwd, CONFIG_FILE))
}
