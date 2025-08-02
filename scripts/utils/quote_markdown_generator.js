const fs = require('fs')
const path = require('path')

// Get the quotes file from command line or default to 'quotes.js'
const quotesFile = process.argv[2] || './quotes.js'
const quotes = require(path.resolve(quotesFile))

// Create output directory
const outputDir = path.join('.', 'new-quotes')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

// Track used filenames to ensure uniqueness
const usedNames = new Set()

function safeFileName(title, idx) {
  let base = title
    .replace(/[^a-zA-Z0-9 \-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  let fileName = `${base || 'quote'}-${(idx + 1)
    .toString()
    .padStart(3, '0')}.md`
  // Ensure filename is unique
  let uniqueName = fileName
  let count = 2
  while (usedNames.has(uniqueName)) {
    uniqueName = `${base || 'quote'}-${(idx + 1)
      .toString()
      .padStart(3, '0')}-${count}.md`
    count++
  }
  usedNames.add(uniqueName)
  return uniqueName
}

quotes.forEach((q, idx) => {
  const fileName = safeFileName(q.title, idx)
  const content = `---\ntitle: "${q.title}"\n---\n\n## "${q.quote}"\n\n${q.author}\n`
  fs.writeFileSync(path.join(outputDir, fileName), content, 'utf8')
  console.log(`Created: ${fileName}`)
})

console.log('All quotes generated in', outputDir)
