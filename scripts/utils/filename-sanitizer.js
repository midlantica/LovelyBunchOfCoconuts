// @ts-nocheck
// utils/filename-sanitizer.js
import fs from 'fs/promises'
import path from 'path'

/**
 * Sanitizes a filename to be URL and filesystem friendly
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length for the sanitized name
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(text, maxLength = 50) {
  // 1. Normalize & lowercase
  const lowered = (text || '')
    .normalize('NFKD')
    .replace(/[_]+/g, ' ') // underscores -> space first so they become token breaks
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/['\u2018\u2019\u201A\u201B`\u02BC\u02B9\uFF07]/g, '') // remove all apostrophe variants (ASCII, curly quotes, modifiers) - just remove, don't add space
    .replace(/\s*'\s*/g, '') // catch any remaining straight apostrophes with surrounding spaces
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ') // keep alnum, space, dash
    .replace(/-/g, ' ') // treat existing dashes as separators for smarter trailing number trim
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()

  if (!lowered) return 'unnamed'

  // 2. Tokenize
  let tokens = lowered.split(' ').filter(Boolean)

  // Helper: detect year
  const isYear = (t) => /^(19|20)\d{2}$/.test(t)
  // Helper: likely random long number (timestamp, camera seq, hash fragment)
  const isLikelyRandomNumber = (t) =>
    /^[0-9]+$/.test(t) && !isYear(t) && t.length >= 3
  // Helper: hex/hashy token
  const isHashy = (t) => /^[0-9a-f]{6,}$/.test(t)

  // 3. Remove trailing hashy / random numeric tokens (keep one year if present)
  while (tokens.length) {
    const last = tokens[tokens.length - 1]
    if (isHashy(last) || isLikelyRandomNumber(last)) {
      tokens.pop()
      continue
    }
    break
  }

  // If everything stripped, fallback to original first non-empty alnum chunk or 'unnamed'
  if (!tokens.length) {
    return 'unnamed'
  }

  // 4. Re-join with hyphens, respecting a max length on token boundaries
  // Prefer whole-word endings; only truncate mid-word if a single token exceeds maxLength.
  let base = ''
  if (tokens.length) {
    const isYear = (t) => /^(19|20)\d{2}$/.test(t)
    let acc = ''
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const sep = acc ? '-' : ''
      const next = acc + sep + token
      if (next.length <= maxLength) {
        acc = next
        continue
      }
      // If first token alone is too long, hard-truncate it
      if (!acc) {
        acc = token.slice(0, Math.max(1, maxLength))
        break
      }
      // If token is a year and fits exactly when replacing last token, try to include it by trimming last token
      if (isYear(token)) {
        // Try dropping last token to include year if that keeps within limit
        const parts = acc.split('-')
        if (parts.length > 0) {
          const withoutLast = parts.slice(0, -1).join('-')
          const candidate = withoutLast ? `${withoutLast}-${token}` : token
          if (candidate.length <= maxLength) {
            acc = candidate
          }
        }
      }
      break
    }
    base = acc
  }
  // Ensure no trailing hyphens
  base = base.replace(/-+$/g, '')

  // 6. Ensure not empty & not a single generic number; if single number that isn't a year, prefix img-
  if (!base) base = 'unnamed'
  else if (/^\d+$/.test(base) && !isYear(base)) base = `img-${base}`

  return base || 'unnamed'
}

/**
 * Checks if a filename is already properly formatted
 * @param {string} filename - Filename to check
 * @returns {boolean} Whether the filename follows our standards
 */
export function isProperlyFormatted(filename) {
  const basename = path.basename(filename, path.extname(filename))

  // Should not contain underscores
  if (basename.includes('_')) return false

  // Should be lowercase
  if (basename !== basename.toLowerCase()) return false

  // Should not have special characters except hyphens
  if (!/^[a-z0-9-]+$/.test(basename)) return false

  // Should not start or end with hyphens
  if (basename.startsWith('-') || basename.endsWith('-')) return false

  // Should not have consecutive hyphens
  if (basename.includes('--')) return false

  return true
}

/**
 * Generates a safe new filename, avoiding conflicts
 * @param {string} directory - Directory where the file will be placed
 * @param {string} originalName - Original filename
 * @param {string} extension - File extension (with dot)
 * @returns {Promise<string>} Safe new filename
 */
export async function generateSafeFilename(directory, originalName, extension) {
  const baseName = sanitizeFilename(originalName)
  let newFilename = baseName + extension
  let counter = 1

  // Check for conflicts and add counter if needed
  while (await fileExists(path.join(directory, newFilename))) {
    newFilename = `${baseName}-${counter}${extension}`
    counter++
  }

  return newFilename
}

/**
 * Helper to check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} Whether file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Renames a file to use proper naming conventions
 * @param {string} oldPath - Current file path
 * @param {string} newPath - New file path
 * @returns {Promise<boolean>} Success status
 */
export async function renameFile(oldPath, newPath) {
  try {
    await fs.rename(oldPath, newPath)
    return true
  } catch (error) {
    console.error(`Error renaming ${oldPath} to ${newPath}: ${error.message}`)
    return false
  }
}
