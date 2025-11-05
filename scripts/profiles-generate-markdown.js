// scripts/generate-markdown.js
// Node script to generate Markdown files for heroes and zeros (no zeroHeroScale).
// Usage: node scripts/generate-markdown.js
// Output: ./content/heroes/*.md and ./content/zeros/*.md

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { heroes, zeros } from '../app/data/profiles.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_ROOT = path.resolve(__dirname, '..', 'content', 'profiles')
const HERO_DIR = path.join(OUTPUT_ROOT, 'heroes')
const ZERO_DIR = path.join(OUTPUT_ROOT, 'zeros')

for (const dir of [OUTPUT_ROOT, HERO_DIR, ZERO_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function toSlug(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function frontmatter({ title, profile, status }) {
  return `---
title: "${title}"
profile: "${profile}"
status: '${status}'
---`
}

function markdown({ title, profile, status, imagePath, bio }) {
  const fm = frontmatter({ title, profile, status })
  const imageAlt = profile
  return `${fm}

![${imageAlt}](${imagePath})

## ${profile}

${bio}
`
}

function writeProfile(profileObj, typeDir) {
  const slug = toSlug(profileObj.profile)
  const filename = path.join(typeDir, `${slug}.md`)
  const content = markdown(profileObj)
  fs.writeFileSync(filename, content, 'utf8')
  return filename
}

function uniqueByName(arr) {
  const map = new Map()
  for (const item of arr) {
    const key = item.profile.trim().toLowerCase()
    if (!map.has(key)) map.set(key, item)
  }
  return Array.from(map.values())
}

function run() {
  const dedupedHeroes = uniqueByName(heroes)
  const dedupedZeros = uniqueByName(zeros)

  const heroFiles = dedupedHeroes.map((p) => writeProfile(p, HERO_DIR))
  const zeroFiles = dedupedZeros.map((p) => writeProfile(p, ZERO_DIR))

  console.log(`Generated ${heroFiles.length} hero files:`)
  heroFiles.forEach((f) => console.log(` - ${f}`))

  console.log(`\nGenerated ${zeroFiles.length} zero files:`)
  zeroFiles.forEach((f) => console.log(` - ${f}`))
}

run()
