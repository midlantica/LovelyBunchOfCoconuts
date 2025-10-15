#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const griftsDir = path.join(process.cwd(), 'content/grifts')

if (!fs.existsSync(griftsDir)) {
  console.log('Grifts directory does not exist')
  process.exit(1)
}

const files = fs
  .readdirSync(griftsDir)
  .filter((file) => file.endsWith('.md'))
  .filter((file) => !file.startsWith('_'))
  .filter((file) => !file.toLowerCase().includes('readme'))

let processedCount = 0
let errorCount = 0

for (const file of files) {
  const filePath = path.join(griftsDir, file)

  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // Find the frontmatter section (between two --- markers)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/m)

    if (frontmatterMatch) {
      // Keep only the frontmatter (including the closing ---)
      const newContent = frontmatterMatch[0]

      // Write back only if there was body content to remove
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8')
        processedCount++
      }
    } else {
      console.log(`⚠️  No frontmatter found in: ${file}`)
      errorCount++
    }
  } catch (error) {
    console.error(
      `❌ Error processing ${file}:`,
      error instanceof Error ? error.message : String(error)
    )
    errorCount++
  }
}

console.log(`\n✅ Processed ${processedCount} files`)
console.log(`📁 Total files: ${files.length}`)
if (errorCount > 0) {
  console.log(`⚠️  Errors: ${errorCount}`)
}
console.log('\n🔄 Run: node scripts/regenerate-content-json.js')
