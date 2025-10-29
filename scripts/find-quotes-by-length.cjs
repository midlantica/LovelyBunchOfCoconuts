const fs = require('fs')
const path = require('path')

function findQuotes(dir, results = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      findQuotes(fullPath, results)
    } else if (file.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        // Look for ## headers (level 2) - that's where the actual quote text is
        const match = content.match(/^## "?(.+?)"?$/m)
        if (match) {
          const quote = match[1].trim()
          const len = quote.length
          results.push({ len, quote, file: fullPath })
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }
  }
  return results
}

const quotes = findQuotes('content/quotes').sort((a, b) => a.len - b.len)

console.log(`\nTotal quotes found: ${quotes.length}\n`)

// Show distribution
const ranges = {
  '0-40': quotes.filter((q) => q.len <= 40),
  '41-60': quotes.filter((q) => q.len >= 41 && q.len <= 60),
  '61-80': quotes.filter((q) => q.len >= 61 && q.len <= 80),
  '81-100': quotes.filter((q) => q.len >= 81 && q.len <= 100),
  '101-120': quotes.filter((q) => q.len >= 101 && q.len <= 120),
  '121-150': quotes.filter((q) => q.len >= 121 && q.len <= 150),
  '151-200': quotes.filter((q) => q.len >= 151 && q.len <= 200),
  '201-300': quotes.filter((q) => q.len >= 201 && q.len <= 300),
  '301-400': quotes.filter((q) => q.len >= 301 && q.len <= 400),
  '401+': quotes.filter((q) => q.len >= 401),
}

console.log('=== QUOTE LENGTH DISTRIBUTION ===\n')
Object.entries(ranges).forEach(([rangeName, quoteList]) => {
  console.log(`${rangeName} chars: ${quoteList.length} quotes`)
})

console.log('\n=== GAPS TO FILL (showing first 2 examples) ===\n')

// Show examples from gap ranges
const gapRanges = {
  '~60 (41-60)': quotes.filter((q) => q.len >= 41 && q.len <= 60),
  '~70 (61-80)': quotes.filter((q) => q.len >= 61 && q.len <= 80),
  '~90 (81-94)': quotes.filter((q) => q.len >= 81 && q.len <= 94),
  '~200 (180-220)': quotes.filter((q) => q.len >= 180 && q.len <= 220),
  '~300 (280-320)': quotes.filter((q) => q.len >= 280 && q.len <= 320),
}

Object.entries(gapRanges).forEach(([rangeName, quoteList]) => {
  if (quoteList.length > 0) {
    console.log(`=== ${rangeName} - ${quoteList.length} quotes available ===\n`)
    quoteList.slice(0, 2).forEach((q) => {
      console.log(`${q.len} chars: "${q.quote}"`)
      console.log(`  File: ${q.file}\n`)
    })
  } else {
    console.log(`=== ${rangeName} - NO QUOTES ===\n`)
  }
})
