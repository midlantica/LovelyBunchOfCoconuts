// composables/useContentCache.js
// Reactive content cache with transformation pipeline: loads, transforms, and caches all content types
// Provides progressive loading (initial batch + remaining) with search enhancement and SSR compatibility

import { interleaveContent } from '~/composables/interleaveContent'

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

  return text.trim()
}

// Global cache instance - shared across all components
const globalCache = reactive({
  claims: [],
  quotes: [],
  memes: [],
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
  claims: new Map(),
  quotes: new Map(),
  memes: new Map(),
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
  const { claims, quotes, memes, isLoading, error } = toRefs(cache)

  // Auto-load content if not already loaded (for dynamic routes)
  const ensureContentLoaded = async () => {
    if (
      cache.claims.length === 0 &&
      cache.quotes.length === 0 &&
      cache.memes.length === 0 &&
      !cache.isLoading
    ) {
      if (import.meta.dev)
        console.log('🚀 Auto-loading content for dynamic route...')
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

      // For claims: frontmatter properties are stored under item.meta
      if (type === 'claims') {
        transformed.claim = item.meta?.claim || item.title
        transformed.translation = item.meta?.translation
      }

      // For quotes: need to extract from body content structure
      if (type === 'quotes') {
        // Extract headings from body value array (Nuxt Content v3 minimark format)
        if (item.body && item.body.value) {
          // Helper to stringify a heading element's content preserving allowed inline tags
          const allowedTags = new Set(['strong', 'em', 'b', 'i', 'br', 'wbr'])
          const stringifyNodes = (node) => {
            if (!node) return ''
            // Raw string
            if (typeof node === 'string') {
              return node
            }
            // Array encoded minimark element: [tag, attrs, children]
            if (Array.isArray(node)) {
              const [tag, attrs, children] = node
              // line break tags
              if (tag === 'br' || tag === 'wbr') return `<${tag}>`
              // Emphasis tags we allow & recurse
              if (allowedTags.has(tag)) {
                return `<${tag}>${stringifyNodes(children)}</${tag}>`
              }
              // If this is a span-like wrapper, just recurse children
              if (tag === 'span') return stringifyNodes(children)
              // If children is array, flatten each
              if (Array.isArray(children))
                return children.map(stringifyNodes).join('')
              return typeof children === 'string' ? children : ''
            }
            // If array of nodes
            if (Array.isArray(node)) {
              return node.map(stringifyNodes).join('')
            }
            return ''
          }

          const headingElements = item.body.value.filter(
            (element) => element[0] === 'h2' || element[0] === 'h1'
          )
          const headings = headingElements
            .map((el) => stringifyNodes(el[2]))
            .map(
              (s) =>
                // Support author writing custom markers for line breaks: use literal "\\n" or " <br> " or " // "
                s
                  .replace(/\\n/g, '<br>') // user typed \n in source
                  .replace(/\s*\/\/\s*/g, '<br>') // user used // as break marker
            )
            .filter((s) => s && s.trim().length)

          transformed.headings = headings

          // Extract attribution from p tags
          const paragraphs = item.body.value
            .filter((element) => element[0] === 'p')
            .map((element) =>
              typeof element[2] === 'string' ? element[2] : ''
            )
            .filter((p) => p && p.trim().length)

          transformed.attribution = paragraphs[0] || ''

          // Set quoteText from the first heading if available
          if (headings.length > 0) {
            transformed.quoteText = headings[0]
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

      // Add searchable text field for search functionality (precompute consolidated lowercase string)
      const rawSearch = extractSearchableText(
        item.body,
        item._path || item.path
      )
      transformed.searchableText = rawSearch
      transformed._search = (
        [
          transformed.claim,
          transformed.translation,
          transformed.title,
          transformed.quoteText,
          transformed.attribution,
          transformed.description,
          rawSearch,
        ]
          .filter(Boolean)
          .join(' ') +
        ' ' +
        (item._path || '')
      )
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
      if (type === 'claims') {
        const s = slugify(transformed.claim || transformed.title || '')
        // Register content-based slug and filename variants
        registerSlugKeys(
          slugMaps.claims,
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
      if (contentType === 'claim' && slugMaps.claims.has(slug))
        return slugMaps.claims.get(slug)
      if (contentType === 'quote' && slugMaps.quotes.has(slug))
        return slugMaps.quotes.get(slug)
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

      console.log(`Trying path variations for ${contentType}:`, pathVariations)

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
      const currentClaims = cache.claims.length
      const currentQuotes = cache.quotes.length
      const currentMemes = cache.memes.length

      // Load more content from each collection
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').skip(currentClaims).limit(batchSize).all(),
        queryCollection('quotes').skip(currentQuotes).limit(batchSize).all(),
        queryCollection('memes').skip(currentMemes).limit(batchSize).all(),
      ])

      // Append to existing cache
      cache.claims = [...cache.claims, ...(claimsData || [])]
      cache.quotes = [...cache.quotes, ...(quotesData || [])]
      cache.memes = [...cache.memes, ...(memesData || [])]

      // Return the new items for use in the feed
      return [
        ...(claimsData || []),
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
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').all(),
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
      ])
      cache.claims = transformContentForComponents(
        filterSpecialFiles(claimsData),
        'claims'
      )
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      if (import.meta.dev)
        console.log(
          `Content loaded: ${cache.claims.length} claims, ${cache.quotes.length} quotes, ${cache.memes.length} memes`
        )
    } catch (error) {
      console.error('Error loading content:', error)
      cache.error = error
    } finally {
      cache.isLoading = false
    }
  }

  const getInterleavedContent = () => {
    if (import.meta.dev)
      console.log('🎯 getInterleavedContent using interleaveContent with:', {
        claims: cache.claims.length,
        quotes: cache.quotes.length,
        memes: cache.memes.length,
      })
    return interleaveContent(cache.claims, cache.quotes, cache.memes)
  }

  const getFilteredContent = (
    searchTerm = '',
    contentFilters = { claims: true, quotes: true, memes: true }
  ) => {
    let filteredClaims = contentFilters.claims ? cache.claims : []
    let filteredQuotes = contentFilters.quotes ? cache.quotes : []
    let filteredMemes = contentFilters.memes ? cache.memes : []
    if (searchTerm && searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim()
      const match = (item) => item._search && item._search.includes(s)
      filteredClaims = filteredClaims.filter(match)
      filteredQuotes = filteredQuotes.filter(match)
      filteredMemes = filteredMemes.filter(match)
      if (import.meta.dev)
        console.log('🔍 Search results:', {
          claims: filteredClaims.length,
          quotes: filteredQuotes.length,
          memes: filteredMemes.length,
        })
    }
    if (import.meta.dev)
      console.log('🎯 getFilteredContent using interleaveContent with:', {
        claims: filteredClaims.length,
        quotes: filteredQuotes.length,
        memes: filteredMemes.length,
      })
    return interleaveContent(filteredClaims, filteredQuotes, filteredMemes)
  }

  // Progressive loading: Load small batch first for instant display
  const loadInitialContent = async (limit = 20) => {
    if (cache.isLoading) return
    cache.isLoading = true
    cache.error = null
    try {
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').limit(limit).all(),
        queryCollection('quotes').limit(limit).all(),
        queryCollection('memes').limit(limit).all(),
      ])
      cache.claims = transformContentForComponents(
        filterSpecialFiles(claimsData),
        'claims'
      )
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      if (import.meta.dev)
        console.log(
          `✅ Initial batch loaded: ${cache.claims.length} claims, ${cache.quotes.length} quotes, ${cache.memes.length} memes`
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
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').all(),
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
      ])
      cache.claims = transformContentForComponents(
        filterSpecialFiles(claimsData),
        'claims'
      )
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      if (import.meta.dev)
        console.log(
          `🎉 Full content loaded: ${cache.claims.length} claims, ${cache.quotes.length} quotes, ${cache.memes.length} memes`
        )
    } catch (error) {
      console.error('Error loading remaining content:', error)
      cache.error = error
    }
  }

  return {
    cache,
    claims,
    quotes,
    memes,
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
