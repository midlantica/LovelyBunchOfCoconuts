import { exec } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { promisify } from 'util'
const execPromise = promisify(exec)

/**
 * Scale an image to a target long side, preserving aspect ratio.
 * Skips images where either side <500px. Supports dry-run.
 * @param {string} filePath
 * @param {number} targetLongSide
 * @param {boolean} dryRun
 * @returns {Promise<'too-small'|'already-large'|'scaled'|'dry-run'|Error>}
 */
export async function scaleImage(
  filePath,
  targetLongSide = 800,
  dryRun = false
) {
  try {
    const { stdout } = await execPromise(
      `identify -format "%w %h" "${filePath}"`
    )
    const [width, height] = stdout.trim().split(' ').map(Number)
    const minSide = Math.min(width, height)
    const maxSide = Math.max(width, height)
    // Always permit upscaling tiny images to reach the target
    if (maxSide >= targetLongSide) {
      if (dryRun) {
        console.log(
          `✅ Would skip (already large): ${filePath} (${width}x${height})`
        )
      } else {
        console.log(`✅ Already large enough: ${filePath} (${width}x${height})`)
      }
      return 'already-large'
    }
    const resizeArg =
      width >= height ? `${targetLongSide}x` : `x${targetLongSide}`
    let afterDims =
      width >= height
        ? [targetLongSide, Math.round(height * (targetLongSide / width))]
        : [Math.round(width * (targetLongSide / height)), targetLongSide]
    if (dryRun) {
      const tinyNote = minSide < 500 ? ' (tiny)' : ''
      console.log(
        `🟡 Would scale${tinyNote}: ${filePath} ${width}x${height} → ${afterDims[0]}x${afterDims[1]}`
      )
      return 'dry-run'
    }
    await execPromise(`mogrify -resize ${resizeArg} "${filePath}"`)
    console.log(
      `🔄 Scaled: ${filePath} ${width}x${height} → ${afterDims[0]}x${afterDims[1]}`
    )
    return 'scaled'
  } catch (e) {
    console.error(`Error scaling ${filePath}: ${e.message}`)
    return e
  }
}

/**
 * Recursively scale all images in a directory tree using scaleImage.
 * Prints a one-line result per file and a final summary.
 * @param {string} dir
 * @param {number} targetLongSide
 * @param {boolean} dryRun
 * @returns {Promise<{total:number, wouldScale:number, scaled:number, skipped:number, tooSmall:number}>}
 */
export async function scaleAllImagesInDir(
  dir,
  targetLongSide = 800,
  dryRun = false
) {
  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  let scaled = 0,
    skipped = 0,
    tooSmall = 0,
    total = 0,
    dryRunCount = 0

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
        total++
        const result = await scaleImage(full, targetLongSide, dryRun)
        if (result === 'already-large') skipped++
        else if (result === 'too-small') tooSmall++
        else if (result === 'dry-run') dryRunCount++
        else if (result === 'scaled') scaled++
      }
    }
  }
  await walk(dir)
  const wouldScale = dryRun ? dryRunCount : scaled
  console.log(
    `\nSummary: total ${total}, would scale ${wouldScale}, skipped (already large) ${skipped}, too small ${tooSmall}`
  )
  return { total, wouldScale, scaled, skipped, tooSmall }
}
