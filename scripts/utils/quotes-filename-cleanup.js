const fs = require("fs")
const path = require("path")

const QUOTES_DIR = path.join(__dirname, "..", "..", "content", "quotes")

function walk(dir, results = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, results)
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath)
    }
  })
  return results
}

function cleanFilename(filename) {
  // Remove -digits before .md, but only if preceded by a hyphen and not part of a word
  return filename.replace(/-\d+(?=\.md$)/, "")
}

const allFiles = walk(QUOTES_DIR)
let renamed = 0
let skipped = 0

allFiles.forEach((file) => {
  const dir = path.dirname(file)
  const base = path.basename(file)
  const cleanBase = cleanFilename(base)
  if (base !== cleanBase) {
    const newPath = path.join(dir, cleanBase)
    if (fs.existsSync(newPath)) {
      console.warn(`SKIPPED: ${base} → ${cleanBase} (target exists)`)
      skipped++
    } else {
      fs.renameSync(file, newPath)
      console.log(`RENAMED: ${base} → ${cleanBase}`)
      renamed++
    }
  }
})

console.log(`\nDone. Renamed: ${renamed}, Skipped: ${skipped}`)
