#!/usr/bin/env node

/**
 * Find duplicate meme files across different directories
 * Compares files by title to identify duplicates
 */

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const MEMES_DIR = path.join(__dirname, '../content/memes')

// Recursively get all .md files
function getAllMdFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getAllMdFiles(filePath, fileList)
    } else if (file.endsWith('.md')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Extract title and content from markdown file
function getFileInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = matter(content)
    const fileSize = fs.statSync(filePath).size
    return {
      title: parsed.data.title || null,
      content: content,
      size: fileSize,
      path: filePath,
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
    return null
  }
}

// Compare two files to see if they're identical
function areFilesIdentical(file1, file2) {
  return file1.content === file2.content
}

// Main function
function findDuplicates() {
  console.log('🔍 Searching for duplicate memes...\n')

  const allFiles = getAllMdFiles(MEMES_DIR)
  const titleMap = new Map() // title -> [file info objects]

  // Build map of titles to file info
  allFiles.forEach((filePath) => {
    const fileInfo = getFileInfo(filePath)
    if (fileInfo && fileInfo.title) {
      const normalizedTitle = fileInfo.title.toLowerCase().trim()
      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, [])
      }
      titleMap.get(normalizedTitle).push(fileInfo)
    }
  })

  // Find duplicates
  const duplicates = []
  titleMap.forEach((files, title) => {
    if (files.length > 1) {
      duplicates.push({ title, files })
    }
  })

  // Report results
  if (duplicates.length === 0) {
    console.log('✅ No duplicate memes found!')
    return
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate meme(s):\n`)
  console.log('='.repeat(80))
  console.log()

  duplicates.forEach(({ title, files }, index) => {
    console.log(`\n${index + 1}. Title: "${title}"`)
    console.log('-'.repeat(80))

    // Check if files are identical
    const allIdentical = files.every(
      (f, i) => i === 0 || areFilesIdentical(files[0], f)
    )

    if (allIdentical) {
      console.log('   ⚠️  EXACT DUPLICATES - Files are identical!')
    } else {
      console.log('   ℹ️  Files have same title but different content')
    }

    console.log()
    files.forEach((file, i) => {
      const relativePath = path.relative(process.cwd(), file.path)
      console.log(`   ${String.fromCharCode(65 + i)}. ${relativePath}`)
      console.log(`      Size: ${file.size} bytes`)
      console.log(`      Full path: ${file.path}`)
      console.log()
    })

    console.log('   💡 To open in VS Code:')
    files.forEach((file, i) => {
      const relativePath = path.relative(process.cwd(), file.path)
      console.log(`      code "${relativePath}"`)
    })
    console.log()
  })

  console.log('='.repeat(80))
  console.log()
  console.log('📋 SUMMARY:')
  console.log(`   Total duplicates found: ${duplicates.length}`)

  const exactDuplicates = duplicates.filter(({ files }) =>
    files.every((f, i) => i === 0 || areFilesIdentical(files[0], f))
  )
  console.log(
    `   Exact duplicates (safe to delete one): ${exactDuplicates.length}`
  )
  console.log(
    `   Different content (review carefully): ${duplicates.length - exactDuplicates.length}`
  )
  console.log()
  console.log('💡 RECOMMENDATION:')
  console.log('   1. Review each duplicate pair above')
  console.log(
    '   2. For exact duplicates, delete the one in the less appropriate directory'
  )
  console.log(
    '   3. For different content, review both and decide which to keep'
  )
  console.log(
    '   4. The deduplication system prevents them from showing in search'
  )
  console.log('   5. Cleaning up source files improves maintainability')
  console.log()
}

// Run the script
try {
  findDuplicates()
} catch (error) {
  console.error('Error:', error.message)
  process.exit(1)
}
