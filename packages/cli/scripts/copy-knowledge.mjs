import { cp, rm } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')

await rm(resolve(__dirname, '../dist/knowledge'), { recursive: true, force: true })
await rm(resolve(__dirname, '../dist/claude-commands'), { recursive: true, force: true })
await cp(resolve(root, 'knowledge'), resolve(__dirname, '../dist/knowledge'), {
  recursive: true,
  filter: (source) => !source.endsWith('.DS_Store'),
})
console.log('✓ knowledge/ copied to dist/knowledge/')
