#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execPromise = promisify(exec)

/**
 * Get file size in KB
 */
async function getFileSizeKB(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return Math.round(stats.size / 1024)
  } catch (error) {
    return 0
  }
}

/**
 * Format file size for display
 */
function formatSize(sizeKB) {
  if (sizeKB >= 1024) {
    return `${(sizeKB / 1024).toFixed(1)}MB`
  }
  return `${sizeKB}k`
}

/**
 * Calculate percentage reduction
 */
function calculateReduction(originalKB, compressedKB) {
  const reduction = ((originalKB - compressedKB) / originalKB) * 100
  return Math.round(reduction)
}

/**
 * Apply moderate compression optimized for text memes
 */
async function compressImage(inputPath, outputPath) {
  try {
    // More aggressive: quality 70 instead of 80
    const command = `convert "${inputPath}" +profile "*" -strip -quality 70 "${outputPath}"`

    await execPromise(command)

    return true
  } catch (error) {
    console.error(`Error compressing ${inputPath}: ${error.message}`)
    return false
  }
}

/**
 * Process all PNG files in directory
 */
async function processDirectory(targetDir) {
  console.log(`🔍 Processing images in: ${targetDir}`)
  console.log(`📊 Testing more aggressive compression (quality 70)\n`)

  try {
    const files = await fs.readdir(targetDir)
    const pngFiles = files.filter(
      (file) =>
        path.extname(file).toLowerCase() === '.png' && !file.endsWith('-c2.png') // Skip already compressed files
    )

    if (pngFiles.length === 0) {
      console.log('No PNG files found to process.')
      return
    }

    console.log(`Found ${pngFiles.length} PNG files to test\n`)

    let totalOriginalKB = 0
    let totalCompressedKB = 0
    let successCount = 0

    for (const file of pngFiles) {
      const inputPath = path.join(targetDir, file)
      const baseName = path.basename(file, '.png')
      const outputPath = path.join(targetDir, `${baseName}-c2.png`)

      // Skip if compressed version already exists
      try {
        await fs.access(outputPath)
        console.log(`⏭️  Skipping ${file} - compressed version already exists`)
        continue
      } catch {
        // File doesn't exist, proceed
      }

      // Get original size
      const originalKB = await getFileSizeKB(inputPath)

      // Compress
      const success = await compressImage(inputPath, outputPath)

      if (success) {
        // Get compressed size
        const compressedKB = await getFileSizeKB(outputPath)
        const reduction = calculateReduction(originalKB, compressedKB)

        // Display results
        console.log(`${file} ${formatSize(originalKB)}`)
        console.log(
          `${baseName}-c2.png ${formatSize(compressedKB)} - ${reduction}% smaller\n`
        )

        totalOriginalKB += originalKB
        totalCompressedKB += compressedKB
        successCount++
      } else {
        console.log(`❌ Failed to compress ${file}\n`)
      }
    }

    // Summary
    if (successCount > 0) {
      const totalReduction = calculateReduction(
        totalOriginalKB,
        totalCompressedKB
      )
      console.log(`\n📊 SUMMARY:`)
      console.log(`✅ Successfully compressed: ${successCount} files`)
      console.log(`📦 Total original size: ${formatSize(totalOriginalKB)}`)
      console.log(`📦 Total compressed size: ${formatSize(totalCompressedKB)}`)
      console.log(`🎯 Overall reduction: ${totalReduction}%`)
      console.log(
        `💾 Space saved: ${formatSize(totalOriginalKB - totalCompressedKB)}`
      )
    }
  } catch (error) {
    console.error(`Error processing directory: ${error.message}`)
    process.exit(1)
  }
}

// Check if ImageMagick is available
async function checkImageMagick() {
  try {
    await execPromise('which mogrify')
  } catch (error) {
    console.error('❌ ImageMagick not found. Please install it first:')
    console.error('brew install imagemagick')
    process.exit(1)
  }
}

// Main execution
async function main() {
  await checkImageMagick()

  const targetDir = path.join(__dirname, '..', 'public', 'memes', 'quotes')
  await processDirectory(targetDir)

  console.log(
    `\n🔍 Check the -c2.png files to see if you like the quality trade-off!`
  )
  console.log(
    `If you're happy with the results, we can apply this to all images.`
  )
}

main().catch(console.error)
