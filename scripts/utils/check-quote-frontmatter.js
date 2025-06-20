const fs = require("fs")
const path = require("path")

const QUOTES_DIR = path.join(__dirname, "..", "..", "content", "quotes")

function checkFrontmatter(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n")
  // Check for at least 4 lines and the exact pattern
  return (
    lines[0].trim() === "---" &&
    /^title:\s*".*"$/.test(lines[1].trim()) &&
    lines[2].trim() === "---"
  )
}

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

const allFiles = walk(QUOTES_DIR)
const badFiles = allFiles.filter((file) => !checkFrontmatter(file))

if (badFiles.length === 0) {
  console.log("All quote markdown files have valid frontmatter!")
} else {
  console.log("Files with invalid or missing frontmatter:")
  badFiles.forEach((file) => console.log(file))
}
