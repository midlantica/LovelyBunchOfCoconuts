#!/usr/bin/env node
/**
 * cleanup-duplicate-claim-slugs.js
 *
 * Goal: Detect pairs of claim markdown files that differ only by dash vs underscore
 * in their slug (e.g. `abolish_prisons.md` and `abolish-prisons.md`).
 * Provide a dry-run report listing candidates, content size diffs, and a recommended keep file.
 * With --apply, remove the losing duplicates (moves them to a backup folder instead of hard delete)
 * to allow manual inspection / recovery.
 *
 * Heuristics for choosing which file to keep:
 * 1. Prefer dash version (canonical) over underscore.
 * 2. If only one has front‑matter or is larger (more bytes), keep the richer one.
 * 3. If tie, keep dash.
 *
 * Backup strategy:
 * - Creates `content/claims/_duplicates_backup/YYYYMMDD-HHMMSS/` and moves removed files there.
 *
 * Usage:
 *  node scripts/cleanup-duplicate-claim-slugs.js              # dry run report only
 *  node scripts/cleanup-duplicate-claim-slugs.js --apply      # execute moves
 *  node scripts/cleanup-duplicate-claim-slugs.js --json       # machine-readable dry run
 *  node scripts/cleanup-duplicate-claim-slugs.js --json --apply # (json plus actions)
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CLAIMS_DIR = path.join(ROOT, 'content', 'claims')

function listMarkdown(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
}

function baseKey(filename) {
  // strip extension, then produce a key removing dashes & underscores so pairs collide
  return filename.replace(/\.md$/i, '').replace(/[\-_]/g, '').toLowerCase()
}

function gather() {
  const files = listMarkdown(CLAIMS_DIR)
  const map = new Map()
  for (const f of files) {
    const key = baseKey(f)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  return [...map.entries()].filter(([, arr]) => arr.length > 1)
}

function readMeta(filepath) {
  const full = fs.readFileSync(filepath, 'utf8')
  const size = Buffer.byteLength(full)
  const fmMatch = full.match(/^---\n([\s\S]*?)\n---/)
  const hasFrontMatter = !!fmMatch
  return { size, hasFrontMatter }
}

function decidePair(files) {
  // Expect 2+; we only handle dash vs underscore variants; others ignored
  // Separate dash/underscore groups
  const enriched = files.map((name) => {
    const p = path.join(CLAIMS_DIR, name)
    const meta = readMeta(p)
    const isDash = name.includes('-')
    const isUnderscore = name.includes('_')
    return { name, path: p, ...meta, isDash, isUnderscore }
  })

  // Filter to just dash/underscore differences; if all same style skip
  const styles = new Set(
    enriched.map((e) =>
      e.isDash ? 'dash' : e.isUnderscore ? 'underscore' : 'other'
    )
  )
  if (styles.size === 1) return null // not a dash vs underscore conflict

  // Choose winner
  let winner = enriched[0]
  for (const e of enriched) {
    // Prefer dash
    if (winner.isUnderscore && e.isDash) winner = e
    // Prefer file with front matter
    if (!winner.hasFrontMatter && e.hasFrontMatter) winner = e
    // Prefer larger size if size difference is meaningful (> 10 bytes)
    if (e.size - winner.size > 10) winner = e
  }
  return { entries: enriched, winner }
}

function formatReport(result) {
  const { entries, winner } = result
  const lines = []
  lines.push('Duplicate slug group:')
  for (const e of entries) {
    lines.push(
      `  - ${e.name}  size=${e.size}  frontMatter=${e.hasFrontMatter}` +
        (e === winner ? '  <-- keep' : '')
    )
  }
  return lines.join('\n')
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function timestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '-' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  )
}

function run() {
  const args = process.argv.slice(2)
  const apply = args.includes('--apply')
  const asJson = args.includes('--json')

  const groups = gather()
  const decisions = []
  for (const [, files] of groups) {
    const decision = decidePair(files)
    if (decision) decisions.push(decision)
  }

  if (asJson) {
    const json = decisions.map((d) => ({
      winner: path.basename(d.winner.name),
      losers: d.entries
        .filter((e) => e !== d.winner)
        .map((e) => path.basename(e.name)),
      sizes: Object.fromEntries(d.entries.map((e) => [e.name, e.size])),
      frontMatter: Object.fromEntries(
        d.entries.map((e) => [e.name, e.hasFrontMatter])
      ),
    }))
    console.log(
      JSON.stringify({ count: json.length, decisions: json }, null, 2)
    )
  } else {
    console.log('== Duplicate Claim Slug Report ==')
    console.log(
      `Found ${decisions.length} duplicate groups (dash vs underscore).`
    )
    if (!decisions.length) {
      console.log('No action needed.')
    } else {
      for (const d of decisions) {
        console.log('')
        console.log(formatReport(d))
      }
    }
  }

  if (apply && decisions.length) {
    const backupRoot = path.join(CLAIMS_DIR, '_duplicates_backup', timestamp())
    ensureDir(backupRoot)
    for (const d of decisions) {
      for (const e of d.entries) {
        if (e === d.winner) continue
        const dest = path.join(backupRoot, e.name)
        fs.renameSync(e.path, dest)
        console.log(`Moved duplicate ${e.name} -> ${path.relative(ROOT, dest)}`)
      }
    }
    console.log(
      `\nMoved ${decisions.reduce(
        (a, d) => a + d.entries.length - 1,
        0
      )} duplicate files into backup: ${path.relative(ROOT, backupRoot)}`
    )
  }

  if (!apply) {
    console.log(
      '\n(Dry run; pass --apply to move duplicates into backup folder)'
    )
  }
}

if (require.main === module) run()
