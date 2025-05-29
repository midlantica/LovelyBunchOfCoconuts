// utils/imageProcessing.js
import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

/**
 * Cleans a filename to make it URL and filesystem friendly
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length for the sanitized name
 * @returns {string} Sanitized filename
 */
export async function sanitizeFilename(text, maxLength = 20) {
  let cleanText = text
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()

  cleanText = cleanText.slice(0, maxLength).replace(/^-+|-+$/g, "")
  return cleanText || "unnamed"
}

/**
 * Checks if a filename is descriptive enough to keep
 * @param {string} filename - Filename to check
 * @returns {boolean} Whether the filename is good enough
 */
export async function isDescriptiveFilename(filename) {
  const basename = path.basename(filename, path.extname(filename))
  // At least 3 alphanumeric chars, not just numbers or random strings
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{2,}$/.test(basename) && !/^[0-9a-f]{8,}$/.test(basename)
}

/**
 * Optimizes images in a directory using mogrify
 * @param {string} directory - Directory containing images
 * @returns {Promise<void>}
 */
export async function optimizeImages(directory) {
  const extensions = ["png", "jpg", "jpeg", "gif", "webp"]
  const existingExt = []

  // Find which image types exist in the directory
  for (const ext of extensions) {
    const files = await fs.readdir(directory)
    if (files.some((file) => file.toLowerCase().endsWith(`.${ext}`))) {
      existingExt.push(ext)
    }
  }

  if (existingExt.length === 0) {
    console.log("No images to optimize")
    return
  }

  const extGlob = existingExt.join(",")
  const command = `mogrify +profile "*" -format png -quality 85 -resize 1080x1080 ${path.join(
    directory,
    "*.{" + extGlob + "}"
  )}`

  try {
    await execPromise(command)
    console.log(`Images optimized in ${directory}`)
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
export async function renameImageFile(directory, filename) {
  const filePath = path.join(directory, filename)
  const ext = path.extname(filename).toLowerCase()
  let newFilename

  // Check if current name is already descriptive
  if (await isDescriptiveFilename(filename)) {
    const basename = path.basename(filename, ext)
    newFilename = `${await sanitizeFilename(basename, 20)}${ext}`
  } else {
    // Fall back to sanitized original name
    const basename = path.basename(filename, ext)
    newFilename = `${await sanitizeFilename(basename, 20)}${ext}`
  }

  // Ensure filename is unique
  let newFilePath = path.join(directory, newFilename)
  let counter = 1

  while (
    await fs
      .access(newFilePath)
      .then(() => true)
      .catch(() => false)
  ) {
    newFilename = `${newFilename.split(ext)[0]}-${counter}${ext}`
    newFilePath = path.join(directory, newFilename)
    counter++
  }

  // Rename the file
  if (newFilename !== filename) {
    await fs.rename(filePath, newFilePath)
    console.log(`Renamed '${filename}' to '${newFilename}'`)
  }

  return newFilename
}

/**
 * Main function to process all images in a directory
 * @param {string} directory - Directory containing images
 * @returns {Promise<void>}
 */
export async function processImages(directory) {
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
