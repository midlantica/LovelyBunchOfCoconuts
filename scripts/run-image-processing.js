#!/usr/bin/env node

import path from 'path'
import fs from 'fs/promises'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { processImages, auditImages } from './imageProcessing.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const exec = promisify(execCb)

// Parse args & flags
const rawArgs = process.argv.slice(2)
const flags = new Set(rawArgs.filter((a) => a.startsWith('--')))
const positional = rawArgs.filter((a) => !a.startsWith('--'))
const subdirName = positional[0]
const dryRun = flags.has('--dry-run')
const force = flags.has('--force')
const audit = flags.has('--audit')
const reloadBrowser = flags.has('--reload-browser') || flags.has('--reload')
const reloadMatchArg = rawArgs.find((a) => a.startsWith('--reload-match='))
const reloadMatch = reloadMatchArg ? reloadMatchArg.split('=')[1] : 'localhost'
const reloadBrowserArg = rawArgs.find((a) => a.startsWith('--browser='))
const reloadTarget = (
  reloadBrowserArg ? reloadBrowserArg.split('=')[1] : 'all'
).toLowerCase()

if (flags.has('--help')) {
  console.log(`Usage: pnpm process-images [subdir] [--dry-run] [--force] [--audit] [--reload-browser] [--reload-match=substr] [--browser=chrome|safari|all]

Examples:
  pnpm process-images
  pnpm process-images thomas-sowell
  pnpm process-images thomas-sowell --dry-run
  pnpm process-images --force
  pnpm process-images --audit

Flags:
  --dry-run     Show what would happen without modifying files
  --force       Reprocess even if marked optimized in manifest
  --audit       Read-only inspection (dimensions, orientation, format, interlace, profiles)
  --reload-browser           macOS dev convenience: reload matching browser tabs after processing
  --reload-match=substr      Tab URL substring to match (default: localhost)
  --browser=chrome|safari|all  Which browser to target (default: all)`)
  process.exit(0)
}

async function maybeReloadBrowser() {
  if (!reloadBrowser || dryRun || process.platform !== 'darwin') return
  const match = reloadMatch || 'localhost'
  const wantChrome = reloadTarget === 'all' || reloadTarget === 'chrome'
  const wantSafari = reloadTarget === 'all' || reloadTarget === 'safari'
  const scripts = []
  if (wantChrome) {
    const sc = `tell application "Google Chrome"
repeat with w in windows
  repeat with t in tabs of w
    if (URL of t contains "${match}") then
      tell t to reload
    end if
  end repeat
end repeat
end tell`
    scripts.push(sc)
  }
  if (wantSafari) {
    const ss = `tell application "Safari"
repeat with w in windows
  repeat with t in tabs of w
    if (URL of t contains "${match}") then
      do JavaScript "location.reload(true)" in t
    end if
  end repeat
end repeat
end tell`
    scripts.push(ss)
  }
  try {
    for (const s of scripts) {
      const safe = s.replace(/'/g, "'\\''")
      await exec(`osascript -e '${safe}'`)
    }
    // Optional: small ding to confirm
    await exec(`osascript -e 'beep 1'`).catch(() => {})
  } catch (e) {
    // Silent failure in non-interactive or closed browsers
  }
}

function printHeader(title) {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

async function processAllSubdirectories() {
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')

  try {
    const entries = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    const perFolder = []
    const perFolderDetails = []

    for (const subdir of subdirs) {
      const subdirPath = path.join(baseMemeDir, subdir)

      if (audit) {
        printHeader(`Auditing: ${subdir}`)
        const rows = await auditImages(subdirPath, subdir)
        if (!rows.length) console.log('  (no images)')
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
        continue
      }

      const result = await processImages(subdirPath, subdir, { dryRun, force })
      if (!result) continue

      perFolder.push({ name: subdir, total: result.totalFiles ?? 0 })
      perFolderDetails.push({
        name: subdir,
        optimized: result.processedCount || 0,
        newMarkdown: result.newMarkdownCount || 0,
        orphanedMoved: (result.orphanedMarkdownFiles || []).length,
      })
    }

    if (!audit) {
      printHeader('GLOBAL SUMMARY')
      // Build table rows
      const headers = ['Folder', 'opt', 'md+', 'orphaned', 'files']
      const rows = perFolderDetails.map((d) => [
        d.name,
        String(d.optimized),
        String(d.newMarkdown),
        String(d.orphanedMoved),
        String(perFolder.find((p) => p.name === d.name)?.total ?? ''),
      ])
      const widths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map((r) => r[i].length))
      )
      const pad = (s, i) => s.padEnd(widths[i], ' ')
      const headerLine = headers.map((h, i) => pad(h, i)).join('  |  ')
      const sep = widths.map((w) => '-'.repeat(w)).join('--+--')
      console.log(headerLine)
      console.log(sep)
      rows.forEach((r) => console.log(r.map((c, i) => pad(c, i)).join('  |  ')))
      console.log(
        `\nMode: ${
          dryRun ? 'DRY-RUN (no changes written)' : force ? 'FORCE' : 'NORMAL'
        }`
      )
      await maybeReloadBrowser()
    }
  } catch (error) {
    console.error(`Error processing subdirectories: ${error.message}`)
    process.exit(1)
  }
}

if (!subdirName) {
  console.log(`Processing images in: ALL public/memes subdirectories`)
  processAllSubdirectories()
    .then(() => console.log('\n✅ Global image processing complete.'))
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
        if (dryRun) return // suppress duplicate summary in subdir mode
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
        return maybeReloadBrowser()
      })
      .catch((err) => {
        console.error('Image processing failed:', err)
        process.exit(1)
      })
  }
}
