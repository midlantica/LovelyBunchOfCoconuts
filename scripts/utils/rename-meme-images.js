#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const rename = promisify(fs.rename)

// Parse command line arguments
const args = process.argv.slice(2)
let targetDir = path.join(__dirname, '..', 'public', 'memes') // Default directory
let skipExisting = true // Default to skip files that already have metadata

// Check for custom directory argument
if (args.length > 0) {
  // First arg is the directory path
  targetDir = path.resolve(args[0])

  // Check if second arg is --force flag
  if (args.length > 1 && args[1] === '--force') {
    skipExisting = false
  }
}

// Configuration
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'memes')
const LOG_FILE = path.join(__dirname, 'rename-log.txt')

// Initialize log file
fs.writeFileSync(
  LOG_FILE,
  `Starting image renaming process at ${new Date().toISOString()}\n`
)
console.log(`Target directory: ${targetDir}`)
console.log(`Skip files with existing metadata: ${skipExisting ? 'Yes' : 'No'}`)

// Helper function to log messages
function log(message) {
  fs.appendFileSync(LOG_FILE, message + '\n')
  console.log(message)
}

// Helper function to clean filenames
function cleanFilename(filename) {
  // Get base name and extension
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)

  // Skip files that start with double underscore
  if (base.startsWith('__')) {
    return null
  }

  // Remove all types of quotes (straight and curly), convert to lowercase, replace spaces with hyphens, remove special chars, collapse multiple hyphens
  let newBase = base
    .toLowerCase()
    .replace(/["'‘’“”`´]/g, '') // Remove quotes
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanum except hyphen
    .replace(/-+/g, '-') // Collapse multiple hyphens (2 or more)
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens

  // Split into words by hyphen
  const words = newBase.split('-').filter(Boolean)
  let result = ''
  let i = 0
  // Add words until adding the next would exceed 50 chars
  while (i < words.length) {
    const next = result ? result + '-' + words[i] : words[i]
    if (next.length > 50) break
    result = next
    i++
  }
  // If the result is empty (first word is too long), fallback to first word truncated to 50 chars
  if (!result && words.length > 0) {
    result = words[0].slice(0, 50)
  }
  // Ensure we do not end with a partial word: if result is not the full base, and the next word would fit, remove the last word
  if (i < words.length && result.length > 0) {
    const lastHyphen = result.lastIndexOf('-')
    if (lastHyphen > 0) {
      result = result.slice(0, lastHyphen)
    } else {
      // Only one word, and it's too long, so fallback to first word under 50 chars
      result = words[0].slice(0, 50)
    }
  }
  result = result.replace(/-+$/g, '')
  return result + ext
}

// Helper function to check if a file exists
async function fileExists(filePath) {
  try {
    await promisify(fs.access)(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

// Main function
async function renameImages() {
  try {
    // Check if directory exists
    try {
      await stat(targetDir)
    } catch (err) {
      log(`Error: Directory ${targetDir} does not exist or is not accessible`)
      process.exit(1)
    }

    // Get all files in the target directory (before renaming)
    const filesBefore = await readdir(targetDir)
    const imageFilesBefore = filesBefore.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)
    })
    const beforeSet = new Set(imageFilesBefore)

    // Get all files in the target directory
    const files = await readdir(targetDir)

    // Filter for image files
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)
    })

    let renamedCount = 0
    let skippedCount = 0
    let renamedFiles = []
    let skippedFiles = []

    // Process each image file
    for (const file of imageFiles) {
      const filePath = path.join(targetDir, file)

      // Skip files that start with double underscore
      if (file.startsWith('__')) {
        log(`Skipping ${file} (starts with __)`)
        skippedCount++
        skippedFiles.push(file)
        continue
      }

      // Clean the filename
      const newName = cleanFilename(file)

      // Skip if cleaning returned null
      if (!newName) {
        log(`Skipping ${file} (invalid name)`)
        skippedCount++
        skippedFiles.push(file)
        continue
      }

      // If the cleaned filename already exists as an image AND a markdown file exists, skip this file
      const cleanImagePath = path.join(targetDir, newName)
      const cleanMarkdownPath = path.join(
        CONTENT_DIR,
        `${path.basename(newName, path.extname(newName))}.md`
      )
      if (
        file !== newName &&
        (await fileExists(cleanImagePath)) &&
        (await fileExists(cleanMarkdownPath))
      ) {
        log(
          `Skipping ${file} (clean image and markdown already exist as ${newName})`
        )
        skippedCount++
        skippedFiles.push(file)
        continue
      }

      // Check if the name needs to be changed
      if (file !== newName) {
        let finalName = newName
        let newPath = path.join(targetDir, finalName)

        // Check if the new filename already exists (but not a full pair)
        if (await fileExists(newPath)) {
          // Add a timestamp to make it unique
          const timestamp = Date.now()
          const ext = path.extname(newName)
          const base = path.basename(newName, ext)
          finalName = `${base}-${timestamp}${ext}`
          newPath = path.join(targetDir, finalName)
        }

        await rename(filePath, newPath)
        log(`Renamed: ${file} → ${finalName}`)
        renamedCount++
        renamedFiles.push(`${file} → ${finalName}`)
      } else {
        log(`No change needed for ${file}`)
        skippedCount++
        skippedFiles.push(file)
      }
    }

    // Get all files in the target directory (after renaming)
    const filesAfter = await readdir(targetDir)
    const imageFilesAfter = filesAfter.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)
    })
    const afterSet = new Set(imageFilesAfter)

    // Compare before and after sets to find renamed files
    const actuallyRenamed = []
    for (const before of beforeSet) {
      if (!afterSet.has(before)) {
        actuallyRenamed.push(before)
      }
    }

    log(`\nRenaming complete at ${new Date().toISOString()}`)
    log(`Images renamed: ${actuallyRenamed.length}`)
    if (actuallyRenamed.length > 0) {
      log(`Renamed files:`)
      actuallyRenamed.forEach((f) => log(`  ${f}`))
    }
    log(`${skippedCount} files skipped`)
    log(`Renamed files are logged in ${LOG_FILE}`)
  } catch (error) {
    log(`Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the main function
renameImages()
