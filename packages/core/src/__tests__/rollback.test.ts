import { describe, it, expect } from 'vitest'
import { Rollback } from '../rollback.js'

describe('Rollback', () => {
  it('runs cleanup functions in LIFO order', async () => {
    const order: number[] = []
    const rb = new Rollback()
    rb.add(async () => { order.push(1) })
    rb.add(async () => { order.push(2) })
    rb.add(async () => { order.push(3) })
    await rb.run()
    expect(order).toEqual([3, 2, 1])
  })

  it('clears the stack after run', async () => {
    const rb = new Rollback()
    rb.add(async () => {})
    rb.add(async () => {})
    expect(rb.size).toBe(2)
    await rb.run()
    expect(rb.size).toBe(0)
  })

  it('continues rolling back even if a step throws', async () => {
    const order: number[] = []
    const rb = new Rollback()
    rb.add(async () => { order.push(1) })
    rb.add(async () => { throw new Error('step 2 failed') })
    rb.add(async () => { order.push(3) })
    await rb.run()
    expect(order).toContain(1)
    expect(order).toContain(3)
  })

  it('clear() empties the stack without running', async () => {
    let ran = false
    const rb = new Rollback()
    rb.add(async () => { ran = true })
    rb.clear()
    expect(rb.size).toBe(0)
    expect(ran).toBe(false)
  })
})
