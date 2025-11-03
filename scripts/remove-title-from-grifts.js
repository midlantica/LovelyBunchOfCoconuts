#!/usr/bin/env node

/**
 * Script to remove redundant 'title' field from grift frontmatter
 * Keeps only 'grift' and 'decode' fields
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GRIFTS_DIR = path.join(__dirname, '../content/grifts')

// Process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')

  // Check if it's a markdown file with frontmatter
  if (!content.startsWith('---')) {
    console.log(`Skipping ${path.basename(filePath)} - no frontmatter`)
    return false
  }

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) {
    console.log(`Skipping ${path.basename(filePath)} - invalid frontmatter`)
    return false
  }

  const frontmatter = frontmatterMatch[1]
  const bodyContent = content.slice(frontmatterMatch[0].length)

  // Check if title exists
  if (!frontmatter.includes('title:')) {
    console.log(`Skipping ${path.basename(filePath)} - no title field`)
    return false
  }

  // Remove the title line
  const lines = frontmatter.split('\n')
  const filteredLines = lines.filter(
    (line) => !line.trim().startsWith('title:')
  )

  // Reconstruct the file
  const newContent = `---\n${filteredLines.join('\n')}\n---${bodyContent}`

  // Write back to file
  fs.writeFileSync(filePath, newContent, 'utf8')

  return true
}

// Main execution
async function main() {
  console.log('🔄 Removing title field from grift markdown files...\n')

  const files = fs
    .readdirSync(GRIFTS_DIR)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))

  let processedCount = 0
  let skippedCount = 0

  for (const file of files) {
    const filePath = path.join(GRIFTS_DIR, file)
    const processed = processFile(filePath)

    if (processed) {
      processedCount++
      console.log(`✓ Processed: ${file}`)
    } else {
      skippedCount++
    }
  }

  console.log(`\n✅ Complete!`)
  console.log(`   Processed: ${processedCount} files`)
  console.log(`   Skipped: ${skippedCount} files`)
}

main().catch(console.error)
