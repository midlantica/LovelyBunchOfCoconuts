#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function processMarkdownFiles(contentDir, outputFile) {
  const files = []
  const fullPath = path.join(process.cwd(), contentDir)

  if (!fs.existsSync(fullPath)) {
    console.log(`Directory ${contentDir} does not exist`)
    return
  }

  const markdownFiles = fs
    .readdirSync(fullPath)
    .filter(
      (file) => file.endsWith('.md') && !file.toLowerCase().includes('readme')
    )
    .filter((file) => !file.startsWith('_'))

  for (const file of markdownFiles) {
    const filePath = path.join(fullPath, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = matter(content)

    const slug = file.replace('.md', '')
    const contentType = contentDir.split('/')[1] // claims, memes, quotes

    files.push({
      _path: `/claims/${contentType}/${slug}`,
      title: parsed.data.title || parsed.data.claim || slug.replace(/-/g, ' '),
      claim: parsed.data.claim || parsed.data.title || slug.replace(/-/g, ' '),
      translation: parsed.data.translation || '',
      body: parsed.content || '',
    })
  }

  const outputPath = path.join(process.cwd(), 'public', outputFile)
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2))
  console.log(`Generated ${outputFile} with ${files.length} entries`)
}

// Regenerate all content JSON files
processMarkdownFiles('content/claims', 'content-claims.json')
processMarkdownFiles('content/memes', 'content-memes.json')
processMarkdownFiles('content/quotes', 'content-quotes.json')

console.log('Content JSON files regenerated successfully!')
