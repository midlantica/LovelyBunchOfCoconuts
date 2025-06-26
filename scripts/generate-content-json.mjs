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
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!entry.name.startsWith("_")) {
        files.push(...(await walkMarkdownFiles(fullPath)))
      }
    } else if (entry.isFile() && entry.name.endsWith(".md") && !shouldExclude(fullPath)) {
      files.push(fullPath)
    }
  }

  return files
}

async function processContent(type) {
  const dir = path.join(baseDir, type)
  const files = await walkMarkdownFiles(dir)

  const results = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(file, "utf8")
      const { data: frontmatter, content: body } = matter(raw)

      const rel = path.relative(baseDir, file).replace(/\.md$/, "")
      const slug = rel.split(path.sep).join("/")
      const _path = `/${type}/${slug}`

      const item = {
        _path,
        ...frontmatter,
        body: body.trim() || undefined,
      }

      // Extra metadata for memes
      if (type === "memes") {
        if (!item.image) {
          const match = body.match(/!\[.*?\]\((.*?)\)/)
          if (match) item.image = match[1]
        }
      }

      // Extra metadata for quotes
      if (type === "quotes") {
        const lines = body
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
        const heading = lines.find((l) => l.startsWith("#"))
        const attribution = lines.find((l, idx) => idx > 0 && !l.startsWith("#"))
        if (heading) item.quoteText = heading.replace(/^#+\s*/, "")
        if (attribution) item.attribution = attribution
      }

      return item
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
