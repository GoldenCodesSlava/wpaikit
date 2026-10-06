import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { renameBoilerplate } from '../commands/init/steps/rename.js'

function makeThemeDir(base: string): string {
  const themesDir = join(base, 'wp-content', 'themes', 'boilerplate')
  mkdirSync(join(themesDir, 'src', 'Theme'), { recursive: true })
  mkdirSync(join(themesDir, 'blocks', 'ExampleBlock'), { recursive: true })
  mkdirSync(join(themesDir, 'frontend', 'src', 'js'), { recursive: true })

  writeFileSync(
    join(themesDir, 'style.css'),
    '/*\nTheme Name: Boilerplate\nText Domain: boilerplate\n*/',
  )

  writeFileSync(
    join(themesDir, 'src', 'Theme', 'ThemeSetup.php'),
    '<?php\nnamespace Boilerplate\\Theme;\nuse Boilerplate\\Theme\\Services\\TimberService;\n',
  )

  writeFileSync(
    join(themesDir, 'index.php'),
    '<?php\n$controller = new \\Boilerplate\\Theme\\Controllers\\PageController();\n',
  )

  writeFileSync(
    join(themesDir, 'vite.config.mjs'),
    "export default { base: '/wp-content/themes/boilerplate/frontend/dist/' }\n",
  )

  writeFileSync(join(themesDir, 'main.scss'), '// Main SCSS file - WordPress boilerplate\n')

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

  writeFileSync(
    join(themesDir, 'boilerplate-config.php'),
    "<?php\ndefined('BOILERPLATE_WISHLIST') || define('BOILERPLATE_WISHLIST', false);\n",
  )

  writeFileSync(
    join(themesDir, 'functions.php'),
    "<?php\nrequire_once __DIR__ . '/boilerplate-config.php';\n",
  )

  writeFileSync(
    join(themesDir, 'frontend', 'src', 'js', 'main.js'),
    'window.boilerplateTheme = boilerplateTheme;\n',
  )

  writeFileSync(
    join(themesDir, 'frontend', 'src', 'js', 'cookie-consent.js'),
    "window.themeCookieConsent = {}; document.dispatchEvent(new Event('theme:consent-changed'));\n",
  )

  writeFileSync(
    join(themesDir, 'frontend', 'src', 'js', 'analytics.js'),
    "window.themeAnalytics = {}; localStorage.setItem('theme_analytics_dedupe_v1', '{}');\n",
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

    const vite = readFileSync(
      join(dir, 'wp-content', 'themes', 'my-site', 'vite.config.mjs'),
      'utf-8',
    )
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

  it('renames the theme config file and its references', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const themeDir = join(dir, 'wp-content', 'themes', 'my-site')
    const functions = readFileSync(join(themeDir, 'functions.php'), 'utf-8')

    expect(existsSync(join(themeDir, 'my-site-config.php'))).toBe(true)
    expect(existsSync(join(themeDir, 'boilerplate-config.php'))).toBe(false)
    expect(functions).toContain("'/my-site-config.php'")
  })

  it('uses a valid camelCase JavaScript global', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const javascript = readFileSync(
      join(dir, 'wp-content', 'themes', 'my-site', 'frontend', 'src', 'js', 'main.js'),
      'utf-8',
    )

    expect(javascript).toBe('window.mySiteTheme = mySiteTheme;\n')
    expect(javascript).not.toContain('my-siteTheme')
  })

  it('keeps stable cookie consent runtime identifiers', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const javascript = readFileSync(
      join(
        dir,
        'wp-content',
        'themes',
        'my-site',
        'frontend',
        'src',
        'js',
        'cookie-consent.js',
      ),
      'utf-8',
    )

    expect(javascript).toContain('window.themeCookieConsent')
    expect(javascript).toContain('theme:consent-changed')
    expect(javascript).not.toContain('my-siteCookieConsent')
  })

  it('keeps stable analytics runtime identifiers', () => {
    renameBoilerplate(dir, 'My Site', 'my-site', 'MySite', 'my-site')
    const javascript = readFileSync(
      join(dir, 'wp-content', 'themes', 'my-site', 'frontend', 'src', 'js', 'analytics.js'),
      'utf-8',
    )

    expect(javascript).toContain('window.themeAnalytics')
    expect(javascript).toContain('theme_analytics_dedupe_v1')
    expect(javascript).not.toContain('my-siteAnalytics')
  })
})
