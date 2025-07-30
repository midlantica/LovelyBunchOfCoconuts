#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to convert dash-separated title to sentence case
function dashesToSentence(title) {
  return title
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Function to recursively find all .md files in memes directory
function findMemeFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    if (item.startsWith('_')) continue // Skip ignored files

    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findMemeFiles(fullPath))
    } else if (item.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

// Function to process a single meme file
function processMemeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')

    // Find the title line in frontmatter
    let titleLineIndex = -1
    let inFrontmatter = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true
        } else {
          break // End of frontmatter
        }
        continue
      }

      if (inFrontmatter && line.startsWith('title:')) {
        titleLineIndex = i
        break
      }
    }

    if (titleLineIndex === -1) {
      console.log(`⚠️  No title found in: ${filePath}`)
      return false
    }

    // Extract current title
    const titleLine = lines[titleLineIndex]
    const titleMatch = titleLine.match(/title:\s*['"](.*?)['"]/)

    if (!titleMatch) {
      console.log(`⚠️  Could not parse title in: ${filePath}`)
      return false
    }

    const currentTitle = titleMatch[1]
    const newTitle = dashesToSentence(currentTitle)

    // Skip if no dashes to convert
    if (currentTitle === newTitle) {
      return false
    }

    // Update the title line
    lines[titleLineIndex] = `title: '${newTitle}'`

    // Write back to file
    const newContent = lines.join('\n')
    fs.writeFileSync(filePath, newContent, 'utf8')

    console.log(`✅ Updated: ${path.basename(filePath)}`)
    console.log(`   From: "${currentTitle}"`)
    console.log(`   To:   "${newTitle}"`)

    return true
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return false
  }
}

// Main execution
function main() {
  const memesDir = path.resolve(__dirname, '../content/memes')

  if (!fs.existsSync(memesDir)) {
    console.error('❌ Memes directory not found:', memesDir)
    process.exit(1)
  }

  console.log('🔍 Finding meme files...')
  const memeFiles = findMemeFiles(memesDir)
  console.log(`📄 Found ${memeFiles.length} meme files`)

  console.log('\n🔄 Processing titles...')
  let updatedCount = 0

  for (const filePath of memeFiles) {
    if (processMemeFile(filePath)) {
      updatedCount++
    }
  }

  console.log(`\n✨ Complete! Updated ${updatedCount} meme titles.`)
}

main()
