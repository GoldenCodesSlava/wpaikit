export class WpaikitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WpaikitError'
  }
}

export class PreflightError extends WpaikitError {
  constructor(message: string) {
    super(message)
    this.name = 'PreflightError'
  }
}

export class ValidationError extends WpaikitError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class RollbackError extends WpaikitError {
  constructor(message: string) {
    super(message)
    this.name = 'RollbackError'
  }
}
