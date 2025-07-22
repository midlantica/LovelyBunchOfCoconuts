import { ref, reactive, watch } from 'vue'
import { interleaveContent } from '~/composables/interleaveContent'

// Helper function to extract searchable text from AST body
const extractSearchableText = (body) => {
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

export function useContentCache() {
  // Return reactive refs to the shared global cache
  const claims = ref(globalCache.claims)
  const quotes = ref(globalCache.quotes)
  const memes = ref(globalCache.memes)
  const isLoading = ref(globalCache.isLoading)
  const error = ref(globalCache.error)

  // Keep refs in sync with global cache
  watch(
    () => globalCache.claims,
    (newClaims) => {
      claims.value = newClaims
    },
    { immediate: true }
  )
  watch(
    () => globalCache.quotes,
    (newQuotes) => {
      quotes.value = newQuotes
    },
    { immediate: true }
  )
  watch(
    () => globalCache.memes,
    (newMemes) => {
      memes.value = newMemes
    },
    { immediate: true }
  )
  watch(
    () => globalCache.isLoading,
    (newLoading) => {
      isLoading.value = newLoading
    },
    { immediate: true }
  )
  watch(
    () => globalCache.error,
    (newError) => {
      error.value = newError
    },
    { immediate: true }
  )

  // Return the shared global cache instance for direct modification
  const cache = globalCache

  // Auto-load content if not already loaded (for dynamic routes)
  const ensureContentLoaded = async () => {
    if (
      globalCache.claims.length === 0 &&
      globalCache.quotes.length === 0 &&
      globalCache.memes.length === 0 &&
      !globalCache.isLoading
    ) {
      console.log('🚀 Auto-loading content for dynamic route...')
      await loadAllContent()
    }
  }

  // Helper function to filter out special files
  const filterSpecialFiles = (items) => {
    return (items || []).filter((item) => {
      const path = item.path?.toLowerCase() || item._path?.toLowerCase() || ''
      const id = item.id?.toLowerCase() || ''
      const pathParts = path.split('/')
      const hasUnderscoreFolder = pathParts.some((part) => part.startsWith('_'))
      const shouldFilter =
        path.includes('readme') ||
        path.includes('__') ||
        id.includes('readme') ||
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
          const headings = item.body.value
            .filter((element) => element[0] === 'h2' || element[0] === 'h1')
            .map((element) => element[2] || '') // The text is in the 3rd position
            .filter(Boolean)

          transformed.headings = headings

          // Extract attribution from p tags
          const paragraphs = item.body.value
            .filter((element) => element[0] === 'p')
            .map((element) => element[2] || '')
            .filter(Boolean)

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
      }

      // Add searchable text field for search functionality
      transformed.searchableText = extractSearchableText(item.body)

      return transformed
    })
  }

  const getContentItem = async (contentType, slug) => {
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
      // Load all content at once since we need it for filtering and search
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').all(),
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
      ])

      // Apply filtering and transformation using top-level helper functions
      const filteredClaims = filterSpecialFiles(claimsData)
      const filteredQuotes = filterSpecialFiles(quotesData)
      const filteredMemes = filterSpecialFiles(memesData)

      cache.claims = transformContentForComponents(filteredClaims, 'claims')
      cache.quotes = transformContentForComponents(filteredQuotes, 'quotes')
      cache.memes = transformContentForComponents(filteredMemes, 'memes')

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
    // NO SHUFFLING - use content in order to maintain strict pattern
    // Use the correct interleaving function from composables/interleaveContent.js

    console.log('🎯 getInterleavedContent using interleaveContent with:', {
      claims: cache.claims.length,
      quotes: cache.quotes.length,
      memes: cache.memes.length,
    })

    const result = interleaveContent(cache.claims, cache.quotes, cache.memes)
    return result
  }

  const getFilteredContent = (
    searchTerm = '',
    contentFilters = { claims: true, quotes: true, memes: true }
  ) => {
    // First filter by content type
    let filteredClaims = contentFilters.claims ? cache.claims : []
    let filteredQuotes = contentFilters.quotes ? cache.quotes : []
    let filteredMemes = contentFilters.memes ? cache.memes : []

    // Then apply search if provided
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      console.log('🔍 Searching for:', searchLower)

      filteredClaims = filteredClaims.filter(
        (item) =>
          (item.claim && item.claim.toLowerCase().includes(searchLower)) ||
          (item.translation &&
            item.translation.toLowerCase().includes(searchLower)) ||
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.searchableText &&
            item.searchableText.toLowerCase().includes(searchLower))
      )

      filteredQuotes = filteredQuotes.filter(
        (item) =>
          (item.quoteText &&
            item.quoteText.toLowerCase().includes(searchLower)) ||
          (item.attribution &&
            item.attribution.toLowerCase().includes(searchLower)) ||
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.searchableText &&
            item.searchableText.toLowerCase().includes(searchLower)) ||
          (item.headings &&
            item.headings.some((h) => h.toLowerCase().includes(searchLower)))
      )

      filteredMemes = filteredMemes.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
          (item.searchableText &&
            item.searchableText.toLowerCase().includes(searchLower)) ||
          // Also search in the title with spaces/dashes converted
          (item.title &&
            item.title
              .toLowerCase()
              .replace(/[-_]/g, ' ')
              .includes(searchLower)) ||
          (item.description &&
            item.description
              .toLowerCase()
              .replace(/[-_]/g, ' ')
              .includes(searchLower))
      )

      console.log('🔍 Search results:', {
        claims: filteredClaims.length,
        quotes: filteredQuotes.length,
        memes: filteredMemes.length,
      })
    }

    // NO SHUFFLING - use content in order to maintain strict pattern
    // Use the correct interleaving function from composables/interleaveContent.js

    console.log('🎯 getFilteredContent using interleaveContent with:', {
      claims: filteredClaims.length,
      quotes: filteredQuotes.length,
      memes: filteredMemes.length,
    })

    const result = interleaveContent(
      filteredClaims,
      filteredQuotes,
      filteredMemes
    )
    return result
  }

  // Progressive loading: Load small batch first for instant display
  const loadInitialContent = async (limit = 20) => {
    if (cache.isLoading) return

    cache.isLoading = true
    cache.error = null

    try {
      // Load just a small batch from each type for immediate display
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').limit(limit).all(),
        queryCollection('quotes').limit(limit).all(),
        queryCollection('memes').limit(limit).all(),
      ])

      // Apply same filtering as loadAllContent
      const filterSpecialFiles = (items) => {
        return (items || []).filter((item) => {
          const path =
            item.path?.toLowerCase() || item._path?.toLowerCase() || ''
          const id = item.id?.toLowerCase() || ''
          const pathParts = path.split('/')
          const hasUnderscoreFolder = pathParts.some((part) =>
            part.startsWith('_')
          )
          const shouldFilter =
            path.includes('readme') ||
            path.includes('__') ||
            id.includes('readme') ||
            hasUnderscoreFolder
          return !shouldFilter
        })
      }

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
      // Load ALL content (this is the slow part, done in background)
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').all(),
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
      ])

      // Apply same filtering and transformation as loadAllContent
      const filterSpecialFiles = (items) => {
        return (items || []).filter((item) => {
          const path =
            item.path?.toLowerCase() || item._path?.toLowerCase() || ''
          const id = item.id?.toLowerCase() || ''
          const pathParts = path.split('/')
          const hasUnderscoreFolder = pathParts.some((part) =>
            part.startsWith('_')
          )
          const shouldFilter =
            path.includes('readme') ||
            path.includes('__') ||
            id.includes('readme') ||
            hasUnderscoreFolder
          return !shouldFilter
        })
      }

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
    loadInitialContent, // NEW
    loadRemainingContent, // NEW
    loadMoreContent,
    getInterleavedContent,
    getFilteredContent,
  }
}
