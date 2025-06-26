const fs = require("fs")
const path = require("path")

// Paths
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

// Find orphaned meme images
function findOrphanedMemeImages(imagesDir, markdownDir) {
  const imageFiles = getFilesRecursively(imagesDir).filter((file) => file.match(/\.(png|jpg)$/))
  const markdownFiles = getFilesRecursively(markdownDir).filter((file) => file.endsWith(".md"))

  const markdownBaseNames = markdownFiles.map((file) => path.basename(file, ".md"))
  const orphanedImages = imageFiles.filter((imageFile) => {
    const imageBaseName = path.basename(imageFile, path.extname(imageFile))
    return !markdownBaseNames.includes(imageBaseName)
  })

  return orphanedImages
}

// Generate report
function generateReport() {
  const orphanedImages = findOrphanedMemeImages(memesImagesDir, memesMarkdownDir)

  const report = {
    orphanedImages,
  }

  fs.writeFileSync(
    path.join(__dirname, "orphaned_meme_images_report.json"),
    JSON.stringify(report, null, 2)
  )
  console.log("Orphaned Meme Images Report generated:", report)
}

// Run the script
generateReport()
