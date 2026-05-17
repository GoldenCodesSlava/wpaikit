import pc from 'picocolors'
import {
  log,
  intro as clackIntro,
  outro as clackOutro,
  spinner as clackSpinner,
  note as clackNote,
} from '@clack/prompts'

export const logger = {
  info: (msg: string): void => log.info(msg),
  success: (msg: string): void => log.success(msg),
  warn: (msg: string): void => log.warn(msg),
  error: (msg: string): void => log.error(msg),
  step: (msg: string): void => log.step(msg),
  message: (msg: string): void => log.message(msg),
}

export function intro(title: string): void {
  clackIntro(pc.bgCyan(pc.black(` ${title} `)))
}

export function outro(msg: string): void {
  clackOutro(msg)
}

export function note(message: string, title?: string): void {
  clackNote(message, title)
}

export function spinner() {
  return clackSpinner()
}
