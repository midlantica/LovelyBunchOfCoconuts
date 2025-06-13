const fs = require("fs")
const path = require("path")

// Paths
const claimsDir = path.join(__dirname, "../content/claims")
const memesImagesDir = path.join(__dirname, "../public/memes")
const memesMarkdownDir = path.join(__dirname, "../content/memes")

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
  const files = getFilesRecursively(dir).filter((file) => file.endsWith(".md"))
  const emptyFiles = files.filter((file) => fs.readFileSync(file, "utf-8").trim() === "")
  return emptyFiles
}

// Updated function to handle variations in naming conventions
function findUnmatchedMemeImages(imagesDir, markdownDir) {
  const imageFiles = getFilesRecursively(imagesDir).filter((file) => file.match(/\.(png|jpg)$/))
  const markdownFiles = getFilesRecursively(markdownDir).filter((file) => file.endsWith(".md"))

  const markdownBaseNames = markdownFiles.map((file) => path.basename(file, ".md"))
  const unmatchedImages = imageFiles.filter((imageFile) => {
    const imageBaseName = path.basename(imageFile, path.extname(imageFile))

    // Check for partial matches or substring matches
    return !markdownBaseNames.some((markdownBaseName) => {
      return markdownBaseName.includes(imageBaseName) || imageBaseName.includes(markdownBaseName)
    })
  })

  return unmatchedImages
}

// Updated function to verify image links in markdown files
function findMissingImagesInMarkdown(markdownDir, imagesDir) {
  const markdownFiles = getFilesRecursively(markdownDir).filter((file) => file.endsWith(".md"))
  const imageFiles = getFilesRecursively(imagesDir).filter((file) => file.match(/\.(png|jpg)$/))

  const imagePathsInMarkdown = []

  markdownFiles.forEach((markdownFile) => {
    const content = fs.readFileSync(markdownFile, "utf-8")

    // Extract image links using regex
    const matches = content.match(/!\[.*?\]\((.*?)\)/g)
    if (matches) {
      matches.forEach((match) => {
        const imagePath = match.match(/\((.*?)\)/)[1]
        if (imagePath) {
          imagePathsInMarkdown.push(imagePath)
        }
      })
    }
  })

  // Normalize image paths and check for missing images
  const normalizedImageFiles = imageFiles.map((file) => path.relative(imagesDir, file))
  const missingImages = imagePathsInMarkdown.filter(
    (imagePath) => !normalizedImageFiles.includes(imagePath)
  )

  return {
    totalImagesReferenced: imagePathsInMarkdown.length,
    missingImages,
  }
}

// Generate report
function generateReport() {
  const emptyClaims = findEmptyMarkdownFiles(claimsDir)
  const { totalImagesReferenced, missingImages } = findMissingImagesInMarkdown(
    memesMarkdownDir,
    memesImagesDir
  )

  const report = {
    emptyClaims,
    totalImagesReferenced,
    missingImages,
  }

  fs.writeFileSync(path.join(__dirname, "report.json"), JSON.stringify(report, null, 2))
  console.log("Report generated:", report)
}

// Run the script
generateReport()
