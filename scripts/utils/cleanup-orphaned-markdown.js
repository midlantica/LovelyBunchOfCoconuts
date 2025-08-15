#!/usr/bin/env node

import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Find orphaned markdown files (markdown files without corresponding images)
 * @param {string} imageDirectory - Directory containing images
 * @param {string[]} imageFiles - Array of image filenames
 * @returns {Promise<string[]>} Array of orphaned markdown filenames
 */
async function findOrphanedMarkdownFiles(imageDirectory, imageFiles) {
  try {
    // Get the corresponding content directory
    const imageDir = imageDirectory
    const pathParts = imageDir.split(path.sep)
    const memesIndex = pathParts.findIndex((part) => part === 'memes')

    if (memesIndex === -1) {
      return [] // Invalid path structure
    }

    // Get subdirectory path after 'memes' (e.g., 'thomas-sowell')
    const subdirParts = pathParts.slice(memesIndex + 1)

    // Construct content directory path
    const contentDir =
      subdirParts.length > 0
        ? path.join(__dirname, '..', 'content', 'memes', ...subdirParts)
        : path.join(__dirname, '..', 'content', 'memes')

    // Check if content directory exists
    try {
      await fs.access(contentDir)
    } catch {
      return [] // Content directory doesn't exist, no orphaned files
    }

    // Get all markdown files in the content directory
    const contentFiles = await fs.readdir(contentDir)
    const markdownFiles = contentFiles.filter((file) => file.endsWith('.md'))

    // Create a set of existing image filenames for quick lookup
    const imageFilenameSet = new Set(imageFiles)

    // Check each markdown file to see if its referenced image exists
    const orphanedFiles = []

    for (const mdFile of markdownFiles) {
      try {
        const mdPath = path.join(contentDir, mdFile)
        const content = await fs.readFile(mdPath, 'utf-8')

        // Extract image path from markdown content using regex
        // Look for ![alt text](/memes/subdirectory/image.jpg) pattern
        const imageMatch = content.match(/!\[.*?\]\(\/memes\/[^)]+\)/)

        if (imageMatch) {
          // Extract the image filename from the path
          const imagePath = imageMatch[0].match(/\/memes\/[^)]+/)[0]
          const imageFilename = path.basename(imagePath)

          // Check if this image file exists in our directory
          if (!imageFilenameSet.has(imageFilename)) {
            orphanedFiles.push({
              filename: mdFile,
              path: mdPath,
              referencedImage: imageFilename,
              content: content,
            })
          }
        } else {
          // No image reference found in markdown - this is definitely orphaned
          orphanedFiles.push({
            filename: mdFile,
            path: mdPath,
            referencedImage: 'No image reference found',
            content: content,
          })
        }
      } catch (error) {
        // If we can't read the markdown file, consider it potentially orphaned
        console.warn(`Could not read markdown file ${mdFile}: ${error.message}`)
        orphanedFiles.push({
          filename: mdFile,
          path: path.join(contentDir, mdFile),
          referencedImage: 'Could not read file',
          content: '',
        })
      }
    }

    return orphanedFiles
  } catch (error) {
    console.error(
      `Error checking for orphaned markdown files: ${error.message}`
    )
    return []
  }
}

/**
 * Move orphaned markdown files to _orphaned folder
 * @param {string} subdirName - Subdirectory name (e.g., 'thomas-sowell')
 * @returns {Promise<void>}
 */
