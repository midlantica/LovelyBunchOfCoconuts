#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const exifr = require("exifr")

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)
const access = promisify(fs.access)
const mkdir = promisify(fs.mkdir)

// Parse command line arguments
const args = process.argv.slice(2)
let targetDir = path.join(__dirname, "..", "public", "memes") // Default directory
let forceUpdate = false // Default to not overwrite existing markdown files

// Check for custom directory argument
if (args.length > 0) {
  // First arg is the directory path
  targetDir = path.resolve(args[0])

  // Check if second arg is --force flag
  if (args.length > 1 && args[1] === "--force") {
    forceUpdate = true
  }
}

// Configuration
const BASE_CONTENT_DIR = path.join(__dirname, "..", "content", "memes")
const BASE_PUBLIC_DIR = path.join(__dirname, "..", "public", "memes")
const LOG_FILE = path.join(__dirname, "markdown-creation-log.txt")

// Initialize log file
fs.writeFileSync(LOG_FILE, `Starting markdown file creation at ${new Date().toISOString()}\n`)
console.log(`Target directory: ${targetDir}`)
console.log(`Force update existing markdown files: ${forceUpdate ? "Yes" : "No"}`)

// Helper function to log messages
function log(message) {
  fs.appendFileSync(LOG_FILE, message + "\n")
  console.log(message)
}

// Helper function to create a title from filename
function createTitle(filename) {
  // Remove extension and replace hyphens with spaces
  const base = path.basename(filename, path.extname(filename))

  // Replace hyphens with spaces and capitalize words
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
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
  return ""
}

// Main function
async function createMarkdownFiles() {
  try {
    // Check if directory exists
    try {
      await stat(targetDir)
    } catch (err) {
      log(`Error: Directory ${targetDir} does not exist or is not accessible`)
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
      log(`Using/creating content directory: ${contentDir}`)
    }

    // Construct the image path prefix for markdown files
    const imagePath = relativePath ? `/memes/${relativePath}/` : "/memes/"

    // Get current time
    const now = new Date()
    const today = now.toISOString().split("T")[0] // YYYY-MM-DD format

    // Get all files in the target directory
    const files = await readdir(targetDir)

    // Filter for image files
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return [".jpg", ".jpeg", ".png", ".gif"].includes(ext)
    })

    let createdCount = 0
    let skippedCount = 0

    // Process each image file
    for (const file of imageFiles) {
      // Skip files that start with double underscore
      if (file.startsWith("__")) {
        log(`Skipping ${file} (starts with __)`)
        skippedCount++
        continue
      }

      // Get base name without extension
      const basename = path.basename(file, path.extname(file))
      const markdownPath = path.join(contentDir, `${basename}.md`)

      // Check if markdown file already exists
      if ((await fileExists(markdownPath)) && !forceUpdate) {
        log(`Markdown file already exists for ${file}`)
        skippedCount++
        continue
      }

      // Create a title from the filename
      const title = createTitle(basename)

      // Create image path for markdown
      const imagePathFull = `${imagePath}${file}`

      // Extract meta tags from image
      let tags = []
      try {
        const meta = await exifr.parse(path.join(targetDir, file), {
          iptc: true,
          xmp: true,
          exif: true,
          tiff: true,
          mergeOutput: true,
        })
        // Collect keywords/tags from IPTC, XMP, EXIF if present
        if (meta) {
          if (meta.Keywords && Array.isArray(meta.Keywords)) tags = tags.concat(meta.Keywords)
          if (meta.Subject && Array.isArray(meta.Subject)) tags = tags.concat(meta.Subject)
          if (meta.tags && Array.isArray(meta.tags)) tags = tags.concat(meta.tags)
          if (meta.Category && typeof meta.Category === "string") tags.push(meta.Category)
          if (meta.Genre && typeof meta.Genre === "string") tags.push(meta.Genre)
          // Remove duplicates and falsy
          tags = Array.from(new Set(tags.filter(Boolean)))
        }
      } catch (err) {
        log(`Warning: Could not extract meta tags from ${file}: ${err.message}`)
      }

      // Create markdown content with tags in frontmatter if any
      const markdown = `---\ntitle: "${basename}"\nimage: "${imagePathFull}"\ndate: "${today}"${
        tags.length ? `\ntags: [${tags.map((t) => `\"${t.replace(/"/g, "")}\"`).join(", ")}]` : ""
      }\n---\n\n![${basename}](${imagePathFull})\n\n${title}\n`

      // Write markdown file
      await writeFile(markdownPath, markdown)
      log(`Created markdown file for ${file} at ${markdownPath}`)
      createdCount++
    }

    log(`\nMarkdown file creation complete at ${new Date().toISOString()}`)
    log(`${createdCount} markdown files created, ${skippedCount} files skipped`)
    log(`Created markdown files are logged in ${LOG_FILE}`)
  } catch (error) {
    log(`Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the main function
createMarkdownFiles()
