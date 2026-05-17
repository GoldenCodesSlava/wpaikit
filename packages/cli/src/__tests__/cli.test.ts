import { describe, it, expect } from 'vitest'
import { program } from '../cli.js'

describe('CLI program', () => {
  it('has the correct name', () => {
    expect(program.name()).toBe('wpaikit')
  })

  it('has a description', () => {
    expect(program.description().length).toBeGreaterThan(0)
  })

  it('has a version', () => {
    expect(program.version()).toBe('0.1.0')
  })
})
