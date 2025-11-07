#!/usr/bin/env node

/**
 * Update Markdown Image References Script for WakeUpNPC
 *
 * This script updates image references in markdown files from .jpg/.jpeg to .webp
 * after you've converted the images using convert-images-to-webp.js
 *
 * Usage:
 *   node scripts/update-markdown-image-refs.js [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be changed without actually changing files
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

// Directories to process
const contentDirs = [
  path.join(__dirname, '../content/memes'),
  path.join(__dirname, '../content/quotes'),
  path.join(__dirname, '../content/grifts'),
  path.join(__dirname, '../content/profiles'),
]

// Statistics
const stats = {
  totalFiles: 0,
  filesChanged: 0,
  referencesUpdated: 0,
}

/**
 * Get all markdown files recursively from a directory
 */
function getMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`)
    return fileList
  }

  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getMarkdownFiles(filePath, fileList)
    } else if (/\.md$/i.test(file)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * Update image references in a markdown file
 */
function updateMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  let updatedContent = content
  let changeCount = 0

  // Pattern to match image references in markdown
  // Matches: ![alt](path/to/image.jpg) or image: /path/to/image.jpeg
  const patterns = [
    // Markdown image syntax: ![alt](image.jpg)
    /!\[([^\]]*)\]\(([^)]+\.jpe?g)\)/gi,
    // YAML frontmatter image fields: image: /path/to/image.jpg
    /(image|thumbnail|cover|photo):\s*([^\s]+\.jpe?g)/gi,
    // HTML img tags: <img src="image.jpg">
    /<img\s+[^>]*src=["']([^"']+\.jpe?g)["']/gi,
  ]

  patterns.forEach((pattern) => {
    updatedContent = updatedContent.replace(pattern, (match, ...groups) => {
      // The last group before the offset is always the image path
      const imagePathIndex = groups.length - 3
      const imagePath = groups[imagePathIndex]

      if (!imagePath) return match

      // Check if corresponding .webp file exists
      const webpPath = imagePath.replace(/\.jpe?g$/i, '.webp')
      const fullImagePath = path.join(path.dirname(filePath), imagePath)
      const fullWebpPath = path.join(path.dirname(filePath), webpPath)

      // For absolute paths starting with /
      const publicImagePath = imagePath.startsWith('/')
        ? path.join(__dirname, '../public', imagePath)
        : fullImagePath
      const publicWebpPath = imagePath.startsWith('/')
        ? path.join(__dirname, '../public', webpPath)
        : fullWebpPath

      // Check if WebP version exists
      if (
        fs.existsSync(publicWebpPath) ||
        fs.existsSync(fullWebpPath.replace(/^\//, ''))
      ) {
        changeCount++
        return match.replace(imagePath, webpPath)
      }

      return match
    })
  })

  if (changeCount > 0) {
    stats.filesChanged++
    stats.referencesUpdated += changeCount

    if (isDryRun) {
      console.log(
        `🔍 Would update ${changeCount} reference(s) in: ${path.basename(filePath)}`
      )
    } else {
      fs.writeFileSync(filePath, updatedContent, 'utf-8')
      console.log(
        `✅ Updated ${changeCount} reference(s) in: ${path.basename(filePath)}`
      )
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📝 WakeUpNPC Markdown Image Reference Updater')
  console.log('=============================================\n')

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n')
  }

  // Collect all markdown files
  const allMarkdownFiles = []
  contentDirs.forEach((dir) => {
    const files = getMarkdownFiles(dir)
    allMarkdownFiles.push(...files)
    console.log(
      `📁 Found ${files.length} markdown files in ${path.basename(dir)}`
    )
  })

  stats.totalFiles = allMarkdownFiles.length
  console.log(`\n📊 Total markdown files to process: ${stats.totalFiles}\n`)

  if (stats.totalFiles === 0) {
    console.log('✨ No markdown files to process!')
    return
  }

  // Process files
  console.log('🔄 Processing files...\n')
  for (const filePath of allMarkdownFiles) {
    updateMarkdownFile(filePath)
  }

  // Print summary
  console.log('\n=============================================')
  console.log('📊 Update Summary')
  console.log('=============================================')
  console.log(`Total files processed: ${stats.totalFiles}`)
  console.log(`Files changed: ${stats.filesChanged}`)
  console.log(`Image references updated: ${stats.referencesUpdated}`)

  console.log('\n✨ Done!')

  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to actually update the files')
  }

  if (stats.filesChanged > 0 && !isDryRun) {
    console.log('\n📝 Next steps:')
    console.log('  1. Review the changes with git diff')
    console.log('  2. Test the site to ensure images load correctly')
    console.log('  3. Commit the changes')
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
