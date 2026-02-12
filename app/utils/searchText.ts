// utils/searchText.ts
// Shared utility for extracting searchable text from Nuxt Content AST bodies.
// Consolidates the 3 duplicate implementations in useContentCache, useProfiles, and useModalContentLoader.

type ASTElement = string | [string, Record<string, any>?, ...any[]]

/**
 * Extract plain text from a Nuxt Content v3 minimark AST body.
 * Optionally enriches with path-derived folder names and profile metadata.
 *
 * @param body - The body object with a `.value` array of AST elements
 * @param options - Optional enrichment: itemPath, profile name, status
 * @returns Normalized plain text string suitable for search indexing
 */
export function extractSearchableText(
  body: { value?: ASTElement[] } | null | undefined,
  options: {
    itemPath?: string
    profile?: string
    status?: string
  } = {}
): string {
  if (!body || !body.value) return ''

  const { itemPath = '', profile = '', status = '' } = options

  let text = ''

  const extractFromElement = (element: ASTElement): void => {
    if (Array.isArray(element)) {
      const [_tag, _attrs, content] = element
      if (typeof content === 'string') {
        text += content + ' '
      } else if (Array.isArray(content)) {
        content.forEach(extractFromElement)
      }
    } else if (typeof element === 'string') {
      text += element + ' '
    }
  }

  body.value.forEach(extractFromElement)

  // Add path information as searchable content (lower priority)
  if (itemPath) {
    const pathParts = itemPath.split('/').filter(Boolean)
    const folderNames = pathParts
      .filter((part) => !part.endsWith('.md'))
      .map((part) => part.replace(/[-_]/g, ' '))
      .join(' ')
    if (folderNames) {
      text += ' ' + folderNames
    }
  }

  // Add profile metadata as searchable content
  if (profile) text += ' ' + profile
  if (status) {
    text += ' ' + status
    text += status === 'hero' ? ' hero' : ' zero'
  }

  // Normalize special characters: convert smart quotes, apostrophes, dashes to standard ASCII
  const normalized = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .trim()

  return normalized
}
