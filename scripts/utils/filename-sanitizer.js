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
  // Convert underscores to dashes first
  let cleanText = text.replace(/_/g, '-')

  // Remove non-alphanumeric characters except hyphens and spaces
  cleanText = cleanText
    .replace(/[^a-zA-Z0-9\-\s]/g, '')
    .replace(/\s+/g, '-') // Convert spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .toLowerCase()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/[0-9a-f]{8,}$/g, '') // Remove trailing hashes/numbers
    .replace(/-+$/g, '') // Remove trailing hyphens again

  // Truncate to max length
  cleanText = cleanText.slice(0, maxLength).replace(/-+$/g, '')

  return cleanText || 'unnamed'
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
