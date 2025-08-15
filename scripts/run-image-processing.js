#!/usr/bin/env node

import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { processImages, auditImages } from './imageProcessing.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse args & flags
const rawArgs = process.argv.slice(2)
const flags = new Set(rawArgs.filter((a) => a.startsWith('--')))
const positional = rawArgs.filter((a) => !a.startsWith('--'))
const subdirName = positional[0]
const dryRun = flags.has('--dry-run')
const force = flags.has('--force')
const audit = flags.has('--audit')
// Fixed target policy: minimum 800px on the long side (no CLI override)
const TARGET_LONG_SIDE = 800

if (flags.has('--help')) {
  console.log(
    `Usage: pnpm process-images [subdir] [--dry-run] [--force] [--audit]\n\n` +
      `Examples:\n  pnpm process-images\n  pnpm process-images thomas-sowell\n  pnpm process-images thomas-sowell --dry-run\n  pnpm process-images --force\n  pnpm process-images --audit\n\nFlags:\n  --dry-run     Show what would happen without modifying files\n  --force       Reprocess even if marked optimized in manifest\n  --audit       Read-only inspection (dimensions, orientation, format, interlace, profiles)`
  )
  process.exit(0)
}

function printHeader(title) {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

/**
 * Process all subdirectories recursively
 */
async function processAllSubdirectories() {
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')

  try {
    const entries = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    console.log(`🔍 Found ${subdirs.length} subdirectories to process`)
    console.log(`Options: dryRun=${dryRun} force=${force} audit=${audit}`)

    let totalProcessed = 0
    let totalExisting = 0
    const allNewFiles = []

    for (const subdir of subdirs) {
      const subdirPath = path.join(baseMemeDir, subdir)
      printHeader(`${audit ? 'Auditing' : 'Processing'}: ${subdir}`)
      if (audit) {
        const rows = await auditImages(subdirPath, subdir)
        if (!rows.length) {
          console.log('  (no images)')
        } else {
          // concise output: file, WxH, orient, fmt, interlace, profiles?, compliant
          for (const r of rows) {
            console.log(
              `  • ${r.file} :: ${r.width}x${r.height} ${r.orientation} | ${
                r.format
              }/${r.interlace} | profiles:${
                r.hasProfiles ? 'yes' : 'no'
              } | ok:${r.compliant}`
            )
          }
        }
        continue
      }
      const result = await processImages(subdirPath, subdir, {
        dryRun,
        force,
      })
      if (result) {
        totalProcessed += result.processedCount || 0
        totalExisting += result.existingCount || 0
        if (result.newFiles) {
          allNewFiles.push(
            ...result.newFiles.map((file) => `${subdir}/${file}`)
          )
        }
      }
    }

    if (!audit) {
      printHeader('GLOBAL SUMMARY')
      console.log(`Processed (optimized) new images: ${totalProcessed}`)
      console.log(`Skipped (existing/optimized): ${totalExisting}`)
      if (allNewFiles.length > 0) {
        console.log(`\nNew images:`)
        allNewFiles.forEach((file) => {
          const mdFile = file.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '.md')
          console.log(`  ${file} -> ${mdFile}`)
        })
      }
      console.log(
        `\nMode: ${
          dryRun ? 'DRY-RUN (no changes written)' : force ? 'FORCE' : 'NORMAL'
        }`
      )
    }
  } catch (error) {
    console.error(`Error processing subdirectories: ${error.message}`)
    process.exit(1)
  }
}

if (!subdirName) {
  console.log(`Processing images in: ALL public/memes subdirectories`)
  processAllSubdirectories()
    .then(() => {
      console.log('\n✅ Global image processing complete.')
    })
    .catch((err) => {
      console.error('Global image processing failed:', err)
      process.exit(1)
    })
} else {
  const targetDir = path.join(__dirname, '..', 'public', 'memes', subdirName)
  const displayPath = `public/memes/${subdirName}`
  console.log(`Processing images in: ${displayPath}`)
  console.log(`Options: dryRun=${dryRun} force=${force} audit=${audit}`)

  if (audit) {
    auditImages(targetDir, subdirName)
      .then((rows) => {
        if (!rows.length) console.log('(no images)')
        else
          rows.forEach((r) =>
            console.log(
              `  • ${r.file} :: ${r.width}x${r.height} ${r.orientation} | ${
                r.format
              }/${r.interlace} | profiles:${
                r.hasProfiles ? 'yes' : 'no'
              } | ok:${r.compliant}`
            )
          )
      })
      .catch((err) => {
        console.error('Audit failed:', err)
        process.exit(1)
      })
  } else {
    processImages(targetDir, subdirName, { dryRun, force })
      .then((result) => {
        if (!result) return
        if (dryRun) {
          // Structured dry-run report already printed inside processImages; suppress duplicate summary.
          return
        }
        console.log('\nImage processing complete.')
        printHeader(`SUMMARY: ${displayPath}`)
        console.log(`Total image files: ${result.totalFiles}`)
        console.log(`Images with existing markdown: ${result.existingMarkdown}`)
        console.log(`Optimized this run: ${result.processedCount}`)
        console.log(`New markdown files created: ${result.newMarkdownCount}`)
        console.log(
          `Orphaned markdown moved: ${
            result.orphanedMarkdownFiles?.length || 0
          }`
        )
        console.log(`Mode: ${force ? 'FORCE' : 'NORMAL'}`)
        if (result.actions && result.actions.length) {
          console.log('\nActions:')
          result.actions.forEach((a) =>
            console.log(`  • ${a.file} -> ${a.action}`)
          )
        }
        if (result.skipped && result.skipped.length) {
          console.log('\nSkipped:')
          result.skipped.forEach((s) =>
            console.log(`  • ${s.file} (${s.reason})`)
          )
        }
        if (result.newMarkdownFiles && result.newMarkdownFiles.length > 0) {
          console.log('\nNew markdown:')
          result.newMarkdownFiles.forEach((f) => console.log(`  ✅ ${f}`))
        }
        if (
          result.missingMarkdownFiles &&
          result.missingMarkdownFiles.length > 0
        ) {
          console.log('\nImages that gained markdown this run:')
          result.missingMarkdownFiles.forEach((f) => console.log(`  📷 ${f}`))
        }
        if (result.newMarkdownCount === 0 && result.processedCount === 0) {
          console.log('\n🎉 All images in sync with markdown, Yay!')
        }
        console.log(`\nManifest: ${result.manifestPath}`)
      })
      .catch((err) => {
        console.error('Image processing failed:', err)
        process.exit(1)
      })
  }
}
