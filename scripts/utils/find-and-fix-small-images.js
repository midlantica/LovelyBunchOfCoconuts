#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

// Configuration
const MEMES_DIR = path.join(__dirname, '..', 'public', 'memes')
const MIN_WIDTH = 400 // Minimum acceptable width
const MIN_HEIGHT = 300 // Minimum acceptable height
const TARGET_WIDTH = 600 // Target width for upscaling
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Get image dimensions using ImageMagick identify
 */
function getImageDimensions(imagePath) {
  try {
    const output = execSync(`identify -format "%w %h" "${imagePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
    }).trim()

    const [width, height] = output.split(' ').map(Number)
    return { width, height }
  } catch (error) {
    log(`❌ Error reading ${imagePath}: ${error.message}`, 'red')
    return null
  }
}

/**
 * Upscale image using ImageMagick with good quality
 */
function upscaleImage(imagePath, targetWidth) {
  try {
    log(
      `📈 Upscaling ${path.basename(imagePath)} to ${targetWidth}px width...`,
      'yellow'
    )

    // Use Lanczos resampling for best quality upscaling
    execSync(`mogrify -resize ${targetWidth}x -filter Lanczos "${imagePath}"`, {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const newDimensions = getImageDimensions(imagePath)
    if (newDimensions) {
      log(
        `✅ Upscaled to ${newDimensions.width}×${newDimensions.height}px`,
        'green'
      )
      return true
    }
    return false
  } catch (error) {
    log(`❌ Error upscaling ${imagePath}: ${error.message}`, 'red')
    return false
  }
}

/**
 * Recursively find all image files
 */
async function findImageFiles(dir) {
  const files = []

  try {
    const entries = await readdir(dir)

    for (const entry of entries) {
      const fullPath = path.join(dir, entry)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        const subFiles = await findImageFiles(fullPath)
        files.push(...subFiles)
      } else if (stats.isFile()) {
        const ext = path.extname(entry).toLowerCase()
        if (IMAGE_EXTENSIONS.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    log(`❌ Error reading directory ${dir}: ${error.message}`, 'red')
  }

  return files
}

/**
 * Analyze all images and find small ones
 */
async function analyzeImages() {
  log('🔍 Scanning for images in public/memes/...', 'cyan')

  const imageFiles = await findImageFiles(MEMES_DIR)
  log(`📁 Found ${imageFiles.length} image files`, 'blue')

  const smallImages = []
  const results = {
    total: imageFiles.length,
    analyzed: 0,
    small: 0,
    errors: 0,
  }

  for (const imagePath of imageFiles) {
    const relativePath = path.relative(MEMES_DIR, imagePath)
    const dimensions = getImageDimensions(imagePath)

    if (dimensions) {
      results.analyzed++

      if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
        results.small++
        smallImages.push({
          path: imagePath,
          relativePath,
          ...dimensions,
          fileSize: fs.statSync(imagePath).size,
        })

        log(
          `📏 SMALL: ${relativePath} (${dimensions.width}×${dimensions.height}px)`,
          'yellow'
        )
      }
    } else {
      results.errors++
    }
  }

  return { smallImages, results }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const shouldFix = args.includes('--fix')
  const dryRun = !shouldFix

  log('🖼️  WakeUpNPC Small Image Detector & Fixer', 'magenta')
  log('='.repeat(50), 'magenta')

  // Check if ImageMagick is available
  try {
    execSync('which identify', { stdio: 'ignore' })
    execSync('which mogrify', { stdio: 'ignore' })
  } catch (error) {
    log('❌ ImageMagick not found! Please install it:', 'red')
    log('   macOS: brew install imagemagick', 'yellow')
    log('   Ubuntu: sudo apt-get install imagemagick', 'yellow')
    process.exit(1)
  }

  const { smallImages, results } = await analyzeImages()

  log('\n📊 ANALYSIS RESULTS:', 'cyan')
  log(`   Total images: ${results.total}`, 'blue')
  log(`   Successfully analyzed: ${results.analyzed}`, 'green')
  log(`   Too small (< ${MIN_WIDTH}×${MIN_HEIGHT}): ${results.small}`, 'yellow')
  log(`   Errors: ${results.errors}`, 'red')

  if (smallImages.length === 0) {
    log(
      '\n🎉 No small images found! All images meet size requirements.',
      'green'
    )
    return
  }

  log('\n📋 SMALL IMAGES FOUND:', 'yellow')
  smallImages.forEach((img) => {
    const sizeKB = Math.round(img.fileSize / 1024)
    log(`   ${img.relativePath}`, 'reset')
    log(`     Size: ${img.width}×${img.height}px (${sizeKB} KB)`, 'yellow')
  })

  if (dryRun) {
    log('\n💡 DRY RUN MODE - No changes made', 'cyan')
    log('To fix these images, run:', 'cyan')
    log('   node scripts/find-and-fix-small-images.js --fix', 'green')
  } else {
    log('\n🔧 FIXING SMALL IMAGES...', 'cyan')

    let fixed = 0
    for (const img of smallImages) {
      log(`\n🔨 Processing: ${img.relativePath}`, 'blue')
      if (upscaleImage(img.path, TARGET_WIDTH)) {
        fixed++
      }
    }

    log(`\n✨ COMPLETED: Fixed ${fixed}/${smallImages.length} images`, 'green')
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log(`❌ Script failed: ${error.message}`, 'red')
    process.exit(1)
  })
}

export { analyzeImages, getImageDimensions, upscaleImage }
