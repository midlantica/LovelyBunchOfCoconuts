// utils/imageProcessing.js
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { sanitizeFilename } from './utils/filename-sanitizer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execPromise = promisify(exec)

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
    (basename.includes('-') ||
      basename.includes('_') ||
      /[a-zA-Z]{3,}/.test(basename)) &&
    !/[0-9a-f]{8,}$/.test(basename)
  )
}

// Helper: Check if image is already optimized (macOS xattr)
async function isImageOptimized(filePath) {
  try {
    const { stdout } = await execPromise(
      `xattr -p user.meme_optimized "${filePath}"`
    )
    return stdout.trim() === '1'
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
 * Get image dimensions using ImageMagick identify
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{width: number, height: number}|null>} Image dimensions or null if failed
 */
async function getImageDimensions(imagePath) {
  try {
    const { stdout } = await execPromise(
      `identify -format "%w %h" "${imagePath}"`
    )
    const [width, height] = stdout.trim().split(' ').map(Number)
    return { width, height }
  } catch (error) {
    console.error(`Error reading dimensions for ${imagePath}: ${error.message}`)
    return null
  }
}

/**
 * Resize image to target dimensions with quality preservation
 * @param {string} imagePath - Path to the image file
 * @param {string} resizeOption - ImageMagick resize option (e.g., "600x", "1080x1080")
 * @param {boolean} isUpscale - Whether this is an upscaling operation
 * @returns {Promise<boolean>} Success status
 */
async function resizeImage(imagePath, resizeOption, isUpscale = false) {
  try {
    const filter = isUpscale ? '-filter Lanczos' : '' // Use Lanczos for upscaling quality
    const command = `mogrify ${filter} -resize ${resizeOption} "${imagePath}"`
    await execPromise(command)
    return true
  } catch (error) {
    console.error(`Error resizing ${imagePath}: ${error.message}`)
    return false
  }
}

/**
 * Unified image processing: sizing, optimization, and format conversion
 * @param {string} directory - Directory containing images
 * @param {string} subdirName - Name of subdirectory for reporting
 * @returns {Promise<void>}
 */
async function optimizeImages(directory, subdirName = '') {
  const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp']
  const files = await fs.readdir(directory)

  // Configuration for target sizes
  const MIN_WIDTH = 400 // Minimum acceptable width
  const MAX_WIDTH = 1080 // Maximum width before downscaling
  const TARGET_UPSCALE = 600 // Target width for small images

  let processedCount = 0
  let skippedCount = 0
  const processedFiles = []
  const skippedFiles = []

  for (const file of files) {
    const ext = path.extname(file).toLowerCase().replace('.', '')
    if (!extensions.includes(ext)) continue

    const filePath = path.join(directory, file)
    const displayPath = subdirName ? `${subdirName}/${file}` : file

    // FIRST: Check if markdown pair already exists (most important check)
    if (await hasMarkdownPair(filePath)) {
      skippedFiles.push({ file, reason: 'has markdown pair' })
      skippedCount++
      continue
    }

    // SECOND: Check if already optimized (fallback safety)
    if (await isImageOptimized(filePath)) {
      skippedFiles.push({ file, reason: 'already optimized' })
      skippedCount++
      continue
    }

    // This file WILL be processed - show details for new files only
    console.log(`🆕 Processing: ${displayPath}`)

    // Get current dimensions
    const dimensions = await getImageDimensions(filePath)
    if (!dimensions) {
      console.log(`⚠️  Skipping ${displayPath} - couldn't read dimensions`)
      skippedFiles.push({ file, reason: 'could not read dimensions' })
      continue
    }

    console.log(`📐 ${dimensions.width}×${dimensions.height}px`)

    let needsProcessing = false
    let action = ''

    // Handle small images (upscale)
    if (dimensions.width < MIN_WIDTH) {
      action = `upscaled from ${dimensions.width}px to ${TARGET_UPSCALE}px`
      console.log(`📈 Upscaling to ${TARGET_UPSCALE}px width`)
      await resizeImage(filePath, `${TARGET_UPSCALE}x`, true) // true = upscale with Lanczos
      needsProcessing = true
    }
    // Handle large images (downscale)
    else if (dimensions.width > MAX_WIDTH) {
      action = `downscaled from ${dimensions.width}px to max ${MAX_WIDTH}px`
      console.log(`📉 Downscaling to max ${MAX_WIDTH}px`)
      await resizeImage(filePath, `${MAX_WIDTH}x${MAX_WIDTH}`, false) // false = downscale
      needsProcessing = true
    }
    // Medium images - just optimize without resizing
    else {
      action = `optimized (${dimensions.width}px width preserved)`
      console.log(`✅ Optimizing quality (size is good)`)
      needsProcessing = true
    }

    if (needsProcessing) {
      // Apply quality optimization and format conversion to progressive JPEG
      try {
        await execPromise(
          `mogrify +profile "*" -format jpg -quality 85 -interlace Plane "${filePath}"`
        )
        await markImageOptimized(filePath)
        processedFiles.push({ file, action })
        processedCount++
        console.log(`✨ Completed: ${displayPath}`)
      } catch (error) {
        console.error(`❌ Error optimizing ${displayPath}: ${error.message}`)
        skippedFiles.push({ file, reason: `error: ${error.message}` })
      }
    }
  }

  // Return data for global summary (no per-folder reporting)
  return {
    processedCount,
    existingCount: skippedCount,
    newFiles: processedFiles.map(({ file }) => file),
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
 * Find and move orphaned markdown files to _orphaned folder
 * @param {string} imageDirectory - Directory containing images
 * @param {string[]} imageFiles - Array of image filenames
 * @returns {Promise<string[]>} Array of orphaned markdown filenames that were moved
 */
async function findAndMoveOrphanedMarkdownFiles(imageDirectory, imageFiles) {
  try {
    // Get the corresponding content directory
    const imageDir = imageDirectory
    const pathParts = imageDir.split(path.sep)
    const memesIndex = pathParts.findIndex((part) => part === 'memes')

    if (memesIndex === -1) {
      return [] // Invalid path structure
    }

    // Get subdirectory path after 'memes' (e.g., 'thomas-sowell')
    const subdirParts = pathParts.slice(memesIndex + 1)

    // Construct content directory path
    const contentDir =
      subdirParts.length > 0
        ? path.join(__dirname, '..', 'content', 'memes', ...subdirParts)
        : path.join(__dirname, '..', 'content', 'memes')

    // Check if content directory exists
    try {
      await fs.access(contentDir)
    } catch {
      return [] // Content directory doesn't exist, no orphaned files
    }

    // Get all markdown files in the content directory (excluding _orphaned folder)
    const contentFiles = await fs.readdir(contentDir)
    const markdownFiles = contentFiles.filter((file) => file.endsWith('.md'))

    // Create a set of existing image filenames for quick lookup
    const imageFilenameSet = new Set(imageFiles)

    // Check each markdown file to see if its referenced image exists
    const orphanedFiles = []

    for (const mdFile of markdownFiles) {
      try {
        const mdPath = path.join(contentDir, mdFile)
        const content = await fs.readFile(mdPath, 'utf-8')

        // Extract image path from markdown content using regex
        // Look for ![alt text](/memes/subdirectory/image.jpg) pattern
        const imageMatch = content.match(/!\[.*?\]\(\/memes\/[^)]+\)/)

        if (imageMatch) {
          // Extract the image filename from the path
          const imagePath = imageMatch[0].match(/\/memes\/[^)]+/)[0]
          const imageFilename = path.basename(imagePath)

          // Check if this image file exists in our directory
          if (!imageFilenameSet.has(imageFilename)) {
            orphanedFiles.push({
              filename: mdFile,
              path: mdPath,
              referencedImage: imageFilename,
            })
          }
        } else {
          // No image reference found in markdown - this is definitely orphaned
          orphanedFiles.push({
            filename: mdFile,
            path: mdPath,
            referencedImage: 'No image reference found',
          })
        }
      } catch (error) {
        // If we can't read the markdown file, consider it potentially orphaned
        console.warn(`Could not read markdown file ${mdFile}: ${error.message}`)
        orphanedFiles.push({
          filename: mdFile,
          path: path.join(contentDir, mdFile),
          referencedImage: 'Could not read file',
        })
      }
    }

    // If orphaned files found, move them to _orphaned folder
    if (orphanedFiles.length > 0) {
      const orphanedDir = path.join(contentDir, '_orphaned')

      // Create _orphaned directory if it doesn't exist
      try {
        await fs.access(orphanedDir)
      } catch {
        await fs.mkdir(orphanedDir, { recursive: true })
      }

      // Move orphaned files
      const movedFiles = []
      for (const file of orphanedFiles) {
        try {
          const destinationPath = path.join(orphanedDir, file.filename)
          await fs.rename(file.path, destinationPath)
          movedFiles.push(file.filename)
        } catch (error) {
          console.error(`Failed to move ${file.filename}: ${error.message}`)
        }
      }

      return movedFiles
    }

    return []
  } catch (error) {
    console.error(
      `Error checking for orphaned markdown files: ${error.message}`
    )
    return []
  }
}

/**
 * Check if a markdown file exists for the given image
 * @param {string} imagePath - Full path to the image file
 * @returns {Promise<boolean>} True if paired markdown exists
 */
async function hasMarkdownPair(imagePath) {
  try {
    // Get the directory structure from the image path
    // imagePath is like: /Users/drew/Documents/_work/WakeUpNPC2/public/memes/thomas-sowell/image.jpg
    const imageDir = path.dirname(imagePath)
    const imageBaseName = path.basename(imagePath, path.extname(imagePath))

    // Extract the subdirectory name from the path
    // Split the path and find the part after 'memes'
    const pathParts = imageDir.split(path.sep)
    const memesIndex = pathParts.findIndex((part) => part === 'memes')

    if (memesIndex === -1) {
      return false // Invalid path structure
    }

    // Get subdirectory path after 'memes' (e.g., 'thomas-sowell')
    const subdirParts = pathParts.slice(memesIndex + 1)

    // Construct expected markdown path
    const contentDir =
      subdirParts.length > 0
        ? path.join(__dirname, '..', 'content', 'memes', ...subdirParts)
        : path.join(__dirname, '..', 'content', 'memes')

    const markdownPath = path.join(contentDir, `${imageBaseName}.md`)

    // Check if markdown file exists
    await fs.access(markdownPath)
    return true
  } catch {
    return false
  }
}

/**
 * Main function to process all images in a directory
 * @param {string} directory - Directory containing images
 * @param {string} subdirName - Name of subdirectory for reporting
 * @returns {Promise<Object>} Processing results with detailed stats
 */
async function processImages(directory, subdirName = '') {
  const imageExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.bmp',
    '.tiff',
    '.gif',
    '.webp',
  ]

  try {
    const files = await fs.readdir(directory)

    // Get all image files
    const imageFiles = files.filter((filename) => {
      const ext = path.extname(filename).toLowerCase()
      return imageExtensions.includes(ext)
    })

    // Count total image files
    const totalFiles = imageFiles.length

    // Check which images already have markdown files
    const imagesWithMarkdown = []
    const imagesWithoutMarkdown = []

    for (const filename of imageFiles) {
      const imagePath = path.join(directory, filename)
      if (await hasMarkdownPair(imagePath)) {
        imagesWithMarkdown.push(filename)
      } else {
        imagesWithoutMarkdown.push(filename)
      }
    }

    // Check for orphaned markdown files and automatically move them to _orphaned folder
    const movedOrphanedFiles = await findAndMoveOrphanedMarkdownFiles(
      directory,
      imageFiles
    )

    console.log(`\n📊 Directory Analysis:`)
    console.log(`Total image files: ${totalFiles}`)
    console.log(`Images with existing markdown: ${imagesWithMarkdown.length}`)
    console.log(`Images missing markdown: ${imagesWithoutMarkdown.length}`)
    console.log(`Orphaned markdown files moved: ${movedOrphanedFiles.length}`)

    if (imagesWithoutMarkdown.length > 0) {
      console.log(`\n🔍 Images missing markdown files:`)
      imagesWithoutMarkdown.forEach((file) => {
        console.log(`  📷 ${file}`)
      })
    }

    if (movedOrphanedFiles.length > 0) {
      console.log(`\n🗑️ Orphaned markdown files moved to _orphaned/:`)
      movedOrphanedFiles.forEach((file) => {
        console.log(`  📄 ${file}`)
      })
    }

    // Process each image file (rename if needed)
    for (const filename of imageFiles) {
      const ext = path.extname(filename).toLowerCase()
      if (imageExtensions.includes(ext)) {
        await renameImageFile(directory, filename)
      }
    }

    // Optimize images that need it
    const optimizationResult = await optimizeImages(directory, subdirName)

    // ALWAYS create markdown files for images that don't have them
    let newMarkdownCount = 0
    let newMarkdownFiles = []

    if (imagesWithoutMarkdown.length > 0) {
      console.log(
        `\n📝 Creating markdown files for ${imagesWithoutMarkdown.length} images...`
      )
      try {
        const createMarkdownScript = path.join(
          __dirname,
          'utils',
          'create-matching-markdown.js'
        )

        // Use the subdirName parameter that was passed in, which is already correct
        const command = subdirName
          ? `node "${createMarkdownScript}" "${subdirName}"`
          : `node "${createMarkdownScript}"`

        await execPromise(command)

        // Count how many markdown files were actually created
        newMarkdownCount = imagesWithoutMarkdown.length
        newMarkdownFiles = imagesWithoutMarkdown.map((filename) => {
          const basename = path.basename(filename, path.extname(filename))
          return `${basename}.md`
        })

        console.log(`✅ ${newMarkdownCount} markdown files created`)
      } catch (error) {
        console.error(`❌ Error creating markdown files: ${error.message}`)
      }
    }

    // Return comprehensive results
    return {
      totalFiles,
      existingMarkdown: imagesWithMarkdown.length,
      processedCount: optimizationResult?.processedCount || 0,
      newMarkdownCount,
      newMarkdownFiles,
      missingMarkdownFiles: imagesWithoutMarkdown,
      orphanedMarkdownFiles: movedOrphanedFiles,
      ...optimizationResult,
    }
  } catch (error) {
    console.error(`Error processing images: ${error.message}`)
    return null
  }
}

export {
  isDescriptiveFilename,
  getImageDimensions,
  resizeImage,
  optimizeImages,
  renameImageFile,
  processImages,
  hasMarkdownPair,
}
