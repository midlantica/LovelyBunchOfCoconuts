#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const rename = promisify(fs.rename)

// Parse command line arguments
const args = process.argv.slice(2)
let targetDir = path.join(__dirname, "..", "public", "memes") // Default directory
let skipExisting = true // Default to skip files that already have metadata

// Check for custom directory argument
if (args.length > 0) {
  // First arg is the directory path
  targetDir = path.resolve(args[0])

  // Check if second arg is --force flag
  if (args.length > 1 && args[1] === "--force") {
    skipExisting = false
  }
}

// Configuration
const CONTENT_DIR = path.join(__dirname, "..", "content", "memes")
const LOG_FILE = path.join(__dirname, "rename-log.txt")

// Initialize log file
fs.writeFileSync(LOG_FILE, `Starting image renaming process at ${new Date().toISOString()}\n`)
console.log(`Target directory: ${targetDir}`)
console.log(`Skip files with existing metadata: ${skipExisting ? "Yes" : "No"}`)

// Helper function to log messages
function log(message) {
  fs.appendFileSync(LOG_FILE, message + "\n")
  console.log(message)
}

// Helper function to clean filenames
function cleanFilename(filename) {
  // Get base name and extension
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)

  // Skip files that start with double underscore
  if (base.startsWith("__")) {
    return null
  }

  // Remove all types of quotes (straight and curly), convert to lowercase, replace spaces with hyphens, remove special chars, collapse multiple hyphens, and trim to 50 chars
  let newBase = base
    .toLowerCase()
    .replace(/["'‘’“”`´]/g, "") // Remove quotes
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanum except hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens (2 or more)
    .replace(/^-+|-+$/g, "") // Trim leading/trailing hyphens
    .slice(0, 50) // Limit to 50 chars

  return newBase + ext
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

    // Get all files in the target directory
    const files = await readdir(targetDir)

    // Filter for image files
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return [".jpg", ".jpeg", ".png", ".gif"].includes(ext)
    })

    let renamedCount = 0
    let skippedCount = 0

    // Process each image file
    for (const file of imageFiles) {
      const filePath = path.join(targetDir, file)

      // Skip files that start with double underscore
      if (file.startsWith("__")) {
        log(`Skipping ${file} (starts with __)`)
        skippedCount++
        continue
      }

      // Clean the filename
      const newName = cleanFilename(file)

      // Skip if cleaning returned null
      if (!newName) {
        log(`Skipping ${file} (invalid name)`)
        skippedCount++
        continue
      }

      // Check if we should skip files with existing metadata
      if (skipExisting) {
        const basename = path.basename(newName, path.extname(newName))
        const metadataPath = path.join(CONTENT_DIR, `${basename}.md`)

        if (await fileExists(metadataPath)) {
          log(`Skipping ${file} (metadata already exists)`)
          skippedCount++
          continue
        }
      }

      // Check if the name needs to be changed
      if (file !== newName) {
        let finalName = newName
        let newPath = path.join(targetDir, finalName)

        // Check if the new filename already exists
        if (await fileExists(newPath)) {
          // Add a timestamp to make it unique
          const timestamp = Date.now()
          const ext = path.extname(newName)
          const base = path.basename(newName, ext)
          finalName = `${base}-${timestamp}${ext}`
          newPath = path.join(targetDir, finalName)
        }

        // Rename the file
        await rename(filePath, newPath)
        log(`Renamed: ${file} → ${finalName}`)
        renamedCount++
      } else {
        log(`No change needed for ${file}`)
        skippedCount++
      }
    }

    log(`\nRenaming complete at ${new Date().toISOString()}`)
    log(`${renamedCount} files renamed, ${skippedCount} files skipped`)
    log(`Renamed files are logged in ${LOG_FILE}`)
  } catch (error) {
    log(`Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the main function
renameImages()
