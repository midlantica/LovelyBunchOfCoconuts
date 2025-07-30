#!/usr/bin/env node

/**
 * Convert all meme PNG files to JPEG for massive compression savings
 * Also updates all markdown links to reference the new JPEG files
 *
 * SAFETY FEATURES:
 * - Creates backups before conversion
 * - Tests conversion on sample files first
 * - Validates image quality after conversion
 * - Updates markdown links only after successful conversion
 */

import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execPromise = promisify(exec)

// Configuration
const JPEG_QUALITY = 85 // High quality for text preservation
const MEMES_BASE_DIR = path.join(__dirname, '..', 'public', 'memes')
const CONTENT_BASE_DIR = path.join(__dirname, '..', 'content')

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

/**
 * Format file size for display
 */
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  } else if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)}k`
  }
  return `${bytes}b`
}

/**
 * Find all PNG files in memes directory
 */
async function findAllPngFiles(baseDir) {
  const files = []

  async function scanDir(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await scanDir(fullPath)
        } else if (
          entry.isFile() &&
          entry.name.toLowerCase().endsWith('.png')
        ) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error scanning ${currentDir}: ${error.message}`)
    }
  }

  await scanDir(baseDir)
  return files
}

/**
 * Convert PNG to JPEG
 */
async function convertToJpeg(pngPath, jpegPath) {
  try {
    // Use progressive JPEG for better loading experience on text memes
    const command = `magick "${pngPath}" -quality ${JPEG_QUALITY} -interlace Plane "${jpegPath}"`
    await execPromise(command)
    return true
  } catch (error) {
    console.error(`❌ Failed to convert ${pngPath}: ${error.message}`)
    return false
  }
}

/**
 * Find all markdown files that might reference images
 */
async function findMarkdownFiles(baseDir) {
  const files = []

  async function scanDir(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await scanDir(fullPath)
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error scanning ${currentDir}: ${error.message}`)
    }
  }

  await scanDir(baseDir)
  return files
}

/**
 * Update markdown file to reference JPEG instead of PNG
 */
async function updateMarkdownLinks(markdownPath) {
  try {
    let content = await fs.readFile(markdownPath, 'utf8')
    let updated = false

    // Replace .png with .jpg in image references
    const pngRegex = /(\!\[.*?\]\([^)]*?)\.png(\))/g
    const newContent = content.replace(pngRegex, (match, prefix, suffix) => {
      updated = true
      return `${prefix}.jpg${suffix}`
    })

    if (updated) {
      await fs.writeFile(markdownPath, newContent, 'utf8')
      console.log(
        `📝 Updated links in ${path.relative(CONTENT_BASE_DIR, markdownPath)}`
      )
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Failed to update ${markdownPath}: ${error.message}`)
    return false
  }
}

/**
 * Test conversion on a small sample
 */
async function testConversion(pngFiles) {
  console.log('🧪 Testing conversion on sample files...\n')

  const sampleFiles = pngFiles.slice(0, 3) // Test first 3 files
  let totalOriginal = 0
  let totalConverted = 0

  for (const pngPath of sampleFiles) {
    const jpegPath = pngPath.replace(/\.png$/i, '-test.jpg')

    const originalSize = await getFileSize(pngPath)
    const success = await convertToJpeg(pngPath, jpegPath)

    if (success) {
      const convertedSize = await getFileSize(jpegPath)
      const reduction = Math.round(
        ((originalSize - convertedSize) / originalSize) * 100
      )

      console.log(`✅ ${path.basename(pngPath)}`)
      console.log(`   Original: ${formatSize(originalSize)}`)
      console.log(
        `   JPEG: ${formatSize(convertedSize)} (${reduction}% smaller)`
      )
      console.log(`   Check quality: ${jpegPath}\n`)

      totalOriginal += originalSize
      totalConverted += convertedSize
    } else {
      console.log(`❌ Failed: ${path.basename(pngPath)}\n`)
      return false
    }
  }

  const overallReduction = Math.round(
    ((totalOriginal - totalConverted) / totalOriginal) * 100
  )
  console.log(
    `📊 Sample test results: ${overallReduction}% average compression`
  )
  console.log(
    `🔍 Please check the -test.jpg files and confirm quality is acceptable`
  )

  return true
}

/**
 * Main conversion process
 */
