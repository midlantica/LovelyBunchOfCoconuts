#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to improve text with AI-like suggestions
function improveMemeText(text) {
  if (!text || text.trim() === '') return text

  let improved = text.trim()

  // Remove dashes between words and convert to proper sentence case
  improved = improved
    // Replace dashes with spaces
    .replace(/-/g, ' ')
    // Fix common spacing issues
    .replace(/\s+/g, ' ')
    // Convert to lowercase first (we'll capitalize properly later)
    .toLowerCase()
    // Fix common abbreviations
    .replace(/\bgovt\b/gi, 'government')
    .replace(/\bw\b/gi, 'with')
    .replace(/\bu\b/gi, 'you')
    .replace(/\br\b/gi, 'are')
    .replace(/\bn\b/gi, 'and')
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bisnt\b/gi, "isn't")
    .replace(/\barent\b/gi, "aren't")
    .replace(/\bwasnt\b/gi, "wasn't")
    .replace(/\bwerent\b/gi, "weren't")
    .replace(/\bhasnt\b/gi, "hasn't")
    .replace(/\bhavent\b/gi, "haven't")
    .replace(/\bhadnt\b/gi, "hadn't")
    .replace(/\bshouldnt\b/gi, "shouldn't")
    .replace(/\bwouldnt\b/gi, "wouldn't")
    .replace(/\bcouldnt\b/gi, "couldn't")
    // Handle specific name cases
    .replace(/\bthomas sowell\b/gi, 'Thomas Sowell')
    .replace(/\belon musk\b/gi, 'Elon Musk')
    .replace(/\btrump\b/gi, 'Trump')
    .replace(/\bbiden\b/gi, 'Biden')
    .replace(/\breagan\b/gi, 'Reagan')
    .replace(/\bobama\b/gi, 'Obama')
    .replace(/\bclinton\b/gi, 'Clinton')
    .replace(/\bscott adams\b/gi, 'Scott Adams')
    .replace(/\bscott jennings\b/gi, 'Scott Jennings')
    .replace(/\bdr king\b/gi, 'Dr. King')
    .replace(/\bdr\. king\b/gi, 'Dr. King')
    // Handle question format
    .replace(
      /^what\s+(.+?)(\s+[a-z]+\s+[a-z]+)$/i,
      (match, question, attribution) => {
        // If it looks like "What something Thomas Sowell" format
        if (attribution.trim().split(' ').length >= 2) {
          return `What ${question.trim()}? ${attribution
            .trim()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}.`
        }
        return match
      }
    )
    // Capitalize first letter only (sentence case)
    .replace(/^./, (match) => match.toUpperCase())
    // Ensure proper punctuation at end
    .replace(/([a-zA-Z])(\s*\n|$)/g, (match, letter, ending) => {
      if (!/[.!?]$/.test(letter)) {
        return letter + '.' + ending
      }
      return match
    })
    // Fix spacing around punctuation
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])([A-Z])/g, '$1 $2')

  return improved.trim()
} // Function to recursively find all markdown files in memes directory
function findMemeFiles(dir) {
  const files = []

  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // Skip directories that start with underscore
        if (!item.startsWith('_')) {
          searchDir(fullPath)
        }
      } else if (item.endsWith('.md') && !item.startsWith('_')) {
        files.push(fullPath)
      }
    }
  }

  searchDir(dir)
  return files
}

// Function to extract and improve text from meme file
function processMemeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')

    // Find where the frontmatter ends
    let frontmatterEnd = -1
    let inFrontmatter = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true
        } else {
          frontmatterEnd = i
          break
        }
      }
    }

    if (frontmatterEnd === -1) {
      console.log(`⚠️  No frontmatter found in: ${filePath}`)
      return null
    }

    // Extract text after the image line
    const bodyLines = lines.slice(frontmatterEnd + 1)
    let textStartIndex = -1

    // Find the first line that's not an image
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim()
      if (line && !line.startsWith('![')) {
        textStartIndex = i
        break
      }
    }

    if (textStartIndex === -1) {
      return null // No text content found
    }

    // Extract text content
    const textLines = bodyLines.slice(textStartIndex)
    const originalText = textLines.join('\n').trim()

    if (!originalText) {
      return null
    }

    const improvedText = improveMemeText(originalText)

    return {
      filePath,
      originalText,
      improvedText,
      hasChanges: originalText !== improvedText,
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return null
  }
}

