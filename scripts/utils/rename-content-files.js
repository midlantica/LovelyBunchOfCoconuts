#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  sanitizeFilename,
  isProperlyFormatted,
  generateSafeFilename,
  renameFile,
} from './filename-sanitizer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Recursively find all markdown files that need renaming
 * @param {string} directory - Directory to search
 * @returns {Promise<string[]>} Array of file paths that need renaming
 */
async function findFilesToRename(directory) {
  const filesToRename = []

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        // Skip certain directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue
        }
        // Recursively search subdirectories
        const subFiles = await findFilesToRename(fullPath)
        filesToRename.push(...subFiles)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Check if this markdown file needs renaming
        if (!isProperlyFormatted(entry.name)) {
          filesToRename.push(fullPath)
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}: ${error.message}`)
  }

  return filesToRename
}

/**
 * Rename a content file and update any corresponding image files
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<boolean>} Success status
 */
async function renameContentFile(filePath) {
  const directory = path.dirname(filePath)
  const oldFilename = path.basename(filePath)
  const extension = path.extname(oldFilename)
  const oldBasename = path.basename(oldFilename, extension)

  try {
    // Generate new filename
    const newFilename = await generateSafeFilename(
      directory,
      oldBasename,
      extension
    )
    const newFilePath = path.join(directory, newFilename)

    if (oldFilename === newFilename) {
      console.log(`✅ ${filePath} - already properly formatted`)
      return true
    }

    // Rename the markdown file
    const success = await renameFile(filePath, newFilePath)
    if (!success) return false

    console.log(`📝 Renamed: ${oldFilename} → ${newFilename}`)

    // Check if there's a corresponding image file that needs renaming
    await renameCorrespondingImage(
      filePath,
      oldBasename,
      path.basename(newFilename, extension)
    )

    return true
  } catch (error) {
    console.error(`Error renaming ${filePath}: ${error.message}`)
    return false
  }
}

/**
 * Rename corresponding image file if it exists
 * @param {string} markdownPath - Original markdown file path
 * @param {string} oldBasename - Old basename without extension
 * @param {string} newBasename - New basename without extension
 */
async function renameCorrespondingImage(
  markdownPath,
  oldBasename,
  newBasename
) {
  // Determine the corresponding image directory
  const contentDir = path.join(__dirname, '..', 'content')
  const publicDir = path.join(__dirname, '..', 'public')

  // Get relative path from content directory
  const relativePath = path.relative(contentDir, path.dirname(markdownPath))
  const imageDir = path.join(publicDir, relativePath)

  // Common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

  for (const ext of imageExtensions) {
    const oldImagePath = path.join(imageDir, oldBasename + ext)
    const newImagePath = path.join(imageDir, newBasename + ext)

    try {
      await fs.access(oldImagePath)
      // Image exists, rename it
      const success = await renameFile(oldImagePath, newImagePath)
      if (success) {
        console.log(
          `🖼️  Renamed image: ${oldBasename}${ext} → ${newBasename}${ext}`
        )
      }
      break // Only rename the first matching image
    } catch {
      // Image doesn't exist, continue
    }
  }
}

/**
 * Main function to rename all content files
 */
async function main() {
  console.log('🔍 Scanning for content files that need renaming...\n')

  const contentDir = path.join(__dirname, '..', 'content')
  const filesToRename = await findFilesToRename(contentDir)

  if (filesToRename.length === 0) {
    console.log('✅ All content files are already properly formatted!')
    return
  }

  console.log(`Found ${filesToRename.length} files that need renaming:\n`)

  // Show preview of what will be renamed
  for (const filePath of filesToRename) {
    const oldFilename = path.basename(filePath)
    const extension = path.extname(oldFilename)
    const oldBasename = path.basename(oldFilename, extension)
    const newBasename = sanitizeFilename(oldBasename)
    const newFilename = newBasename + extension

    console.log(`  ${oldFilename} → ${newFilename}`)
  }

  console.log('\n🚀 Starting rename process...\n')

  let successCount = 0
  let errorCount = 0

  for (const filePath of filesToRename) {
    const success = await renameContentFile(filePath)
    if (success) {
      successCount++
    } else {
      errorCount++
    }
  }

  console.log('\n📊 Rename Summary:')
  console.log(`✅ Successfully renamed: ${successCount} files`)
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`)
  }
  console.log('\n🎉 Content file renaming complete!')
}

// Run the script
main().catch(console.error)
