#!/usr/bin/env node
// @ts-nocheck

import path from 'path'
import fs from 'fs/promises'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { processImages, auditImages } from './imageProcessing.js'
import crypto from 'crypto'

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
const openCreated =
  flags.has('--open-created') || flags.has('--open-md') || flags.has('--open')

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
  --browser=chrome|safari|all  Which browser to target (default: all)
  --open-created | --open     Open any newly-created markdown files in VS Code after processing`)
  process.exit(0)
}

async function openInVSCode(paths) {
  if (!paths || !paths.length) return
  // Wait briefly for files to exist to avoid opening empty buffers on race
  const waitFor = async (p, tries = 10, delay = 100) => {
    for (let i = 0; i < tries; i++) {
      try {
        const st = await fs.stat(p)
        if (st.size >= 0) return true
      } catch {}
      await new Promise((r) => setTimeout(r, delay))
    }
    return false
  }
  for (const p of paths) {
    await waitFor(p)
  }
  const esc = (s) => `'${s.replace(/'/g, "'\\''")}'`
  const args = paths.map(esc).join(' ')
  try {
    await exec(`command -v code >/dev/null 2>&1 && code -r ${args}`)
    return
  } catch {}
  try {
    await exec(`open -a "Visual Studio Code" ${args}`)
  } catch {}
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

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return maxLen === 0 ? 1 : 1 - distance / maxLen
}

/**
 * Extract content body from markdown file
 */
function extractContentBody(content) {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n*/m, '')
  // Remove markdown formatting but keep the text content
  const cleaned = withoutFrontmatter
    .replace(/#+\s/g, '') // headers
    .replace(/\*\*/g, '') // bold
    .replace(/\*/g, '') // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links - keep link text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // images - remove completely
    .replace(/\n\s*\n/g, '\n') // normalize multiple newlines
    .trim()

  // Only compare if there's actual content (at least 10 characters)
  // This prevents false matches on nearly-empty files
  if (cleaned.length < 10) {
    return crypto.randomBytes(16).toString('hex') // Return unique value for empty files
  }

  return cleaned.toLowerCase()
}

/**
 * Find duplicate or near-duplicate markdown files in content directories
 */
async function findDuplicateContent(
  categories = ['claims', 'quotes', 'memes']
) {
  const contentDir = path.join(__dirname, '..', 'content')
  const duplicates = []

  for (const category of categories) {
    const categoryDir = path.join(contentDir, category)

    try {
      await fs.access(categoryDir)
    } catch {
      continue // Skip if category doesn't exist
    }

    // Read all markdown files in category
    const files = await fs.readdir(categoryDir)
    const mdFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('_'))

    const fileContents = []

    // Read all file contents
    for (const file of mdFiles) {
      try {
        const filePath = path.join(categoryDir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const body = extractContentBody(content)
        const hash = crypto.createHash('md5').update(body).digest('hex')

        fileContents.push({
          file,
          path: filePath,
          body,
          hash,
          category,
        })
      } catch (err) {
        // Skip files that can't be read
      }
    }

    // Compare files for duplicates
    for (let i = 0; i < fileContents.length; i++) {
      for (let j = i + 1; j < fileContents.length; j++) {
        const file1 = fileContents[i]
        const file2 = fileContents[j]

        // Check for exact hash match (identical content)
        if (file1.hash === file2.hash) {
          duplicates.push({
            category,
            file1: file1.file,
            file2: file2.file,
            path1: file1.path,
            path2: file2.path,
            similarity: 1.0,
            type: 'identical',
          })
          continue
        }

        // Check for near-identical content (>85% similar)
        const similarity = calculateSimilarity(file1.body, file2.body)
        if (similarity > 0.85) {
          duplicates.push({
            category,
            file1: file1.file,
            file2: file2.file,
            path1: file1.path,
            path2: file2.path,
            similarity,
            type: 'similar',
          })
        }
      }
    }
  }

  return duplicates
}

/**
 * Print duplicate content report with clickable links
 */
function printDuplicateReport(duplicates) {
  if (duplicates.length === 0) {
    printHeader('✅ NO DUPLICATE CONTENT DETECTED')
    console.log('Found 0 potential duplicate(s).\n')
    return
  }

  printHeader('⚠️  DUPLICATE CONTENT DETECTED')
  console.log(`Found ${duplicates.length} potential duplicate(s):\n`)

  const byCategory = {}
  for (const dup of duplicates) {
    if (!byCategory[dup.category]) {
      byCategory[dup.category] = []
    }
    byCategory[dup.category].push(dup)
  }

  for (const [category, dups] of Object.entries(byCategory)) {
    console.log(`\n📁 ${category.toUpperCase()}:`)
    for (const dup of dups) {
      const simPercent = (dup.similarity * 100).toFixed(1)
      const typeLabel =
        dup.type === 'identical' ? '🔴 IDENTICAL' : `🟡 ${simPercent}% SIMILAR`
      console.log(`\n  ${typeLabel}`)
      console.log(`    file://${dup.path1}`)
      console.log(`    file://${dup.path2}`)
    }
  }

  console.log(
    '\n💡 Tip: Cmd+Click (macOS) or Ctrl+Click (Windows/Linux) the file:// paths to open them'
  )
  console.log('')
}

async function processAllSubdirectories() {
  const baseMemeDir = path.join(__dirname, '..', 'public', 'memes')

  try {
    const entries = await fs.readdir(baseMemeDir, { withFileTypes: true })
    const subdirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    const perFolder = []
    const perFolderDetails = []
    const createdMarkdownPaths = []

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
      if (
        !dryRun &&
        Array.isArray(result.newMarkdownFiles) &&
        result.newMarkdownFiles.length
      ) {
        for (const f of result.newMarkdownFiles) {
          createdMarkdownPaths.push(
            path.join(__dirname, '..', 'content', 'memes', subdir, f)
          )
        }
      }
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
      if (openCreated && createdMarkdownPaths.length) {
        console.log(
          `\nOpening ${createdMarkdownPaths.length} new markdown file(s) in VS Code...`
        )
        await openInVSCode(createdMarkdownPaths)
      }
      await maybeReloadBrowser()

      // Check for duplicate content
      console.log('\nScanning for duplicate content...')
      const duplicates = await findDuplicateContent([
        'claims',
        'quotes',
        'memes',
      ])
      printDuplicateReport(duplicates)
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
      .then(async (result) => {
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
        if (
          openCreated &&
          Array.isArray(result.newMarkdownFiles) &&
          result.newMarkdownFiles.length
        ) {
          const files = result.newMarkdownFiles.map((f) =>
            path.join(__dirname, '..', 'content', 'memes', subdirName, f)
          )
          console.log(
            `\nOpening ${files.length} new markdown file(s) in VS Code...`
          )
          await openInVSCode(files)
        }
        await maybeReloadBrowser()

        // Check for duplicate content
        console.log('\nScanning for duplicate content...')
        const duplicates = await findDuplicateContent([
          'claims',
          'quotes',
          'memes',
        ])
        printDuplicateReport(duplicates)
      })
      .catch((err) => {
        console.error('Image processing failed:', err)
        process.exit(1)
      })
  }
}
