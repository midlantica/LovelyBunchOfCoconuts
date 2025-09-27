#!/usr/bin/env node

/**
 * Fix Redundant "-1" File Names
 *
 * This script identifies and fixes files with "-1" suffixes that don't have
 * corresponding base files (indicating they're redundant naming artifacts).
 *
 * Usage:
 *   node scripts/fix-redundant-dash-1-files.js [--dry-run] [--apply]
 *
 * Features:
 * - Identifies files ending with "-1.md" that have no base version
 * - Shows content preview to verify it's safe to rename
 * - Dry run by default, --apply to actually rename files
 * - Skips files in _not-Ads, _not, and other excluded directories
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const DRY_RUN = !process.argv.includes('--apply')

// Directories to skip (test/backup content)
const SKIP_DIRS = ['_not-Ads', '_not', '_backup', '_duplicates_backup']

async function findRedundantDash1Files() {
  const redundantFiles = []

  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (SKIP_DIRS.includes(entry.name)) {
            console.log(
              `⏭️  Skipping directory: ${path.relative(CONTENT_DIR, fullPath)}`
            )
            continue
          }
          await scanDirectory(fullPath)
        } else if (entry.name.endsWith('-1.md')) {
          // Check if base file exists
          const baseName = entry.name.replace('-1.md', '.md')
          const basePath = path.join(dir, baseName)

          try {
            await fs.access(basePath)
            console.log(
              `⚠️  KEEPING (base exists): ${path.relative(
                CONTENT_DIR,
                fullPath
              )}`
            )
          } catch {
            // Base file doesn't exist - this is redundant
            redundantFiles.push({
              currentPath: fullPath,
              newPath: basePath,
              relativePath: path.relative(CONTENT_DIR, fullPath),
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}: ${error.message}`)
    }
  }

  await scanDirectory(CONTENT_DIR)
  return redundantFiles
}

async function previewFileContent(filePath, maxLines = 10) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')
    const preview = lines.slice(0, maxLines).join('\n')
    const truncated =
      lines.length > maxLines
        ? `\n... (${lines.length - maxLines} more lines)`
        : ''
    return preview + truncated
  } catch (error) {
    return `Error reading file: ${error.message}`
  }
}

async function renameFile(oldPath, newPath) {
  try {
    await fs.rename(oldPath, newPath)
    return true
  } catch (error) {
    console.error(`❌ Failed to rename ${oldPath}: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🔍 Scanning for redundant "-1" files...\n')

  const redundantFiles = await findRedundantDash1Files()

  if (redundantFiles.length === 0) {
    console.log('✅ No redundant "-1" files found!')
    return
  }

  console.log(`\n📋 Found ${redundantFiles.length} redundant "-1" files:\n`)

  for (const file of redundantFiles) {
    console.log(`📄 ${file.relativePath}`)
    console.log(`   → ${path.basename(file.newPath)}`)

    // Show content preview
    const preview = await previewFileContent(file.currentPath, 5)
    console.log('   Content preview:')
    console.log('   ' + preview.split('\n').join('\n   '))
    console.log('')
  }

  if (DRY_RUN) {
    console.log('🔍 DRY RUN: Add --apply to actually rename these files')
    console.log('\nTo apply changes:')
    console.log('node scripts/fix-redundant-dash-1-files.js --apply')
  } else {
    console.log('🚀 Applying changes...\n')

    let successCount = 0
    for (const file of redundantFiles) {
      const success = await renameFile(file.currentPath, file.newPath)
      if (success) {
        console.log(`✅ Renamed: ${file.relativePath}`)
        successCount++
      }
    }

    console.log(`\n📊 SUMMARY:`)
    console.log(`✅ Successfully renamed: ${successCount} files`)
    console.log(`❌ Failed: ${redundantFiles.length - successCount} files`)

    if (successCount > 0) {
      console.log('\n💡 Next steps:')
      console.log('1. Test your website to ensure links still work')
      console.log('2. Regenerate content JSON files if needed')
      console.log('3. Commit the changes to git')
    }
  }
}

main().catch(console.error)
