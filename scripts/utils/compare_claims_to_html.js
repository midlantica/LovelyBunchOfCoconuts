const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

// Paths
const claimsDir = path.join(__dirname, '../content/claims')
const htmlFilePath = path.join(__dirname, 'claims.html')

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

// Extract claim titles from HTML
function extractClaimsFromHTML(htmlFilePath) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8')
  const $ = cheerio.load(htmlContent)

  const claims = []
  $('h2').each((_, element) => {
    const text = $(element).text().trim()
    if (text && !claims.includes(text)) {
      claims.push(text)
    }
  })

  return claims
}

// Extract claim titles from markdown files
function extractMarkdownClaims(markdownDir) {
  const markdownFiles = getFilesRecursively(markdownDir).filter((file) =>
    file.endsWith('.md')
  )
  const markdownTitles = markdownFiles
    .map((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      const match = content.match(/claim:\s*"(.*?)"/i)
      return match ? match[1].trim() : null
    })
    .filter(Boolean)

  return markdownTitles
}

// Compare claims in HTML to markdown files
function compareClaims(htmlClaims, markdownTitles) {
  // Identify claims in markdown that are not in HTML
  const missingClaims = markdownTitles.filter(
    (title) => !htmlClaims.includes(title)
  )
  return missingClaims
}

// Generate report
function generateReport() {
  const htmlClaims = extractClaimsFromHTML(htmlFilePath)
  const markdownTitles = extractMarkdownClaims(claimsDir)
  const missingClaims = compareClaims(htmlClaims, markdownTitles)

  // Output only the missing claims
  const report = {
    missingClaims,
  }

  fs.writeFileSync(
    path.join(__dirname, 'missing_claims_from_html_report.json'),
    JSON.stringify(report, null, 2)
  )
  console.log('Missing Claims Report generated:', report)
}

// Run the script
generateReport()
