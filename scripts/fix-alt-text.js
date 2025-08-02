#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to create a title from filename (same logic as create-matching-markdown.js)
function createTitle(filename) {
  // Remove extension and replace hyphens with spaces
  const base = path.basename(filename, path.extname(filename))

  // Replace hyphens with spaces and use sentence case (only first letter capitalized)
  const words = base.split('-').map((word) => word.toLowerCase())
  if (words.length > 0) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  }
  return words.join(' ')
}

// Function to process a single markdown file
async function processMarkdownFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')

    // Look for image markdown pattern: ![alt-text](image-path)
    const imageRegex = /!\[([^\]]+)\]\(([^)]+)\)/g

    let updatedContent = content
    let hasChanges = false

    // Replace each image's alt text
    updatedContent = content.replace(
      imageRegex,
      (match, altText, imagePath) => {
        // Check if alt text contains dashes (indicating it needs fixing)
        if (altText.includes('-')) {
          // Create proper title from the alt text
          const properTitle = createTitle(altText)
          hasChanges = true
          console.log(`  Updating alt text: "${altText}" → "${properTitle}"`)
          return `![${properTitle}](${imagePath})`
        }
        return match
      }
    )

    // Write back to file if changes were made
    if (hasChanges) {
      await fs.writeFile(filePath, updatedContent, 'utf8')
      return true
    }

    return false
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`)
    return false
  }
}

// Function to recursively process all markdown files in a directory
async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    let totalProcessed = 0
    let totalUpdated = 0

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        const result = await processDirectory(fullPath)
        totalProcessed += result.processed
        totalUpdated += result.updated
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Process markdown files
        console.log(`Processing: ${path.relative(process.cwd(), fullPath)}`)
        totalProcessed++

        const wasUpdated = await processMarkdownFile(fullPath)
        if (wasUpdated) {
          totalUpdated++
        }
      }
    }

    return { processed: totalProcessed, updated: totalUpdated }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}: ${error.message}`)
    return { processed: 0, updated: 0 }
  }
}

// Main function
async function main() {
  const contentMemesDir = path.join(__dirname, '..', 'content', 'memes')

  console.log('🔧 Fixing alt text in markdown files...')
  console.log(`Target directory: ${contentMemesDir}\n`)

  try {
    // Check if directory exists
    await fs.access(contentMemesDir)

    const result = await processDirectory(contentMemesDir)

    console.log('\n✅ Alt text fixing complete!')
    console.log(`📊 Summary:`)
    console.log(`   Files processed: ${result.processed}`)
    console.log(`   Files updated: ${result.updated}`)
    console.log(`   Files unchanged: ${result.processed - result.updated}`)
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the script
main()
