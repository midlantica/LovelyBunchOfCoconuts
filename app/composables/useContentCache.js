// composables/useContentCache.js
// Reactive content cache with transformation pipeline: loads, transforms, and caches all content types
// Provides progressive loading (initial batch + remaining) with search enhancement and SSR compatibility

import { interleaveContent } from '~/composables/interleaveContent'

// Unified debug flag (enable by setting VITE_CONTENT_DEBUG=1)
const contentDebug =
  import.meta.dev && import.meta.env?.VITE_CONTENT_DEBUG === '1'
const debugLog = (...args) => {
  if (contentDebug) console.log(...args)
}

// Helper function to extract searchable text from AST body and path
const extractSearchableText = (body, itemPath = '') => {
  if (!body || !body.value) return ''

  let text = ''
  const extractFromElement = (element) => {
    if (Array.isArray(element)) {
      const [tag, attrs, content] = element
      if (typeof content === 'string') {
        text += content + ' '
      } else if (Array.isArray(content)) {
        content.forEach(extractFromElement)
      }
    } else if (typeof element === 'string') {
      text += element + ' '
    }
  }

  body.value.forEach(extractFromElement)

  // Add path information as searchable content (lower priority)
  if (itemPath) {
    // Extract folder names from path and add them as searchable terms
    const pathParts = itemPath.split('/').filter(Boolean)
    const folderNames = pathParts
      .filter((part) => !part.endsWith('.md')) // Exclude filename
      .map((part) => part.replace(/[-_]/g, ' ')) // Convert dashes/underscores to spaces
      .join(' ')

    if (folderNames) {
      text += ' ' + folderNames
    }
  }

  // Normalize special characters: convert smart quotes, apostrophes, dashes to standard ASCII
  // This ensures searches work regardless of character encoding
  const normalized = text
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes to apostrophe
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes to straight quotes
    .replace(/[\u2013\u2014]/g, '-') // En dash and em dash to hyphen
    .replace(/[\u2026]/g, '...') // Ellipsis to three dots
    .trim()

  return normalized
}

// Global cache instance - shared across all components
const globalCache = reactive({
  grifts: [],
  quotes: [],
  memes: [],
  posts: [],
  profiles: [],
  isLoading: false,
  error: null,
})

// Slug helpers & maps must be declared before use
const slugify = (str = '') =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)

const slugMaps = reactive({
  grifts: new Map(),
  quotes: new Map(),
  memes: new Map(),
  posts: new Map(),
  profiles: new Map(),
})

// Helper to register multiple keys for the same item
const registerSlugKeys = (map, keys, value) => {
  ;(Array.isArray(keys) ? keys : [keys])
    .filter(Boolean)
    .forEach((k) => map.set(k, value))
}

