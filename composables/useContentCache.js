// composables/useContentCache.js
import { ref, reactive } from "vue"

// Create a reactive store to cache content items
const contentCache = reactive({
  claims: {},
  quotes: {},
  memes: {},
  allClaims: null,
  allQuotes: null,
  allMemes: null,
})

// Create a loading state tracker
const loadingStates = reactive({
  claims: {},
  quotes: {},
  memes: {},
  allClaims: false,
  allQuotes: false,
  allMemes: false,
})

export function useContentCache() {
  // Get a specific content item from cache or fetch it
  const getContentItem = async (contentType, slug) => {
    const fullPath = `/${contentType}/${slug}`

    if (contentCache[contentType][fullPath]) {
      return contentCache[contentType][fullPath]
    }

    loadingStates[contentType][fullPath] = true

    try {
      // Load all items of the content type
      if (!contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]) {
        const res = await fetch(`/content-${contentType}.json`)
        const data = await res.json()
        contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = data
      }

      const allItems =
        contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]
      const item = allItems.find((entry) => entry._path === fullPath)

      if (item) {
        contentCache[contentType][fullPath] = item
      }

      return item || null
    } catch (error) {
      console.error(`Error loading ${contentType} item from static JSON:`, error)
      return null
    } finally {
      loadingStates[contentType][fullPath] = false
    }
  }

  // Get all items of a specific content type
  const getAllContent = async (contentType) => {
    // Check if we already have all items cached
    if (contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]) {
      return contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]
    }

    // Mark as loading
    loadingStates[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = true

    try {
      // Fetch all items
      const response = await fetch(`/content-${contentType}.json`)
      const data = await response.json()

      // Cache the result
      if (data && !data.error) {
        contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = data
      }

      return data
    } catch (error) {
      console.error(`Error fetching all ${contentType}:`, error)
      return []
    } finally {
      loadingStates[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = false
    }
  }

  // Prefetch a content item
  const prefetchContentItem = async (path) => {
    if (!path || path === "/") return

    // Extract content type and slug from path
    const pathParts = path.split("/")
    if (pathParts.length < 3) return

    const contentType = pathParts[1] // 'claims', 'quotes', or 'memes'
    const slugParts = pathParts.slice(2)
    const slug = slugParts.join("/")

    // Only prefetch if it's a valid content type and not already cached
    if (
      ["claims", "quotes", "memes"].includes(contentType) &&
      !contentCache[contentType][`/${contentType}/${slug}`]
    ) {
      console.log(`Prefetching ${contentType} item: ${slug}`)
      getContentItem(contentType, slug).catch((err) => {
        console.error(`Error prefetching ${contentType} item:`, err)
      })
    }
  }

  // Check if a specific content item is loading
  const isLoading = (contentType, slug) => {
    const fullPath = `/${contentType}/${slug}`
    return !!loadingStates[contentType][fullPath]
  }

  // Check if all items of a content type are loading
  const isLoadingAll = (contentType) => {
    return loadingStates[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]
  }

  return {
    getContentItem,
    getAllContent,
    prefetchContentItem,
    isLoading,
    isLoadingAll,
    contentCache,
  }
}
