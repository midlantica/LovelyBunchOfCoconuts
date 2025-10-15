const fs = require('fs')
const path = require('path')

// Path to claims directory
const claimsDir = path.join(__dirname, '../content/grifts')

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

// Find empty markdown files
function findEmptyMarkdownFiles(dir) {
  const files = getFilesRecursively(dir).filter((file) => file.endsWith('.md'))
  const emptyFiles = files.filter(
    (file) => fs.readFileSync(file, 'utf-8').trim() === ''
  )
  return emptyFiles
}

// Generate report
function generateReport() {
  const emptyClaims = findEmptyMarkdownFiles(claimsDir)

  const report = {
    emptyClaims,
  }

  fs.writeFileSync(
    path.join(__dirname, 'missing_claims_report.json'),
    JSON.stringify(report, null, 2)
  )
  console.log('Missing Claims Report generated:', report)
}

// Run the script
generateReport()
