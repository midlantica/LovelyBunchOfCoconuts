// composables/useContentCache.js
import { ref, reactive } from 'vue'
import { queryContent } from '#content/query' // ✅ Nuxt Content v3 runtime-safe import

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
    try {
      const item = await queryContent(contentType).where({ slug }).findOne()
      return item || null
    } catch (error) {
      console.error(`Error loading ${contentType} item:`, error)
      return null
    }
  }

  // Get all items of a specific content type
  const getAllContent = async (contentType) => {
    try {
      const items = await queryContent(contentType).find()
      return items || []
    } catch (error) {
      console.error(`Error fetching all ${contentType}:`, error)
      return []
    }
  }

  return {
    getContentItem,
    getAllContent,
  }
}