// Function to apply improvements to file
function applyImprovements(filePath, originalText, improvedText) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')

    // Find where the frontmatter ends
    let frontmatterEnd = -1
    let inFrontmatter = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true
        } else {
          frontmatterEnd = i
          break
        }
      }
    }

    if (frontmatterEnd === -1) {
      return false
    }

    // Find the text content after the image
    const bodyLines = lines.slice(frontmatterEnd + 1)
    let textStartIndex = -1

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim()
      if (line && !line.startsWith('![')) {
        textStartIndex = i
        break
      }
    }

    if (textStartIndex === -1) {
      return false
    }

    // Replace only the text content portion
    const beforeText = lines.slice(0, frontmatterEnd + 1 + textStartIndex)
    const textLines = bodyLines.slice(textStartIndex)
    const currentText = textLines.join('\n').trim()
    
    // Only replace if we find the exact original text
    if (currentText === originalText) {
      const afterText = lines.slice(frontmatterEnd + 1 + textStartIndex + textLines.length)
      const newContent = [
        ...beforeText,
        improvedText,
        ...afterText
      ].join('\n')
      
      fs.writeFileSync(filePath, newContent, 'utf8')
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message)
    return false
  }
}

// Interactive mode for reviewing changes
async function interactiveMode(changes) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve))

  let appliedCount = 0

  for (const change of changes) {
    if (!change.hasChanges) continue

    console.log(`\n📄 File: ${path.basename(change.filePath)}`)
    console.log(`📍 Original:`)
    console.log(`"${change.originalText}"`)
    console.log(`\n✨ Improved:`)
    console.log(`"${change.improvedText}"`)

    const answer = await question('\n👀 Apply this change? (y/n/q): ')

    if (answer.toLowerCase() === 'q') {
      console.log('Quitting...')
      break
    }

    if (answer.toLowerCase() === 'y') {
      if (
        applyImprovements(
          change.filePath,
          change.originalText,
          change.improvedText
        )
      ) {
        console.log('✅ Applied!')
        appliedCount++
      }
    } else {
      console.log('⏭️  Skipped')
    }
  }

  rl.close()
  return appliedCount
}

// Main execution
async function main() {
  const memesDir = path.resolve(__dirname, '../content/memes')

  if (!fs.existsSync(memesDir)) {
    console.error('❌ Memes directory not found:', memesDir)
    process.exit(1)
  }

  console.log('🔍 Finding meme files with text content...')
  const memeFiles = findMemeFiles(memesDir)
  console.log(`📁 Found ${memeFiles.length} total markdown files`)

  // Show first few files for debugging
  if (memeFiles.length > 0) {
    console.log('📄 Sample files found:')
    memeFiles.slice(0, 5).forEach((file) => {
      console.log(`  - ${path.relative(memesDir, file)}`)
    })
    if (memeFiles.length > 5) {
      console.log(`  ... and ${memeFiles.length - 5} more`)
    }
  }

  console.log('📝 Analyzing text content...')
  const changes = []

  for (const filePath of memeFiles) {
    const result = processMemeFile(filePath)
    if (result) {
      changes.push(result)
    }
  }

  const changesCount = changes.filter((c) => c.hasChanges).length

  if (changesCount === 0) {
    console.log('✨ No improvements needed! All meme text looks good.')
    return
  }

  console.log(`\n📊 Analysis Results:`)
  console.log(`📁 Total memes: ${memeFiles.length}`)
  console.log(`📄 Memes with text content: ${changes.length}`)
  console.log(`✨ Memes updated: ${changesCount}`)
  console.log('\n' + '='.repeat(80))
  console.log('BEFORE & AFTER COMPARISON')
  console.log('='.repeat(80))

  // Print all before/after comparisons
  for (const change of changes) {
    if (!change.hasChanges) continue

    // Get relative path from content/memes/
    const relativePath = change.filePath.replace(memesDir + '/', '')

    console.log(`\nFile: ${relativePath}`)
    console.log(`Before: "${change.originalText}"`)
    console.log(`After:  "${change.improvedText}"`)
  }

  console.log('\n' + '='.repeat(80))
  console.log(`📁 Total memes: ${memeFiles.length}`)
  console.log(`✨ Memes that need updates: ${changesCount}`)
  
  // Actually apply the changes
  console.log('\n🔧 Applying changes...')
  let appliedCount = 0
  
  for (const change of changes) {
    if (!change.hasChanges) continue
    
    if (applyImprovements(change.filePath, change.originalText, change.improvedText)) {
      appliedCount++
    }
  }
  
  console.log(`\n✅ Successfully updated ${appliedCount} meme files!`)
}

main().catch(console.error)
