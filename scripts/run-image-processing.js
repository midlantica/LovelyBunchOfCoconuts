#!/usr/bin/env node

import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { processImages } from './utils/imageProcessing.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)

/**
 * Process all subdirectories recursively
 */
async function processAllSubdirectories() {
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')

  try {
    const entries = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(`🔍 Found ${subdirs.length} subdirectories to process`)

    let totalProcessed = 0
    let totalExisting = 0
    const allNewFiles = []

    // Process each subdirectory
    for (const subdir of subdirs) {
      const subdirPath = path.join(baseMemeDir, subdir)
      console.log(`\n📂 Processing subdirectory: ${subdir}`)

      const result = await processImages(subdirPath)
      if (result) {
        totalProcessed += result.processedCount || 0
        totalExisting += result.existingCount || 0
        if (result.newFiles) {
          allNewFiles.push(
            ...result.newFiles.map((file) => `${subdir}/${file}`)
          )
        }
      }
    }

    // Final summary
    console.log(`\n🎯 GLOBAL SUMMARY:`)
    console.log(`Total Memes Existing: ${totalExisting}`)
    console.log(`Total New Files Created: ${totalProcessed}`)

    if (allNewFiles.length > 0) {
      console.log(`\nAll new image & markdown files created:`)
      allNewFiles.forEach((file) => {
        const mdFile = file.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '.md')
        console.log(`🆕 ${file} & ${mdFile}`)
      })
    }
  } catch (error) {
    console.error(`Error processing subdirectories: ${error.message}`)
    process.exit(1)
  }
}

const subdirName = args[0]

if (!subdirName) {
  // No argument = process ALL subdirectories recursively
  console.log(`Processing images in: ALL public/memes subdirectories`)
  processAllSubdirectories()
    .then(() => {
      console.log('\n✅ Global image processing complete.')
    })
    .catch((err) => {
      console.error('Global image processing failed:', err)
      process.exit(1)
    })
} else {
  // Specific subdirectory
  const targetDir = path.join(__dirname, '..', 'public', 'memes', subdirName)
  const displayPath = `public/memes/${subdirName}`
  console.log(`Processing images in: ${displayPath}`)

  processImages(targetDir)
    .then(() => {
      console.log('Image processing complete.')
    })
    .catch((err) => {
      console.error('Image processing failed:', err)
      process.exit(1)
    })
}
