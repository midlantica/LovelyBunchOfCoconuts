#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Clean up duplicate markdown files and fix problematic filenames
 */
async function cleanupFilenames() {
  const baseContentDir = path.join(__dirname, '..', 'content', 'memes')
  const publicMemesDir = path.join(__dirname, '..', 'public', 'memes')

  // Track image paths to detect duplicates
  const imageToMarkdown = new Map()
  const cleanupActions = {
    duplicatesRemoved: 0,
    tripleHyphensFixed: 0,
    truncatedNamesFound: 0,
  }

  try {
    // Get all subdirectories
    const subdirs = await fs.readdir(baseContentDir, { withFileTypes: true })
    const subdirNames = subdirs
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(
      `🧹 Starting cleanup of ${subdirNames.length} subdirectories...\n`
    )

    // STEP 1: Fix triple hyphens first
    console.log(`🔧 STEP 1: Fixing triple hyphens...`)

    const tripleHyphenFile =
      'content/memes/data/global-deaths-in-conflicts-since-the-year-1400---by-max-roser.md'
    const fixedHyphenFile =
      'content/memes/data/global-deaths-in-conflicts-since-the-year-1400-by-max-roser.md'

    try {
      const fullTriplePath = path.join(__dirname, '..', tripleHyphenFile)
      const fullFixedPath = path.join(__dirname, '..', fixedHyphenFile)

      await fs.rename(fullTriplePath, fullFixedPath)
      console.log(`✅ Fixed: ${tripleHyphenFile} → ${fixedHyphenFile}`)
      cleanupActions.tripleHyphensFixed++
    } catch (error) {
      console.log(`⚠️  Could not fix triple hyphens: ${error.message}`)
    }

    // STEP 2: Process duplicates
    console.log(`\n🔧 STEP 2: Finding and removing duplicates...`)

    for (const subdir of subdirNames) {
      const markdownDir = path.join(baseContentDir, subdir)

      try {
        const mdFiles = await fs.readdir(markdownDir)
        const markdownFiles = mdFiles.filter((file) => file.endsWith('.md'))

        for (const mdFile of markdownFiles) {
          const mdPath = path.join(markdownDir, mdFile)
          const relativePath = `content/memes/${subdir}/${mdFile}`

          // Read the markdown to get image path
          try {
            const content = await fs.readFile(mdPath, 'utf8')
            const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/)

            if (imageMatch) {
              const imagePath = imageMatch[1]

              if (imageToMarkdown.has(imagePath)) {
                // Found duplicate! Decide which one to keep
                const existing = imageToMarkdown.get(imagePath)

                // Keep the shorter filename (less truncated)
                const currentBasename = path.basename(mdFile, '.md')
                const existingBasename = path.basename(
                  existing.split('/').pop(),
                  '.md'
                )

                let fileToDelete, fileToKeep

                if (currentBasename.length < existingBasename.length) {
                  // Current file has shorter name, keep it, delete existing
                  fileToDelete = existing
                  fileToKeep = relativePath
                  imageToMarkdown.set(imagePath, relativePath)
                } else {
                  // Existing file has shorter name, keep existing, delete current
                  fileToDelete = relativePath
                  fileToKeep = existing
                }

                // Delete the longer filename
                try {
                  const deleteFullPath = path.join(
                    __dirname,
                    '..',
                    fileToDelete
                  )
                  await fs.unlink(deleteFullPath)
                  console.log(`🗑️  Deleted duplicate: ${fileToDelete}`)
                  console.log(`   Kept: ${fileToKeep}`)
                  cleanupActions.duplicatesRemoved++
                } catch (deleteError) {
                  console.log(
                    `⚠️  Could not delete ${fileToDelete}: ${deleteError.message}`
                  )
                }
              } else {
                imageToMarkdown.set(imagePath, relativePath)

                // Check if this is a truncated name
                const basename = path.basename(mdFile, '.md')
                if (
                  basename.length > 20 &&
                  !basename.match(/\d{4}$/) &&
                  basename.match(/[a-z]$/)
                ) {
                  const lastWord = basename.split('-').pop()
                  if (
                    lastWord &&
                    lastWord.length < 4 &&
                    !lastWord.match(/^\d+$/)
                  ) {
                    cleanupActions.truncatedNamesFound++
                  }
                }
              }
            }
          } catch (readError) {
            console.log(
              `⚠️  Could not read ${relativePath}: ${readError.message}`
            )
          }
        }
      } catch (dirError) {
        console.log(
          `⚠️  Could not read directory ${subdir}: ${dirError.message}`
        )
      }
    }

    console.log(`\n🎯 CLEANUP SUMMARY:`)
    console.log(`Triple hyphens fixed: ${cleanupActions.tripleHyphensFixed}`)
    console.log(`Duplicate files removed: ${cleanupActions.duplicatesRemoved}`)
    console.log(
      `Truncated filenames found: ${cleanupActions.truncatedNamesFound}`
    )

    if (cleanupActions.truncatedNamesFound > 0) {
      console.log(
        `\n📝 NOTE: ${cleanupActions.truncatedNamesFound} truncated filenames still need manual review.`
      )
      console.log(`These are files ending mid-word that may need better names.`)
    }

    return cleanupActions
  } catch (error) {
    console.error(`Error during cleanup: ${error.message}`)
    return cleanupActions
  }
}

// Run cleanup
cleanupFilenames().then((actions) => {
  if (actions.duplicatesRemoved > 0 || actions.tripleHyphensFixed > 0) {
    console.log(`\n✨ Cleanup completed! Your content is now cleaner.`)
  } else {
    console.log(`\n✨ No changes needed - everything looks good!`)
  }
})
