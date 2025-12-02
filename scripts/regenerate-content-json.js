#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function getAllMarkdownFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip directories starting with _ or .
      if (!item.startsWith('_') && !item.startsWith('.')) {
        getAllMarkdownFiles(fullPath, fileList)
      }
    } else if (
      item.endsWith('.md') &&
      !item.toLowerCase().includes('readme') &&
      !item.startsWith('_')
    ) {
      fileList.push(fullPath)
    }
  }

  return fileList
}

function processMarkdownFiles(contentDir, outputFile) {
  const files = []
  const fullPath = path.join(process.cwd(), contentDir)

  if (!fs.existsSync(fullPath)) {
    console.log(`Directory ${contentDir} does not exist`)
    return 0
  }

  const markdownFiles = getAllMarkdownFiles(fullPath)
  const contentType = contentDir.split('/')[1] // grifts, memes, quotes, ads

  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const parsed = matter(content)

      const file = path.basename(filePath)
      const slug = file.replace('.md', '')

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
    } catch (error) {
      console.warn(
        `⚠️  Skipping ${path.relative(process.cwd(), filePath)}: ${error.message}`
      )
    }
  }

  const outputPath = path.join(process.cwd(), 'public', outputFile)
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2))

  return files.length
}

// Regenerate all content JSON files
const griftsCount = processMarkdownFiles(
  'content/grifts',
  'content-grifts.json'
)
const memesCount = processMarkdownFiles('content/memes', 'content-memes.json')
const quotesCount = processMarkdownFiles(
  'content/quotes',
  'content-quotes.json'
)
const adsCount = processMarkdownFiles('content/ads', 'content-ads.json')
const postsCount = processMarkdownFiles('content/posts', 'content-posts.json')

const totalCount =
  griftsCount + memesCount + quotesCount + adsCount + postsCount

console.log('Generated JSON content in public/:')
console.log(`Grifts: ${griftsCount},`)
console.log(`Memes: ${memesCount},`)
console.log(`Quotes: ${quotesCount},`)
console.log(`Ads: ${adsCount},`)
console.log(`Posts: ${postsCount}`)
console.log(`\n📊 Total items: ${totalCount}`)
console.log('\nContent JSON files regenerated successfully!\n')
