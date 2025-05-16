// server/api/content/item.get.js
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const contentPath = query.path
    
    if (!contentPath) {
      return createError({
        statusCode: 400,
        message: 'Path parameter is required'
      })
    }
    
    // Remove leading slash if present
    const normalizedPath = contentPath.startsWith('/') ? contentPath.substring(1) : contentPath
    
    // Construct the full file path
    const filePath = path.join(process.cwd(), 'content', `${normalizedPath}.md`)
    
    try {
      // Check if file exists
      await fs.access(filePath)
      
      // Read and parse the file
      const content = await fs.readFile(filePath, 'utf-8')
      const { data, content: bodyContent } = matter(content)
      
      // Parse the markdown content to extract headings
      const lines = bodyContent.split('\n')
      const headings = lines
        .filter(line => line.startsWith('##') || line.startsWith('# '))
        .map(line => line.replace(/^#+\\s+/, '').replace(/"/g, '').trim())
      
      // For claims, extract claim and translation
      let claim = data.claim || ''
      let translation = data.translation || ''
      
      // For quotes, extract quote text and attribution
      let quoteText = ''
      let attribution = ''
      
      if (normalizedPath.startsWith('quotes/') && headings.length > 0) {
        quoteText = headings[0]
        // Look for attribution line (usually follows the heading)
        const headingIndex = lines.findIndex(line => 
          line.startsWith('##') || line.startsWith('# ')
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
      if (!image && normalizedPath.startsWith('memes/')) {
        // Try to find image in content
        const imgMatch = bodyContent.match(/!\\[.*?\\]\\((.*?)\\)/)
        if (imgMatch && imgMatch[1]) {
          image = imgMatch[1]
        }
      }
      
      return {
        _path: `/${normalizedPath}`,
        ...data,
        body: bodyContent,
        headings,
        claim,
        translation,
        quoteText,
        attribution,
        image
      }
      
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
      return createError({
        statusCode: 404,
        message: `Content not found: ${contentPath}`
      })
    }
    
  } catch (error) {
    console.error('Error fetching content item:', error)
    return createError({
      statusCode: 500,
      message: 'Error fetching content item'
    })
  }
})
