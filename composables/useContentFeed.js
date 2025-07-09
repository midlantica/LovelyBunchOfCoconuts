// composables/useContentFeed.js
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { interleaveContent } from '~/utils/interleaveContent'

export function useContentFeed(
  providedSearchTerm = ref(''),
  providedContentFilters = ref({ claims: true, quotes: true, memes: true })
) {
  // Core state
  const searchTerm = providedSearchTerm
  const contentFilters = providedContentFilters
  const displayedItems = ref([])
  const contentCollections = {
    claims: ref([]),
    quotes: ref([]),
    memes: ref([]),
  }

  // Initialize data - fetch content using lazy loading
  const initialize = async () => {
    try {
      // Instead of loading ALL content, use lazy loading with smaller initial batch
      const initialLimit = 30 // Reasonable initial load

      const claimsData = await queryCollection('claims')
        .limit(initialLimit)
        .all()
      const quotesData = await queryCollection('quotes')
        .limit(initialLimit)
        .all()
      const memesData = await queryCollection('memes').limit(initialLimit).all()

      console.log('✅ Initial lazy content loaded:', {
        claims: claimsData?.length || 0,
        quotes: quotesData?.length || 0,
        memes: memesData?.length || 0,
      })

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
            // Frontmatter properties are in item.meta
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
            }
          }

          // For memes: extract image from body content structure
          if (type === 'memes') {
            // Debug: log meme structure only for first few items
            if (contentCollections.memes.value.length < 2) {
              // Removed verbose logging for performance
            }

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

            if (contentCollections.memes.value.length < 5) {
              console.log(
                'Extracted meme image for',
                item.title,
                ':',
                transformed.image
              )
              console.log('Full transformed meme:', {
                title: transformed.title,
                image: transformed.image,
                path: transformed.path,
                hasImage: !!transformed.image,
              })
            }
          }

          return transformed
        })
      }

      // Store collections (filtered and transformed)
      contentCollections.claims.value = transformContentForComponents(
        filterSpecialFiles(claimsData || []),
        'claims'
      )
      contentCollections.quotes.value = transformContentForComponents(
        filterSpecialFiles(quotesData || []),
        'quotes'
      )
      contentCollections.memes.value = transformContentForComponents(
        filterSpecialFiles(memesData || []),
        'memes'
      )

      // Create the interleaved wall
      createContentWall()
    } catch (err) {
      console.error('Error loading content:', err)
    }
  }

  // Create the balanced wall of content
  const createContentWall = () => {
    // Get only the content types that are enabled by filters
    const filteredCollections = {
      claims: contentFilters.value.claims
        ? contentCollections.claims.value.slice()
        : [],
      quotes: contentFilters.value.quotes
        ? contentCollections.quotes.value.slice()
        : [],
      memes: contentFilters.value.memes
        ? contentCollections.memes.value.slice()
        : [],
    }

    // Only show the enabled types
    const enabledTypes = Object.entries(contentFilters.value)
      .filter(([k, v]) => v)
      .map(([k]) => k)

    let wall = []
    if (enabledTypes.length === 1) {
      // Only one pill on: show only that type
      const type = enabledTypes[0]
      if (type === 'claims') {
        // Group claims into pairs for wall
        for (let i = 0; i < filteredCollections.claims.length; i += 2) {
          const pair = [
            { type: 'claim', data: filteredCollections.claims[i] },
            filteredCollections.claims[i + 1]
              ? { type: 'claim', data: filteredCollections.claims[i + 1] }
              : null,
          ].filter(Boolean)
          wall.push({ type: 'claimPair', data: pair })
        }
      } else if (type === 'quotes') {
        wall = filteredCollections.quotes.map((q) => ({
          type: 'quote',
          data: q,
        }))
      } else if (type === 'memes') {
        for (let i = 0; i < filteredCollections.memes.length; i += 2) {
          const pair = [
            { type: 'meme', data: filteredCollections.memes[i] },
            filteredCollections.memes[i + 1]
              ? { type: 'meme', data: filteredCollections.memes[i + 1] }
              : null,
          ].filter(Boolean)
          wall.push({ type: 'memeRow', data: pair })
        }
      }
    } else if (enabledTypes.length === 2) {
      // Two pills on: interleave only those two types
      if (!contentFilters.value.claims) {
        // Only quotes + memes
        // Interleave quotes and memes as pairs
        const maxLen = Math.max(
          filteredCollections.quotes.length,
          filteredCollections.memes.length
        )
        for (let i = 0; i < maxLen; i++) {
          if (filteredCollections.quotes[i])
            wall.push({
              type: 'quote',
              data: filteredCollections.quotes[i],
            })
          if (filteredCollections.memes[i]) {
            const pair = [
              { type: 'meme', data: filteredCollections.memes[i] },
              filteredCollections.memes[i + 1]
                ? {
                    type: 'meme',
                    data: filteredCollections.memes[i + 1],
                  }
                : null,
            ].filter(Boolean)
            wall.push({ type: 'memeRow', data: pair })
            i++
          }
        }
      } else if (!contentFilters.value.quotes) {
        // Only claims + memes
        const maxLen = Math.max(
          Math.ceil(filteredCollections.claims.length / 2),
          Math.ceil(filteredCollections.memes.length / 2)
        )
        for (let i = 0, ci = 0, mi = 0; i < maxLen; i++) {
          if (ci < filteredCollections.claims.length) {
            const pair = [
              { type: 'claim', data: filteredCollections.claims[ci++] },
              ci < filteredCollections.claims.length
                ? {
                    type: 'claim',
                    data: filteredCollections.claims[ci++],
                  }
                : null,
            ].filter(Boolean)
            wall.push({ type: 'claimPair', data: pair })
          }
          if (mi < filteredCollections.memes.length) {
            const pair = [
              { type: 'meme', data: filteredCollections.memes[mi++] },
              mi < filteredCollections.memes.length
                ? {
                    type: 'meme',
                    data: filteredCollections.memes[mi++],
                  }
                : null,
            ].filter(Boolean)
            wall.push({ type: 'memeRow', data: pair })
          }
        }
      } else if (!contentFilters.value.memes) {
        // Only claims + quotes
        // Use original interleave logic for claims and quotes only
        // Group claims into pairs
        const claimPairs = []
        for (let i = 0; i < filteredCollections.claims.length; i += 2) {
          const pair = [
            { type: 'claim', data: filteredCollections.claims[i] },
            filteredCollections.claims[i + 1]
              ? { type: 'claim', data: filteredCollections.claims[i + 1] }
              : null,
          ].filter(Boolean)
          claimPairs.push({ type: 'claimPair', data: pair })
        }
        // Interleave claims and quotes
        let quoteIndex = 0
        const pairsPerQuote = 2
        for (let i = 0; i < claimPairs.length; i++) {
          wall.push(claimPairs[i])
          if (
            (i + 1) % pairsPerQuote === 0 &&
            quoteIndex < filteredCollections.quotes.length
          ) {
            wall.push({
              type: 'quote',
              data: filteredCollections.quotes[quoteIndex++],
            })
          }
        }
        while (quoteIndex < filteredCollections.quotes.length) {
          wall.push({
            type: 'quote',
            data: filteredCollections.quotes[quoteIndex++],
          })
        }
      }
    } else {
      // All three pills on: use full interleave
      wall = interleaveContent(
        filteredCollections.claims,
        filteredCollections.quotes,
        filteredCollections.memes
      )
    }

    // Update state
    displayedItems.value = wall
  }

  // Search implementation using Nuxt Content v3 queryCollection
  const performSearch = async (query) => {
    displayedItems.value = []

    try {
      if (query) {
        console.log(
          `Searching for: "${query}" using Nuxt Content v3 queryCollection`
        )

        // Search each collection using Nuxt Content v3 where() method
        const searchPromises = []

        if (contentFilters.value.claims) {
          searchPromises.push(
            queryCollection('claims')
              .where({
                $or: [
                  { title: { $icontains: query } },
                  { body: { $icontains: query } },
                  { _path: { $icontains: query } },
                ],
              })
              .all()
          )
        } else {
          searchPromises.push(Promise.resolve([]))
        }

        if (contentFilters.value.quotes) {
          searchPromises.push(
            queryCollection('quotes')
              .where({
                $or: [
                  { title: { $icontains: query } },
                  { body: { $icontains: query } },
                  { _path: { $icontains: query } },
                ],
              })
              .all()
          )
        } else {
          searchPromises.push(Promise.resolve([]))
        }

        if (contentFilters.value.memes) {
          searchPromises.push(
            queryCollection('memes')
              .where({
                $or: [
                  { title: { $icontains: query } },
                  { body: { $icontains: query } },
                  { _path: { $icontains: query } },
                ],
              })
              .all()
          )
        } else {
          searchPromises.push(Promise.resolve([]))
        }

        const [claimsResult, quotesResult, memesResult] = await Promise.all(
          searchPromises
        )

        console.log(`Search results:`, {
          claims: claimsResult?.length || 0,
          quotes: quotesResult?.length || 0,
          memes: memesResult?.length || 0,
        })

        // Apply filtering and transformation to search results too
        contentCollections.claims.value = transformContentForComponents(
          filterSpecialFiles(claimsResult || []),
          'claims'
        )
        contentCollections.quotes.value = transformContentForComponents(
          filterSpecialFiles(quotesResult || []),
          'quotes'
        )
        contentCollections.memes.value = transformContentForComponents(
          filterSpecialFiles(memesResult || []),
          'memes'
        )
      } else {
        // Reset to original content collections
        await initialize()
        return // initialize will call createContentWall
      }

      // Recreate the wall with filtered content
      createContentWall()
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    console.log(`Debounced search triggered with term: "${term}"`)
    if (term === '') {
      // For empty search, immediately restore all content
      console.log('Empty search term detected, restoring all content')
      // Force reload all content and rebuild wall
      initialize().then(() => {
        console.log('Content reinitialized after search cleared')
        createContentWall()
      })
    } else {
      performSearch(term)
    }
  }, 300)

  // Watch for search term and filter changes
  watch(
    [searchTerm, contentFilters],
    ([newSearchTerm, newFilters]) => {
      console.log(`Search term changed to: "${newSearchTerm}"`)
      if (newSearchTerm === '') {
        // No search: reload all content and update the wall
        initialize()
      } else {
        debouncedSearch(newSearchTerm)
      }
    },
    { deep: true }
  )

  // Function to find individual content items for modals
  const findContentItem = (contentType, slug) => {
    console.log(`Finding ${contentType} item with slug:`, slug)

    let collection = []
    if (contentType === 'claims') {
      collection = contentCollections.claims.value
    } else if (contentType === 'quotes') {
      collection = contentCollections.quotes.value
    } else if (contentType === 'memes') {
      collection = contentCollections.memes.value
    }

    console.log(`Searching in ${collection.length} ${contentType} items`)

    // Extract the filename from slug for matching
    const filenameFromSlug =
      slug
        .split('/')
        .pop()
        ?.replace(/\.[^/.]+$/, '') || slug

    // Try different matching strategies
    const item = collection.find((item) => {
      const itemPath = item.path || item._path || ''
      const itemTitle = item.title || ''
      const itemId = item.id || ''

      console.log(`Checking: ${itemTitle} (path: ${itemPath})`)

      // Match by path, title, or various slug formats
      return (
        itemPath === slug ||
        itemPath.includes(filenameFromSlug) ||
        itemTitle.toLowerCase().replace(/\s+/g, '-') === filenameFromSlug ||
        itemTitle.toLowerCase().replace(/\s+/g, '_') === filenameFromSlug ||
        itemId.includes(filenameFromSlug)
      )
    })

    if (item) {
      console.log(`✅ Found ${contentType} item:`, item.title)
      return item
    }

    console.log(`❌ Could not find ${contentType} item with slug: ${slug}`)
    return null
  }

  // Load more content for infinite scrolling
  const loadMoreContent = async (batchSize = 20) => {
    try {
      const currentClaims = contentCollections.claims.value.length
      const currentQuotes = contentCollections.quotes.value.length
      const currentMemes = contentCollections.memes.value.length

      // Load more content from each collection
      const [claimsData, quotesData, memesData] = await Promise.all([
        queryCollection('claims').skip(currentClaims).limit(batchSize).all(),
        queryCollection('quotes').skip(currentQuotes).limit(batchSize).all(),
        queryCollection('memes').skip(currentMemes).limit(batchSize).all(),
      ])

      console.log('✅ Loaded more content batch:', {
        claims: claimsData?.length || 0,
        quotes: quotesData?.length || 0,
        memes: memesData?.length || 0,
      })

      // Filter and transform the new content
      const newClaims = transformContentForComponents(
        filterSpecialFiles(claimsData || []),
        'claims'
      )
      const newQuotes = transformContentForComponents(
        filterSpecialFiles(quotesData || []),
        'quotes'
      )
      const newMemes = transformContentForComponents(
        filterSpecialFiles(memesData || []),
        'memes'
      )

      // Append to existing collections
      contentCollections.claims.value = [
        ...contentCollections.claims.value,
        ...newClaims,
      ]
      contentCollections.quotes.value = [
        ...contentCollections.quotes.value,
        ...newQuotes,
      ]
      contentCollections.memes.value = [
        ...contentCollections.memes.value,
        ...newMemes,
      ]

      // Recreate the wall with new content
      createContentWall()

      return {
        claims: newClaims.length,
        quotes: newQuotes.length,
        memes: newMemes.length,
        hasMore:
          newClaims.length > 0 || newQuotes.length > 0 || newMemes.length > 0,
      }
    } catch (error) {
      console.error('Error loading more content:', error)
      return { claims: 0, quotes: 0, memes: 0, hasMore: false }
    }
  }

  // Initialize on mount
  onMounted(() => {
    initialize()
  })

  return {
    searchTerm,
    contentFilters,
    displayedItems,
    contentCollections, // <-- expose contentCollections for global counts
    findContentItem, // <-- expose function to find individual items
    loadMoreContent, // <-- expose function to load more content
  }
}
