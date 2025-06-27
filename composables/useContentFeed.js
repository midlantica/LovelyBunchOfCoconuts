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

  // Initialize data - fetch content directly using Nuxt Content v3
  const initialize = async () => {
    try {
      console.log('Starting content initialization')

      // Use queryCollection API to fetch content
      const claims = await queryCollection('claims').find()
      const quotes = await queryCollection('quotes').find()
      const memes = await queryCollection('memes').find()

      // Filter out README.md files and files with "__" in their name
      const filterSpecialFiles = (items) => {
        return (items || []).filter((item) => {
          const path = item._path?.toLowerCase() || ''
          return !path.includes('readme') && !path.includes('__')
        })
      }

      // Store collections (filtered)
      contentCollections.claims.value = filterSpecialFiles(claims || [])
      contentCollections.quotes.value = filterSpecialFiles(quotes || [])
      contentCollections.memes.value = filterSpecialFiles(memes || [])

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

  // Search implementation using queryCollectionSearchSections API
  const performSearch = async (query) => {
    displayedItems.value = []

    try {
      if (query) {
        console.log(
          `Searching for: "${query}" using queryCollectionSearchSections`
        )

        // Use queryCollectionSearchSections API for full-text search
        const searchResults = await queryCollectionSearchSections({ query })

        console.log(`Search returned ${searchResults.length} total results`)

        // Filter results by content type based on filters
        let claimsResults = []
        let quotesResults = []
        let memesResults = []

        if (contentFilters.value.claims) {
          claimsResults = searchResults.filter((item) =>
            item._path?.startsWith('/claims/')
          )
          console.log(`Found ${claimsResults.length} claim results`)
        }

        if (contentFilters.value.quotes) {
          quotesResults = searchResults.filter((item) =>
            item._path?.startsWith('/quotes/')
          )
          console.log(`Found ${quotesResults.length} quote results`)
        }

        if (contentFilters.value.memes) {
          memesResults = searchResults.filter((item) =>
            item._path?.startsWith('/memes/')
          )
          console.log(`Found ${memesResults.length} meme results`)
        }

        // Update collections with filtered search results
        contentCollections.claims.value = claimsResults
        contentCollections.quotes.value = quotesResults
        contentCollections.memes.value = memesResults
      } else {
        console.log('Search cleared, restoring all content')

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

  // Initialize on mount
  onMounted(() => {
    initialize()
  })

  return {
    searchTerm,
    contentFilters,
    displayedItems,
    contentCollections, // <-- expose contentCollections for global counts
  }
}
