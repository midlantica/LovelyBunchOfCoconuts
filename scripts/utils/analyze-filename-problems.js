#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Find and analyze duplicate markdown files and problematic filenames
 */
async function analyzeDuplicatesAndProblems() {
  const baseContentDir = path.join(__dirname, '..', 'content', 'memes')

  // Track image paths to detect duplicates
  const imageToMarkdown = new Map()
  const problems = {
    tripleHyphens: [],
    truncatedNames: [],
    duplicates: [],
  }

  try {
    // Get all subdirectories (excluding those starting with underscore)
    const subdirs = await fs.readdir(baseContentDir, { withFileTypes: true })
    const subdirNames = subdirs
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
      .map((entry) => entry.name)

    console.log(`🔍 Analyzing ${subdirNames.length} subdirectories...\n`)

    for (const subdir of subdirNames) {
      const markdownDir = path.join(baseContentDir, subdir)

      try {
        const mdFiles = await fs.readdir(markdownDir)
        const markdownFiles = mdFiles.filter((file) => file.endsWith('.md'))

        for (const mdFile of markdownFiles) {
          const mdPath = path.join(markdownDir, mdFile)
          const relativePath = `content/memes/${subdir}/${mdFile}`

          // Check for triple hyphens
          if (mdFile.includes('---')) {
            problems.tripleHyphens.push(relativePath)
          }

          // Check for truncated names (ending mid-word)
          const basename = path.basename(mdFile, '.md')
          if (
            basename.length > 20 &&
            !basename.match(/\d{4}$/) &&
            !basename.match(/[a-z](?:ing|tion|sion|ness|ment|able|ible)$/) &&
            basename.match(/[a-z]$/)
          ) {
            // Likely truncated if it's long and ends with a random letter
            const lastWord = basename.split('-').pop()
            if (lastWord && lastWord.length < 4 && !lastWord.match(/^\d+$/)) {
              problems.truncatedNames.push(relativePath)
            }
          }

          // Read the markdown to get image path
          try {
            const content = await fs.readFile(mdPath, 'utf8')
            const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/)

            if (imageMatch) {
              const imagePath = imageMatch[1]

              if (imageToMarkdown.has(imagePath)) {
                // Found duplicate!
                const existing = imageToMarkdown.get(imagePath)
                problems.duplicates.push({
                  imagePath,
                  files: [existing, relativePath],
                })
              } else {
                imageToMarkdown.set(imagePath, relativePath)
              }
            }
          } catch (readError) {
            console.log(`⚠️  Could not read ${relativePath}`)
          }
        }
      } catch (dirError) {
        console.log(`⚠️  Could not read directory ${subdir}`)
      }
    }

    // Report findings
    console.log(`📊 ANALYSIS RESULTS:\n`)

    console.log(`🔗 Triple Hyphens (${problems.tripleHyphens.length}):`)
    problems.tripleHyphens.forEach((file) => console.log(`  - ${file}`))

    console.log(`\n✂️  Truncated Names (${problems.truncatedNames.length}):`)
    problems.truncatedNames.forEach((file) => console.log(`  - ${file}`))

    console.log(`\n👥 Duplicates (${problems.duplicates.length} sets):`)
    problems.duplicates.forEach((dup) => {
      console.log(`  Image: ${dup.imagePath}`)
      dup.files.forEach((file) => console.log(`    - ${file}`))
      console.log()
    })

    return problems
  } catch (error) {
    console.error(`Error analyzing files: ${error.message}`)
    return problems
  }
}

// Run analysis
analyzeDuplicatesAndProblems().then((problems) => {
  console.log(`\n🎯 SUMMARY:`)
  console.log(`Files with triple hyphens: ${problems.tripleHyphens.length}`)
  console.log(`Files with truncated names: ${problems.truncatedNames.length}`)
  console.log(`Duplicate image sets: ${problems.duplicates.length}`)
})
