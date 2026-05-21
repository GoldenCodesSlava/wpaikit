import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { renameBoilerplate } from '../commands/init/steps/rename.js'

function makeThemeDir(base: string): string {
  const themesDir = join(base, 'wp-content', 'themes', 'boilerplate')
  mkdirSync(join(themesDir, 'src', 'Theme'), { recursive: true })
  mkdirSync(join(themesDir, 'blocks', 'ExampleBlock'), { recursive: true })

  writeFileSync(
    join(themesDir, 'style.css'),
    '/*\nTheme Name: Boilerplate\nText Domain: boilerplate\n*/',
  )

  writeFileSync(
    join(themesDir, 'src', 'Theme', 'ThemeSetup.php'),
    "<?php\nnamespace Boilerplate\\Theme;\nuse Boilerplate\\Theme\\Services\\TimberService;\n",
  )

  writeFileSync(
    join(themesDir, 'index.php'),
    "<?php\n$controller = new \\Boilerplate\\Theme\\Controllers\\PageController();\n",
  )

  writeFileSync(
    join(themesDir, 'vite.config.mjs'),
    "export default { base: '/wp-content/themes/boilerplate/frontend/dist/' }\n",
  )

  writeFileSync(
    join(themesDir, 'main.scss'),
    '// Main SCSS file - WordPress boilerplate\n',
  )

  writeFileSync(
    join(themesDir, 'blocks.php'),
    "<?php\nreturn ['title' => __('Boilerplate Blocks', 'boilerplate')];\n",
  )

  writeFileSync(
    join(themesDir, 'composer.json'),
    JSON.stringify(
      {
        name: 'boilerplate/wordpress-theme',
        autoload: { 'psr-4': { 'Boilerplate\\': 'src/' } },
      },
      null,
      2,
    ),
  )

  writeFileSync(
    join(themesDir, 'blocks', 'ExampleBlock', 'ExampleBlock.php'),
    "<?php\nnamespace Boilerplate\\Theme\\Blocks\\ExampleBlock;\n__('example', 'boilerplate');\n",
  )

  return base
}

describe('renameBoilerplate', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `wpaikit-rename-test-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    makeThemeDir(dir)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('renames the theme folder', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    expect(existsSync(join(dir, 'wp-content', 'themes', 'my-site'))).toBe(true)
    expect(existsSync(join(dir, 'wp-content', 'themes', 'boilerplate'))).toBe(false)
  })

  it('updates style.css Theme Name and Text Domain', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const css = readFileSync(join(dir, 'wp-content', 'themes', 'my-site', 'style.css'), 'utf-8')
    expect(css).toContain('Theme Name: My Site')
    expect(css).toContain('Text Domain: my-site')
    expect(css).not.toContain('Boilerplate')
  })

  it('replaces PHP namespace declarations', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const php = readFileSync(
      join(dir, 'wp-content', 'themes', 'my-site', 'src', 'Theme', 'ThemeSetup.php'),
      'utf-8',
    )
    expect(php).toContain('namespace MySite\\Theme;')
    expect(php).toContain('use MySite\\Theme\\Services\\TimberService;')
    expect(php).not.toContain('Boilerplate')
  })

  it('replaces fully-qualified PHP namespace references', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const php = readFileSync(join(dir, 'wp-content', 'themes', 'my-site', 'index.php'), 'utf-8')
    expect(php).toContain('new \\MySite\\Theme\\Controllers\\PageController()')
    expect(php).not.toContain('\\Boilerplate\\')
  })

  it('replaces identifiers in frontend config and scss files', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')

    const vite = readFileSync(join(dir, 'wp-content', 'themes', 'my-site', 'vite.config.mjs'), 'utf-8')
    const scss = readFileSync(join(dir, 'wp-content', 'themes', 'my-site', 'main.scss'), 'utf-8')

    expect(vite).toContain('/wp-content/themes/my-site/frontend/dist/')
    expect(vite).not.toContain('boilerplate')
    expect(scss).toContain('WordPress my-site')
  })

  it('replaces human-facing block category names', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const php = readFileSync(join(dir, 'wp-content', 'themes', 'my-site', 'blocks.php'), 'utf-8')
    expect(php).toContain('My Site Blocks')
    expect(php).not.toContain('Boilerplate Blocks')
  })

  it('replaces text domain in PHP files', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const php = readFileSync(
      join(dir, 'wp-content', 'themes', 'my-site', 'blocks', 'ExampleBlock', 'ExampleBlock.php'),
      'utf-8',
    )
    expect(php).toContain("'my-site'")
    expect(php).not.toContain("'boilerplate'")
  })

  it('updates composer.json name and autoload', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const composer = JSON.parse(
      readFileSync(join(dir, 'wp-content', 'themes', 'my-site', 'composer.json'), 'utf-8'),
    )
    expect(composer.name).toBe('my-site/wordpress-theme')
    expect(composer.autoload['psr-4']['MySite\\']).toBe('src/')
  })
})
