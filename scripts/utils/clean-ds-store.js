#!/usr/bin/env node

import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

/**
 * Remove all .DS_Store files from the project
 */
async function cleanDSStore() {
  try {
    console.log('🧹 Cleaning .DS_Store files...')

    // Remove all .DS_Store files from content and public directories specifically
    const dirsToClean = ['./content', './public']

    for (const dir of dirsToClean) {
      try {
        await execPromise(
          `find "${dir}" -name ".DS_Store" -type f -delete 2>/dev/null || true`
        )
      } catch (err) {
        // Ignore errors
      }
    }

    console.log('✅ All .DS_Store files removed')

    // Also clean Thumbs.db files on Windows
    try {
      await execPromise(
        'find ./content ./public -name "Thumbs.db" -type f -delete 2>/dev/null || true'
      )
      console.log('✅ All Thumbs.db files removed')
    } catch (err) {
      // Ignore if no Thumbs.db files found
    }
  } catch (error) {
    console.error('❌ Error cleaning files:', error.message)
  }
}

// Run the cleanup
cleanDSStore()
