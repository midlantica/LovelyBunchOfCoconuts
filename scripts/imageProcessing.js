const path = require("path")
const { processImages } = require("./utils/imageProcessing.js")

const args = process.argv.slice(2)
const targetDir = args[0] ? path.resolve(args[0]) : path.join(__dirname, "..", "public", "memes")

processImages(targetDir)
  .then(() => {
    console.log("Image processing complete.")
  })
  .catch((err) => {
    console.error("Image processing failed:", err)
    process.exit(1)
  })
