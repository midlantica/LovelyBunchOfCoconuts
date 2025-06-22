const fs = require("fs")
const path = require("path")

function checkClaimFrontmatter(directory) {
  const files = fs.readdirSync(directory)
  const errors = []

  files.forEach((file) => {
    if (path.extname(file) === ".md") {
      const filePath = path.join(directory, file)
      const content = fs.readFileSync(filePath, "utf-8")

      // Strictly match the front matter pattern
      const frontmatterRegex =
        /^---\n(title: \"[\s\S]*?\")\n(claim: \"[\s\S]*?\")\n(translation: \"[\s\S]*?\")\n---$/m
      const frontmatterMatch = content.match(frontmatterRegex)

      if (!frontmatterMatch) {
        errors.push({ file, error: "Missing or malformed front matter" })
        return
      }
    }
  })

  console.log(`Total claims in content folder: ${files.length}`)
  console.log(`Valid claims: ${files.length - errors.length}`)

  if (errors.length > 0) {
    console.log("Errors found:")
    errors.forEach((err) => console.log(`${err.file}: ${err.error}`))
  } else {
    console.log("All claim markdown files are valid.")
  }
}

// Run the script
const claimsDirectory = path.join(__dirname, "../../content/claims")
checkClaimFrontmatter(claimsDirectory)
