import { ref, reactive } from 'vue'
import { queryCollection } from '@nuxt/content'

export function useContentCache() {
  const getContentItem = async (contentType, slug) => {
    try {
      const item = await queryCollection(contentType).where({ slug }).findOne()
      return item || null
    } catch (error) {
      console.error(`Error loading ${contentType} item:`, error)
      return null
    }
  }

  const getAllContent = async (contentType) => {
    try {
      const items = await queryCollection(contentType).find()
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
