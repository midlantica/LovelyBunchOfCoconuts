// server/api/content/search.js
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Helper to read directory recursively
async function readDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        return readDir(fullPath);
      } else if (entry.name.endsWith('.md') && !entry.name.toLowerCase().includes('readme')) {
        return fullPath;
      } else {
        return [];
      }
    })
  );
  
  return files.flat();
}

// Parse markdown file with frontmatter
async function parseMarkdownFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: bodyContent } = matter(content);
    
    // Create a path similar to Nuxt Content's _path
    const relativePath = filePath
      .replace(process.cwd(), '')
      .replace('/content', '')
      .replace('.md', '');
    
    // Parse the markdown content to extract headings
    const lines = bodyContent.split('\n');
    const headings = lines
      .filter(line => line.startsWith('##') || line.startsWith('# '))
      .map(line => line.replace(/^#+\s+/, '').replace(/"/g, '').trim());
    
    // For claims, extract claim and translation
    let claim = data.claim || '';
    let translation = data.translation || '';
    
    // For quotes, extract quote text and attribution
    let quoteText = '';
    let attribution = '';
    
    if (relativePath.startsWith('/quotes/') && headings.length > 0) {
      quoteText = headings[0];
      // Look for attribution line (usually follows the heading)
      const headingIndex = lines.findIndex(line => 
        line.startsWith('##') || line.startsWith('# ')
      );
      if (headingIndex !== -1 && headingIndex + 1 < lines.length) {
        // Find the first non-empty line after the heading
        for (let i = headingIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.startsWith('#')) {
            attribution = line;
            break;
          }
        }
      }
    }
    
    // For memes, extract image path
    let image = data.image || '';
    if (!image && relativePath.startsWith('/memes/')) {
      // Try to find image in content
      const imgMatch = bodyContent.match(/!\[.*?\]\((.*?)\)/);
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1];
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
      image
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event);
  
  if (!query) {
    return [];
  }
  
  try {
    const contentDir = path.join(process.cwd(), 'content');
    const dirsToRead = [
      path.join(contentDir, 'claims'),
      path.join(contentDir, 'quotes'),
      path.join(contentDir, 'memes')
    ];
    
    // Read all markdown files
    const filePathsArrays = await Promise.all(dirsToRead.map(dir => readDir(dir)));
    const filePaths = filePathsArrays.flat();
    
    // Parse all markdown files
    const contentItems = await Promise.all(
      filePaths.map(filePath => parseMarkdownFile(filePath))
    );
    
    // Filter out null values
    const validItems = contentItems.filter(Boolean);
    
    // Perform text search across all content
    const searchTerm = query.toLowerCase();
    const searchResults = validItems.filter(item => {
      // Search in various fields based on content type
      const searchableText = [
        item.body || '',
        item.claim || '',
        item.translation || '',
        item.title || '',
        item.attribution || '',
        ...(item.headings || []),
        item.description || ''
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
    
    console.log(`Search for "${query}" found ${searchResults.length} results`);
    
    return searchResults;
  } catch (error) {
    console.error('Error in search:', error);
    return { error: true, message: error.message };
  }
});