async function cleanupOrphanedMarkdown(subdirName = '') {
  const imageExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.bmp',
    '.tiff',
    '.gif',
    '.webp',
  ]

  try {
    // Construct paths
    const imageDir = subdirName
      ? path.join(__dirname, '..', 'public', 'memes', subdirName)
      : path.join(__dirname, '..', 'public', 'memes')

    const contentDir = subdirName
      ? path.join(__dirname, '..', 'content', 'memes', subdirName)
      : path.join(__dirname, '..', 'content', 'memes')

    const orphanedDir = path.join(contentDir, '_orphaned')

    // Get all image files
    const files = await fs.readdir(imageDir)
    const imageFiles = files.filter((filename) => {
      const ext = path.extname(filename).toLowerCase()
      return imageExtensions.includes(ext)
    })

    console.log(
      `🔍 Checking for orphaned markdown files in: content/memes/${subdirName || ''}`
    )
    console.log(`📊 Found ${imageFiles.length} image files to check against`)

    // Find orphaned markdown files
    const orphanedFiles = await findOrphanedMarkdownFiles(imageDir, imageFiles)

    if (orphanedFiles.length === 0) {
      console.log(`✅ No orphaned markdown files found!`)
      return
    }

    console.log(`\n🗑️ Found ${orphanedFiles.length} orphaned markdown files:`)
    orphanedFiles.forEach((file) => {
      console.log(`  📄 ${file.filename} → references: ${file.referencedImage}`)
    })

    // Create _orphaned directory if it doesn't exist
    try {
      await fs.access(orphanedDir)
    } catch {
      await fs.mkdir(orphanedDir, { recursive: true })
      console.log(
        `\n📁 Created _orphaned directory: ${path.relative(process.cwd(), orphanedDir)}`
      )
    }

    // Move orphaned files
    console.log(`\n🚚 Moving orphaned files to _orphaned folder...`)
    let movedCount = 0

    for (const file of orphanedFiles) {
      try {
        const destinationPath = path.join(orphanedDir, file.filename)
        await fs.rename(file.path, destinationPath)
        console.log(`  ✅ Moved: ${file.filename}`)
        movedCount++
      } catch (error) {
        console.error(`  ❌ Failed to move ${file.filename}: ${error.message}`)
      }
    }

    console.log(`\n🎯 CLEANUP SUMMARY:`)
    console.log(`📄 Orphaned files found: ${orphanedFiles.length}`)
    console.log(`🚚 Files moved to _orphaned: ${movedCount}`)
    console.log(
      `📁 Location: content/memes/${subdirName ? subdirName + '/' : ''}_orphaned/`
    )

    if (movedCount > 0) {
      console.log(
        `\n💡 TIP: Review files in _orphaned folder before permanently deleting them.`
      )
      console.log(
        `     These files are now ignored by Nuxt Content and won't appear on your site.`
      )
    }
  } catch (error) {
    console.error(`Error during cleanup: ${error.message}`)
    process.exit(1)
  }
}

// Main execution
const args = process.argv.slice(2)
const subdirName = args[0]

if (subdirName) {
  console.log(`🧹 Cleaning up orphaned markdown files in: ${subdirName}`)
  cleanupOrphanedMarkdown(subdirName)
    .then(() => {
      console.log('\n✅ Orphaned markdown cleanup complete.')
    })
    .catch((err) => {
      console.error('Cleanup failed:', err)
      process.exit(1)
    })
} else {
  console.log(`🧹 Cleaning up orphaned markdown files in: ALL subdirectories`)

  // Process all subdirectories
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')

  try {
    const entries = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(`🔍 Found ${subdirs.length} subdirectories to process\n`)

    let totalOrphaned = 0
    let totalMoved = 0

    // Process each subdirectory
    for (const subdir of subdirs) {
      console.log(`\n📁 Processing: ${subdir}`)

      try {
        await cleanupOrphanedMarkdown(subdir)
        // Note: cleanupOrphanedMarkdown handles its own reporting
      } catch (error) {
        console.error(`❌ Error processing ${subdir}: ${error.message}`)
      }
    }

    console.log(`\n🎯 GLOBAL CLEANUP COMPLETE!`)
    console.log(`📁 Processed ${subdirs.length} subdirectories`)
    console.log(`💡 Check individual subdirectory reports above for details`)
  } catch (error) {
    console.error(`Error processing subdirectories: ${error.message}`)
    process.exit(1)
  }
}

export { findOrphanedMarkdownFiles, cleanupOrphanedMarkdown }
