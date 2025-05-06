// composables/useContentFeed.js
import { ref, watch, onMounted } from "vue"
import { debounce } from "lodash-es"
import { useNuxtApp } from "#app"
import { useAsyncData } from "#app"
import { queryContent } from "#imports"

export function useContentFeed(providedSearchTerm = ref("")) {
  // Core state
  const searchTerm = providedSearchTerm
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
    memes: ref([])
  }
  
  // Full data cache
  const fullCollections = {
    claims: ref([]),
    quotes: ref([]),
    memes: ref([])
  }
  
  // Track initialization
  const isInitialized = ref(false)
  
  // Initialize data - this will be called from onMounted
  const initialize = async () => {
    if (isInitialized.value) return
    
    loading.value = true
    try {
      console.log("Starting content initialization");
      
      // Use queryContent to get content (Nuxt Content v3 API)
      console.log("Fetching content with queryContent");
      
      // Fetch claims
      const { data: claimsData } = await useAsyncData('claims', () => 
        queryContent('claims').find()
      );
      console.log("Raw claims data:", claimsData.value);
      
      // Fetch quotes
      const { data: quotesData } = await useAsyncData('quotes', () => 
        queryContent('quotes').find()
      );
      console.log("Raw quotes data:", quotesData.value);
      
      // Fetch memes
      const { data: memesData } = await useAsyncData('memes', () => 
        queryContent('memes').find()
      );
      console.log("Raw memes data:", memesData.value);
      
      // Filter out README.md files and files with "__" in their name
      const filterSpecialFiles = (items) => {
        return (items || []).filter(item => {
          const path = item._path?.toLowerCase() || '';
          return !path.includes('readme') && !path.includes('__');
        });
      };
      
      // Store full collections (filtered)
      fullCollections.claims.value = filterSpecialFiles(claimsData.value || [])
      fullCollections.quotes.value = filterSpecialFiles(quotesData.value || [])
      fullCollections.memes.value = filterSpecialFiles(memesData.value || [])
      
      console.log("Loaded memes:", fullCollections.memes.value.length);
      if (fullCollections.memes.value.length > 0) {
        console.log("Sample meme:", fullCollections.memes.value[0]);
        console.log("Meme paths:", fullCollections.memes.value.map(m => m._path));
      }
      
      // Initialize working collections
      contentCollections.claims.value = [...fullCollections.claims.value]
      contentCollections.quotes.value = [...fullCollections.quotes.value]
      contentCollections.memes.value = [...fullCollections.memes.value]
      
      isInitialized.value = true
      
      // Create the interleaved wall
      createContentWall()
    } catch (err) {
      console.error("Error loading content:", err);
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  // Create the balanced wall of content
  const createContentWall = () => {
    // Deduplicate items by path
    const uniqueItems = {
      claims: [...new Set(contentCollections.claims.value.map(c => c._path))]
        .map(path => contentCollections.claims.value.find(c => c._path === path)),
      quotes: [...new Set(contentCollections.quotes.value.map(q => q._path))]
        .map(path => contentCollections.quotes.value.find(q => q._path === path)),
      memes: [...new Set(contentCollections.memes.value.map(m => m._path))]
        .map(path => contentCollections.memes.value.find(m => m._path === path))
    }
    
    console.log("Unique memes for wall:", uniqueItems.memes.length);
    
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
          .map(c => ({ type: "claim", data: c }))
        
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
          .map(m => ({ type: "meme", data: m }))
        
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
  
  // Helper to normalize content paths
  const normalizeContentPath = (path) => {
    let normalized = path.toLowerCase()
    
    if (!normalized.startsWith("/")) normalized = "/" + normalized
    if (!normalized.endsWith(".md")) normalized += ".md"
    return normalized
  }
  
  // Helper to map search results to full content items
  const mapSearchResultsToContent = (searchResults, fullCollection) => {
    return searchResults
      .map(result => {
        // For nested structure, we need to match on the full path
        const normalizedPath = normalizeContentPath(result._path || result.path || "")
        
        return fullCollection.find(item => {
          const itemPath = (item._path || "").toLowerCase()
          return itemPath === normalizedPath || 
                 itemPath.endsWith(normalizedPath)
        })
      })
      .filter(Boolean) // Remove any undefined items
  }
  
  // Handle search with debounce
  const debouncedSearch = debounce(async (query) => {
    loading.value = true
    displayedItems.value = []
    page.value = 1
    
    try {
      if (query) {
        // Search using Nuxt Content v3 API
        const { data: claimsResults } = await useAsyncData(`claims-search-${query}`, () => 
          queryContent('claims')
            .where({ $or: [
              { body: { $contains: query } },
              { title: { $contains: query } }
            ]})
            .find()
        );
          
        const { data: quotesResults } = await useAsyncData(`quotes-search-${query}`, () => 
          queryContent('quotes')
            .where({ $or: [
              { body: { $contains: query } },
              { title: { $contains: query } }
            ]})
            .find()
        );
          
        const { data: memesResults } = await useAsyncData(`memes-search-${query}`, () => 
          queryContent('memes')
            .where({ $or: [
              { body: { $contains: query } },
              { title: { $contains: query } },
              { caption: { $contains: query } }
            ]})
            .find()
        );
        
        // Map results back to full content items
        contentCollections.claims.value = mapSearchResultsToContent(
          claimsResults.value || [], 
          fullCollections.claims.value
        )
        
        contentCollections.quotes.value = mapSearchResultsToContent(
          quotesResults.value || [], 
          fullCollections.quotes.value
        )
        
        contentCollections.memes.value = mapSearchResultsToContent(
          memesResults.value || [], 
          fullCollections.memes.value
        )
      } else {
        // Reset to full collections if search is cleared
        contentCollections.claims.value = [...fullCollections.claims.value]
        contentCollections.quotes.value = [...fullCollections.quotes.value]
        contentCollections.memes.value = [...fullCollections.memes.value]
      }
      
      // Recreate the wall with filtered content
      createContentWall()
    } catch (err) {
      console.error("Search error:", err);
      error.value = err
    } finally {
      loading.value = false
    }
  }, 300)
  
  // Watch for search term changes
  watch(searchTerm, (newValue) => {
    debouncedSearch(newValue)
  })
  
  // Initialize on mount instead of during module initialization
  onMounted(() => {
    initialize()
  })
  
  return {
    searchTerm,
    loadMoreContent,
    displayedItems,
    loading,
    hasMore,
    error
  }
}
