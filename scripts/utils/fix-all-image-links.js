#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Fix all markdown files to point to actual existing images
 */
async function fixAllImageLinks() {
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')
  const baseContentDir = path.join(__dirname, '..', 'content', 'memes')

  let fixedCount = 0
  let totalChecked = 0

  try {
    // Get all subdirectories
    const subdirs = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirNames = subdirs
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(
      `🔧 Fixing image links in ${subdirNames.length} subdirectories...\n`
    )

    for (const subdir of subdirNames) {
      const imageDir = path.join(baseMemeDir, subdir)
      const markdownDir = path.join(baseContentDir, subdir)

      // Check if markdown directory exists
      try {
        await fs.access(markdownDir)
      } catch {
        console.log(`⚠️  No markdown directory for ${subdir}, skipping`)
        continue
      }

      // Get all image files in this directory
      const imageFiles = await fs.readdir(imageDir)
      const images = imageFiles.filter((file) =>
        /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
      )

      // Create a map of image basenames to actual filenames
      const imageMap = new Map()
      images.forEach((imageFile) => {
        const basename = path.basename(imageFile, path.extname(imageFile))
        imageMap.set(basename, imageFile)
      })

      // Get all markdown files
      const mdFiles = await fs.readdir(markdownDir)
      const markdownFiles = mdFiles.filter((file) => file.endsWith('.md'))

      for (const mdFile of markdownFiles) {
        totalChecked++
        const mdPath = path.join(markdownDir, mdFile)
        const mdBasename = path.basename(mdFile, '.md')

        // Read markdown content
        let content = await fs.readFile(mdPath, 'utf8')

        // Look for the current image link
        const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/)
        if (!imageMatch) {
          console.log(`⚠️  No image link found in ${subdir}/${mdFile}`)
          continue
        }

        const currentImagePath = imageMatch[1]

        // Check if we have an actual image file for this markdown
        let actualImageFile = null

        // First try exact basename match
        if (imageMap.has(mdBasename)) {
          actualImageFile = imageMap.get(mdBasename)
        } else {
          // Try to find a similar image (truncated name)
          for (const [imageBasename, imageFile] of imageMap.entries()) {
            if (
              mdBasename.startsWith(imageBasename) ||
              imageBasename.startsWith(mdBasename)
            ) {
              actualImageFile = imageFile
              break
            }
          }
        }

        if (actualImageFile) {
          const correctImagePath = `/memes/${subdir}/${actualImageFile}`

          if (currentImagePath !== correctImagePath) {
            // Fix the image link
            const newContent = content.replace(
              /!\[.*?\]\([^)]+\)/,
              `![${mdBasename}](${correctImagePath})`
            )

            await fs.writeFile(mdPath, newContent, 'utf8')
            console.log(`✅ Fixed ${subdir}/${mdFile}`)
            console.log(`   Old: ${currentImagePath}`)
            console.log(`   New: ${correctImagePath}`)
            fixedCount++
          } else {
            console.log(`✅ ${subdir}/${mdFile} (already correct)`)
          }
        } else {
          console.log(`💀 ${subdir}/${mdFile} - no matching image found`)
        }
      }
    }

    console.log(`\n🎯 SUMMARY:`)
    console.log(`Total markdown files checked: ${totalChecked}`)
    console.log(`Image links fixed: ${fixedCount}`)
  } catch (error) {
    console.error(`Error fixing image links: ${error.message}`)
  }
}

// Run the fix
fixAllImageLinks()
