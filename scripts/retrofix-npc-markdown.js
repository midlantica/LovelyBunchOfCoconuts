#!/usr/bin/env node
/**
 * Retrofix NPC markdown files: improve title, alt text, and caption lines using updated createTitle logic.
 * Only operates inside content/memes/npc.
 * Logs before and after for each modified file with a blank line separator.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Reuse title creation logic from create-matching-markdown (duplicate minimal to avoid circular import)
function smartTitleFromExisting(titleLike) {
  if (!titleLike) return 'Untitled'
  // Break into tokens similar to filename process but we already have a phrase; keep case heuristics.
  let raw = titleLike.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim()

  if (!raw) return 'Untitled'

  const tokens = raw.split(' ').filter(Boolean)
  const ACRONYMS = new Set([
    'npc',
    'usa',
    'us',
    'gdp',
    'ai',
    'eu',
    'uk',
    'nato',
    'fbi',
    'cia',
    'nsa',
    'lgbt',
    'lgbtq',
    'lgbtqia',
    'dei',
    'esg',
    'irs',
    'doj',
    'cdc',
    'who',
    'un',
    'imf',
    'wto',
    'epa',
    'oecd',
    'blm',
    'atf',
    'sec',
    'dod',
    'cop',
    'ipcc',
    'faq',
  ])

  let words = tokens.map((t) => {
    const lower = t.toLowerCase()
    if (ACRONYMS.has(lower)) return lower.toUpperCase()
    return lower
  })

  let sentence = words.join(' ')
  sentence = sentence.replace(/\bi\b/g, 'I')
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  const startsToken = sentence.toLowerCase().split(/\s+/)[0]
  if (
    (startsToken === 'maybe' || startsToken === 'should') &&
    !/[.!?]$/.test(sentence)
  ) {
    sentence += '?'
  }
  return sentence
}

async function run() {
  const npcDir = path.join(__dirname, '..', 'content', 'memes', 'npc')
  let files
  try {
    files = await fs.readdir(npcDir)
  } catch (e) {
    console.error('NPC directory not found:', e.message)
    process.exit(1)
  }
  const mdFiles = files.filter((f) => f.toLowerCase().endsWith('.md'))
  let changed = 0
  for (const file of mdFiles) {
    const full = path.join(npcDir, file)
    let data
    try {
      data = await fs.readFile(full, 'utf-8')
    } catch {
      continue
    }

    // Extract frontmatter title
    const frontmatterMatch = data.match(/---\n([\s\S]*?)\n---/)
    if (!frontmatterMatch) continue

    const bodyStart = frontmatterMatch[0].length
    const frontmatter = frontmatterMatch[1]
    const titleLineMatch = frontmatter.match(/title:\s*"([^"]+)"/)
    if (!titleLineMatch) continue
    const originalTitle = titleLineMatch[1]

    // Find first image alt+path line after frontmatter
    const rest = data.slice(bodyStart)
    const imageLineMatch = rest.match(/!\[(.*?)\]\((.*?)\)/)
    let originalAlt = imageLineMatch ? imageLineMatch[1] : originalTitle

    // Find caption line: first non-empty line after image line
    let caption = ''
    if (imageLineMatch) {
      const afterImage = rest
        .slice(imageLineMatch.index + imageLineMatch[0].length)
        .split('\n')
      for (const l of afterImage) {
        if (l.trim()) {
          caption = l.trim()
          break
        }
      }
    }
    if (!caption) caption = originalTitle

    const improved = smartTitleFromExisting(originalTitle)

    if (
      improved === originalTitle &&
      improved === originalAlt &&
      improved === caption
    ) {
      continue // nothing to change
    }

    // Rebuild frontmatter
    const newFront = frontmatter.replace(
      /title:\s*"([^"]+)"/,
      `title: "${improved}"`
    )

    // Replace image alt + caption
    let newRest = rest
    if (imageLineMatch) {
      const newImageLine = imageLineMatch[0].replace(
        /!\[(.*?)\]/,
        `![${improved}]`
      )
      newRest =
        newRest.slice(0, imageLineMatch.index) +
        newImageLine +
        newRest.slice(imageLineMatch.index + imageLineMatch[0].length)
    }

    // Replace caption line (only first caption occurrence we identified)
    if (caption) {
      const captionRegex = new RegExp(
        `(^|\n)${caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\n)`
      ) // exact line
      newRest = newRest.replace(captionRegex, `\n${improved}$2`)
    }

    const newContent = `---\n${newFront}\n---${newRest}`

    console.log(
      `[BEFORE] ${file}\n${originalTitle} | ${originalAlt} | ${caption}`
    )
    console.log(`[AFTER ] ${file}\n${improved} | ${improved} | ${improved}\n`)

    try {
      await fs.writeFile(full, newContent, 'utf-8')
      changed++
    } catch (e) {
      console.error('Failed to write', file, e.message)
    }
  }
  console.log(`NPC retrofix complete. Files changed: ${changed}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
