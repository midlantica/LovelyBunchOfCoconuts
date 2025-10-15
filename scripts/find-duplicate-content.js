#!/usr/bin/env node

/**
 * Find Duplicate Content Across Claims, Quotes, and Memes
 *
 * This script identifies duplicate content by comparing the actual text content
 * of markdown files within each content type (claims, quotes, memes).
 *
 * Usage:
 *   node scripts/find-duplicate-content.js [--verbose] [--apply]
 *
 * Features:
 * - Compares actual content text, not just filenames
 * - Groups duplicates by content type (claims, quotes, memes)
 * - Shows content preview and file sizes for comparison
 * - Dry run by default, --apply to move duplicates to backup
 * - --verbose shows detailed content comparison
 */

import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const DRY_RUN = !process.argv.includes('--apply')
const VERBOSE = process.argv.includes('--verbose')

// Content types to check for duplicates
const CONTENT_TYPES = ['grifts', 'quotes', 'memes']

async function extractContentText(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')

    // Remove frontmatter
    const lines = content.split('\n')
    let contentStart = 0
    let inFrontmatter = false

    if (lines[0] === '---') {
      inFrontmatter = true
      contentStart = 1

      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          contentStart = i + 1
          inFrontmatter = false
          break
        }
      }
    }

    // Extract main content (skip frontmatter)
    const mainContent = lines.slice(contentStart).join('\n').trim()

    // Normalize text for comparison
    const normalized = mainContent
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    return {
      raw: mainContent,
      normalized,
      hash: crypto.createHash('md5').update(normalized).digest('hex'),
      size: Buffer.byteLength(content, 'utf8'),
    }
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`)
    return null
  }
}

async function findDuplicatesInType(contentType) {
  const typeDir = path.join(CONTENT_DIR, contentType)
  const duplicates = new Map()
  const files = []

  try {
    // Recursively find all markdown files
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory() && !entry.name.startsWith('_')) {
          await scanDirectory(fullPath)
        } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
          files.push(fullPath)
        }
      }
    }

    await scanDirectory(typeDir)

    console.log(`📁 Scanning ${files.length} ${contentType} files...`)

    // Extract content from each file
    for (const filePath of files) {
      const content = await extractContentText(filePath)
      if (content && content.normalized.length > 10) {
        // Skip very short content
        const relativePath = path.relative(CONTENT_DIR, filePath)

        if (!duplicates.has(content.hash)) {
          duplicates.set(content.hash, [])
        }

        duplicates.get(content.hash).push({
          path: filePath,
          relativePath,
          content,
          filename: path.basename(filePath),
        })
      }
    }

    // Filter to only groups with duplicates
    const duplicateGroups = Array.from(duplicates.entries())
      .filter(([hash, group]) => group.length > 1)
      .map(([hash, group]) => ({ hash, files: group }))

    return duplicateGroups
  } catch (error) {
    console.error(`Error scanning ${contentType}: ${error.message}`)
    return []
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${Math.round(bytes / (1024 * 1024))}MB`
}

function chooseFileToKeep(files) {
  // Prefer files with:
  // 1. Longer content (more complete)
  // 2. Better filename (no -1, more descriptive)
  // 3. Newer modification time

  let best = files[0]

  for (const file of files) {
    // Prefer longer content
    if (file.content.size > best.content.size) {
      best = file
      continue
    }

    // If same size, prefer better filename
    if (file.content.size === best.content.size) {
      // Prefer files without -1 suffix
      if (best.filename.includes('-1') && !file.filename.includes('-1')) {
        best = file
        continue
      }

      // Prefer shorter, cleaner filenames
      if (file.filename.length < best.filename.length) {
        best = file
      }
    }
  }

  return best
}

async function createBackupDir() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupDir = path.join(CONTENT_DIR, '_duplicates_backup', timestamp)
  await fs.mkdir(backupDir, { recursive: true })
  return backupDir
}

async function main() {
  console.log('🔍 Scanning for duplicate content across content types...\n')

  const allDuplicates = []

  for (const contentType of CONTENT_TYPES) {
    console.log(`\n📂 Checking ${contentType}...`)
    const duplicates = await findDuplicatesInType(contentType)

    if (duplicates.length > 0) {
      console.log(
        `❗ Found ${duplicates.length} duplicate groups in ${contentType}`
      )
      allDuplicates.push({ contentType, duplicates })
    } else {
      console.log(`✅ No duplicates found in ${contentType}`)
    }
  }

  if (allDuplicates.length === 0) {
    console.log('\n🎉 No duplicate content found!')
    return
  }

  console.log('\n📋 DUPLICATE CONTENT REPORT:\n')

  let totalDuplicateFiles = 0
  const filesToRemove = []

  for (const { contentType, duplicates } of allDuplicates) {
    console.log(`\n🔴 ${contentType.toUpperCase()} DUPLICATES:`)

    for (let i = 0; i < duplicates.length; i++) {
      const group = duplicates[i]
      console.log(`\n  Group ${i + 1} (${group.files.length} files):`)

      const keeper = chooseFileToKeep(group.files)

      for (const file of group.files) {
        const isKeeper = file === keeper
        const status = isKeeper ? '✅ KEEP' : '❌ REMOVE'

        console.log(`    ${status} ${file.relativePath}`)
        console.log(`         Size: ${formatSize(file.content.size)}`)

        if (VERBOSE) {
          const preview = file.content.raw.slice(0, 100).replace(/\n/g, ' ')
          console.log(`         Preview: ${preview}...`)
        }

        if (!isKeeper) {
          filesToRemove.push(file)
          totalDuplicateFiles++
        }
      }
    }
  }

  console.log(`\n📊 SUMMARY:`)
  console.log(`Total duplicate files to remove: ${totalDuplicateFiles}`)

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN: Add --apply to move duplicate files to backup')
    console.log('node scripts/find-duplicate-content.js --apply')
  } else {
    if (filesToRemove.length > 0) {
      console.log('\n🚀 Moving duplicate files to backup...')

      const backupDir = await createBackupDir()
      let movedCount = 0

      for (const file of filesToRemove) {
        try {
          const backupPath = path.join(backupDir, file.relativePath)
          await fs.mkdir(path.dirname(backupPath), { recursive: true })
          await fs.rename(file.path, backupPath)
          console.log(`✅ Moved: ${file.relativePath}`)
          movedCount++
        } catch (error) {
          console.error(
            `❌ Failed to move ${file.relativePath}: ${error.message}`
          )
        }
      }

      console.log(`\n📊 FINAL SUMMARY:`)
      console.log(`✅ Successfully moved: ${movedCount} files`)
      console.log(`❌ Failed: ${filesToRemove.length - movedCount} files`)
      console.log(
        `📁 Backup location: ${path.relative(process.cwd(), backupDir)}`
      )

      if (movedCount > 0) {
        console.log('\n💡 Next steps:')
        console.log('1. Test your website to ensure no broken links')
        console.log('2. Regenerate content JSON files')
        console.log('3. Commit the changes to git')
      }
    }
  }
}

main().catch(console.error)
