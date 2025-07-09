import { ref, reactive } from 'vue'

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

export function useContentCache() {
  const cache = reactive({
    claims: [],
    quotes: [],
    memes: [],
    isLoading: false,
    error: null,
  })

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

      // Filter out README.md files, files with "__" in their name, and content from folders starting with "_"
      const filterSpecialFiles = (items) => {
        return (items || []).filter((item) => {
          const path =
            item.path?.toLowerCase() || item._path?.toLowerCase() || ''
          const id = item.id?.toLowerCase() || ''

          // Check if any part of the path contains a folder starting with underscore
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

      // Transform content to flatten meta properties for component compatibility
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

      // Apply filtering and transformation
      const filteredClaims = filterSpecialFiles(claimsData)
      const filteredQuotes = filterSpecialFiles(quotesData)
      const filteredMemes = filterSpecialFiles(memesData)

      // Store transformed content in cache
      cache.claims = transformContentForComponents(filteredClaims, 'claims')
      cache.quotes = transformContentForComponents(filteredQuotes, 'quotes')
      cache.memes = transformContentForComponents(filteredMemes, 'memes')
    } catch (error) {
      console.error('Error loading content:', error)
      cache.error = error
    } finally {
      cache.isLoading = false
    }
  }

  // Smart interleaving function with visual variety constraints
  const smartInterleave = (claimPairs, quotes, memePairs) => {
    const allContent = []

    // Create pools of content
    const claimPool = [...claimPairs]
    const quotePool = [...quotes]
    const memePool = [...memePairs]

    // Check if only one type of content is available
    const availablePoolCount = [
      claimPool.length > 0,
      quotePool.length > 0,
      memePool.length > 0,
    ].filter(Boolean).length

    // If only one type is available, just return all of that type
    if (availablePoolCount === 1) {
      if (quotePool.length > 0) {
        return quotePool
      }
      if (claimPool.length > 0) {
        return claimPool
      }
      if (memePool.length > 0) {
        return memePool
      }
    }

    let lastType = null
    let consecutiveQuotes = 0
    let consecutiveTextElements = 0 // Track claims and quotes together

    // Continue until all pools are empty
    while (
      claimPool.length > 0 ||
      quotePool.length > 0 ||
      memePool.length > 0
    ) {
      const availableTypes = []

      // Determine what types are available and valid
      // Never more than 2 quotes in a row (but only if other types are available)
      if (
        quotePool.length > 0 &&
        (consecutiveQuotes < 2 ||
          (claimPool.length === 0 && memePool.length === 0))
      ) {
        // Also check if we need a meme break for visual variety (but only if memes exist)
        if (consecutiveTextElements < 2 || memePool.length === 0) {
          availableTypes.push('quote')
        }
      }

      // Never consecutive claim pairs (but allow if no other types available)
      if (
        claimPool.length > 0 &&
        (lastType !== 'claimPair' ||
          (quotePool.length === 0 && memePool.length === 0))
      ) {
        // Also check if we need a meme break for visual variety (but only if memes exist)
        if (consecutiveTextElements < 2 || memePool.length === 0) {
          availableTypes.push('claimPair')
        }
      }

      // Never consecutive meme pairs (but allow if no other types available)
      if (
        memePool.length > 0 &&
        (lastType !== 'memeRow' ||
          (claimPool.length === 0 && quotePool.length === 0))
      ) {
        availableTypes.push('memeRow')
      }

      // Force meme pairs when we have too many text elements in a row (but only if memes available)
      if (consecutiveTextElements >= 2 && memePool.length > 0) {
        availableTypes.length = 0 // Clear other options
        availableTypes.push('memeRow')
      }

      // If no valid types, force a break in patterns
      if (availableTypes.length === 0) {
        // Prioritize memes for visual break if available
        if (memePool.length > 0) {
          availableTypes.push('memeRow')
        }
        // If we have too many consecutive quotes, prioritize pairs
        else if (consecutiveQuotes >= 2) {
          if (claimPool.length > 0) {
            availableTypes.push('claimPair')
          }
        }
        // Allow remaining content types
        else if (quotePool.length > 0) {
          availableTypes.push('quote')
        } else if (claimPool.length > 0) {
          availableTypes.push('claimPair')
        }
      }

      // Randomly select from available types
      if (availableTypes.length > 0) {
        const selectedType =
          availableTypes[Math.floor(Math.random() * availableTypes.length)]

        switch (selectedType) {
          case 'quote':
            allContent.push(quotePool.shift())
            lastType = 'quote'
            consecutiveQuotes++
            consecutiveTextElements++ // Quotes are text elements
            break
          case 'claimPair':
            allContent.push(claimPool.shift())
            lastType = 'claimPair'
            consecutiveQuotes = 0 // Reset quote counter
            consecutiveTextElements++ // Claims are text elements
            break
          case 'memeRow':
            allContent.push(memePool.shift())
            lastType = 'memeRow'
            consecutiveQuotes = 0 // Reset quote counter
            consecutiveTextElements = 0 // Reset text element counter - memes break the text
            break
        }
      } else {
        // Fallback - should not happen, but just in case
        break
      }
    }

    return allContent
  }

  const getInterleavedContent = () => {
    // Shuffle arrays for random order each time
    const shuffleClaims = [...cache.claims].sort(() => Math.random() - 0.5)
    const shuffleQuotes = [...cache.quotes].sort(() => Math.random() - 0.5)
    const shuffleMemes = [...cache.memes].sort(() => Math.random() - 0.5)

    // Group claims into pairs
    const claimPairs = []
    for (let i = 0; i < shuffleClaims.length; i += 2) {
      const pair = shuffleClaims.slice(i, i + 2)
      claimPairs.push({
        type: 'claimPair',
        data: pair,
      })
    }

    // Group memes into pairs
    const memePairs = []
    for (let i = 0; i < shuffleMemes.length; i += 2) {
      const pair = shuffleMemes.slice(i, i + 2)
      memePairs.push({
        type: 'memeRow',
        data: pair,
      })
    }

    // Individual quotes (full width)
    const quotes = shuffleQuotes.map((item) => ({
      type: 'quote',
      data: item,
    }))

    // Smart interleaving to prevent consecutive claim pairs or meme pairs
    return smartInterleave(claimPairs, quotes, memePairs)
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
            item.searchableText.toLowerCase().includes(searchLower))
      )

      console.log('🔍 Search results:', {
        claims: filteredClaims.length,
        quotes: filteredQuotes.length,
        memes: filteredMemes.length,
      })
    }

    // Shuffle the filtered results
    filteredClaims = filteredClaims.sort(() => Math.random() - 0.5)
    filteredQuotes = filteredQuotes.sort(() => Math.random() - 0.5)
    filteredMemes = filteredMemes.sort(() => Math.random() - 0.5)

    // Group filtered results same as getInterleavedContent
    const claimPairs = []
    for (let i = 0; i < filteredClaims.length; i += 2) {
      const pair = filteredClaims.slice(i, i + 2)
      claimPairs.push({
        type: 'claimPair',
        data: pair,
      })
    }

    const memePairs = []
    for (let i = 0; i < filteredMemes.length; i += 2) {
      const pair = filteredMemes.slice(i, i + 2)
      memePairs.push({
        type: 'memeRow',
        data: pair,
      })
    }

    const quotes = filteredQuotes.map((item) => ({
      type: 'quote',
      data: item,
    }))

    // Smart interleaving to prevent consecutive claim pairs or meme pairs
    const result = smartInterleave(claimPairs, quotes, memePairs)
    return result
  }

  return {
    cache,
    getContentItem,
    getAllContent,
    loadAllContent,
    loadMoreContent,
    getInterleavedContent,
    getFilteredContent,
  }
}
