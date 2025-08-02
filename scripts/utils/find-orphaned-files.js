#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Find orphaned images and markdown files
 */
async function findOrphanedFiles() {
  const baseContentDir = path.join(__dirname, '..', 'content', 'memes')
  const basePublicDir = path.join(__dirname, '..', 'public', 'memes')

  const orphans = {
    imagesWithoutMarkdown: [],
    markdownWithoutImages: [],
  }

  try {
    // Get all subdirectories
    const contentSubdirs = await fs.readdir(baseContentDir, {
      withFileTypes: true,
    })
    const subdirNames = contentSubdirs
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(
      `🔍 Checking for orphaned files in ${subdirNames.length} subdirectories...\n`
    )

    for (const subdir of subdirNames) {
      const markdownDir = path.join(baseContentDir, subdir)
      const imageDir = path.join(basePublicDir, subdir)

      // Check if both directories exist
      const markdownDirExists = await fs
        .access(markdownDir)
        .then(() => true)
        .catch(() => false)
      const imageDirExists = await fs
        .access(imageDir)
        .then(() => true)
        .catch(() => false)

      if (!markdownDirExists && !imageDirExists) {
        continue // Skip if neither exists
      }

      // Get markdown files
      let markdownFiles = []
      if (markdownDirExists) {
        try {
          const mdFiles = await fs.readdir(markdownDir)
          markdownFiles = mdFiles.filter((file) => file.endsWith('.md'))
        } catch (error) {
          console.log(
            `⚠️  Could not read markdown directory ${subdir}: ${error.message}`
          )
        }
      }

      // Get image files
      let imageFiles = []
      if (imageDirExists) {
        try {
          const imgFiles = await fs.readdir(imageDir)
          imageFiles = imgFiles.filter((file) =>
            /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
          )
        } catch (error) {
          console.log(
            `⚠️  Could not read image directory ${subdir}: ${error.message}`
          )
        }
      }

      // Create maps for comparison
      const markdownBasenames = new Set(
        markdownFiles.map((file) => path.basename(file, '.md'))
      )

      const imageBasenames = new Set(
        imageFiles.map((file) => path.basename(file, path.extname(file)))
      )

      // Find orphaned images (images without corresponding markdown)
      for (const imageFile of imageFiles) {
        const imageBasename = path.basename(imageFile, path.extname(imageFile))

        // Check if there's a markdown file with the same basename
        if (!markdownBasenames.has(imageBasename)) {
          // Also check for similar names (truncated matches)
          let hasMatch = false
          for (const mdBasename of markdownBasenames) {
            if (
              mdBasename.startsWith(imageBasename) ||
              imageBasename.startsWith(mdBasename)
            ) {
              hasMatch = true
              break
            }
          }

          if (!hasMatch) {
            orphans.imagesWithoutMarkdown.push(
              `public/memes/${subdir}/${imageFile}`
            )
          }
        }
      }

      // Find orphaned markdown files (markdown without corresponding images)
      for (const markdownFile of markdownFiles) {
        const mdPath = path.join(markdownDir, markdownFile)

        try {
          // Read the markdown to see what image it expects
          const content = await fs.readFile(mdPath, 'utf8')
          const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/)

          if (imageMatch) {
            const imagePath = imageMatch[1]
            // Extract the actual filename from the path
            const expectedImageFile = path.basename(imagePath)

            // Check if this image file exists in the corresponding directory
            const fullImagePath = path.join(
              __dirname,
              '..',
              'public',
              imagePath.replace(/^\//, '')
            )
            const imageExists = await fs
              .access(fullImagePath)
              .then(() => true)
              .catch(() => false)

            if (!imageExists) {
              orphans.markdownWithoutImages.push({
                markdown: `content/memes/${subdir}/${markdownFile}`,
                expectedImage: imagePath,
                fullImagePath: fullImagePath,
              })
            }
          } else {
            // Markdown file has no image reference at all
            orphans.markdownWithoutImages.push({
              markdown: `content/memes/${subdir}/${markdownFile}`,
              expectedImage: 'NO IMAGE REFERENCE',
              fullImagePath: 'N/A',
            })
          }
        } catch (readError) {
          console.log(
            `⚠️  Could not read ${markdownFile}: ${readError.message}`
          )
        }
      }
    }

    // Report findings
    console.log(`📊 ORPHAN ANALYSIS RESULTS:\n`)

    console.log(
      `🖼️  Images without markdown files (${orphans.imagesWithoutMarkdown.length}):`
    )
    if (orphans.imagesWithoutMarkdown.length === 0) {
      console.log(`   ✅ No orphaned images found!`)
    } else {
      orphans.imagesWithoutMarkdown.forEach((file) =>
        console.log(`   - ${file}`)
      )
    }

    console.log(
      `\n📝 Markdown files without images (${orphans.markdownWithoutImages.length}):`
    )
    if (orphans.markdownWithoutImages.length === 0) {
      console.log(`   ✅ No orphaned markdown files found!`)
    } else {
      orphans.markdownWithoutImages.forEach((item) => {
        console.log(`   - ${item.markdown}`)
        console.log(`     Expected: ${item.expectedImage}`)
        if (item.fullImagePath !== 'N/A') {
          console.log(`     Full path: ${item.fullImagePath}`)
        }
        console.log()
      })
    }

    console.log(`\n🎯 ORPHAN SUMMARY:`)
    console.log(`Orphaned images: ${orphans.imagesWithoutMarkdown.length}`)
    console.log(`Orphaned markdown: ${orphans.markdownWithoutImages.length}`)

    if (
      orphans.imagesWithoutMarkdown.length === 0 &&
      orphans.markdownWithoutImages.length === 0
    ) {
      console.log(`\n🎉 Perfect! All files are properly paired!`)
    }

    return orphans
  } catch (error) {
    console.error(`Error finding orphaned files: ${error.message}`)
    return orphans
  }
}

// Run analysis
findOrphanedFiles()
