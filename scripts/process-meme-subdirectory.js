#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const { execSync } = require("child_process")

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length === 0) {
  console.error("Error: Please provide a subdirectory name within public/memes/")
  console.error("Usage: node process-meme-subdirectory.js <subdirectory-name> [--force]")
  process.exit(1)
}

// Get subdirectory name and force flag
const subdirName = args[0]
const forceFlag = args.includes("--force") ? "--force" : ""

// Configuration
const BASE_MEMES_DIR = path.join(__dirname, "..", "public", "memes")
const TARGET_DIR = path.join(BASE_MEMES_DIR, subdirName)
const LOG_FILE = path.join(__dirname, "process-subdir-log.txt")

// Initialize log file
fs.writeFileSync(LOG_FILE, `Starting subdirectory processing at ${new Date().toISOString()}\n`)
console.log(`Processing subdirectory: ${subdirName}`)

// Helper function to log messages
function log(message) {
  fs.appendFileSync(LOG_FILE, message + "\n")
  console.log(message)
}

// Helper to parse summary info from a log file
function parseLogSummary(logPath, patterns) {
  if (!fs.existsSync(logPath)) return {}
  const logContent = fs.readFileSync(logPath, "utf8")
  const summary = {}
  for (const [key, regex] of Object.entries(patterns)) {
    const match = logContent.match(regex)
    summary[key] = match ? (isNaN(Number(match[1])) ? match[1] : Number(match[1])) : 0
  }
  return summary
}

