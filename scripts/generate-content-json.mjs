// scripts/generate-content-json.mjs

import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

const baseDir = "./content"
const outputDir = "./public"
const contentTypes = ["claims", "quotes", "memes"]

function shouldExclude(filePath) {
  return filePath.split(path.sep).some((segment) => segment.startsWith("_"))
}

async function walkMarkdownFiles(dir) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      if (!shouldExclude(fullPath)) {
        files.push(fullPath)
      }
    }
  }

  return files
}

async function processContent(type) {
  const dir = path.join(baseDir, type)
  const files = await walkMarkdownFiles(dir)

  const results = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, "utf8")
      const { data: frontmatter, content: body } = matter(content)

      const relativePath = "/" + file.replace(baseDir + "/", "").replace(/\.md$/, "")

      return {
        _path: "/" + type + "/" + relativePath.split("/").slice(1).join("/"),
        ...frontmatter,
        body: body.trim() || undefined,
      }
    })
  )

  const outputPath = path.join(outputDir, `content-${type}.json`)
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2), "utf8")
  console.log(`✅ Wrote ${results.length} items to ${outputPath}`)
}

async function run() {
  await fs.mkdir(outputDir, { recursive: true })
  for (const type of contentTypes) {
    await processContent(type)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
