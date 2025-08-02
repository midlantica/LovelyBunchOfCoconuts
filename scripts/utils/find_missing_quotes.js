const fs = require('fs')
const path = require('path')

// Path to quotes directory
const quotesDir = path.join(__dirname, '../content/quotes')

// Helper function to get all files in a directory recursively
function getFilesRecursively(dir) {
  const files = []
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath))
    } else {
      files.push(fullPath)
    }
  })
  return files
}

// Find malformed quote markdown files
function findMalformedQuoteFiles(dir) {
  const files = getFilesRecursively(dir).filter((file) => file.endsWith('.md'))
  const malformedFiles = files.filter((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const hasQuoteText = content.includes('quoteText:')
    const hasAttribution = content.includes('attribution:')
    return !hasQuoteText || !hasAttribution
  })
  return malformedFiles
}

// Generate report
function generateReport() {
  const malformedQuotes = findMalformedQuoteFiles(quotesDir)

  const report = {
    malformedQuotes,
  }

  fs.writeFileSync(
    path.join(__dirname, 'missing_quotes_report.json'),
    JSON.stringify(report, null, 2)
  )
  console.log('Missing Quotes Report generated:', report)
}

// Run the script
generateReport()
