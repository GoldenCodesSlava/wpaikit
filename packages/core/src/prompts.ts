import {
  text,
  confirm as clackConfirm,
  select as clackSelect,
  multiselect as clackMultiselect,
  password as clackPassword,
  isCancel,
} from '@clack/prompts'
import type { Option } from '@clack/prompts'

function handleCancel(value: unknown): asserts value is NonNullable<typeof value> {
  if (isCancel(value)) {
    process.exit(0)
  }
}

export async function promptText(options: {
  message: string
  placeholder?: string
  defaultValue?: string
  validate?: (value: string) => string | undefined
}): Promise<string> {
  const value = await text(options)
  handleCancel(value)
  return value as string
}

export async function confirm(message: string): Promise<boolean> {
  const value = await clackConfirm({ message })
  handleCancel(value)
  return value as boolean
}

export async function select<T>(options: {
  message: string
  options: Option<T>[]
  initialValue?: T
}): Promise<T> {
  const value = await clackSelect(options)
  handleCancel(value)
  return value as T
}

export async function multiselect<T>(options: {
  message: string
  options: Option<T>[]
  initialValues?: T[]
  required?: boolean
}): Promise<T[]> {
  const value = await clackMultiselect({
    ...options,
    required: options.required ?? false,
  })
  handleCancel(value)
  return value as T[]
}

export async function password(message: string): Promise<string> {
  const value = await clackPassword({ message })
  handleCancel(value)
  return value as string
}
