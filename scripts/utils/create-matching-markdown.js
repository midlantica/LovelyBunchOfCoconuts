#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)
const appendFile = promisify(fs.appendFile)
const access = promisify(fs.access)
const mkdir = promisify(fs.mkdir)

// Parse command line arguments
const args = process.argv.slice(2)
let targetDir = path.join(__dirname, '..', '..', 'public', 'memes') // Default directory
let forceUpdate = false // Default to not overwrite existing markdown files

// Check for custom directory argument
if (args.length > 0) {
  // First arg is the subdirectory name within public/memes/
  const subdirName = args[0]
  targetDir = path.join(__dirname, '..', '..', 'public', 'memes', subdirName)

  // Check if second arg is --force flag
  if (args.length > 1 && args[1] === '--force') {
    forceUpdate = true
  }
}

// Configuration
const BASE_CONTENT_DIR = path.join(__dirname, '..', '..', 'content', 'memes')
const BASE_PUBLIC_DIR = path.join(__dirname, '..', '..', 'public', 'memes')
const LOG_FILE = path.join(__dirname, 'markdown-creation-log.txt')

// Helper function to log messages
async function log(message) {
  await appendFile(LOG_FILE, message + '\n')
  console.log(message)
}

// Helper function to create a more natural English title from filename
function createTitle(filename) {
  const base = path.basename(filename, path.extname(filename))
  const rawWords = base.split('-').filter(Boolean)
  if (!rawWords.length) return 'Untitled'

  // Lowercase everything first for normalization
  let words = rawWords.map((w) => w.toLowerCase())

  // Known acronyms to preserve / upper-case
  const ACRONYMS = new Set([
    'npc',
    'usa',
    'us',
    'gdp',
    'ai',
    'eu',
    'uk',
    'nato',
    'fbi',
    'cia',
    'nsa',
    'lgbt',
    'lgbtq',
    'lgbtqia',
    'dei',
    'esg',
    'irs',
    'doj',
    'cdc',
    'who',
    'un',
    'imf',
    'wto',
    'epa',
    'oecd',
    'blm',
    'atf',
    'sec',
    'dod',
    'cop',
    'ipcc',
    'faq',
  ])

  words = words.map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w))

  // Join into a sentence string
  let sentence = words.join(' ')

  // Capitalize standalone pronoun 'i' -> 'I'
  sentence = sentence.replace(/\bi\b/g, 'I')

  // Capitalize first letter of the sentence
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)

  // Punctuation heuristic: if starts with maybe/should and lacks terminal punctuation, add ?
  const startsToken = sentence.toLowerCase().split(/\s+/)[0]
  if (
    (startsToken === 'maybe' || startsToken === 'should') &&
    !/[.!?]$/.test(sentence)
  ) {
    sentence += '?'
  }

  return sentence
}

// Helper function to check if a file exists
async function fileExists(filePath) {
  try {
    await access(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

// Helper function to extract relative path from target directory to public/memes
function getRelativePath(fullPath) {
  // If the target directory is inside public/memes, get the relative path
  if (fullPath.startsWith(BASE_PUBLIC_DIR)) {
    return path.relative(BASE_PUBLIC_DIR, fullPath)
  }
  return ''
}

// Main function
async function createMarkdownFiles() {
  // Initialize log file
  await writeFile(
    LOG_FILE,
    `Starting markdown file creation at ${new Date().toISOString()}\n`
  )
  console.log(`Target directory: ${targetDir}`)
  console.log(
    `Force update existing markdown files: ${forceUpdate ? 'Yes' : 'No'}`
  )

  try {
    // Check if directory exists
    try {
      await stat(targetDir)
    } catch (err) {
      await log(
        `Error: Directory ${targetDir} does not exist or is not accessible`
      )
      process.exit(1)
    }

    // Get relative path for image references and content directory structure
    const relativePath = getRelativePath(targetDir)

    // Determine the content directory where markdown files should be created
    let contentDir = BASE_CONTENT_DIR
    if (relativePath) {
      contentDir = path.join(BASE_CONTENT_DIR, relativePath)
      // Create the directory structure if it doesn't exist
      await mkdir(contentDir, { recursive: true })
      await log(`Using/creating content directory: ${contentDir}`)
    }

    // Construct the image path prefix for markdown files
    const imagePath = relativePath ? `/memes/${relativePath}/` : '/memes/'

    // Get current time
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format

    // Get all files in the target directory
    const files = await readdir(targetDir)

    // Filter for image files (including webp since images may already be converted)
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    let createdCount = 0
    let skippedCount = 0

    // Process each image file
    for (const file of imageFiles) {
      // Skip files that start with double underscore
      if (file.startsWith('__')) {
        await log(`Skipping ${file} (starts with __)`)
        skippedCount++
        continue
      }

      // Get base name without extension
      const basename = path.basename(file, path.extname(file))
      const markdownPath = path.join(contentDir, `${basename}.md`)

      // Check for existing markdown file (case-insensitive)
      let existingMarkdown = false
      if (!forceUpdate) {
        try {
          // First try exact match
          if (await fileExists(markdownPath)) {
            existingMarkdown = true
          } else {
            // Try case-insensitive match by reading directory
            const existingFiles = await readdir(contentDir)
            const basenameLower = basename.toLowerCase()
            for (const existingFile of existingFiles) {
              if (existingFile.toLowerCase() === `${basenameLower}.md`) {
                await log(
                  `Markdown file already exists for ${file} (case-insensitive match: ${existingFile})`
                )
                existingMarkdown = true
                break
              }
            }
          }
        } catch (err) {
          // Directory doesn't exist yet, no existing markdown
        }
      }

      if (existingMarkdown) {
        skippedCount++
        continue
      }

      // Create a title from the filename
      const title = createTitle(basename)

      // Create image path for markdown - always use .webp extension since images are converted to WebP
      const webpFilename = basename + '.webp'
      const imagePathFull = `${imagePath}${webpFilename}`

      // Create markdown content: only title in frontmatter, then image and caption in body
      const markdown = `---\ntitle: "${title}"\n---\n\n![${title}](${imagePathFull})\n\n${title}\n`

      // Write markdown file
      await writeFile(markdownPath, markdown)
      await log(`Created markdown file for ${file} at ${markdownPath}`)
      createdCount++
    }

    await log(
      `\nMarkdown file creation complete at ${new Date().toISOString()}`
    )
    await log(
      `${createdCount} markdown files created, ${skippedCount} files skipped`
    )
    await log(`Created markdown files are logged in ${LOG_FILE}`)
  } catch (error) {
    await log(`Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the main function
createMarkdownFiles()
