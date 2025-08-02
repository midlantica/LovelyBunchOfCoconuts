/**
 * Content wall management composable
 * Handles content display, infinite scroll, and item management
 */
export function useContentWall() {
  // SSR-safe state
  const ssrDisplayedItems = useState('displayedItems', () => [])
  const ssrIsLoaded = useState('isLoaded', () => false)

  // Reactive state
  const allFilteredItems = ref([])
  const displayedItems = ssrDisplayedItems
  const isLoaded = ssrIsLoaded
  const error = ref(null)
  const itemsToShow = ref(60) // Start with enough items to enable scrolling

  // Content counts
  const claimCount = computed(
    () =>
      allFilteredItems.value.filter((item) => item.type === 'claimPair').length
  )
  const quoteCount = computed(
    () => allFilteredItems.value.filter((item) => item.type === 'quote').length
  )
  const memeCount = computed(
    () =>
      allFilteredItems.value.filter((item) => item.type === 'memeRow').length
  )
  const totalCount = computed(() => allFilteredItems.value.length)

  // Load more content for infinite scroll
  const loadMoreContent = async (batchSize = 20) => {
    const currentCount = displayedItems.value.length
    const totalCount = allFilteredItems.value.length

    if (currentCount >= totalCount) {
      console.log('🔄 No more content to load')
      return false
    }

    const newItemsToShow = Math.min(currentCount + batchSize, totalCount)
    const newItemsAdded = newItemsToShow - currentCount

    const newItems = allFilteredItems.value.slice(currentCount, newItemsToShow)
    const newDisplayedItems = [...displayedItems.value, ...newItems]

    displayedItems.value = newDisplayedItems

    console.log(
      `📦 Loaded ${newItemsAdded} more items (${newItemsToShow}/${totalCount} total)`
    )

    // Preload images for new items
    await nextTick()
    const { preloadImages } = useLazyImages()
    preloadImages()

    return newItemsAdded > 0
  }

  // Update displayed items when filtered content changes
  const updateDisplayedItems = (filteredItems) => {
    allFilteredItems.value = filteredItems
    const newItemsToShow = Math.min(itemsToShow.value, filteredItems.length)
    displayedItems.value = filteredItems.slice(0, newItemsToShow)
    isLoaded.value = true
  }

  // Reset display state
  const resetDisplayState = () => {
    displayedItems.value = []
    allFilteredItems.value = []
    isLoaded.value = false
    error.value = null
    itemsToShow.value = 60
  }

  return {
    // State
    displayedItems,
    allFilteredItems,
    isLoaded,
    error,
    itemsToShow,

    // Computed
    claimCount,
    quoteCount,
    memeCount,
    totalCount,

    // Methods
    loadMoreContent,
    updateDisplayedItems,
    resetDisplayState,
  }
}
