#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const exec = promisify(execCb)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.join(__dirname, '..')
const memesDir = path.join(rootDir, 'public', 'memes')

const rawArgs = process.argv.slice(2)
const flags = new Set(rawArgs.filter((a) => a.startsWith('--')))
const notify = flags.has('--notify')
const quiet = flags.has('--quiet')
const noFail = flags.has('--no-fail')
const listNew = flags.has('--list-new')

// No manifest involved: "new" means no matching markdown exists yet.

function isImage(name) {
  return /\.(png|jpe?g|gif|webp)$/i.test(name)
}

function relKey(absPath) {
  const idx = absPath.lastIndexOf(
    `${path.sep}public${path.sep}memes${path.sep}`
  )
  if (idx === -1) return path.basename(absPath)
  const rel = absPath.slice(
    idx + `${path.sep}public${path.sep}memes${path.sep}`.length
  )
  return rel.replace(/\\/g, '/')
}

async function listImages(dir) {
  const out = []
  async function walk(d) {
    let entries = []
    try {
      entries = await fs.readdir(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const p = path.join(d, e.name)
      if (e.isDirectory()) await walk(p)
      else if (isImage(e.name)) out.push(p)
    }
  }
  await walk(dir)
  return out
}

async function hasMarkdown(absImagePath) {
  // map public/memes/.../file.jpg -> content/memes/.../file.md
  const idx = absImagePath.lastIndexOf(
    `${path.sep}public${path.sep}memes${path.sep}`
  )
  if (idx === -1) return false
  const rel = absImagePath.slice(
    idx + `${path.sep}public${path.sep}memes${path.sep}`.length
  )
  const noExt = rel.replace(/\.[^.]+$/i, '')
  const mdPath =
    path.join(rootDir, 'content', 'memes', ...noExt.split(path.sep)) + '.md'
  try {
    await fs.access(mdPath)
    return true
  } catch {
    return false
  }
}

function printTable(rows, headers, totalsRow) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length))
  )
  const pad = (s, i) => String(s).padEnd(widths[i], ' ')
  const headerLine = headers.map((h, i) => pad(h, i)).join('  |  ')
  const sep = widths.map((w) => '-'.repeat(w)).join('--+--')
  console.log(sep)
  console.log(headerLine)
  console.log(sep)
  rows.forEach((r) => console.log(r.map((c, i) => pad(c, i)).join('  |  ')))
  if (totalsRow) {
    console.log(sep)
    console.log(totalsRow.map((c, i) => pad(c, i)).join('  |  '))
    console.log(sep)
  }
}

async function main() {
  const files = await listImages(memesDir)
  const newFiles = []

  const per = new Map() // folder -> { total, new }
  for (const abs of files) {
    const key = relKey(abs)
    const top = key.includes('/') ? key.split('/')[0] : '(root)'
    const bucket = per.get(top) || { total: 0, new: 0 }
    bucket.total++
    const hasMd = await hasMarkdown(abs)
    if (!hasMd) {
      bucket.new++
      newFiles.push(key)
    }
    per.set(top, bucket)
  }

  // Build rows sorted by folder name
  const rows = Array.from(per.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([folder, s]) => [
      folder,
      String(s.total - s.new), // Images w Markdown
      String(s.new), // New Images
    ])

  // Totals
  const sumNew = Array.from(per.values()).reduce((n, s) => n + (s.new || 0), 0)
  const sumWithMd = Array.from(per.values()).reduce(
    (n, s) => n + (s.total - (s.new || 0)),
    0
  )

  if (!quiet) {
    console.log('\nGLOBAL SUMMARY (new images check)')
    printTable(
      rows,
      ['Folder', 'Images w Markdown', 'New Images'],
      ['TOTAL', String(sumWithMd), String(sumNew)]
    )
  }

  // If requested, print the list of new image paths (relative to public/memes)
  if (listNew && newFiles.length) {
    newFiles.sort((a, b) => a.localeCompare(b))
    newFiles.forEach((p) => console.log(p))
  }

  const totalNew = sumNew
  if (notify && totalNew > 0 && process.platform === 'darwin') {
    try {
      const msg = `${totalNew} new image${
        totalNew === 1 ? '' : 's'
      } detected. Run: pnpm process-images`
      await exec(
        `osascript -e 'display notification "${msg.replace(
          /"/g,
          '\\"'
        )}" with title "WakeUpNPC2"'`
      )
    } catch {}
  }

  // exit code signals whether action is needed
  if (noFail) process.exit(0)
  process.exit(totalNew > 0 ? 2 : 0)
}

main().catch((err) => {
  console.error('check-new-memes failed:', err)
  process.exit(1)
})
