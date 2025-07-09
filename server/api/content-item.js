// server/api/content-item.js
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const { type, slug } = getQuery(event)

  if (!type || !slug) {
    return { error: true, message: 'Type and slug are required' }
  }

  try {
    // Construct the file path
    const contentDir = path.join(process.cwd(), 'content')
    const filePath = path.join(contentDir, type, `${slug}.md`)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch (err) {
      return { error: true, message: 'Content not found', status: 404 }
    }

    // Read and parse the file
    const content = await fs.readFile(filePath, 'utf-8')
    const { data, content: bodyContent } = matter(content)

    // Parse the markdown content to extract headings
    const lines = bodyContent.split('\n')
    const headings = lines
      .filter((line) => line.startsWith('##') || line.startsWith('# '))
      .map((line) =>
        line
          .replace(/^#+\s+/, '')
          .replace(/"/g, '')
          .trim()
      )

    // Create a path similar to Nuxt Content's _path
    const relativePath = filePath
      .replace(process.cwd(), '')
      .replace('/content', '')
      .replace('.md', '')

    // For claims, extract claim and translation
    let claim = data.claim || ''
    let translation = data.translation || ''

    // For quotes, extract quote text and attribution
    let quoteText = ''
    let attribution = ''

    if (type === 'quotes' && headings.length > 0) {
      quoteText = headings[0]
      // Look for attribution line (usually follows the heading)
      const headingIndex = lines.findIndex(
        (line) => line.startsWith('##') || line.startsWith('# ')
      )
      if (headingIndex !== -1 && headingIndex + 1 < lines.length) {
        // Find the first non-empty line after the heading
        for (let i = headingIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line && !line.startsWith('#')) {
            attribution = line
            break
          }
        }
      }
    }

    // For memes, extract image path
    let image = data.image || ''
    if (!image && type === 'memes') {
      // Try to find image in content
      const imgMatch = bodyContent.match(/!\[.*?\]\((.*?)\)/)
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1]
      }
    }

    return {
      _path: relativePath,
      ...data,
      body: bodyContent,
      headings,
      claim,
      translation,
      quoteText,
      attribution,
      image,
    }
  } catch (error) {
    console.error('Error fetching content item:', error)
    return { error: true, message: error.message }
  }
})
