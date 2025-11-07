#!/usr/bin/env node

/**
 * Image Conversion Script for WakeUpNPC
 *
 * This script converts JPEG images to WebP format for better performance.
 * It processes images in the public/memes directory and creates WebP versions
 * alongside the originals.
 *
 * Usage:
 *   node scripts/convert-images-to-webp.js [--dry-run] [--quality=80]
 *
 * Options:
 *   --dry-run    Show what would be converted without actually converting
 *   --quality    WebP quality (1-100, default: 80)
 *   --replace    Replace original JPEGs with WebP (default: keep both)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const shouldReplace = args.includes('--replace')
const qualityArg = args.find((arg) => arg.startsWith('--quality='))
const quality = qualityArg ? parseInt(qualityArg.split('=')[1]) : 80

// Directories to process
const directories = [
  path.join(__dirname, '../public/memes'),
  path.join(__dirname, '../public/profiles'),
]

// Statistics
const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  newSize: 0,
}

/**
 * Get all image files recursively from a directory
 */
function getImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`)
    return fileList
  }

  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getImageFiles(filePath, fileList)
    } else if (/\.(jpe?g)$/i.test(file)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * Convert a single image to WebP
 */
async function convertImage(inputPath) {
  const outputPath = inputPath.replace(/\.(jpe?g)$/i, '.webp')

  // Skip if WebP already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping (WebP exists): ${path.basename(inputPath)}`)
    stats.skipped++
    return
  }

  try {
    const inputStats = fs.statSync(inputPath)
    stats.originalSize += inputStats.size

    if (isDryRun) {
      console.log(
        `🔍 Would convert: ${path.basename(inputPath)} → ${path.basename(outputPath)}`
      )
      stats.converted++
      return
    }

    // Convert to WebP
    await sharp(inputPath).webp({ quality, effort: 6 }).toFile(outputPath)

    const outputStats = fs.statSync(outputPath)
    stats.newSize += outputStats.size

    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1)
    console.log(
      `✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`
    )

    // Optionally remove original
    if (shouldReplace) {
      fs.unlinkSync(inputPath)
      console.log(`   🗑️  Removed original: ${path.basename(inputPath)}`)
    }

    stats.converted++
  } catch (error) {
    console.error(
      `❌ Error converting ${path.basename(inputPath)}:`,
      error.message
    )
    stats.errors++
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  WakeUpNPC Image Conversion Script')
  console.log('=====================================\n')

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n')
  }

  console.log(`Settings:`)
  console.log(`  Quality: ${quality}`)
  console.log(`  Replace originals: ${shouldReplace ? 'Yes' : 'No'}`)
  console.log(`  Directories: ${directories.length}\n`)

  // Collect all image files
  const allImages = []
  directories.forEach((dir) => {
    const images = getImageFiles(dir)
    allImages.push(...images)
    console.log(
      `📁 Found ${images.length} JPEG images in ${path.basename(dir)}`
    )
  })

  stats.total = allImages.length
  console.log(`\n📊 Total images to process: ${stats.total}\n`)

  if (stats.total === 0) {
    console.log('✨ No images to convert!')
    return
  }

  // Convert images
  console.log('🔄 Starting conversion...\n')
  for (const imagePath of allImages) {
    await convertImage(imagePath)
  }

  // Print summary
  console.log('\n=====================================')
  console.log('📊 Conversion Summary')
  console.log('=====================================')
  console.log(`Total images: ${stats.total}`)
  console.log(`Converted: ${stats.converted}`)
  console.log(`Skipped: ${stats.skipped}`)
  console.log(`Errors: ${stats.errors}`)

  if (!isDryRun && stats.converted > 0) {
    const totalSavings = stats.originalSize - stats.newSize
    const savingsPercent = ((totalSavings / stats.originalSize) * 100).toFixed(
      1
    )
    const savingsMB = (totalSavings / 1024 / 1024).toFixed(2)

    console.log(`\n💾 Storage savings:`)
    console.log(
      `  Original size: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`
    )
    console.log(`  New size: ${(stats.newSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Saved: ${savingsMB} MB (${savingsPercent}%)`)
  }

  console.log('\n✨ Done!')

  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to actually convert the images')
  }

  if (!shouldReplace && stats.converted > 0) {
    console.log('\n📝 Next steps:')
    console.log(
      '  1. Update image references in your markdown files to use .webp'
    )
    console.log('  2. Test the site to ensure images load correctly')
    console.log(
      '  3. Run with --replace flag to remove original JPEGs (optional)'
    )
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
