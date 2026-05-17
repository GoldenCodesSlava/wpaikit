import { describe, it, expect } from 'vitest'
import { toSlug, toPascalCase, toTitle } from '../commands/init/normalize-name.js'

describe('toSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(toSlug('My Cool Site')).toBe('my-cool-site')
  })

  it('collapses multiple separators', () => {
    expect(toSlug('my--cool  site')).toBe('my-cool-site')
  })

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('  -hello- ')).toBe('hello')
  })

  it('handles already-slug input', () => {
    expect(toSlug('my-project')).toBe('my-project')
  })

  it('replaces underscores', () => {
    expect(toSlug('my_project')).toBe('my-project')
  })
})

describe('toPascalCase', () => {
  it('converts slug to PascalCase', () => {
    expect(toPascalCase('my-cool-site')).toBe('MyCoolSite')
  })

  it('handles spaces', () => {
    expect(toPascalCase('my cool site')).toBe('MyCoolSite')
  })

  it('handles single word', () => {
    expect(toPascalCase('boilerplate')).toBe('Boilerplate')
  })

  it('handles mixed separators', () => {
    expect(toPascalCase('my_cool-site')).toBe('MyCoolSite')
  })
})

describe('toTitle', () => {
  it('converts slug to title case', () => {
    expect(toTitle('my-cool-site')).toBe('My Cool Site')
  })

  it('handles underscores', () => {
    expect(toTitle('my_project')).toBe('My Project')
  })

  it('handles already title case', () => {
    expect(toTitle('My Project')).toBe('My Project')
  })
})