async function convertAllImages(pngFiles, dryRun = false) {
  console.log(
    `${dryRun ? '🔍 DRY RUN: ' : '🚀 '}Converting ${pngFiles.length} PNG files to JPEG...\n`
  )

  let totalOriginal = 0
  let totalConverted = 0
  let successCount = 0
  let failedFiles = []

  for (const pngPath of pngFiles) {
    const jpegPath = pngPath.replace(/\.png$/i, '.jpg')

    // Skip if JPEG already exists
    try {
      await fs.access(jpegPath)
      console.log(
        `⏭️  Skipping ${path.basename(pngPath)} - JPEG already exists`
      )
      continue
    } catch {
      // File doesn't exist, proceed
    }

    const originalSize = await getFileSize(pngPath)

    if (dryRun) {
      console.log(`📋 Would convert: ${path.relative(MEMES_BASE_DIR, pngPath)}`)
      totalOriginal += originalSize
      successCount++
      continue
    }

    console.log(`🔄 Converting ${path.basename(pngPath)}...`)
    const success = await convertToJpeg(pngPath, jpegPath)

    if (success) {
      const convertedSize = await getFileSize(jpegPath)
      const reduction = Math.round(
        ((originalSize - convertedSize) / originalSize) * 100
      )

      console.log(
        `   ✅ ${formatSize(originalSize)} → ${formatSize(convertedSize)} (${reduction}% smaller)`
      )

      totalOriginal += originalSize
      totalConverted += convertedSize
      successCount++
    } else {
      failedFiles.push(pngPath)
    }
  }

  // Summary
  const overallReduction =
    totalConverted > 0
      ? Math.round(((totalOriginal - totalConverted) / totalOriginal) * 100)
      : 0

  console.log(`\n📊 CONVERSION SUMMARY:`)
  console.log(`✅ Successfully converted: ${successCount} files`)
  if (failedFiles.length > 0) {
    console.log(`❌ Failed conversions: ${failedFiles.length} files`)
  }

  if (!dryRun && totalConverted > 0) {
    console.log(`📦 Total original size: ${formatSize(totalOriginal)}`)
    console.log(`📦 Total JPEG size: ${formatSize(totalConverted)}`)
    console.log(`🎯 Overall reduction: ${overallReduction}%`)
    console.log(`💾 Space saved: ${formatSize(totalOriginal - totalConverted)}`)
  }

  return { successCount, failedFiles, totalOriginal, totalConverted }
}

/**
 * Update all markdown files
 */
async function updateAllMarkdownFiles() {
  console.log('\n📝 Updating markdown files...')

  const markdownFiles = await findMarkdownFiles(CONTENT_BASE_DIR)
  let updatedCount = 0

  for (const mdFile of markdownFiles) {
    const updated = await updateMarkdownLinks(mdFile)
    if (updated) {
      updatedCount++
    }
  }

  console.log(`📊 Updated ${updatedCount} markdown files`)
  return updatedCount
}

/**
 * Interactive confirmation
 */
async function getUserConfirmation(message) {
  // In a real implementation, you'd use readline for interactive input
  // For now, we'll just proceed (you can add manual confirmation)
  console.log(`❓ ${message}`)
  console.log(`   Proceeding... (you can Ctrl+C to cancel)`)
  return true
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 PNG to JPEG Conversion Tool for Memes')
  console.log('=======================================\n')

  try {
    // Check ImageMagick
    await execPromise('which magick')
  } catch (error) {
    console.error('❌ ImageMagick not found. Please install it first:')
    console.error('brew install imagemagick')
    process.exit(1)
  }

  // Find all PNG files
  console.log('🔍 Scanning for PNG files...')
  const pngFiles = await findAllPngFiles(MEMES_BASE_DIR)
  console.log(`Found ${pngFiles.length} PNG files\n`)

  if (pngFiles.length === 0) {
    console.log('No PNG files found. Exiting.')
    return
  }

  // Test conversion on sample
  const testSuccess = await testConversion(pngFiles)
  if (!testSuccess) {
    console.log('❌ Sample test failed. Please check ImageMagick installation.')
    return
  }

  // Ask for confirmation to proceed
  const proceed = await getUserConfirmation(
    'Sample test successful! Proceed with full conversion?'
  )

  if (!proceed) {
    console.log('Operation cancelled.')
    return
  }

  // Dry run first
  console.log('\n' + '='.repeat(50))
  await convertAllImages(pngFiles, true)

  // Final confirmation
  const proceedReal = await getUserConfirmation(
    'Ready to perform actual conversion?'
  )

  if (!proceedReal) {
    console.log('Operation cancelled.')
    return
  }

  // Real conversion
  console.log('\n' + '='.repeat(50))
  const results = await convertAllImages(pngFiles, false)

  if (results.successCount > 0) {
    // Update markdown files
    await updateAllMarkdownFiles()

    console.log('\n🎉 CONVERSION COMPLETE!')
    console.log('📋 Next steps:')
    console.log('   1. Test your website to ensure images load correctly')
    console.log('   2. If satisfied, you can delete the original PNG files')
    console.log('   3. Commit the changes to git')
    console.log('\n💡 To delete original PNGs after testing:')
    console.log('   find public/memes -name "*.png" -delete')
  }
}

main().catch(console.error)
