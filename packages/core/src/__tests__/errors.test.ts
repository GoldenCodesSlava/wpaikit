import { describe, it, expect } from 'vitest'
import { WpaikitError, PreflightError, ValidationError, RollbackError } from '../errors.js'

describe('errors', () => {
  it('PreflightError is instanceof WpaikitError and Error', () => {
    const err = new PreflightError('test message')
    expect(err).toBeInstanceOf(WpaikitError)
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('PreflightError')
    expect(err.message).toBe('test message')
  })

  it('ValidationError has correct name', () => {
    const err = new ValidationError('invalid')
    expect(err.name).toBe('ValidationError')
    expect(err).toBeInstanceOf(WpaikitError)
  })

  it('RollbackError has correct name', () => {
    const err = new RollbackError('rollback failed')
    expect(err.name).toBe('RollbackError')
    expect(err).toBeInstanceOf(WpaikitError)
  })
})
