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

// Helper function to create a title from filename
function createTitle(filename) {
  // Remove extension and replace hyphens with spaces
  const base = path.basename(filename, path.extname(filename))

  // Replace hyphens with spaces and capitalize words
  return base
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

    // Filter for image files
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)
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

      // If markdown file already exists and we're not forcing update, skip it
      if ((await fileExists(markdownPath)) && !forceUpdate) {
        await log(`Markdown file already exists for ${file}`)
        skippedCount++
        continue
      }

      // Create a title from the filename
      const title = createTitle(basename)

      // Create image path for markdown
      const imagePathFull = `${imagePath}${file}`

      // Create markdown content: only title in frontmatter, then image and caption in body
      const markdown = `---\ntitle: "${basename}"\n---\n\n![${basename}](${imagePathFull})\n\n${title}\n`

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
