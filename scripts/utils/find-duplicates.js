#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const contentDir = './content'

function findDuplicates(type) {
  const dir = join(contentDir, type)
  const files = readdirSync(dir).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_')
  )

  const contentMap = new Map()
  const titleMap = new Map()
  const filenameMap = new Map()

  console.log(`\n=== ${type.toUpperCase()} DUPLICATES ===\n`)

  files.forEach((file) => {
    const filePath = join(dir, file)
    const content = readFileSync(filePath, 'utf-8')

    // Extract title from frontmatter
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Check for duplicate filenames (case insensitive)
    const lowerFilename = file.toLowerCase()
    if (filenameMap.has(lowerFilename)) {
      filenameMap.get(lowerFilename).push(file)
    } else {
      filenameMap.set(lowerFilename, [file])
    }

    // Check for duplicate content (ignoring whitespace)
    const normalizedContent = content.replace(/\s+/g, ' ').trim()
    if (contentMap.has(normalizedContent)) {
      contentMap.get(normalizedContent).push(file)
    } else {
      contentMap.set(normalizedContent, [file])
    }

    // Check for duplicate titles
    if (title) {
      const normalizedTitle = title.toLowerCase().trim()
      if (titleMap.has(normalizedTitle)) {
        titleMap.get(normalizedTitle).push(file)
      } else {
        titleMap.set(normalizedTitle, [file])
      }
    }
  })

  let foundDuplicates = false

  // Report filename duplicates
  for (const [filename, fileList] of filenameMap) {
    if (fileList.length > 1) {
      console.log(`📁 DUPLICATE FILENAMES:`)
      fileList.forEach((file) => {
        console.log(
          `   /Users/drew/Documents/_work/WakeUpNPC2/content/${type}/${file}`
        )
      })
      console.log()
      foundDuplicates = true
    }
  }

  // Report content duplicates
  for (const [content, fileList] of contentMap) {
    if (fileList.length > 1) {
      console.log(`📄 DUPLICATE CONTENT:`)
      fileList.forEach((file) => {
        console.log(
          `   /Users/drew/Documents/_work/WakeUpNPC2/content/${type}/${file}`
        )
      })
      console.log()
      foundDuplicates = true
    }
  }

  // Report title duplicates
  for (const [title, fileList] of titleMap) {
    if (fileList.length > 1) {
      console.log(`📝 DUPLICATE TITLES: "${title}"`)
      fileList.forEach((file) => {
        console.log(
          `   /Users/drew/Documents/_work/WakeUpNPC2/content/${type}/${file}`
        )
      })
      console.log()
      foundDuplicates = true
    }
  }

  if (!foundDuplicates) {
    console.log(`✅ No duplicates found in ${type}`)
  }
}

// Check all content types
findDuplicates('claims')
findDuplicates('quotes')
findDuplicates('memes')

console.log('\n=== SUMMARY ===')
console.log(
  'Check the paths above - you can Command+Click them in VS Code to open the files'
)
