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
    const contentType = contentDir.split('/')[1] // grifts, memes, quotes, ads

    // Special handling for ads
    if (contentType === 'ads') {
      // Map old size values to new ones
      let size = parsed.data.size || 'square'
      if (size === 'small') size = 'square'
      if (size === 'large') size = 'horizontal'

      files.push({
        id: parsed.data.id || slug,
        title: parsed.data.title || 'Advertisement',
        type: parsed.data.type || 'grift',
        size: size,
        advertiser: parsed.data.advertiser || 'Demo Advertiser',
        campaign: parsed.data.campaign || 'Test Campaign',
        link: parsed.data.link || '#',
        image: parsed.data.image || `/ads/${slug}.png`,
        frequency: parsed.data.frequency || 10,
        active: parsed.data.active !== false,
        body: parsed.content || '',
      })
    } else {
      files.push({
        _path: `/${contentType}/${slug}`,
        title:
          parsed.data.title || parsed.data.grift || slug.replace(/-/g, ' '),
        grift:
          parsed.data.grift || parsed.data.title || slug.replace(/-/g, ' '),
        decode: parsed.data.decode || '',
        body: parsed.content || '',
      })
    }
  }

  const outputPath = path.join(process.cwd(), 'public', outputFile)
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2))
  console.log(`Generated ${outputFile} with ${files.length} entries`)
}

// Regenerate all content JSON files
processMarkdownFiles('content/grifts', 'content-grifts.json')
processMarkdownFiles('content/memes', 'content-memes.json')
processMarkdownFiles('content/quotes', 'content-quotes.json')
processMarkdownFiles('content/ads', 'content-ads.json')
processMarkdownFiles('content/posts', 'content-posts.json')

console.log('Content JSON files regenerated successfully!')
