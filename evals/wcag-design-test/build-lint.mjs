// Builds wcag-lint.min.js from wcag-lint.js: the readable script stays the source of truth, the
// minified copy is what the skill pastes into use_figma (half the size, half the tokens per run).
// The CONFIG line is kept verbatim on line 1 so it can still be edited by hand.
//   node evals/wcag-design-test/build-lint.mjs          # write the .min.js
//   node evals/wcag-design-test/build-lint.mjs --check  # exit 1 if it is out of date
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dir = join(here, '../../knowledge/packs/design/skills/wcag-design-test/scripts')
const src = join(dir, 'wcag-lint.js')
const out = join(dir, 'wcag-lint.min.js')

export async function buildLint(source = readFileSync(src, 'utf8')) {
  const require = createRequire(createRequire(import.meta.url).resolve('tsup'))
  const { transform } = require('esbuild')
  const configLine = source.split('\n').find((line) => line.startsWith('const CONFIG = '))
  if (!configLine) throw new Error('wcag-lint.js: no `const CONFIG = ` line')
  // CONFIG stays a free variable inside the wrapper, so esbuild keeps its name.
  const body = source.replace(configLine, '')
  const { code } = await transform(`async function __wcag(){${body}\n}`, {
    minify: true,
    target: 'es2020',
  })
  const match = code.match(/^async function __wcag\(\)\{([\s\S]*)\}\s*$/)
  if (!match) throw new Error('unexpected esbuild output')
  return `${configLine}\n${match[1]}\n`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const built = await buildLint()
  if (process.argv.includes('--check')) {
    const current = readFileSync(out, 'utf8')
    if (current !== built) {
      console.error(
        'wcag-lint.min.js is out of date: run node evals/wcag-design-test/build-lint.mjs',
      )
      process.exit(1)
    }
  } else {
    writeFileSync(out, built)
    console.log(
      `wcag-lint.min.js: ${Buffer.byteLength(built)} bytes (source ${Buffer.byteLength(readFileSync(src))})`,
    )
  }
}
