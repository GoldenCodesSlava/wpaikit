/**
 * Convert any string to a kebab-case slug (lowercase, hyphens only).
 * e.g. "My Cool Site" → "my-cool-site"
 */
export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Convert a slug or any string to PascalCase namespace.
 * e.g. "my-cool-site" → "MyCoolSite"
 */
export function toPascalCase(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Convert a slug or any string to a human-readable title.
 * e.g. "my-cool-site" → "My Cool Site"
 */
export function toTitle(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
