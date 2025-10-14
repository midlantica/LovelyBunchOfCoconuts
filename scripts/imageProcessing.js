// @ts-nocheck
// utils/imageProcessing.js
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { scaleImage as sharedScaleImage } from './utils/imageScaler.js'
import { fileURLToPath } from 'url'
import { sanitizeFilename } from './utils/filename-sanitizer.js'
import crypto from 'crypto'

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

// Helper: Get format and whether profiles are present
async function getFormatAndProfiles(imagePath) {
  try {
    const { stdout } = await execPromise(
      `identify -format "%m|%[profiles]" "${imagePath}"`
    )
    const [fmt, profiles] = stdout.trim().split('|')
    const format = (fmt || '').toUpperCase()
    const hasProfiles = Boolean((profiles || '').trim() && profiles !== 'none')
    return { format, hasProfiles }
  } catch (e) {
    // If identify fails, err on the side of not mutating unnecessarily.
    return { format: 'JPEG', hasProfiles: false }
  }
}

/**
 * Unified image processing: sizing, optimization, and format conversion
 * @param {string} directory - Directory containing images
 * @param {string} subdirName - Name of subdirectory for reporting
 * @returns {Promise<Object>}
 */
async function optimizeImages(directory, subdirName = '', options = {}) {
  const { manifest, dryRun, force } = options || {}
  const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp']
  const files = await fs.readdir(directory)

  // Configuration for target sizes
  const MIN_SIDE = 500
  const TARGET_LONG_SIDE = 800
  const MAX_WIDTH = 1080

  let processedCount = 0
  let skippedCount = 0
  const processedFiles = []
  const skippedFiles = []
  const actions = []

  for (const file of files) {
    const ext = path.extname(file).toLowerCase().replace('.', '')
    if (!extensions.includes(ext)) continue

    const filePath = path.join(directory, file)
    const displayPath = subdirName ? `${subdirName}/${file}` : file
    const key = relImageKey(filePath)
    const entry = manifest.images[key] || {}

    // If a markdown pair already exists, do not alter the image unless forced
    const hasPair = await hasMarkdownPair(filePath)
    if (hasPair && !force) {
      skippedFiles.push({ file, reason: 'has markdown pair' })
      continue
    }

    // Also respect the manifest flag as an extra safety net
    if (!force && entry.optimized) {
      skippedFiles.push({ file, reason: 'manifest: optimized' })
      continue
    }

    // Always read actual dimensions (read-only) for accurate decisions/reporting
    let dimensions = await getImageDimensions(filePath)
    if (!dimensions) {
      skippedFiles.push({ file, reason: 'no dimensions' })
      continue
    }

    console.log(`🆕 Processing: ${displayPath}`)
    console.log(`📐 ${dimensions.width}×${dimensions.height}px`)

    let action = ''
    let needsProcessing = false

    // Policy: Always ensure long side >= TARGET_LONG_SIDE (800).
    const minSide = Math.min(dimensions.width, dimensions.height)
    const maxSide = Math.max(dimensions.width, dimensions.height)
    if (maxSide < TARGET_LONG_SIDE) {
      action = `upscale→${TARGET_LONG_SIDE}`
      console.log(`📈 Upscaling to ${TARGET_LONG_SIDE}px on long side`)
      if (!dryRun) await sharedScaleImage(filePath, TARGET_LONG_SIDE, false)
      needsProcessing = true
    } else if (dimensions.width > MAX_WIDTH) {
      action = `downscale→≤${MAX_WIDTH}`
      console.log(`📉 Downscaling to max ${MAX_WIDTH}px`)
      if (!dryRun)
        await resizeImage(filePath, `${MAX_WIDTH}x${MAX_WIDTH}`, false)
      needsProcessing = true
    } else {
      // Already good size: only convert/strip if needed
      const { format, hasProfiles } = await getFormatAndProfiles(filePath)
      const needsConvert = format !== 'JPEG' && format !== 'JPG'
      const needsStrip = hasProfiles
      if (needsConvert || needsStrip) {
        action = needsConvert ? 'convert-jpeg' : 'strip-profiles'
        console.log(
          `✅ ${
            needsConvert ? 'Converting to JPEG' : 'Stripping profiles'
          } (size is good)`
        )
        needsProcessing = true
      } else {
        action = 'skip-unchanged'
        console.log(`✅ Already optimized; skipping`)
        skippedFiles.push({ file, reason: 'already optimized' })
        continue
      }
    }

    let dimsForManifest = dimensions
    if (needsProcessing && !dryRun) {
      try {
        await execPromise(
          `mogrify +profile "*" -format jpg -quality 85 "${filePath}"`
        )
        await markImageOptimized(filePath)
        // Refresh dimensions after processing so manifest is accurate
        const newDims = await getImageDimensions(filePath)
        if (newDims) dimsForManifest = newDims
      } catch (e) {
        skippedFiles.push({ file, reason: `opt error: ${e.message}` })
        continue
      }
    }

    const fileHash = dryRun ? entry.hash || 'dry-run' : await hashFile(filePath)
    manifest.images[key] = {
      ...entry,
      optimized: true,
      hash: fileHash,
      action,
      updated: new Date().toISOString(),
      width: dimsForManifest.width,
      height: dimsForManifest.height,
    }
    processedFiles.push({ file, action })
    actions.push({ file, action })
    processedCount++
  }

  return {
    processedCount,
    existingCount: skippedCount + skippedFiles.length,
    newFiles: processedFiles.map((f) => f.file),
    skippedFiles,
    actions,
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

// Pre-pass: normalize filenames (lowercase, dashes, .jpeg -> .jpg) before rest of pipeline
async function prepassNormalizeFilenames(
  directory,
  subdirName,
  { dryRun, manifest }
) {
  const plannedRenames = []
  let files
  try {
    files = await fs.readdir(directory)
  } catch {
    return plannedRenames
  }
  for (const file of files) {
    const extWithDot = path.extname(file)
    if (!extWithDot) continue
    const extLower = extWithDot.toLowerCase()
    // Only operate on image-like files
    if (
      !['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff'].includes(
        extLower
      )
    )
      continue
    const baseOriginal = path.basename(file, extWithDot)
    const sanitizedBase = sanitizeFilename(baseOriginal, 60)
    const targetExt = extLower === '.jpeg' ? '.jpg' : extLower
    let newName = sanitizedBase + targetExt
    if (newName === file) continue // Already normalized
    // uniqueness (only if actually renaming)
    if (!dryRun) {
      let counter = 1
      while (
        newName !== file &&
        (await fs
          .access(path.join(directory, newName))
          .then(() => true)
          .catch(() => false))
      ) {
        newName = `${sanitizedBase}-${counter}${targetExt}`
        counter++
      }
    }
    const oldPath = path.join(directory, file)
    const newPath = path.join(directory, newName)
    if (dryRun) {
      plannedRenames.push({
        from: displayImagePath(subdirName, file),
        to: displayImagePath(subdirName, newName),
      })
    } else {
      try {
        await fs.rename(oldPath, newPath)
        console.log(`🔁 Renamed: ${file} → ${newName}`)
        // Update markdown reference if a paired markdown exists (best-effort)
        try {
          const pathParts = directory.split(path.sep)
          const memesIndex = pathParts.findIndex((p) => p === 'memes')
          if (memesIndex !== -1) {
            const subdirParts = pathParts.slice(memesIndex + 1)
            const contentDir = subdirParts.length
              ? path.join(__dirname, '..', 'content', 'memes', ...subdirParts)
              : path.join(__dirname, '..', 'content', 'memes')
            const mdPathGuessOld = path.join(contentDir, `${baseOriginal}.md`)
            const mdPathGuessSanitized = path.join(
              contentDir,
              `${sanitizedBase}.md`
            )
            const mdCandidates = [mdPathGuessOld, mdPathGuessSanitized]
            for (const mdCandidate of mdCandidates) {
              try {
                const data = await fs.readFile(mdCandidate, 'utf-8')
                const updated = data.replace(
                  new RegExp(file.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'g'),
                  newName
                )
                if (updated !== data) {
                  await fs.writeFile(mdCandidate, updated, 'utf-8')
                  console.log(
                    `   ↳ Updated markdown reference in ${path.basename(
                      mdCandidate
                    )}`
                  )
                }
              } catch {}
            }
          }
        } catch {}
        // Move manifest entry
        try {
          const oldKey = relImageKey(oldPath)
          const newKey = relImageKey(newPath)
          if (manifest.images[oldKey]) {
            manifest.images[newKey] = { ...manifest.images[oldKey] }
            delete manifest.images[oldKey]
            console.log(`   ↳ Manifest key updated: ${oldKey} → ${newKey}`)
          }
        } catch {}
      } catch (e) {
        console.error(`Failed to rename ${file}: ${e.message}`)
      }
    }
  }
  return plannedRenames
}

function displayImagePath(subdirName, filename) {
  return subdirName
    ? path.join('public', 'memes', subdirName, filename)
    : path.join('public', 'memes', filename)
}

/**
 * Find and move orphaned markdown files to _orphaned folder
 * @param {string} imageDirectory - Directory containing images
 * @param {string[]} imageFiles - Array of image filenames
 * @returns {Promise<string[]>} Array of orphaned markdown filenames that were moved
 */
async function findAndMoveOrphanedMarkdownFiles(
  imageDirectory,
  imageFiles,
  { dryRun = false } = {}
) {
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
          const m = imageMatch[0].match(/\/memes\/[^)]+/)
          if (!m) continue
          const imagePath = m[0]
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

    // If orphaned files found, move them to _orphaned folder (unless dryRun)
    if (orphanedFiles.length > 0) {
      if (dryRun) {
        // Report-only in dry-run; do not move files
        return orphanedFiles.map((f) => f.filename)
      }
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
    const imageDir = path.dirname(imagePath)
    const imageBaseName = path.basename(imagePath, path.extname(imagePath))
    const imageFilename = path.basename(imagePath)

    // Extract the subdirectory name from the path
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

    // Fast path: exact basename match
    try {
      await fs.access(markdownPath)
      return true
    } catch {}

    // Enhanced fuzzy matching fallback
    try {
      const files = await fs.readdir(contentDir)
      const mdFiles = files.filter((f) => f.toLowerCase().endsWith('.md'))

      // Create normalized versions for comparison
      const sanitizedImageBase = sanitizeFilename(
        imageBaseName,
        60
      ).toLowerCase()
      const imageBaseNoExt = imageBaseName.toLowerCase()

      for (const md of mdFiles) {
        const mdBaseName = path.basename(md, '.md').toLowerCase()
        const sanitizedMdBase = sanitizeFilename(
          path.basename(md, '.md'),
          60
        ).toLowerCase()

        // Check 1: Exact or sanitized basename match
        if (
          mdBaseName === imageBaseNoExt ||
          sanitizedMdBase === sanitizedImageBase
        ) {
          return true
        }

        // Check 2: Read file content and look for image reference
        try {
          const mdFull = path.join(contentDir, md)
          const data = await fs.readFile(mdFull, 'utf-8')

          // Check if markdown references this specific image
          if (data.includes(imageFilename)) {
            return true
          }

          // Check if markdown references image with subdirectory path
          const subdirPath =
            subdirParts.length > 0 ? subdirParts.join('/') + '/' : ''
          if (data.includes(`/memes/${subdirPath}${imageFilename}`)) {
            return true
          }

          // Check 3: Fuzzy match - if basenames are very similar (allowing for minor differences)
          if (areBaseNamesSimilar(mdBaseName, imageBaseNoExt)) {
            // Double-check that the markdown references *some* image in the same subdirectory
            const pathPattern = subdirPath ? `/memes/${subdirPath}` : '/memes/'
            if (data.includes(pathPattern)) {
              return true
            }
          }
        } catch {}
      }
    } catch {}
    return false
  } catch {
    return false
  }
}

/**
 * Helper: Check if two basenames are similar enough to be considered a match
 * Allows for minor variations in naming (numbers, special chars, etc.)
 */
function areBaseNamesSimilar(name1, name2) {
  // Remove common suffixes, numbers, and special chars for comparison
  const normalize = (str) => str.replace(/[-_\d]+$/, '').replace(/[^a-z]/g, '')
  const n1 = normalize(name1)
  const n2 = normalize(name2)

  if (n1 === n2 && n1.length > 3) return true

  // Check if one contains the other (for cases like "example" vs "example-1")
  if (n1.length > 5 && n2.length > 5) {
    if (n1.includes(n2) || n2.includes(n1)) return true
  }

  return false
}

// Manifest helpers ----------------------------------------------------------
const MEME_MANIFEST_PATH = path.join(
  __dirname,
  '..',
  'public',
  'memes',
  '_meme-manifest.json'
)

async function loadManifest() {
  try {
    const raw = await fs.readFile(MEME_MANIFEST_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { images: {} }
  }
}

async function saveManifest(manifest, dryRun = false) {
  if (dryRun) return
  await fs.writeFile(
    MEME_MANIFEST_PATH,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  )
}

function relImageKey(absImagePath) {
  // key relative to public/memes
  const parts = absImagePath.split(path.sep)
  const idx = parts.lastIndexOf('memes')
  return idx === -1
    ? path.basename(absImagePath)
    : parts.slice(idx + 1).join('/')
}

async function hashFile(filePath) {
  try {
    const buf = await fs.readFile(filePath)
    return crypto.createHash('sha1').update(buf).digest('hex')
  } catch {
    return null
  }
}
// ---------------------------------------------------------------------------

/**
 * Main function to process all images in a directory
 * @param {string} directory - Directory containing images
 * @param {string} subdirName - Name of subdirectory for reporting
 * @returns {Promise<Object>} Processing results with detailed stats
 */
async function processImages(directory, subdirName = '', options = {}) {
  const { dryRun = false, force = false } = options
  const manifest = await loadManifest()

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
    // Pre-pass normalization (returns planned renames when dryRun)
    const plannedRenames = await prepassNormalizeFilenames(
      directory,
      subdirName,
      { dryRun, manifest }
    )
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
      const key = relImageKey(imagePath)
      const entry = manifest.images[key] || {}

      // Check both hasMarkdownPair AND manifest optimized flag
      const hasPair = await hasMarkdownPair(imagePath)
      const isOptimized = entry.optimized === true

      if (hasPair || isOptimized) {
        imagesWithMarkdown.push(filename)
      } else {
        imagesWithoutMarkdown.push(filename)
      }
    }

    // --- Dry-run reporting prep -------------------------------------------------
    let dryRunReport = null
    if (dryRun && imagesWithoutMarkdown.length) {
      const relDirParts = directory.split(path.sep)
      const memesIdx = relDirParts.lastIndexOf('memes')
      const subRel =
        memesIdx !== -1 ? relDirParts.slice(memesIdx + 1).join('/') : ''

      const NEW_IMAGES = []
      const SANITIZED = []
      const SCALE_INFO = []
      const MARKDOWN_MAP = []

      for (const filename of imagesWithoutMarkdown) {
        const originalRel = subRel ? `${subRel}/${filename}` : filename
        NEW_IMAGES.push(originalRel)
        const ext = path.extname(filename).toLowerCase()
        const base = path.basename(filename, ext)
        const sanitizedBase = sanitizeFilename(base, 60)
        // Final target extension for output preview always .jpg
        const finalName = `${sanitizedBase}.jpg`
        SANITIZED.push(finalName)
        // Dimension + size probe (best-effort)
        let dims = { width: 0, height: 0 }
        try {
          dims =
            (await getImageDimensions(path.join(directory, filename))) || dims
        } catch {}
        let fileSize = 0
        try {
          const st = await fs.stat(path.join(directory, filename))
          fileSize = st.size
        } catch {}
        // Simple action inference mirroring optimize logic (approx)
        const MAX_WIDTH = 1080
        const TARGET_LONG_SIDE = 800
        const maxSide = Math.max(dims.width, dims.height)
        const minSide = Math.min(dims.width, dims.height)
        let action = 'convert-jpg'
        if (maxSide < TARGET_LONG_SIDE) action = `upscale→${TARGET_LONG_SIDE}`
        else if (dims.width > MAX_WIDTH) action = `downscale→≤${MAX_WIDTH}`
        else action = 'optimize/strip'
        const sizeKB = fileSize ? (fileSize / 1024).toFixed(0) : '?'
        // We cannot know new size; show placeholder ~
        const pct = action.startsWith('downscale')
          ? '≈-25%'
          : action.startsWith('upscale')
            ? '+??'
            : '≈-10%'
        SCALE_INFO.push({
          name: finalName,
          dims: `${dims.width}x${dims.height}`,
          sizeKB,
          pct,
        })
        MARKDOWN_MAP.push({
          image: finalName,
          md: finalName.replace(/\.jpg$/, '') + '.md',
        })
      }

      dryRunReport = { NEW_IMAGES, SANITIZED, SCALE_INFO, MARKDOWN_MAP }
      // Print formatted report now
      const bar = '###############################'
      console.log(`\n${bar}\n\n📂 LIST OF NEW IMAGES\nfound in public/memes/ :`)
      NEW_IMAGES.forEach((f) => console.log(f))
      console.log('\n⮕⮕⮕⮕⮕⮕\n\n🧹 IMAGE NAMES SANITIZED & → jpg:')
      SANITIZED.forEach((f) => console.log(f))
      console.log(
        '\n⮕⮕⮕⮕⮕⮕\n\n🗜️ IMAGES SCALED / COMPRESSED (orig dims, est size change):'
      )
      SCALE_INFO.forEach((r) =>
        console.log(`${r.name} | ${r.dims} | ${r.sizeKB}KB | ${r.pct}`)
      )
      console.log(
        '\n⮕⮕⮕⮕⮕⮕\n\n📝 MATCHING PAIRED MARKDOWN FILES (to be created in content/memes/):'
      )
      MARKDOWN_MAP.forEach((m) => {
        const sub = subRel ? `${subRel}/` : ''
        console.log(`${sub}${m.image}`)
        console.log(`  -> ${sub}${m.md}`)
      })
      console.log(`\nImages updated (would process): ${SCALE_INFO.length}`)
      console.log(`Markdown created (would create): ${MARKDOWN_MAP.length}`)
    }
    // ---------------------------------------------------------------------------

    // Check for orphaned markdown files and automatically move them to _orphaned folder
    const movedOrphanedFiles = await findAndMoveOrphanedMarkdownFiles(
      directory,
      imageFiles,
      { dryRun }
    )

    // rename loop only when not dry-run (dry-run is report-only)
    if (!dryRun) {
      for (const filename of imagesWithoutMarkdown) {
        const ext = path.extname(filename).toLowerCase()
        if (imageExtensions.includes(ext))
          await renameImageFile(directory, filename)
      }
    }
    // IMPORTANT: After potential renames, recompute missing list so filenames are current
    let effectiveMissing = imagesWithoutMarkdown
    if (!dryRun) {
      try {
        const filesAfter = await fs.readdir(directory)
        const imageFilesAfter = filesAfter.filter((fname) =>
          imageExtensions.includes(path.extname(fname).toLowerCase())
        )
        const imagesWithoutMarkdownAfter = []
        for (const filename of imageFilesAfter) {
          const imagePath = path.join(directory, filename)
          if (await hasMarkdownPair(imagePath)) continue
          imagesWithoutMarkdownAfter.push(filename)
        }
        effectiveMissing = imagesWithoutMarkdownAfter
      } catch {}
    }
    // If dry-run: we skip deep optimize (avoid noisy logs) and simulate
    let optimizationResult = {
      processedCount: 0,
      skippedFiles: [],
      actions: [],
    }
    if (!dryRun) {
      optimizationResult = (await optimizeImages(directory, subdirName, {
        manifest,
        dryRun,
        force,
      })) || { processedCount: 0, skippedFiles: [], actions: [] }
    }
    // ALWAYS create markdown for missing (simulate in dry-run)
    let newMarkdownCount = 0
    let newMarkdownFiles = []
    if (effectiveMissing.length > 0) {
      if (!dryRun) {
        try {
          const createMarkdownScript = path.join(
            __dirname,
            'utils',
            'create-matching-markdown.js'
          )
          const command = subdirName
            ? `node "${createMarkdownScript}" "${subdirName}"`
            : `node "${createMarkdownScript}"`
          await execPromise(command)
          newMarkdownCount = effectiveMissing.length
          newMarkdownFiles = effectiveMissing.map((filename) => {
            const basename = path.basename(filename, path.extname(filename))
            return `${basename}.md`
          })
        } catch (e) {
          console.error(`❌ Error creating markdown files: ${e.message}`)
        }
      } else {
        // simulate only
        newMarkdownCount = effectiveMissing.length
        newMarkdownFiles = effectiveMissing.map((filename) => {
          const basename = path.basename(filename, path.extname(filename))
          return `${basename}.md`
        })
      }
    }
    await saveManifest(manifest, dryRun)

    // If dry-run: print structured report & summary ONLY and return early
    if (dryRun) {
      const totalFiles = imageFiles.length
      const imagesUpdated = imagesWithoutMarkdown.length // approximation
      const optimizedThisRun = imagesUpdated
      const bar = '\n###############################'
      console.log(`${bar}`)
      console.log(`\nSUMMARY: public/memes/${subdirName || '*'}`)
      console.log(`Total image files: ${totalFiles}`)
      console.log(`Images updated: ${imagesUpdated}`)
      console.log(`Optimized this run: ${optimizedThisRun}`)
      console.log(`Images with existing markdown: ${imagesWithMarkdown.length}`)
      console.log(`New markdown files created: ${newMarkdownCount}`)
      console.log(`Markdown created: ${newMarkdownCount}`)
      console.log(`Orphaned markdown moved: ${movedOrphanedFiles.length}`)
      console.log(`Mode: DRY-RUN`)
      console.log(`${bar}`)
      return {
        totalFiles,
        existingMarkdown: imagesWithMarkdown.length,
        processedCount: 0,
        newMarkdownCount,
        newMarkdownFiles,
        missingMarkdownFiles: imagesWithoutMarkdown,
        orphanedMarkdownFiles: movedOrphanedFiles,
        dryRun: true,
        force,
        manifestPath: MEME_MANIFEST_PATH,
        skipped: [],
        actions: [],
        plannedRenames,
        dryRunReport,
      }
    }

    const changed =
      (optimizationResult?.processedCount || 0) > 0 ||
      newMarkdownCount > 0 ||
      movedOrphanedFiles.length > 0

    if (dryRun) {
      console.log(
        `\n📊 Summary (${subdirName || 'root'}): no changes (dry-run)`
      )
    }
    console.log(
      `\n📊 Summary (${subdirName || 'root'}): optimized ${
        optimizationResult?.processedCount || 0
      }, markdown +${newMarkdownCount}, orphaned moved ${
        movedOrphanedFiles.length
      }`
    )
    const acts = Array.isArray(optimizationResult?.actions)
      ? optimizationResult.actions
      : []
    acts.forEach((a) => console.log(`  • ${a.file} -> ${a.action}`))
    if (newMarkdownFiles.length) {
      console.log('  • markdown created:')
      newMarkdownFiles.forEach((f) => console.log(`    - ${f}`))
    }
    if (movedOrphanedFiles.length) {
      console.log('  • orphaned moved:')
      movedOrphanedFiles.forEach((f) => console.log(`    - ${f}`))
    }

    return {
      totalFiles,
      existingMarkdown: imagesWithMarkdown.length,
      processedCount: optimizationResult?.processedCount || 0,
      newMarkdownCount,
      newMarkdownFiles,
      missingMarkdownFiles: effectiveMissing,
      orphanedMarkdownFiles: movedOrphanedFiles,
      dryRun,
      force,
      manifestPath: MEME_MANIFEST_PATH,
      skipped: optimizationResult.skippedFiles,
      actions: optimizationResult.actions,
      plannedRenames,
      dryRunReport,
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

// --- Read-only Audit helpers (exported below) ------------------------------
/**
 * Inspect image properties without modifying files.
 * Reports: width/height, orientation, format, interlace, profiles, xattr marker, and compliance.
 *
 * Compliance definition (to mirror optimizeImages intent):
 * - Dimensions: MIN_WIDTH <= width <= MAX_WIDTH
 * - Format: JPEG
 * - Interlace: Plane (progressive)
 * - Profiles: none (since we strip with +profile "*")
 *
 * Note: xattr user.meme_optimized indicates our pipeline touched the file on this machine.
 */
async function auditImages(directory, subdirName = '') {
  const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp']
  const files = await fs.readdir(directory)

  const MIN_SIDE = 500
  const TARGET_LONG_SIDE = 800
  const MAX_WIDTH = 1080

  const results = []

  for (const file of files) {
    const ext = path.extname(file).toLowerCase().replace('.', '')
    if (!extensions.includes(ext)) continue

    const filePath = path.join(directory, file)
    let width = 0
    let height = 0
    let format = ''
    let interlace = ''
    let profilesRaw = ''
    let hasProfiles = false
    let optimizedXattr = false

    try {
      // gather with a single identify -format call where possible
      const { stdout } = await execPromise(
        `identify -format "%w %h|%m|%[interlace]|%[profiles]" "${filePath}"`
      )
      const [dimStr, fmt, il, prof] = stdout.trim().split('|')
      const [wStr, hStr] = dimStr.split(' ')
      width = Number(wStr) || 0
      height = Number(hStr) || 0
      format = (fmt || '').toUpperCase()
      interlace = il || ''
      profilesRaw = prof || ''
      hasProfiles = Boolean(profilesRaw && profilesRaw.trim() !== 'none')
    } catch (e) {
      // fall back to separate calls if needed
      const dims = await getImageDimensions(filePath)
      if (dims) {
        width = dims.width
        height = dims.height
      }
      try {
        const { stdout: fmts } = await execPromise(
          `identify -format "%m" "${filePath}"`
        )
        format = (fmts || '').trim().toUpperCase()
      } catch {}
      try {
        const { stdout: ils } = await execPromise(
          `identify -format "%[interlace]" "${filePath}"`
        )
        interlace = (ils || '').trim()
      } catch {}
      try {
        const { stdout: profs } = await execPromise(
          `identify -format "%[profiles]" "${filePath}"`
        )
        profilesRaw = (profs || '').trim()
        hasProfiles = Boolean(profilesRaw && profilesRaw !== 'none')
      } catch {}
    }

    // orientation
    const orientation =
      width === height ? 'square' : width > height ? 'landscape' : 'portrait'

    // xattr mark (best-effort; macOS only)
    optimizedXattr = await isImageOptimized(filePath)

    // compliance checks (new):
    const minSide = Math.min(width, height)
    const maxSide = Math.max(width, height)
    let dimStatus = 'within'
    if (minSide < MIN_SIDE) dimStatus = 'below-min'
    else if (maxSide < TARGET_LONG_SIDE) dimStatus = 'below-target'
    else if (width > MAX_WIDTH) dimStatus = 'above-max'
    const fmtOk = format === 'JPEG' || format === 'JPG'
    const profilesOk = !hasProfiles
    // No longer require progressive/interlace
    const compliant = dimStatus !== 'below-min' && fmtOk && profilesOk

    results.push({
      file: subdirName ? `${subdirName}/${file}` : file,
      width,
      height,
      orientation,
      format,
      interlace,
      hasProfiles,
      optimizedXattr,
      dimStatus,
      fmtOk,
      profilesOk,
      compliant,
    })
  }

  return results
}

export { auditImages }
