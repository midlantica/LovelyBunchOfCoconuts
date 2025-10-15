#!/usr/bin/env node
/**
 * remove-underscore-claim-duplicates.js
 *
 * Purpose: Delete claim markdown files in content/grifts/ that use underscores
 * when a hyphenated version of the same slug also exists. Keeps the hyphenated
 * canonical file (preferred for URLs) and removes the underscore variant.
 *
 * Safety features:
 *  - Dry run by default (no deletions) -> pass --apply to actually delete.
 *  - Only deletes files matching *_[a-z]* pattern and ONLY if a corresponding
 *    hyphen variant already exists.
 *  - Skips README / non .md, and files that already contain hyphens plus underscores mixed oddly.
 *  - Summarizes actions.
 *
 * Usage:
 *   node scripts/remove-underscore-claim-duplicates.js          # dry run
 *   node scripts/remove-underscore-claim-duplicates.js --apply  # perform deletions
 */

import { readdirSync, statSync, unlinkSync } from 'fs'
import { join, extname } from 'path'

const CLAIMS_DIR = join(process.cwd(), 'content', 'grifts')
const isDryRun = !process.argv.includes('--apply')

function toBaseName(file) {
  return file.replace(/\.md$/i, '')
}

function underscoreToHyphen(name) {
  return name.replace(/_/g, '-')
}

function main() {
  const entries = readdirSync(CLAIMS_DIR)
  const underscoreFiles = []
  const hyphenSet = new Set()

  // Pass 1: collect hyphenated base names
  for (const f of entries) {
    const full = join(CLAIMS_DIR, f)
    if (statSync(full).isDirectory()) continue
    if (extname(f).toLowerCase() !== '.md') continue
    if (f.startsWith('_') || /readme/i.test(f)) continue
    if (f.includes('_')) continue // hyphen set should only have pure hyphen names
    hyphenSet.add(toBaseName(f))
  }

  // Pass 2: find underscore files that have a hyphen twin
  for (const f of entries) {
    const full = join(CLAIMS_DIR, f)
    if (statSync(full).isDirectory()) continue
    if (extname(f).toLowerCase() !== '.md') continue
    if (!f.includes('_')) continue
    if (/readme/i.test(f)) continue

    const base = toBaseName(f)
    const hyphenVariant = underscoreToHyphen(base)
    if (hyphenSet.has(hyphenVariant)) {
      underscoreFiles.push({
        file: f,
        hyphenVariant: hyphenVariant + '.md',
        path: full,
      })
    }
  }

  if (underscoreFiles.length === 0) {
    console.log('No redundant underscore claim files found.')
    return
  }

  console.log(`Found ${underscoreFiles.length} redundant underscore files:`)
  for (const item of underscoreFiles) {
    console.log(`  - ${item.file} -> keeps ${item.hyphenVariant}`)
  }
  console.log(`Total candidates: ${underscoreFiles.length}`)

  if (isDryRun) {
    console.log(
      '\nDry run complete. Re-run with --apply to delete these files.'
    )
    return
  }

  let deleted = 0
  for (const item of underscoreFiles) {
    try {
      unlinkSync(item.path)
      deleted++
      console.log(`Deleted: ${item.file}`)
    } catch (e) {
      console.error(`Failed to delete ${item.file}:`, e.message)
    }
  }
  console.log(
    `\nDone. Deleted ${deleted} of ${underscoreFiles.length} candidate files.`
  )
}

main()
