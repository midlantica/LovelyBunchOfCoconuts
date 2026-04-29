#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const DIR = path.join(
  __dirname,
  '..',
  'content',
  'scraped-quotes',
  'Thomas-Sowell'
)

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/['"'\u2018\u2019\u201c\u201d]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-$/, '')
    .substring(0, 80)
}

function extractTitle(content) {
  const match = content.match(
    /^---[\s\S]*?title:\s*['"]?(.*?)['"]?\s*\n[\s\S]*?---/m
  )
  if (match) return match[1].trim()
  return null
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'))
const slugsSeen = new Map() // slug -> count
let renamed = 0
let skipped = 0
let errors = 0

for (const file of files) {
  const filePath = path.join(DIR, file)
  const stat = fs.statSync(filePath)
  if (stat.isDirectory()) continue // skip dupes/ etc.

  const content = fs.readFileSync(filePath, 'utf8')
  const title = extractTitle(content)

  if (!title) {
    console.warn(`⚠️  No title found in: ${file}`)
    skipped++
    continue
  }

  let slug = toSlug(title)
  if (!slug) {
    console.warn(`⚠️  Empty slug for title "${title}" in: ${file}`)
    skipped++
    continue
  }

  // Handle collisions
  const baseSlug = slug
  let count = slugsSeen.get(baseSlug) || 0
  count++
  slugsSeen.set(baseSlug, count)
  if (count > 1) {
    slug = `${baseSlug}-${count}`
  }

  const newName = `${slug}.md`
  const newPath = path.join(DIR, newName)

  if (file === newName) {
    // Already correct name
    skipped++
    continue
  }

  try {
    fs.renameSync(filePath, newPath)
    console.log(`✅  ${file} → ${newName}`)
    renamed++
  } catch (err) {
    console.error(`❌  Failed to rename ${file}: ${err.message}`)
    errors++
  }
}

console.log(
  `\nDone. Renamed: ${renamed}, Already correct/skipped: ${skipped}, Errors: ${errors}`
)