// Main function
async function processSubdirectory() {
  try {
    // Check if subdirectory exists
    try {
      await stat(TARGET_DIR)
    } catch (err) {
      log(`Error: Subdirectory ${subdirName} does not exist in ${BASE_MEMES_DIR}`)
      process.exit(1)
    }

    // Step 0: Optimize images using mogrify
    log(`Step 0: Optimizing images in ${TARGET_DIR}`)
    try {
      // Use dynamic import to load ESM module
      await import(path.join(__dirname, "../utils/imageProcessing.js")).then((mod) =>
        mod.processImages(TARGET_DIR)
      )
      log("Image optimization completed successfully")
    } catch (error) {
      log(`Error during image optimization: ${error.message}`)
      // Continue even if optimization fails
    }

    log(`Step 1: Renaming image files in ${TARGET_DIR}`)
    try {
      execSync(
        `node ${path.join(__dirname, "rename-meme-images.js")} "${TARGET_DIR}" ${forceFlag}`,
        { stdio: "inherit" }
      )
      log("Renaming completed successfully")
    } catch (error) {
      log(`Error during renaming: ${error.message}`)
      process.exit(1)
    }

    log(`\nStep 2: Creating matching markdown files for images in ${TARGET_DIR}`)
    try {
      execSync(
        `node ${path.join(__dirname, "create-matching-markdown.js")} "${TARGET_DIR}" ${forceFlag}`,
        { stdio: "inherit" }
      )
      log("Markdown file creation completed successfully")
    } catch (error) {
      log(`Error during markdown file creation: ${error.message}`)
      process.exit(1)
    }

    log(`\nStep 3: Checking for orphaned markdown files in content/memes/${subdirName}`)
    const contentDir = path.join(__dirname, "..", "content", "memes", subdirName)
    let orphanCount = 0
    try {
      if (fs.existsSync(contentDir)) {
        const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"))
        for (const mdFile of mdFiles) {
          const mdPath = path.join(contentDir, mdFile)
          const mdContent = fs.readFileSync(mdPath, "utf8")
          // Try to extract image path from markdown ![...](...)
          const match = mdContent.match(/!\[[^\]]*\]\(([^)]+)\)/)
          if (match) {
            let imgRelPath = match[1]
            // Remove leading slash if present
            if (imgRelPath.startsWith("/")) imgRelPath = imgRelPath.slice(1)
            const imgAbsPath = path.join(__dirname, "..", "public", imgRelPath)
            if (!fs.existsSync(imgAbsPath)) {
              log(`Orphaned markdown: ${mdFile} (missing image: ${imgRelPath})`)
              orphanCount++
            }
          } else {
            log(`Warning: No image found in ${mdFile}`)
          }
        }
        if (orphanCount === 0) {
          log("No orphaned markdown files found.")
        } else {
          log(`Total orphaned markdown files: ${orphanCount}`)
        }
      } else {
        log(`No content directory found at ${contentDir}`)
      }
    } catch (err) {
      log(`Error during orphan check: ${err.message}`)
    }

    log(`\nProcessing of subdirectory ${subdirName} completed at ${new Date().toISOString()}`)
    log(`Check individual log files for details on renamed files and created markdown files.`)

    // Count images in the subdirectory
    let imageCount = 0
    try {
      const files = await readdir(TARGET_DIR)
      imageCount = files.filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f)).length
    } catch (e) {
      imageCount = 0
    }
    // --- SUMMARY REPORT ---
    // Parse step logs for summary info
    const renameSummary = parseLogSummary(path.join(__dirname, "rename-log.txt"), {
      renamed: /([0-9]+) files renamed/,
      skipped: /([0-9]+) files skipped/,
    })
    const mdSummary = parseLogSummary(path.join(__dirname, "markdown-creation-log.txt"), {
      created: /([0-9]+) markdown files created/,
      skipped: /([0-9]+) files skipped/,
    })
    // Orphan count is already tracked
    // Add color and emoji for terminal output
    const color = (code) => `\x1b[${code}m`
    const reset = "\x1b[0m"
    const green = color(32)
    const yellow = color(33)
    const red = color(31)
    const cyan = color(36)
    const bold = color(1)
    // Table-style summary for terminal (no index column, no single quotes)
    const summaryRows = [
      { Action: "Images renamed", Count: `${renameSummary.renamed || 0}` },
      { Action: "Images skipped", Count: `${renameSummary.skipped || 0}` },
      { Action: "Markdown files created", Count: `${mdSummary.created || 0}` },
      { Action: "Markdown files skipped", Count: `${mdSummary.skipped || 0}` },
      { Action: "Orphaned markdown files", Count: `${orphanCount}` },
    ]
    if (process.stdout.isTTY) {
      console.log(`\n\x1b[1;36m--- Meme Processing Summary ---\x1b[0m`)
      console.log(`\x1b[1;36mSubdirectory:\x1b[0m ${subdirName}`)
      // Print a table with aligned columns, no emojis, and numbers in the second column
      const tableRows = [
        { label: "Images", value: imageCount },
        { label: "Images renamed", value: renameSummary.renamed || 0 },
        { label: "Images skipped", value: renameSummary.skipped || 0 },
        { label: "Markdown files created", value: mdSummary.created || 0 },
        { label: "Markdown files skipped", value: mdSummary.skipped || 0 },
        { label: "Orphaned markdown files", value: orphanCount },
      ]
      const maxLabel = Math.max(...tableRows.map((row) => row.label.length))
      const maxValue = Math.max(...tableRows.map((row) => String(row.value).length))
      tableRows.forEach((row) => {
        const label = row.label.padEnd(maxLabel, " ")
        const value = String(row.value).padStart(maxValue, " ")
        console.log(`${label} | ${value}`)
      })
      console.log(`\x1b[36mCompleted at:\x1b[0m ${new Date().toLocaleString()}`)
      console.log(`\x1b[36m-------------------------------\x1b[0m\n`)
    }
    // Write summary to log file (plain, no color, as a text table)
    const logTable = [
      "",
      "--- Meme Processing Summary ---",
      `Subdirectory: ${subdirName}`,
      `Images: ${imageCount}`,
      "+---------------------------+-------+",
      "| Action                    | Count |",
      "+---------------------------+-------+",
      `| Images renamed            | ${renameSummary.renamed || 0}     |`,
      `| Images skipped            | ${renameSummary.skipped || 0}     |`,
      `| Markdown files created    | ${mdSummary.created || 0}     |`,
      `| Markdown files skipped    | ${mdSummary.skipped || 0}     |`,
      `| Orphaned markdown files   | ${orphanCount}     |`,
      "+---------------------------+-------+",
      `Completed at: ${new Date().toLocaleString()}`,
      "-------------------------------",
      "",
    ]
    logTable.forEach((line) => fs.appendFileSync(LOG_FILE, line + "\n"))
  } catch (error) {
    log(`Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the main function
processSubdirectory()
