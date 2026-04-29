#!/usr/bin/env node
/**
 * Deduplication script for scraped Thomas Sowell quotes.
 * Compares content/scraped-quotes/Thomas-Sowell/ against content/quotes/Thomas-Sowell/
 * Moves duplicates to content/scraped-quotes/Thomas-Sowell/dupes/
 *
 * Matching strategy (fuzzy):
 *  1. Normalize both quote texts (lowercase, strip punctuation/whitespace)
 *  2. Check if normalized new quote CONTAINS or IS CONTAINED BY normalized old quote
 *     (handles truncated vs full versions)
 *  3. Also check first 80 chars of normalized text for near-matches
 */

const fs = require('fs')
const path = require('path')

const OLD_DIR = path.join(__dirname, '..', 'content', 'quotes', 'Thomas-Sowell')
const NEW_DIR = path.join(__dirname, '..', 'content', 'scraped-quotes', 'Thomas-Sowell')
const DUPES_DIR = path.join(NEW_DIR, 'dupes')

fs.mkdirSync(DUPES_DIR, { recursive: true })

/**
 * Extract the quote body text from a markdown file.
 * Looks for the ## "..." line or any substantial text block.
 */
function extractQuoteText(filepath) {
  const content = fs.readFileSync(filepath, 'utf8')
  // Try to find ## "quote text" pattern
  const h2Match = content.match(/^##\s+"?(.+?)"?\s*$/m)
  if (h2Match) return h2Match[1].trim()
  // Fallback: grab all non-frontmatter, non-attribution text
  const lines = content.split('\n').filter(l =>
    l.trim() &&
    !l.startsWith('---') &&
    !l.startsWith('title:') &&
    !l.startsWith('##') &&
    !l.startsWith('Thomas Sowell')
  )
  return lines.join(' ').trim()
}

/**
 * Normalize text for comparison:
 * - lowercase
 * - remove all punctuation and extra whitespace
 * - collapse spaces
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[\u201c\u201d\u2018\u2019"']/g, '') // curly quotes
    .replace(/[^a-z0-9\s]/g, ' ')                  // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if two normalized strings are duplicates.
 * Uses containment check (one is substring of other) and prefix match.
 */
function isDuplicate(normNew, normOld) {
  if (!normNew || !normOld) return false

  // Exact match
  if (normNew === normOld) return true

  // One contains the other (handles truncated quotes)
  if (normNew.length > 30 && normOld.length > 30) {
    if (normNew.includes(normOld.substring(0, Math.min(normOld.length, 80)))) return true
    if (normOld.includes(normNew.substring(0, Math.min(normNew.length, 80)))) return true
  }

  // First 60 chars match (same opening)
  const prefixLen = 60
  if (normNew.length >= prefixLen && normOld.length >= prefixLen) {
    if (normNew.substring(0, prefixLen) === normOld.substring(0, prefixLen)) return true
  }

  // Word overlap: if 85%+ of shorter quote's words appear in longer quote
  const wordsNew = new Set(normNew.split(' ').filter(w => w.length > 3))
  const wordsOld = new Set(normOld.split(' ').filter(w => w.length > 3))
  const shorter = wordsNew.size < wordsOld.size ? wordsNew : wordsOld
  const longer = wordsNew.size < wordsOld.size ? wordsOld : wordsNew
  if (shorter.size >= 8) {
    let overlap = 0
    for (const w of shorter) {
      if (longer.has(w)) overlap++
    }
    const ratio = overlap / shorter.size
    if (ratio >= 0.85) return true
  }

  return false
}

// ── Load old quotes ──────────────────────────────────────────────────────────
console.log('Loading old quotes from content/quotes/Thomas-Sowell/...')
const oldQuotes = []
for (const file of fs.readdirSync(OLD_DIR)) {
  if (!file.endsWith('.md')) continue
  const filepath = path.join(OLD_DIR, file)
  const text = extractQuoteText(filepath)
  const norm = normalize(text)
  oldQuotes.push({ file, text, norm })
}
console.log(`Loaded ${oldQuotes.length} old quotes`)

// ── Load new quotes ──────────────────────────────────────────────────────────
console.log('Loading new quotes from content/scraped-quotes/Thomas-Sowell/...')
const newQuotes = []
for (const file of fs.readdirSync(NEW_DIR)) {
  if (!file.endsWith('.md')) continue
  const filepath = path.join(NEW_DIR, file)
  const text = extractQuoteText(filepath)
  const norm = normalize(text)
  newQuotes.push({ file, filepath, text, norm })
}
console.log(`Loaded ${newQuotes.length} new quotes`)

// ── Compare ──────────────────────────────────────────────────────────────────
console.log('\nComparing quotes...')
const duplicates = []
const unique = []

for (const newQ of newQuotes) {
  let foundDupe = null
  for (const oldQ of oldQuotes) {
    if (isDuplicate(newQ.norm, oldQ.norm)) {
      foundDupe = oldQ
      break
    }
  }
  if (foundDupe) {
    duplicates.push({ new: newQ, old: foundDupe })
  } else {
    unique.push(newQ)
  }
}

console.log(`\nResults:`)
console.log(`  Duplicates found: ${duplicates.length}`)
console.log(`  Unique new quotes: ${unique.length}`)

// ── Move duplicates ──────────────────────────────────────────────────────────
if (duplicates.length > 0) {
  console.log('\nMoving duplicates to dupes/ folder...')
  for (const dupe of duplicates) {
    const src = dupe.new.filepath
    const dest = path.join(DUPES_DIR, dupe.new.file)
    fs.renameSync(src, dest)
    console.log(`  DUPE: ${dupe.new.file}`)
    console.log(`        matches: ${dupe.old.file}`)
  }
}

console.log(`\n✅ Done!`)
console.log(`   ${duplicates.length} duplicates moved to: ${DUPES_DIR}`)
console.log(`   ${unique.length} unique quotes remain in: ${NEW_DIR}`)
