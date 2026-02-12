// utils/slugify.ts
// Shared slugify utility — used across composables, pages, and components.
// Consolidates the 5+ duplicate implementations into one canonical source.

/**
 * Convert a string to a URL-friendly slug.
 * - Lowercases, strips non-alphanumeric chars (except spaces and hyphens),
 *   collapses whitespace/hyphens, trims, and caps at maxLength.
 */
export function slugify(str: string = '', maxLength: number = 80): string {
  return str
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, maxLength)
}
