import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkNode, checkWriteAccess } from '../commands/doctor/checks.js'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync, rmSync, chmodSync } from 'node:fs'

describe('checkNode', () => {
  it('returns ok for current Node.js version', async () => {
    const result = await checkNode()
    expect(result.status).toBe('ok')
    expect(result.message).toMatch(/^v\d+/)
  })

  it('returns error when Node.js is below v18', async () => {
    const original = process.version
    Object.defineProperty(process, 'version', { value: 'v16.20.0', configurable: true })
    const result = await checkNode()
    expect(result.status).toBe('error')
    expect(result.fix).toBeDefined()
    Object.defineProperty(process, 'version', { value: original, configurable: true })
  })
})

describe('checkWriteAccess', () => {
  it('returns ok for a writable directory', () => {
    const result = checkWriteAccess(tmpdir())
    expect(result.status).toBe('ok')
  })

  it('returns error for a non-writable directory', () => {
    // Only run on non-root (root bypasses permissions)
    if (process.getuid && process.getuid() === 0) return

    const dir = join(tmpdir(), `wpaikit-perm-test-${Date.now()}`)
    mkdirSync(dir)
    chmodSync(dir, 0o444)

    const result = checkWriteAccess(dir)
    expect(result.status).toBe('error')
    expect(result.fix).toBeDefined()

    chmodSync(dir, 0o755)
    rmSync(dir, { recursive: true })
  })
})
