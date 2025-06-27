// composables/useContentFeed.js
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { useRuntimeConfig } from '#app'
import { useAsyncData } from '#app'
import { interleaveContent } from '~/utils/interleaveContent'

export function useContentFeed(
  providedSearchTerm = ref(''),
  providedContentFilters = ref({ claims: true, quotes: true, memes: true })
) {
  // Core state
  const searchTerm = providedSearchTerm
  const contentFilters = providedContentFilters
  const displayedItems = ref([])
  const allItems = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const error = ref(null)

  // Pagination
  const page = ref(1)
  const limit = ref(10)

  // Content collections
  const contentCollections = {
    claims: ref([]),
    quotes: ref([]),
    memes: ref([]),
  }

  // Track initialization
  const isInitialized = ref(false)
  // Expose counts for UI and logging
  const claimCount = ref(0)
  const quoteCount = ref(0)
  const memeCount = ref(0)

  // Defensive: always ensure contentFilters.value is a valid object with all keys
  function ensureFilterKeys(obj) {
    obj = obj && typeof obj === 'object' ? obj : {}
    return {
      claims: typeof obj.claims === 'boolean' ? obj.claims : true,
      quotes: typeof obj.quotes === 'boolean' ? obj.quotes : true,
      memes: typeof obj.memes === 'boolean' ? obj.memes : true,
    }
  }

  // Initialize data - fetch content directly using Nuxt Content v3
  const initialize = async () => {
    loading.value = true
    try {
      console.log('Starting content initialization')

      // Use fetch API to get content directly from the server API
      const fetchClaims = fetch('/content-claims.json')
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? data : []))
      const fetchQuotes = fetch('/content-quotes.json')
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? data : []))
      const fetchMemes = fetch('/content-memes.json')
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? data : []))

      // Execute all fetchs in parallel
      const [claims, quotes, memes] = await Promise.all([
        fetchClaims,
        fetchQuotes,
        fetchMemes,
      ])

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

      // Update counts for UI and logging
      claimCount.value = contentCollections.claims.value.length
      quoteCount.value = contentCollections.quotes.value.length
      memeCount.value = contentCollections.memes.value.length

      // Always log the counts in the dev terminal
      if (process.client && typeof window !== 'undefined') {
        // Browser log
        console.log(
          `%cClaims: %c${claimCount.value}  %cQuotes: %c${quoteCount.value}  %cMemes: %c${memeCount.value}`,
          'color: #888; font-weight: bold;',
          'color: #2d8cf0; font-weight: bold;',
          'color: #888; font-weight: bold;',
          'color: #19be6b; font-weight: bold;',
          'color: #888; font-weight: bold;',
          'color: #ff9900; font-weight: bold;'
        )
      } else {
        // Node/terminal log
        // eslint-disable-next-line no-console
        console.log(
          `Claims: ${claimCount.value}  Quotes: ${quoteCount.value}  Memes: ${memeCount.value}`
        )
      }

      isInitialized.value = true

      // Create the interleaved wall
      createContentWall()
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Create the balanced wall of content
  const createContentWall = () => {
    // Get only the content types that are enabled by filters
    const filteredCollections = {
      claims: ensureFilterKeys(contentFilters.value).claims
        ? contentCollections.claims.value.slice()
        : [],
      quotes: ensureFilterKeys(contentFilters.value).quotes
        ? contentCollections.quotes.value.slice()
        : [],
      memes: ensureFilterKeys(contentFilters.value).memes
        ? contentCollections.memes.value.slice()
        : [],
    }

    // Deduplicate items by path
    const uniqueItems = {
      claims: [...new Set(filteredCollections.claims.map((c) => c._path))].map(
        (path) => filteredCollections.claims.find((c) => c._path === path)
      ),
      quotes: [...new Set(filteredCollections.quotes.map((q) => q._path))].map(
        (path) => filteredCollections.quotes.find((q) => q._path === path)
      ),
      memes: [...new Set(filteredCollections.memes.map((m) => m._path))].map(
        (path) => filteredCollections.memes.find((m) => m._path === path)
      ),
    }

    // Only show the enabled types
    const enabledTypes = Object.entries(ensureFilterKeys(contentFilters.value))
      .filter(([k, v]) => v)
      .map(([k]) => k)

    let wall = []
    if (enabledTypes.length === 1) {
      // Only one pill on: show only that type
      const type = enabledTypes[0]
      if (type === 'claims') {
        // Group claims into pairs for wall
        for (let i = 0; i < uniqueItems.claims.length; i += 2) {
          const pair = [
            { type: 'claim', data: uniqueItems.claims[i] },
            uniqueItems.claims[i + 1]
              ? { type: 'claim', data: uniqueItems.claims[i + 1] }
              : null,
          ].filter(Boolean)
          wall.push({ type: 'claimPair', data: pair })
        }
      } else if (type === 'quotes') {
        wall = uniqueItems.quotes.map((q) => ({
          type: 'quote',
          data: q,
        }))
      } else if (type === 'memes') {
        for (let i = 0; i < uniqueItems.memes.length; i += 2) {
          const pair = [
            { type: 'meme', data: uniqueItems.memes[i] },
            uniqueItems.memes[i + 1]
              ? { type: 'meme', data: uniqueItems.memes[i + 1] }
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
          uniqueItems.quotes.length,
          uniqueItems.memes.length
        )
        for (let i = 0; i < maxLen; i++) {
          if (uniqueItems.quotes[i])
            wall.push({
              type: 'quote',
              data: uniqueItems.quotes[i],
            })
          if (uniqueItems.memes[i]) {
            const pair = [
              { type: 'meme', data: uniqueItems.memes[i] },
              uniqueItems.memes[i + 1]
                ? {
                    type: 'meme',
                    data: uniqueItems.memes[i + 1],
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
          Math.ceil(uniqueItems.claims.length / 2),
          Math.ceil(uniqueItems.memes.length / 2)
        )
        for (let i = 0, ci = 0, mi = 0; i < maxLen; i++) {
          if (ci < uniqueItems.claims.length) {
            const pair = [
              { type: 'claim', data: uniqueItems.claims[ci++] },
              ci < uniqueItems.claims.length
                ? {
                    type: 'claim',
                    data: uniqueItems.claims[ci++],
                  }
                : null,
            ].filter(Boolean)
            wall.push({ type: 'claimPair', data: pair })
          }
          if (mi < uniqueItems.memes.length) {
            const pair = [
              { type: 'meme', data: uniqueItems.memes[mi++] },
              mi < uniqueItems.memes.length
                ? {
                    type: 'meme',
                    data: uniqueItems.memes[mi++],
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
        for (let i = 0; i < uniqueItems.claims.length; i += 2) {
          const pair = [
            { type: 'claim', data: uniqueItems.claims[i] },
            uniqueItems.claims[i + 1]
              ? { type: 'claim', data: uniqueItems.claims[i + 1] }
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
            quoteIndex < uniqueItems.quotes.length
          ) {
            wall.push({
              type: 'quote',
              data: uniqueItems.quotes[quoteIndex++],
            })
          }
        }
        while (quoteIndex < uniqueItems.quotes.length) {
          wall.push({
            type: 'quote',
            data: uniqueItems.quotes[quoteIndex++],
          })
        }
      }
    } else {
      // All three pills on: use full interleave
      wall = interleaveContent(
        uniqueItems.claims,
        uniqueItems.quotes,
        uniqueItems.memes
      )
    }

    // Update state
    allItems.value = wall
    displayedItems.value = wall.slice(0, limit.value)
    hasMore.value = wall.length > limit.value
    page.value = 2
  }

  // Load more content (for infinite scroll)
  const loadMoreContent = () => {
    if (!hasMore.value || loading.value) return

    loading.value = true
    const start = (page.value - 1) * limit.value
    const end = start + limit.value

    // Add next chunk of items
    const newItems = allItems.value.slice(start, end)
    displayedItems.value = [...displayedItems.value, ...newItems]

    // Update pagination state
    hasMore.value = end < allItems.value.length
    page.value++
    loading.value = false
  }

  // Search implementation using fetch API
  const performSearch = async (query) => {
    loading.value = true
    displayedItems.value = []
    page.value = 1

    try {
      if (query) {
        // Build search URL with query parameter
        const searchParams = new URLSearchParams({ query })
        const searchUrl = `/api/content/search?${searchParams.toString()}`

        console.log(`Searching for: "${query}" using ${searchUrl}`)

        // Fetch search results from dedicated search endpoint
        const response = await fetch(searchUrl)
        const searchResults = await response.json()

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
        // If search is cleared, reinitialize to get all content
        console.log('Search cleared, restoring all content')

        // Reset to original content collections
        await initialize()
        return // initialize will call createContentWall
      }

      // Recreate the wall with filtered content
      createContentWall()
    } catch (err) {
      console.error('Search error:', err)
      error.value = err
    } finally {
      loading.value = false
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
    loadMoreContent,
    displayedItems,
    loading,
    hasMore,
    error,
    contentCollections, // <-- expose contentCollections for global counts
    claimCount,
    quoteCount,
    memeCount,
  }
}
