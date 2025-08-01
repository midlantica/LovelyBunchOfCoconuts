// organize_quotes.js - Script to organize quote files into thematic categories
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const quotesDir = path.join(__dirname, '../content/quotes')

// Categories and keywords for classification
const categories = {
  liberty: [
    'liberty',
    'freedom',
    'free',
    'rights',
    'individual',
    'independence',
    'free speech',
    'free market',
    'free people',
    'liberty-',
    'self-ownership',
    'pursuit of happiness',
    'free society',
    'free men',
    'free citizen',
  ],
  economics: [
    'tax',
    'econom',
    'market',
    'money',
    'wealth',
    'debt',
    'inflation',
    'spend',
    'fiscal',
    'budget',
    'trade',
    'dollar',
    'financial',
    'banking',
    'capitalism',
  ],
  government: [
    'government',
    'state',
    'law',
    'republic',
    'democra',
    'administration',
    'bureaucra',
    'politician',
    'congress',
    'senate',
    'legislat',
    'regulation',
    'federal',
    'policy',
    'official',
    'public servant',
  ],
  socialism: [
    'social',
    'communism',
    'marx',
    'collectiv',
    'redistribution',
    'welfare state',
    'central planning',
    'equality of outcome',
    'commune',
    'utopia',
  ],
  tyranny: [
    'tyran',
    'dictator',
    'oppress',
    'totalitarian',
    'authorit',
    'despot',
    'fascis',
    'tyranny',
    'control',
    'power',
    'force',
    'coercion',
    'fear',
  ],
  constitution: [
    'constitution',
    'founding',
    'amendment',
    'bill of rights',
    'founding fathers',
    'constitutional',
    'judicial',
    'supreme court',
  ],
  wisdom: [
    'wisdom',
    'truth',
    'morality',
    'virtue',
    'principl',
    'ethic',
    'integrit',
    'character',
    'honest',
    'knowledge',
    'understand',
  ],
}

// Helper function to read file content
async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return content
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return ''
  }
}

// Helper function to determine category based on content
function categorizeQuote(filename, content) {
  // Skip directories and non-markdown files
  if (!filename.endsWith('.md')) return null

  // Normalize content for matching
  const normalizedContent = content.toLowerCase()

  // Check for each category based on keywords
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (
        normalizedContent.includes(keyword.toLowerCase()) ||
        filename.toLowerCase().includes(keyword.toLowerCase())
      ) {
        return category
      }
    }
  }

  // Default to wisdom if no clear category is found
  return 'wisdom'
}

// Main function to organize quotes
async function organizeQuotes() {
  try {
    console.log('Starting quote organization...')

    // Get all files in the quotes directory
    const files = await fs.readdir(quotesDir)

    // Track statistics
    const stats = {
      processed: 0,
      categorized: {},
      skipped: 0,
    }

    // Initialize count for each category
    for (const category of Object.keys(categories)) {
      stats.categorized[category] = 0
    }

    // Process each file
    for (const file of files) {
      const filePath = path.join(quotesDir, file)

      // Skip directories and non-markdown files
      const fileStats = await fs.stat(filePath)
      if (fileStats.isDirectory()) {
        continue
      }

      if (!file.endsWith('.md')) {
        stats.skipped++
        continue
      }

      // Read file content
      const content = await readFileContent(filePath)

      // Determine category
      const category = categorizeQuote(file, content)

      if (!category) {
        stats.skipped++
        continue
      }

      // Create category directory if it doesn't exist
      const categoryDir = path.join(quotesDir, category)
      try {
        await fs.mkdir(categoryDir, { recursive: true })
      } catch (error) {
        if (error.code !== 'EEXIST') {
          console.error(`Error creating directory ${category}:`, error)
          continue
        }
      }

      // Move file to category directory
      const destPath = path.join(categoryDir, file)
      try {
        await fs.rename(filePath, destPath)
        stats.processed++
        stats.categorized[category]++
        console.log(`Moved: ${file} -> ${category}/`)
      } catch (error) {
        console.error(`Error moving ${file} to ${category}:`, error)
      }
    }

    // Display statistics
    console.log('\nOrganization complete!')
    console.log(`Total files processed: ${stats.processed}`)
    console.log('Files per category:')
    for (const [category, count] of Object.entries(stats.categorized)) {
      console.log(`  ${category}: ${count}`)
    }
    console.log(`Files skipped: ${stats.skipped}`)
  } catch (error) {
    console.error('Error organizing quotes:', error)
  }
}

// Run the script
organizeQuotes()
