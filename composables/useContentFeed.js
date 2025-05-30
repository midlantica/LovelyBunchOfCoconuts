// composables/useContentFeed.js
import { ref, watch, onMounted } from "vue"
import { debounce } from "lodash-es"
import { useRuntimeConfig } from "#app"
import { useAsyncData } from "#app"

export function useContentFeed(
  providedSearchTerm = ref(""),
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

  // Initialize data - fetch content directly using Nuxt Content v3
  const initialize = async () => {
    loading.value = true
    try {
      console.log("Starting content initialization")

      // Use fetch API to get content directly from the server API
      const fetchClaims = fetch("/api/content?type=claims").then((res) => res.json())
      const fetchQuotes = fetch("/api/content?type=quotes").then((res) => res.json())
      const fetchMemes = fetch("/api/content?type=memes").then((res) => res.json())

      // Execute all fetches in parallel
      const [claims, quotes, memes] = await Promise.all([fetchClaims, fetchQuotes, fetchMemes])

      // Filter out README.md files and files with "__" in their name
      const filterSpecialFiles = (items) => {
        return (items || []).filter((item) => {
          const path = item._path?.toLowerCase() || ""
          return !path.includes("readme") && !path.includes("__")
        })
      }

      // Store collections (filtered)
      contentCollections.claims.value = filterSpecialFiles(claims || [])
      contentCollections.quotes.value = filterSpecialFiles(quotes || [])
      contentCollections.memes.value = filterSpecialFiles(memes || [])

      console.log("Loaded claims:", contentCollections.claims.value.length)
      console.log("Loaded quotes:", contentCollections.quotes.value.length)
      console.log("Loaded memes:", contentCollections.memes.value.length)

      isInitialized.value = true

      // Create the interleaved wall
      createContentWall()
    } catch (err) {
      console.error("Error loading content:", err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Create the balanced wall of content
  const createContentWall = () => {
    // Get only the content types that are enabled by filters
    const filteredCollections = {
      claims: contentFilters.value.claims ? contentCollections.claims.value : [],
      quotes: contentFilters.value.quotes ? contentCollections.quotes.value : [],
      memes: contentFilters.value.memes ? contentCollections.memes.value : [],
    }

    // Deduplicate items by path
    const uniqueItems = {
      claims: [...new Set(filteredCollections.claims.map((c) => c._path))].map((path) =>
        filteredCollections.claims.find((c) => c._path === path)
      ),
      quotes: [...new Set(filteredCollections.quotes.map((q) => q._path))].map((path) =>
        filteredCollections.quotes.find((q) => q._path === path)
      ),
      memes: [...new Set(filteredCollections.memes.map((m) => m._path))].map((path) =>
        filteredCollections.memes.find((m) => m._path === path)
      ),
    }

    console.log("Unique claims for wall:", uniqueItems.claims.length)
    console.log("Unique quotes for wall:", uniqueItems.quotes.length)
    console.log("Unique memes for wall:", uniqueItems.memes.length)

    const wall = []
    let indices = { claims: 0, quotes: 0, memes: 0 }

    // Interleave content types to create a balanced wall
    while (
      indices.claims < uniqueItems.claims.length ||
      indices.quotes < uniqueItems.quotes.length ||
      indices.memes < uniqueItems.memes.length
    ) {
      // Add claim pairs (two side by side)
      if (indices.claims < uniqueItems.claims.length) {
        const pair = [uniqueItems.claims[indices.claims], uniqueItems.claims[indices.claims + 1]]
          .filter(Boolean)
          .map((c) => ({ type: "claim", data: c }))

        if (pair.length) wall.push({ type: "claimPair", data: pair })
        indices.claims += 2
      }

      // Add a quote
      if (indices.quotes < uniqueItems.quotes.length) {
        wall.push({ type: "quote", data: uniqueItems.quotes[indices.quotes] })
        indices.quotes++
      }

      // Add meme pairs (two side by side)
      if (indices.memes < uniqueItems.memes.length) {
        const pair = [uniqueItems.memes[indices.memes], uniqueItems.memes[indices.memes + 1]]
          .filter(Boolean)
          .map((m) => ({ type: "meme", data: m }))

        if (pair.length) wall.push({ type: "memeRow", data: pair })
        indices.memes += 2
      }
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
          claimsResults = searchResults.filter((item) => item._path?.startsWith("/claims/"))
          console.log(`Found ${claimsResults.length} claim results`)
        }

        if (contentFilters.value.quotes) {
          quotesResults = searchResults.filter((item) => item._path?.startsWith("/quotes/"))
          console.log(`Found ${quotesResults.length} quote results`)
        }

        if (contentFilters.value.memes) {
          memesResults = searchResults.filter((item) => item._path?.startsWith("/memes/"))
          console.log(`Found ${memesResults.length} meme results`)
        }

        // Update collections with filtered search results
        contentCollections.claims.value = claimsResults
        contentCollections.quotes.value = quotesResults
        contentCollections.memes.value = memesResults
      } else {
        // If search is cleared, reinitialize to get all content
        console.log("Search cleared, restoring all content")

        // Reset to original content collections
        await initialize()
        return // initialize will call createContentWall
      }

      // Recreate the wall with filtered content
      createContentWall()
    } catch (err) {
      console.error("Search error:", err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    console.log(`Debounced search triggered with term: "${term}"`)
    if (term === "") {
      // For empty search, immediately restore all content
      console.log("Empty search term detected, restoring all content")
      // Force reload all content and rebuild wall
      initialize().then(() => {
        console.log("Content reinitialized after search cleared")
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
      debouncedSearch(newSearchTerm)
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
  }
}
