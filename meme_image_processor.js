// meme_image_processor.js
import fs from "fs/promises"
import path from "path"
import { processImages } from "./utils/imageProcessing.js"

/**
 * Main entry point for the image processor
 */
async function main() {
  const args = process.argv.slice(2)
  
  // Validate command line arguments
  if (args.length !== 1) {
    console.error("Usage: node meme_image_processor.js <directory>")
    process.exit(1)
  }

  const directory = path.resolve(args[0])
  
  try {
    // Check if directory exists
    await fs.access(directory)
    
    // Process all images in the directory
    await processImages(directory)
    console.log("Image processing complete!")
  } catch (error) {
    console.error(`Error: '${directory}' is not a valid directory`)
    process.exit(1)
  }
}

// Run the script
main()
