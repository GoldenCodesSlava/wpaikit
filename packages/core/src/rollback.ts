type CleanupFn = () => Promise<void> | void

export class Rollback {
  private stack: CleanupFn[] = []

  add(fn: CleanupFn): void {
    this.stack.push(fn)
  }

  async run(): Promise<void> {
    const fns = [...this.stack].reverse()
    this.stack = []
    for (const fn of fns) {
      try {
        await fn()
      } catch (err) {
        console.error('[rollback] cleanup step failed:', err)
      }
    }
  }

  clear(): void {
    this.stack = []
  }

  get size(): number {
    return this.stack.length
  }
}
