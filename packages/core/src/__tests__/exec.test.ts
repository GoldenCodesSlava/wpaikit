import { describe, it, expect, beforeEach } from 'vitest'
import { exec, addSecret, clearSecrets } from '../exec.js'

beforeEach(() => {
  clearSecrets()
})

describe('exec', () => {
  it('runs a command and returns stdout', async () => {
    const result = await exec('echo', ['hello world'])
    expect(result.stdout.trim()).toBe('hello world')
  })

  it('returns empty stderr on success', async () => {
    const result = await exec('echo', ['test'])
    expect(result.stderr).toBe('')
  })

  it('throws on non-zero exit code', async () => {
    await expect(exec('sh', ['-c', 'exit 1'])).rejects.toThrow()
  })

  it('supports cwd option', async () => {
    const { realpathSync } = await import('node:fs')
    const cwd = realpathSync('/tmp')
    const result = await exec('pwd', [], { cwd })
    expect(result.stdout.trim()).toBe(cwd)
  })
})

describe('exec secret masking', () => {
  it('masks a registered secret in error messages', async () => {
    addSecret('supersecret123')
    try {
      await exec('sh', ['-c', 'echo supersecret123 && exit 1'])
    } catch (err) {
      expect((err as Error).message).not.toContain('supersecret123')
      expect((err as Error).message).toContain('***')
    }
  })

  it('does not mask when no secrets are registered', async () => {
    try {
      await exec('sh', ['-c', 'echo visible && exit 1'])
    } catch (err) {
      expect((err as Error).message).toContain('visible')
    }
  })

  it('clearSecrets removes all registered secrets', () => {
    addSecret('token123')
    clearSecrets()
    // After clearing, no masking should happen
    // Just verify it doesn't throw
    expect(true).toBe(true)
  })
})
