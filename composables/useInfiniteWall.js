// composables/useInfiniteWall.js
import { ref, watch, inject } from 'vue'

export function useInfiniteWall() {
  // Get values from the layout
  const displayedItems = inject('displayedItems', ref([]))
  const loadMoreFromLayout = inject('loadMoreContent')
  const error = inject('error', ref(null))
  const searchTerm = inject('searchTerm', ref(''))
  const contentFilters = inject(
    'contentFilters',
    ref({ claims: true, quotes: true, memes: true })
  )

  // Modal state
  const selectedMeme = ref(null)
  function openMemeModal(memePath) {
    for (const item of displayedItems.value) {
      if (item.type === 'memeRow') {
        const found = item.data.find(
          (m) => m._path === memePath || m.path === memePath
        )
        if (found) {
          selectedMeme.value = found
          break
        }
      }
    }
  }

  // Infinite scroll states
  const isLoading = ref(false)
  const hasMore = ref(true)
  const lastItemCount = ref(0)
  const newItemsStartIndex = ref(0)

  // Reset hasMore when search/filters change
  watch(
    [searchTerm, contentFilters],
    () => {
      hasMore.value = true
      lastItemCount.value = 0
      newItemsStartIndex.value = 0
    },
    { deep: true }
  )

  // Watch for new items to apply fade-in animation
  watch(
    displayedItems,
    (newItems, oldItems) => {
      const oldLength = oldItems?.length || 0
      const newLength = newItems.length
      if (newLength > oldLength) {
        newItemsStartIndex.value = oldLength
        setTimeout(() => {
          lastItemCount.value = newLength
        }, 100)
      }
    },
    { deep: true }
  )

  // Load more content function - properly implement infinite scroll
  const loadMoreContent = async () => {
    if (!hasMore.value) return
    if (!loadMoreFromLayout) return
    try {
      const result = await loadMoreFromLayout(20)
      if (
        result &&
        typeof result === 'object' &&
        result.claims === 0 &&
        result.quotes === 0 &&
        result.memes === 0
      ) {
        hasMore.value = false
      }
    } catch (error) {
      console.error('❌ Error loading more content:', error)
      hasMore.value = false
    }
  }

  return {
    displayedItems,
    loadMoreContent,
    error,
    searchTerm,
    contentFilters,
    selectedMeme,
    openMemeModal,
    isLoading,
    hasMore,
    lastItemCount,
    newItemsStartIndex,
  }
}
