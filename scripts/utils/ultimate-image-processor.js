#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
 * Ultimate image processing pipeline
 */
async function processAllImages() {
  const args = process.argv.slice(2)
  const targetDir = args[0]
    ? path.resolve(args[0])
    : path.join(__dirname, '..', 'public', 'memes')

  log('🖼️  WakeUpNPC Ultimate Image Processor', 'magenta')
  log('='.repeat(50), 'magenta')

  // Check if ImageMagick is available
  try {
    execSync('which identify', { stdio: 'ignore' })
    execSync('which mogrify', { stdio: 'ignore' })
  } catch (error) {
    log('❌ ImageMagick not found! Please install it:', 'red')
    log('   macOS: brew install imagemagick', 'yellow')
    process.exit(1)
  }

  log(`🎯 Target directory: ${targetDir}`, 'blue')

  try {
    // STEP 1: Fix small images first (upscale before optimization)
    log('\n📈 STEP 1: Detecting and fixing small images...', 'cyan')
    execSync(
      `node "${path.join(__dirname, 'find-and-fix-small-images.js')}" --fix`,
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      }
    )

    // STEP 2: Rename files to safe, descriptive names
    log('\n📝 STEP 2: Renaming files to safe names...', 'cyan')
    execSync(
      `node "${path.join(__dirname, 'run-image-processing.js')}" "${targetDir}"`,
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      }
    )

    log('\n✨ ALL PROCESSING COMPLETE!', 'green')
    log('🎉 Your images are now:', 'green')
    log('   • Properly sized (min 400×300px)', 'green')
    log('   • Safely named for web', 'green')
    log('   • Optimized for performance', 'green')
    log('   • Converted to PNG format', 'green')
  } catch (error) {
    log(`❌ Processing failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the ultimate processor
if (import.meta.url === `file://${process.argv[1]}`) {
  processAllImages()
}

export { processAllImages }