export function useContentCache() {
  // Instead of mirroring with individual refs + watchers, expose reactive toRefs directly
  const cache = globalCache
  const { grifts, quotes, memes, posts, profiles, isLoading, error } =
    toRefs(cache)

  // Auto-load content if not already loaded (for dynamic routes)
  const ensureContentLoaded = async () => {
    if (
      cache.grifts.length === 0 &&
      cache.quotes.length === 0 &&
      cache.memes.length === 0 &&
      cache.posts.length === 0 &&
      cache.profiles.length === 0 &&
      !cache.isLoading
    ) {
      debugLog('🚀 Auto-loading content for dynamic route...')
      await loadAllContent()
    }
  }

  // Helper function to filter out special files (centralized so we don't redeclare inside funcs)
  const filterSpecialFiles = (items) => {
    return (items || []).filter((item) => {
      const path = item.path?.toLowerCase() || item._path?.toLowerCase() || ''
      const id = item.id?.toLowerCase() || ''
      const pathParts = path.split('/')
      const hasUnderscoreFolder = pathParts.some((part) => part.startsWith('_'))
      const shouldFilter =
        path.includes('readme') ||
        path.includes('test-ignore') ||
        path.includes('__') ||
        id.includes('readme') ||
        id.includes('test-ignore') ||
        hasUnderscoreFolder
      return !shouldFilter
    })
  }

  // Helper function to transform content for component compatibility
  const transformContentForComponents = (items, type) => {
    return items.map((item) => {
      const transformed = { ...item }

      // For grifts: frontmatter properties are stored under item.meta
      if (type === 'grifts') {
        transformed.grift = item.meta?.grift || item.meta?.claim || item.title
        transformed.decode = item.meta?.decode || item.meta?.translation
      }

      if (type === 'quotes') {
        if (item.body && item.body.value) {
          const headings = item.body.value
            .filter((element) => element[0] === 'h2' || element[0] === 'h1')
            .map((element) => element[2] || '')
            .filter(Boolean)
          transformed.headings = headings
          const paragraphs = item.body.value
            .filter((element) => element[0] === 'p')
            .map((element) => element[2] || '')
            .filter(Boolean)
          transformed.attribution = paragraphs[0] || ''
          if (headings.length > 0) {
            transformed.quoteText = headings.join('\n\n')
          }
        }
      }

      // For memes: extract image from body content structure
      if (type === 'memes') {
        // Extract image from body value array (Nuxt Content v3 minimark format)
        if (item.body && item.body.value) {
          // Look for image in different ways
          for (const element of item.body.value) {
            if (Array.isArray(element)) {
              // Check if this is an image element
              if (element[0] === 'img' && element[1]?.src) {
                transformed.image = element[1].src
                break
              }
              // Check if it's a paragraph containing an image
              if (element[0] === 'p' && Array.isArray(element[2])) {
                // The element[2] IS the img element directly: ["img", {src: "..."}]
                if (element[2][0] === 'img' && element[2][1]?.src) {
                  transformed.image = element[2][1].src
                  break
                }

                // OR look through the paragraph content for images (if it's an array of elements)
                for (const child of element[2]) {
                  if (
                    Array.isArray(child) &&
                    child[0] === 'img' &&
                    child[1]?.src
                  ) {
                    transformed.image = child[1].src
                    break
                  }
                }
                if (transformed.image) break
              }
              // Check if it's a paragraph with an image markdown string
              if (
                element[0] === 'p' &&
                typeof element[2] === 'string' &&
                element[2].includes('![')
              ) {
                // Extract image from markdown syntax like ![alt](/path/to/image.png)
                const imageMatch = element[2].match(/!\[.*?\]\(([^)]+)\)/)
                if (imageMatch) {
                  transformed.image = imageMatch[1]
                  break
                }
              }
            }
          }
        }

        // If we still didn't find an image, set a placeholder or leave empty
        if (!transformed.image) {
          transformed.image = '' // This will be handled by the component
        }

        // Set description from title if available
        if (item.title) {
          transformed.description = item.title
        }

        // Extract text content from body (excluding the image)
        if (item.body && item.body.value) {
          const textParts = []
          for (const element of item.body.value) {
            if (Array.isArray(element)) {
              // Skip image elements, collect text elements
              if (element[0] === 'p' && typeof element[2] === 'string') {
                // Skip paragraphs that contain image markdown
                if (!element[2].includes('![')) {
                  textParts.push(element[2])
                }
              }
              // Handle other text elements like headings
              if (
                (element[0] === 'h1' ||
                  element[0] === 'h2' ||
                  element[0] === 'h3') &&
                typeof element[2] === 'string'
              ) {
                textParts.push(element[2])
              }
            }
          }
          transformed.bodyText = textParts.join('\n\n').trim()
        }
      }

      // For posts: extract body text for preview and search
      if (type === 'posts') {
        if (item.body && item.body.value) {
          // Posts use full body content, no special transformation needed
          // The body will be rendered by ContentRenderer in the modal
          transformed.body = item.body

          // Extract text content for search (including title)
          const bodyText = extractSearchableText(
            item.body,
            item._path || item.path
          )
          transformed.bodyText = bodyText
        }
      }

      // Add searchable text field for search functionality (precompute consolidated lowercase string)
      const rawSearch = extractSearchableText(
        item.body,
        item._path || item.path
      )
      transformed.searchableText = rawSearch

      // Build _search field with all relevant text content
      const searchParts = [
        transformed.grift,
        transformed.decode,
        transformed.title,
        transformed.quoteText,
        transformed.attribution,
        transformed.description,
        transformed.bodyText, // Include bodyText for posts
        rawSearch,
        item._path || '',
      ].filter(Boolean)

      transformed._search = searchParts
        .join(' ')
        .toLowerCase()
        .replace(/[-_]/g, ' ')

      // Build filename-based keys (supports underscores and dashes)
      const fileBase = (item.id || item._path || '')
        .toString()
        .split('/')
        .pop()
        ?.replace(/\.md$/, '')
        .toLowerCase()
      const fileSlugDash = fileBase?.replace(/_/g, '-')
      const fileSlugUnderscore = fileBase?.replace(/-/g, '_')

      // Slug generation & map insertion
      if (type === 'grifts') {
        const s = slugify(transformed.grift || transformed.title || '')
        // Register content-based slug and filename variants
        registerSlugKeys(
          slugMaps.grifts,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      } else if (type === 'quotes') {
        const author = slugify(transformed.attribution || 'unknown')
        const qt = slugify(transformed.quoteText || transformed.title || '')
        const s = `${author}-${qt}`.substring(0, 80)
        registerSlugKeys(
          slugMaps.quotes,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      } else if (type === 'posts') {
        const s = slugify(transformed.title || '')
        registerSlugKeys(
          slugMaps.posts,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      } else if (type === 'memes') {
        const s = slugify(transformed.title || transformed.description || '')
        registerSlugKeys(
          slugMaps.memes,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      }
      return transformed
    })
  }

  const getContentItem = async (contentType, slug) => {
    // Fast path via slug maps
    if (slug) {
      if (contentType === 'grift' && slugMaps.grifts.has(slug))
        return slugMaps.grifts.get(slug)
      if (contentType === 'quote' && slugMaps.quotes.has(slug))
        return slugMaps.quotes.get(slug)
      if (contentType === 'post' && slugMaps.posts.has(slug))
        return slugMaps.posts.get(slug)
      if (contentType === 'meme' && slugMaps.memes.has(slug))
        return slugMaps.memes.get(slug)
    }

    try {
      // Handle undefined slug
      if (!slug) {
        console.error(`No slug provided for ${contentType}`)
        return null
      }

      // Try multiple path variations to handle dev vs prod differences
      const pathVariations = [
        slug, // Original slug as-is
        `/${slug}`, // With leading slash
        slug.replace(/^\/+/, ''), // Remove leading slashes
        slug.replace(/^\/+/, '').replace(/^[^\/]+\//, ''), // Remove content type prefix
      ]

      // If slug doesn't start with contentType, also try with contentType prefix
      if (!slug.includes(contentType)) {
        pathVariations.push(`${contentType}/${slug}`)
        pathVariations.push(`/${contentType}/${slug}`)
        pathVariations.push(`${contentType}/${slug.replace(/^\/+/, '')}`)
      }

      // Try each path variation
      for (const pathVar of pathVariations) {
        try {
          // Safety check: ensure pathVar is a valid string
          if (!pathVar || typeof pathVar !== 'string') {
            continue
          }

          const item = await queryCollection(contentType)
            .where({ _path: pathVar })
            .first()

          if (item) {
            return item
          }
        } catch (e) {
          // Path variation failed, try next
        }
      }

      // If all path variations fail, try searching by title or filename
      const filenameFromSlug =
        slug
          .split('/')
          .pop()
          ?.replace(/\.[^/.]+$/, '') || slug

      const allItems = await queryCollection(contentType).all()

      // Try different matching strategies
      const matchingItem = allItems.find((item) => {
        // Safety check - ensure we have valid data
        if (!item || typeof item !== 'object') return false

        const itemTitle = item.title || ''
        const itemPath = item._path || ''
        const itemId = item.id || ''

        // Convert underscores to dashes for path matching
        const normalizedSlug = filenameFromSlug.replace(/_/g, '-')
        const normalizedSlugUnderscore = filenameFromSlug.replace(/-/g, '_')

        const matches =
          itemTitle === filenameFromSlug ||
          itemTitle === normalizedSlug ||
          itemTitle === normalizedSlugUnderscore ||
          itemPath.includes(filenameFromSlug) ||
          itemPath.includes(normalizedSlug) ||
          itemPath.includes(normalizedSlugUnderscore) ||
          itemId === filenameFromSlug ||
          itemId === normalizedSlug ||
          itemId === normalizedSlugUnderscore ||
          itemPath.toLowerCase().includes(filenameFromSlug.toLowerCase()) ||
          itemPath.toLowerCase().includes(normalizedSlug.toLowerCase()) ||
          itemPath
            .toLowerCase()
            .includes(normalizedSlugUnderscore.toLowerCase())

        return matches
      })

      if (matchingItem) {
        return matchingItem
      }

      console.error(`Could not find ${contentType} item with slug: ${slug}`)
      return null
    } catch (error) {
      console.error(`Error loading ${contentType} item:`, error)
      return null
    }
  }

  const getAllContent = async (contentType) => {
    try {
      // Use Nuxt Content v3 queryCollection to get all items of a type
      const data = await queryCollection(contentType).all()
      return data || []
    } catch (error) {
      console.error(`Error fetching all ${contentType}:`, error)
      return []
    }
  }

  const loadMoreContent = async (batchSize = 20) => {
    if (cache.isLoading) return []

    cache.isLoading = true

    try {
      const currentGrifts = cache.grifts.length
      const currentQuotes = cache.quotes.length
      const currentMemes = cache.memes.length

      // Load more content from each collection
      const [griftsData, quotesData, memesData] = await Promise.all([
        queryCollection('grifts').skip(currentGrifts).limit(batchSize).all(),
        queryCollection('quotes').skip(currentQuotes).limit(batchSize).all(),
        queryCollection('memes').skip(currentMemes).limit(batchSize).all(),
      ])

      // Append to existing cache
      cache.grifts = [...cache.grifts, ...(griftsData || [])]
      cache.quotes = [...cache.quotes, ...(quotesData || [])]
      cache.memes = [...cache.memes, ...(memesData || [])]

      // Return the new items for use in the feed
      return [
        ...(griftsData || []),
        ...(quotesData || []),
        ...(memesData || []),
      ]
    } catch (error) {
      console.error('Error loading more content:', error)
      return []
    } finally {
      cache.isLoading = false
    }
  }

  const loadAllContent = async () => {
    if (cache.isLoading) return
    cache.isLoading = true
    cache.error = null
    try {
      const [griftsData, quotesData, memesData, postsData] = await Promise.all([
        queryCollection('grifts').all(),
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
        queryCollection('posts').all(),
      ])

      cache.grifts = transformContentForComponents(
        filterSpecialFiles(griftsData),
        'grifts'
      )
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      cache.posts = transformContentForComponents(
        filterSpecialFiles(postsData),
        'posts'
      )
      debugLog(
        `Content loaded: ${cache.grifts.length} grifts, ${cache.quotes.length} quotes, ${cache.memes.length} memes, ${cache.posts.length} posts`
      )
    } catch (error) {
      console.error('Error loading content:', error)
      cache.error = error
    } finally {
      cache.isLoading = false
    }
  }

  const getInterleavedContent = () => {
    debugLog('🎯 getInterleavedContent using interleaveContent with:', {
      grifts: cache.grifts.length,
      quotes: cache.quotes.length,
      memes: cache.memes.length,
      posts: cache.posts.length,
    })
    return interleaveContent(cache.grifts, cache.quotes, cache.memes, {
      posts: cache.posts,
    })
  }

  const getFilteredContent = (
    searchTerm = '',
    contentFilters = { grifts: true, quotes: true, memes: true }
  ) => {
    let filteredGrifts = contentFilters.grifts ? cache.grifts : []
    let filteredQuotes = contentFilters.quotes ? cache.quotes : []
    let filteredMemes = contentFilters.memes ? cache.memes : []
    let filteredPosts = cache.posts // Posts are always included (no filter toggle)
    if (searchTerm && searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim()
      const match = (item) => item._search && item._search.includes(s)
      filteredGrifts = filteredGrifts.filter(match)
      filteredQuotes = filteredQuotes.filter(match)
      filteredMemes = filteredMemes.filter(match)
      filteredPosts = filteredPosts.filter(match)
      debugLog('🔍 Search results:', {
        grifts: filteredGrifts.length,
        quotes: filteredQuotes.length,
        memes: filteredMemes.length,
        posts: filteredPosts.length,
      })
    }
    debugLog('🎯 getFilteredContent using interleaveContent with:', {
      grifts: filteredGrifts.length,
      quotes: filteredQuotes.length,
      memes: filteredMemes.length,
      posts: filteredPosts.length,
    })
    return interleaveContent(filteredGrifts, filteredQuotes, filteredMemes, {
      posts: filteredPosts,
    })
  }

  // Progressive loading: Load small batch first for instant display
  const loadInitialContent = async (limit = 20) => {
    if (cache.isLoading) return
    cache.isLoading = true
    cache.error = null
    try {
      const [griftsData, quotesData, memesData, postsData] = await Promise.all([
        queryCollection('grifts').limit(limit).all(),
        queryCollection('quotes').limit(limit).all(),
        queryCollection('memes').limit(limit).all(),
        queryCollection('posts').limit(limit).all(),
      ])
      cache.grifts = transformContentForComponents(
        filterSpecialFiles(griftsData),
        'grifts'
      )
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      cache.posts = transformContentForComponents(
        filterSpecialFiles(postsData),
        'posts'
      )
      debugLog(
        `✅ Initial batch loaded: ${cache.grifts.length} grifts, ${cache.quotes.length} quotes, ${cache.memes.length} memes, ${cache.posts.length} posts`
      )
    } catch (error) {
      console.error('Error loading initial content:', error)
      cache.error = error
    } finally {
      cache.isLoading = false
    }
  }

  // Load remaining content in background after initial display
  const loadRemainingContent = async () => {
    try {
      const [griftsData, quotesData, memesData, postsData] = await Promise.all([
        queryCollection('grifts').all(),
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
        queryCollection('posts').all(),
      ])
      cache.grifts = transformContentForComponents(
        filterSpecialFiles(griftsData),
        'grifts'
      )
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      cache.posts = transformContentForComponents(
        filterSpecialFiles(postsData),
        'posts'
      )
      debugLog(
        `🎉 Full content loaded: ${cache.grifts.length} grifts, ${cache.quotes.length} quotes, ${cache.memes.length} memes, ${cache.posts.length} posts`
      )
    } catch (error) {
      console.error('Error loading remaining content:', error)
      cache.error = error
    }
  }

  return {
    cache,
    grifts,
    quotes,
    memes,
    posts,
    isLoading,
    error,
    ensureContentLoaded,
    getContentItem,
    getAllContent,
    loadAllContent,
    loadInitialContent,
    loadRemainingContent,
    loadMoreContent,
    getInterleavedContent,
    getFilteredContent,
    slugMaps,
  }
}
