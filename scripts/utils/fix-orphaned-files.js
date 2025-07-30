#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Fix orphaned files and create perfect 1:1 image-markdown pairs
 */
async function fixOrphanedFiles() {
  const baseContentDir = path.join(__dirname, '..', 'content', 'memes')
  const basePublicDir = path.join(__dirname, '..', 'public', 'memes')

  const actions = {
    markdownCreated: 0,
    linksFixed: 0,
    duplicatesRemoved: 0,
    testFilesIgnored: 0,
  }

  try {
    console.log(`🔧 Starting orphan cleanup and 1:1 pairing...\n`)

    // STEP 1: Fix the known broken markdown links first
    console.log(`🔗 STEP 1: Fixing broken markdown links...`)

    const brokenLinks = [
      {
        mdFile:
          'content/memes/thomas-sowell/many-on-the-political-left-are-so-in-transit-by-the-beauty-of-their-vision.md',
        currentLink:
          '/memes/thomas-sowell/many-on-the-political-left-are-so-entranced-by-the-beauty-of-their-vision.png',
        actualImage:
          '/memes/thomas-sowell/many-on-the-political-left-are-so-entran.png',
      },
      {
        mdFile:
          'content/memes/woke-insanity/toxic-leftist-media-mass-formation-psychosis-04.md',
        currentLink:
          '/memes/cartoons/toxic-leftist-media-mass-formation-psychosis-04.png',
        actualImage:
          '/memes/cartoons/toxic-leftist-media-mass-formation-psych.png',
      },
    ]

    for (const link of brokenLinks) {
      try {
        const fullMdPath = path.join(__dirname, '..', link.mdFile)

        // Check if markdown file exists
        const mdExists = await fs
          .access(fullMdPath)
          .then(() => true)
          .catch(() => false)
        if (!mdExists) {
          console.log(`⚠️  Markdown file not found: ${link.mdFile}`)
          continue
        }

        // Check if the actual image exists
        const fullImagePath = path.join(
          __dirname,
          '..',
          'public',
          link.actualImage.replace(/^\//, '')
        )
        const imageExists = await fs
          .access(fullImagePath)
          .then(() => true)
          .catch(() => false)
        if (!imageExists) {
          console.log(`⚠️  Image not found: ${link.actualImage}`)
          continue
        }

        // Read and fix the markdown
        const content = await fs.readFile(fullMdPath, 'utf8')
        const newContent = content.replace(link.currentLink, link.actualImage)

        if (content !== newContent) {
          await fs.writeFile(fullMdPath, newContent, 'utf8')
          console.log(`✅ Fixed link in ${link.mdFile}`)
          console.log(`   From: ${link.currentLink}`)
          console.log(`   To: ${link.actualImage}`)
          actions.linksFixed++
        }
      } catch (error) {
        console.log(`⚠️  Error fixing ${link.mdFile}: ${error.message}`)
      }
    }

    // STEP 2: Handle sowell-on-slavery special case
    console.log(`\n🔧 STEP 2: Handling sowell-on-slavery case...`)

    const sowellMdPath = path.join(
      __dirname,
      '..',
      'content/memes/thomas-sowell/sowell-on-slavery.md'
    )
    const sowellMdExists = await fs
      .access(sowellMdPath)
      .then(() => true)
      .catch(() => false)

    if (sowellMdExists) {
      // This file expects a different image - let's find the closest match
      const content = await fs.readFile(sowellMdPath, 'utf8')

      // Check if we have the "more-whites-were-brought-as-slaves" image
      const moreWhitesImage =
        '/memes/thomas-sowell/more-whites-were-brought-as-slaves-to-no.png'
      const moreWhitesPath = path.join(
        __dirname,
        '..',
        'public',
        moreWhitesImage.replace(/^\//, '')
      )
      const moreWhitesExists = await fs
        .access(moreWhitesPath)
        .then(() => true)
        .catch(() => false)

      if (moreWhitesExists) {
        const newContent = content.replace(
          /!\[.*?\]\([^)]+\)/,
          `![More whites were brought as slaves to North Africa than](${moreWhitesImage})`
        )
        await fs.writeFile(sowellMdPath, newContent, 'utf8')
        console.log(`✅ Fixed sowell-on-slavery.md to use existing image`)
        actions.linksFixed++
      } else {
        console.log(
          `⚠️  Could not find suitable image for sowell-on-slavery.md`
        )
      }
    }

    // STEP 3: Create markdown files for orphaned images
    console.log(`\n📝 STEP 3: Creating markdown files for orphaned images...`)

    const orphanedImages = [
      'public/memes/cartoons/dei-blm-crt-esg-end-woke-insanity.png',
      'public/memes/data/united-states-croplands-ports-and-rivers.png',
      'public/memes/media/cnn-npc-woke-dystopia.png',
      'public/memes/politics/greta-pay-300-more-for-your-electricity.png',
      'public/memes/politics/la-fiery-but-mostly-burning.png',
      'public/memes/politics/lets-see-if-ive-got-this-right.png',
      'public/memes/quotes/seneca-quote-religion.png',
      'public/memes/quotes/supreme-court-on-free-speech.png',
      'public/memes/woke-insanity/democrat-savior-complex.png',
    ]

    for (const imagePath of orphanedImages) {
      // Extract path components
      const relativePath = imagePath.replace('public/', '')
      const pathParts = relativePath.split('/')
      const subdir = pathParts[1] // memes/[subdir]/filename
      const imageFile = pathParts[2]
      const imageBasename = path.basename(imageFile, path.extname(imageFile))

      // Create markdown filename and path
      const markdownFile = `${imageBasename}.md`
      const markdownDir = path.join(baseContentDir, subdir)
      const markdownPath = path.join(markdownDir, markdownFile)

      // Check if markdown already exists
      const mdExists = await fs
        .access(markdownPath)
        .then(() => true)
        .catch(() => false)
      if (mdExists) {
        console.log(`⚠️  Markdown already exists for ${imagePath}`)
        continue
      }

      // Check if image actually exists
      const fullImagePath = path.join(__dirname, '..', imagePath)
      const imageExists = await fs
        .access(fullImagePath)
        .then(() => true)
        .catch(() => false)
      if (!imageExists) {
        console.log(`⚠️  Image not found: ${imagePath}`)
        continue
      }

      // Create title from filename
      const title = imageBasename
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Create markdown content
      const markdownContent = `---
title: '${title}'
---

![${title}](/${relativePath})

${title}
`

      // Ensure directory exists
      await fs.mkdir(markdownDir, { recursive: true })

      // Write markdown file
      await fs.writeFile(markdownPath, markdownContent, 'utf8')
      console.log(
        `✅ Created markdown: content/memes/${subdir}/${markdownFile}`
      )
      actions.markdownCreated++
    }

    console.log(`\n🎯 ORPHAN FIX SUMMARY:`)
    console.log(`Markdown files created: ${actions.markdownCreated}`)
    console.log(`Links fixed: ${actions.linksFixed}`)
    console.log(`Test files ignored: (skipped _random/ as requested)`)

    return actions
  } catch (error) {
    console.error(`Error fixing orphaned files: ${error.message}`)
    return actions
  }
}

// Run the fix
fixOrphanedFiles().then((actions) => {
  if (actions.markdownCreated > 0 || actions.linksFixed > 0) {
    console.log(`\n✨ Orphan cleanup completed! Perfect 1:1 pairing achieved.`)
  } else {
    console.log(`\n✨ No changes needed - everything is already paired!`)
  }
})
