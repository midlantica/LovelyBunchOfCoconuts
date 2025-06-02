// utils/imageProcessing.js
const fs = require("fs/promises")
const path = require("path")
const { exec, execSync } = require("child_process")
const { promisify } = require("util")

const execPromise = promisify(exec)

/**
 * Cleans a filename to make it URL and filesystem friendly
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length for the sanitized name
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(text, maxLength = 40) {
  // Allow hyphens and underscores, remove other non-alphanum
  let cleanText = text
    .replace(/[^a-zA-Z0-9\-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .toLowerCase()
    .replace(/-+$/g, "") // Remove trailing hyphens
    .replace(/_+$/g, "") // Remove trailing underscores
    .replace(/[0-9a-f]{8,}$/g, "") // Remove trailing hashes/numbers
    .replace(/-+$/g, "") // Remove trailing hyphens again
    .replace(/_+$/g, "") // Remove trailing underscores again
  cleanText = cleanText.slice(0, maxLength).replace(/^-+|-+$/g, "")
  return cleanText || "unnamed"
}

/**
 * Checks if a filename is descriptive enough to keep
 * @param {string} filename - Filename to check
 * @returns {boolean} Whether the filename is good enough
 */
function isDescriptiveFilename(filename) {
  const basename = path.basename(filename, path.extname(filename))
  // Human-readable: at least 2 words or a word with hyphens/underscores, not just numbers or hashes
  // No trailing random numbers/hashes (8+ digits/hex)
  return (
    /[a-zA-Z]/.test(basename) &&
    (basename.includes("-") || basename.includes("_") || /[a-zA-Z]{3,}/.test(basename)) &&
    !/[0-9a-f]{8,}$/.test(basename)
  )
}

// Helper: Check if image is already optimized (macOS xattr)
async function isImageOptimized(filePath) {
  try {
    const { stdout } = await execPromise(`xattr -p user.meme_optimized "${filePath}"`)
    return stdout.trim() === "1"
  } catch {
    return false
  }
}

// Helper: Mark image as optimized (macOS xattr)
async function markImageOptimized(filePath) {
  try {
    await execPromise(`xattr -w user.meme_optimized 1 "${filePath}"`)
  } catch (err) {
    // Ignore errors
  }
}

/**
 * Optimizes images in a directory using mogrify
 * @param {string} directory - Directory containing images
 * @returns {Promise<void>}
 */
async function optimizeImages(directory) {
  const extensions = ["png", "jpg", "jpeg", "gif", "webp"]
  const files = await fs.readdir(directory)
  const imagesToOptimize = []
  for (const file of files) {
    const ext = path.extname(file).toLowerCase().replace(".", "")
    if (extensions.includes(ext)) {
      const filePath = path.join(directory, file)
      if (!(await isImageOptimized(filePath))) {
        imagesToOptimize.push(file)
      }
    }
  }
  if (imagesToOptimize.length === 0) {
    console.log("No new images to optimize")
    return
  }
  const extGlob = [
    ...new Set(imagesToOptimize.map((f) => path.extname(f).slice(1).toLowerCase())),
  ].join(",")
  const command = `mogrify +profile "*" -format png -quality 85 -resize 1080x1080 ${imagesToOptimize
    .map((f) => '"' + path.join(directory, f) + '"')
    .join(" ")}`
  try {
    await execPromise(command)
    // Mark all as optimized
    for (const file of imagesToOptimize) {
      await markImageOptimized(path.join(directory, file))
    }
    console.log(`Images optimized in ${directory}: ${imagesToOptimize.length}`)
  } catch (error) {
    console.error(`Image optimization failed: ${error.message}`)
  }
}

/**
 * Renames an image file based on its existing name
 * @param {string} directory - Directory containing the image
 * @param {string} filename - Current filename
 * @returns {Promise<string>} New filename
 */
async function renameImageFile(directory, filename) {
  const ext = path.extname(filename).toLowerCase()
  const basename = path.basename(filename, ext)
  let newFilename

  if (isDescriptiveFilename(filename)) {
    // Already human-readable, just sanitize for safety (but don't remove hyphens/underscores)
    newFilename = sanitizeFilename(basename, 40) + ext
  } else {
    // Not readable, sanitize
    newFilename = sanitizeFilename(basename, 40) + ext
  }

  let newFilePath = path.join(directory, newFilename)
  let counter = 1
  while (
    newFilename !== filename &&
    (await fs
      .access(newFilePath)
      .then(() => true)
      .catch(() => false))
  ) {
    newFilename = `${sanitizeFilename(basename, 40)}-${counter}${ext}`
    newFilePath = path.join(directory, newFilename)
    counter++
  }

  if (newFilename !== filename) {
    await fs.rename(path.join(directory, filename), newFilePath)
    console.log(`Renamed '${filename}' to '${newFilename}'`)
  }

  return newFilename
}

/**
 * Main function to process all images in a directory
 * @param {string} directory - Directory containing images
 * @returns {Promise<void>}
 */
async function processImages(directory) {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".gif", ".webp"]

  try {
    const files = await fs.readdir(directory)

    // Process each image file
    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase()
      if (imageExtensions.includes(ext)) {
        await renameImageFile(directory, filename)
      }
    }

    // Optimize all images after renaming
    await optimizeImages(directory)
  } catch (error) {
    console.error(`Error processing images: ${error.message}`)
  }
}

module.exports = {
  sanitizeFilename,
  isDescriptiveFilename,
  optimizeImages,
  renameImageFile,
  processImages,
}
