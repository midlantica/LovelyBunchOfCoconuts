#!/usr/bin/env node

/**
 * Script to remove console.log and console.info statements
 * while preserving console.warn and console.error
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Find all files with console.log or console.info
const files = execSync(
  'find app -type f \\( -name "*.vue" -o -name "*.js" -o -name "*.ts" \\) | xargs grep -l "console\\.log\\|console\\.info" 2>/dev/null || true',
  { encoding: 'utf-8' }
)
  .trim()
  .split('\n')
  .filter(Boolean)

console.log(`Found ${files.length} files with console.log/info statements`)

let totalRemoved = 0

files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf-8')
    let originalContent = content
    let removedCount = 0

    // Remove console.log statements (various patterns)
    // Pattern 1: Single line console.log
    content = content.replace(/^\s*console\.log\([^)]*\)\s*$/gm, () => {
      removedCount++
      return ''
    })

    // Pattern 2: console.log as part of conditional or with semicolon
    content = content.replace(/\s*console\.log\([^)]*\);?\s*\n/g, () => {
      removedCount++
      return '\n'
    })

    // Pattern 3: if (import.meta.dev) console.log(...) blocks
    content = content.replace(
      /\s*if\s*\(\s*import\.meta\.dev\s*\)\s*console\.log\([^)]*\)\s*\n/g,
      () => {
        removedCount++
        return '\n'
      }
    )

    // Remove console.info statements
    content = content.replace(/^\s*console\.info\([^)]*\)\s*$/gm, () => {
      removedCount++
      return ''
    })

    content = content.replace(/\s*console\.info\([^)]*\);?\s*\n/g, () => {
      removedCount++
      return '\n'
    })

    // Clean up multiple consecutive blank lines
    content = content.replace(/\n\n\n+/g, '\n\n')

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf-8')
      console.log(`  ✓ ${file}: Removed ${removedCount} console statements`)
      totalRemoved += removedCount
    }
  } catch (error) {
    console.error(`  ✗ ${file}: Error - ${error.message}`)
  }
})

console.log(`\nTotal removed: ${totalRemoved} console.log/info statements`)
console.log('Preserved: console.warn and console.error statements')
