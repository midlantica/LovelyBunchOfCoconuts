// organize_quotes_by_author.js - Script to organize quotes by author
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const quotesDir = path.join(__dirname, '../content/quotes')

// List of authors to organize
const targetAuthors = [
  'Thomas Sowell',
  'Milton Friedman',
  'Margaret Thatcher',
  'Ronald Reagan',
  'Friedrich Hayek',
]

// Function to read a file and extract author name
async function extractAuthorFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')

    // Look for author name after the quote (typically line 7 or so)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines
      if (!line) continue

      // Check if line contains an author name from our target list
      for (const author of targetAuthors) {
        if (line.includes(author)) {
          return author
        }
      }
    }

    return null
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return null
  }
}

// Function to create author folder name (format used in the project)
function getAuthorFolderName(author) {
  return author.replace(/\s+/g, '-')
}

// Main function to organize quotes by author
async function organizeQuotesByAuthor() {
  try {
    console.log('Starting quote organization by author...')

    // Get all category folders
    const folders = await fs.readdir(quotesDir)

    // Stats tracking
    const stats = {
      processed: 0,
      moved: 0,
      skipped: 0,
      byAuthor: {},
    }

    // Initialize stats for each author
    for (const author of targetAuthors) {
      stats.byAuthor[author] = 0
    }

    // Process each folder
    for (const folder of folders) {
      const folderPath = path.join(quotesDir, folder)

      // Skip if it's already an author folder or not a directory
      const isDir = (await fs.stat(folderPath)).isDirectory()
      if (!isDir) continue

      // Skip author folders (don't move files that are already in author folders)
      let isAuthorFolder = false
      for (const author of targetAuthors) {
        const authorFolder = getAuthorFolderName(author)
        if (folder === authorFolder) {
          isAuthorFolder = true
          break
        }
      }

      if (isAuthorFolder) {
        console.log(`Skipping author folder: ${folder}`)
        continue
      }

      // Process files in this category folder
      const files = await fs.readdir(folderPath)

      for (const file of files) {
        const filePath = path.join(folderPath, file)

        // Skip directories
        if ((await fs.stat(filePath)).isDirectory()) continue

        // Skip non-markdown files
        if (!file.endsWith('.md')) continue

        stats.processed++

        // Extract author from the file
        const author = await extractAuthorFromFile(filePath)

        if (!author || !targetAuthors.includes(author)) {
          stats.skipped++
          continue
        }

        // Get author folder name and create it if needed
        const authorFolder = getAuthorFolderName(author)
        const authorFolderPath = path.join(quotesDir, authorFolder)

        try {
          await fs.mkdir(authorFolderPath, { recursive: true })
        } catch (error) {
          if (error.code !== 'EEXIST') {
            console.error(`Error creating directory for ${author}:`, error)
            continue
          }
        }

        // Move the file to the author's folder
        const destPath = path.join(authorFolderPath, file)

        try {
          await fs.rename(filePath, destPath)
          console.log(`Moved: ${folder}/${file} -> ${authorFolder}/`)
          stats.moved++
          stats.byAuthor[author]++
        } catch (error) {
          console.error(
            `Error moving ${file} to ${authorFolder}/: ${error.message}`
          )
        }
      }
    }

    // Display statistics
    console.log('\nQuote organization by author complete!')
    console.log(`Total files processed: ${stats.processed}`)
    console.log(`Files moved: ${stats.moved}`)
    console.log(`Files skipped: ${stats.skipped}`)

    console.log('\nFiles moved by author:')
    for (const [author, count] of Object.entries(stats.byAuthor)) {
      if (count > 0) {
        console.log(`  ${author}: ${count}`)
      }
    }
  } catch (error) {
    console.error('Error organizing quotes by author:', error)
  }
}

// Run the script
organizeQuotesByAuthor()
