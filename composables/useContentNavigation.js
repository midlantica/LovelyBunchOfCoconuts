// composables/useContentNavigation.js
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigation } from './useNavigation'

export function useContentNavigation(collectionName) {
  const route = useRoute()
  const items = ref([])
  const loading = ref(true)

  // Fetch content on mount
  onMounted(async () => {
    try {
      console.log(`Fetching content for navigation: ${collectionName}`)

      // Use Nuxt Content v3 queryCollection method
      const result = await queryCollection(collectionName)
        .all()
        .catch((err) => {
          console.error(`Error fetching ${collectionName}:`, err)
          return []
        })

      items.value = result || []
      console.log(`Found ${items.value.length} items for ${collectionName}`)

      if (items.value.length > 0) {
        console.log('Sample item:', items.value[0])
        console.log(
          'Item paths:',
          items.value.map((item) => item._path)
        )
      }

      loading.value = false
    } catch (error) {
      console.error(`Error fetching ${collectionName} content:`, error)
      loading.value = false
    }
  })

  // Navigation (prev/next slugs)
  const navigation = computed(() => {
    if (!items.value || !items.value.length) {
      return { prevSlug: '/', nextSlug: '/' }
    }
    return useNavigation(items, route.params.slug, `/${collectionName}`).value
  })

  const prevSlug = computed(() => navigation.value.prevSlug)
  const nextSlug = computed(() => navigation.value.nextSlug)

  // Current item
  const currentItem = computed(() => {
    if (!items.value || items.value.length === 0) return null

    console.log('Looking for item with slug:', route.params.slug)

    // First try exact match with the slug
    const exactMatch = items.value.find(
      (item) => item._path === `/${collectionName}/${route.params.slug}`
    )

    if (exactMatch) {
      console.log('Found exact match:', exactMatch._path)
      return exactMatch
    }

    // If no exact match, try to find an item in a subdirectory
    const subdirMatch = items.value.find((item) => {
      // Check if the item's path ends with the slug
      const pathParts = item._path.split('/')
      const lastPart = pathParts[pathParts.length - 1]
      return lastPart === route.params.slug
    })

    if (subdirMatch) {
      console.log('Found subdirectory match:', subdirMatch._path)
      return subdirMatch
    }

    console.log('No match found for slug:', route.params.slug)
    return null
  })

  return {
    items,
    currentItem,
    prevSlug,
    nextSlug,
    loading,
  }
}
