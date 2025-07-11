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

    // Remove all .DS_Store files
    await execPromise('find . -name ".DS_Store" -type f -delete')

    console.log('✅ All .DS_Store files removed')

    // Also clean Thumbs.db files on Windows
    try {
      await execPromise('find . -name "Thumbs.db" -type f -delete')
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
