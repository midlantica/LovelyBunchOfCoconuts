#!/usr/bin/env node
/**
 * Merges italicized source attribution from dupes into originals.
 *
 * For each dupe in content/scraped-quotes/Thomas-Sowell/dupes/:
 *   - Extract the source line (e.g. "Thomas Sowell, *Book Title (Year)*")
 *   - Find the matching original in content/quotes/Thomas-Sowell/
 *   - If the original only has "Thomas Sowell" (no source), update it with the source
 *
 * Matching is done by the same fuzzy logic used in dedup.
 */

const fs = require('fs')
const path = require('path')

const OLD_DIR = path.join(__dirname, '..', 'content', 'quotes', 'Thomas-Sowell')
const DUPES_DIR = path.join(__dirname, '..', 'content', 'scraped-quotes', 'Thomas-Sowell', 'dupes')

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[\u201c\u201d\u2018\u2019"']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractQuoteText(content) {
  const h2Match = content.match(/^##\s+"?(.+?)"?\s*$/m)
  if (h2Match) return h2Match[1].trim()
  return ''
}

function extractSourceLine(content) {
  // Look for "Thomas Sowell, *Source*" pattern
  const match = content.match(/^(Thomas Sowell,\s*\*.+\*)\s*$/m)
  return match ? match[1].trim() : null
}

function isDuplicate(normNew, normOld) {
  if (!normNew || !normOld) return false
  if (normNew === normOld) return true
  if (normNew.length > 30 && normOld.length > 30) {
    if (normNew.includes(normOld.substring(0, Math.min(normOld.length, 80)))) return true
    if (normOld.includes(normNew.substring(0, Math.min(normNew.length, 80)))) return true
  }
  const prefixLen = 60
  if (normNew.length >= prefixLen && normOld.length >= prefixLen) {
    if (normNew.substring(0, prefixLen) === normOld.substring(0, prefixLen)) return true
  }
  const wordsNew = new Set(normNew.split(' ').filter(w => w.length > 3))
  const wordsOld = new Set(normOld.split(' ').filter(w => w.length > 3))
  const shorter = wordsNew.size < wordsOld.size ? wordsNew : wordsOld
  const longer = wordsNew.size < wordsOld.size ? wordsOld : wordsNew
  if (shorter.size >= 8) {
    let overlap = 0
    for (const w of shorter) { if (longer.has(w)) overlap++ }
    if (overlap / shorter.size >= 0.85) return true
  }
  return false
}

// Load originals
const originals = []
for (const file of fs.readdirSync(OLD_DIR)) {
  if (!file.endsWith('.md')) continue
  const filepath = path.join(OLD_DIR, file)
  const content = fs.readFileSync(filepath, 'utf8')
  const quoteText = extractQuoteText(content)
  originals.push({ file, filepath, content, norm: normalize(quoteText) })
}
console.log(`Loaded ${originals.length} originals`)

// Load dupes
const dupes = []
for (const file of fs.readdirSync(DUPES_DIR)) {
  if (!file.endsWith('.md')) continue
  const filepath = path.join(DUPES_DIR, file)
  const content = fs.readFileSync(filepath, 'utf8')
  const quoteText = extractQuoteText(content)
  const sourceLine = extractSourceLine(content)
  dupes.push({ file, filepath, content, norm: normalize(quoteText), sourceLine })
}
console.log(`Loaded ${dupes.length} dupes`)

// Match and merge
let updated = 0
let skipped = 0
let noSource = 0

for (const dupe of dupes) {
  if (!dupe.sourceLine) {
    console.log(`  NO SOURCE in dupe: ${dupe.file}`)
    noSource++
    continue
  }

  // Find matching original
  const match = originals.find(o => isDuplicate(dupe.norm, o.norm))
  if (!match) {
    console.log(`  NO MATCH for dupe: ${dupe.file}`)
    skipped++
    continue
  }

  // Check if original already has a source
  const existingSource = extractSourceLine(match.content)
  if (existingSource) {
    console.log(`  SKIP (already has source): ${match.file}`)
    console.log(`    existing: ${existingSource}`)
    skipped++
    continue
  }

  // Replace "Thomas Sowell" attribution line with the sourced version
  const newContent = match.content.replace(
    /^Thomas Sowell\s*$/m,
    dupe.sourceLine
  )

  if (newContent === match.content) {
    console.log(`  SKIP (no change): ${match.file}`)
    skipped++
    continue
  }

  fs.writeFileSync(match.filepath, newContent, 'utf8')
  console.log(`  UPDATED: ${match.file}`)
  console.log(`    source: ${dupe.sourceLine}`)
  updated++
}

console.log(`\n✅ Done!`)
console.log(`   Updated: ${updated} originals`)
console.log(`   Skipped: ${skipped} (already had source or no match)`)
console.log(`   No source in dupe: ${noSource}`)
