#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Check if markdown files have correct image links
 */
async function checkMarkdownLinks() {
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')
  const baseContentDir = path.join(__dirname, '..', 'content', 'memes')

  let brokenLinks = []
  let fixedLinks = 0
  let totalChecked = 0

  try {
    const subdirs = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirNames = subdirs
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(
      `🔍 Checking markdown links in ${subdirNames.length} subdirectories...\n`
    )

    for (const subdir of subdirNames) {
      const imageDir = path.join(baseMemeDir, subdir)
      const markdownDir = path.join(baseContentDir, subdir)

      // Check if markdown directory exists
      try {
        await fs.access(markdownDir)
      } catch {
        console.log(`⚠️  No markdown directory for ${subdir}`)
        continue
      }

      // Get all markdown files
      const mdFiles = await fs.readdir(markdownDir)
      const markdownFiles = mdFiles.filter((file) => file.endsWith('.md'))

      for (const mdFile of markdownFiles) {
        totalChecked++
        const mdPath = path.join(markdownDir, mdFile)
        const mdContent = await fs.readFile(mdPath, 'utf8')

        // Extract current image link from markdown
        const imageMatch = mdContent.match(/!\[.*?\]\(([^)]+)\)/)
        if (!imageMatch) {
          brokenLinks.push({
            markdown: `${subdir}/${mdFile}`,
            issue: 'No image link found in markdown',
            currentLink: 'none',
          })
          continue
        }

        const currentImagePath = imageMatch[1]
        // Remove leading slash if present
        const cleanImagePath = currentImagePath.startsWith('/')
          ? currentImagePath.slice(1)
          : currentImagePath

        // Check if the referenced image actually exists
        const expectedImagePath = path.join(
          __dirname,
          '..',
          'public',
          cleanImagePath
        )

        try {
          await fs.access(expectedImagePath)
          // Image exists - link is good
          console.log(`✅ ${subdir}/${mdFile} → ${cleanImagePath}`)
        } catch {
          // Image doesn't exist - broken link!
          const baseName = path.basename(mdFile, '.md')

          // Look for corresponding image file in the same subdirectory
          try {
            const imageFiles = await fs.readdir(imageDir)
            const matchingImage = imageFiles.find((file) => {
              const imageBaseName = path.basename(file, path.extname(file))
              return (
                imageBaseName === baseName &&
                /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
              )
            })

            if (matchingImage) {
              const correctImagePath = `/memes/${subdir}/${matchingImage}`

              brokenLinks.push({
                markdown: `${subdir}/${mdFile}`,
                issue: 'Broken image link',
                currentLink: currentImagePath,
                correctLink: correctImagePath,
                shouldFix: true,
              })

              console.log(`❌ ${subdir}/${mdFile}`)
              console.log(`   Current: ${currentImagePath}`)
              console.log(`   Should be: ${correctImagePath}`)
            } else {
              brokenLinks.push({
                markdown: `${subdir}/${mdFile}`,
                issue: 'No matching image file found',
                currentLink: currentImagePath,
                shouldFix: false,
              })

              console.log(`💀 ${subdir}/${mdFile} - no matching image found`)
            }
          } catch (dirError) {
            brokenLinks.push({
              markdown: `${subdir}/${mdFile}`,
              issue: 'Could not read image directory',
              currentLink: currentImagePath,
              shouldFix: false,
            })
            console.log(
              `💀 ${subdir}/${mdFile} - could not read image directory`
            )
          }
        }
      }
    }

    // Summary report
    console.log(`\n📊 LINK CHECK SUMMARY:`)
    console.log(`Total markdown files checked: ${totalChecked}`)
    console.log(`Broken links found: ${brokenLinks.length}`)

    if (brokenLinks.length > 0) {
      console.log(`\n❌ BROKEN LINKS:`)
      brokenLinks.forEach((link) => {
        console.log(`  ${link.markdown}: ${link.issue}`)
        if (link.currentLink !== 'none') {
          console.log(`    Current: ${link.currentLink}`)
        }
        if (link.correctLink) {
          console.log(`    Correct: ${link.correctLink}`)
        }
      })

      // Ask if user wants to fix them
      const fixableLinks = brokenLinks.filter((link) => link.shouldFix)
      if (fixableLinks.length > 0) {
        console.log(`\n🔧 ${fixableLinks.length} links can be auto-fixed.`)
        console.log(`Run with --fix flag to repair them automatically.`)
      }
    } else {
      console.log(`✅ All markdown links are correct!`)
    }

    return { brokenLinks, totalChecked }
  } catch (error) {
    console.error(`Error checking markdown links: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Fix broken markdown links
 */
async function fixMarkdownLinks() {
  console.log(`🔧 FIXING broken markdown links...\n`)

  const { brokenLinks } = await checkMarkdownLinks()
  const fixableLinks = brokenLinks.filter((link) => link.shouldFix)

  if (fixableLinks.length === 0) {
    console.log(`Nothing to fix!`)
    return
  }

  let fixedCount = 0

  for (const link of fixableLinks) {
    try {
      const [subdir, mdFile] = link.markdown.split('/')
      const mdPath = path.join(
        __dirname,
        '..',
        'content',
        'memes',
        subdir,
        mdFile
      )

      let content = await fs.readFile(mdPath, 'utf8')

      // Replace the broken image link with the correct one
      content = content.replace(
        /!\[.*?\]\([^)]+\)/,
        `![${path.basename(mdFile, '.md')}](${link.correctLink})`
      )

      await fs.writeFile(mdPath, content, 'utf8')

      console.log(`✅ Fixed: ${link.markdown}`)
      fixedCount++
    } catch (error) {
      console.log(`❌ Failed to fix ${link.markdown}: ${error.message}`)
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} markdown files!`)
}

// Main execution
const args = process.argv.slice(2)
const shouldFix = args.includes('--fix')

if (shouldFix) {
  fixMarkdownLinks()
} else {
  checkMarkdownLinks()
}
