/**
 * Content filtering and search composable
 * Handles search terms, content type filters, and filtered results
 */
export function useContentFilters() {
  const searchTerm = ref('')
  const contentFilters = ref({
    claims: true,
    quotes: true,
    memes: true,
  })

  // Computed filter state
  const activeFilters = computed(() => {
    const filters = []
    if (contentFilters.value.claims) filters.push('claims')
    if (contentFilters.value.quotes) filters.push('quotes')
    if (contentFilters.value.memes) filters.push('memes')
    return filters
  })

  const hasActiveFilters = computed(() => {
    return (
      !contentFilters.value.claims ||
      !contentFilters.value.quotes ||
      !contentFilters.value.memes
    )
  })

  // Filter function
  const filterContent = (
    items,
    search = searchTerm.value,
    filters = contentFilters.value
  ) => {
    let filtered = items

    // Apply content type filters
    if (!filters.claims || !filters.quotes || !filters.memes) {
      filtered = filtered.filter((item) => {
        const type = item.type || item._type
        if (type === 'claimPair' && !filters.claims) return false
        if (type === 'quote' && !filters.quotes) return false
        if (type === 'memeRow' && !filters.memes) return false
        return true
      })
    }

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((item) => {
        // Search in titles, handling dash/underscore normalization
        const searchableTitle = (item.title || item.name || '')
          .replace(/[-_]/g, ' ')
          .toLowerCase()

        if (searchableTitle.includes(searchLower)) return true

        // Search in content based on type
        if (item.type === 'claimPair') {
          const claim1 = (item.items?.[0]?.claim || '').toLowerCase()
          const claim2 = (item.items?.[1]?.claim || '').toLowerCase()
          const trans1 = (item.items?.[0]?.translation || '').toLowerCase()
          const trans2 = (item.items?.[1]?.translation || '').toLowerCase()
          return (
            claim1.includes(searchLower) ||
            claim2.includes(searchLower) ||
            trans1.includes(searchLower) ||
            trans2.includes(searchLower)
          )
        }

        if (item.type === 'quote') {
          const quote = (item.quote || '').toLowerCase()
          const attribution = (item.attribution || '').toLowerCase()
          return (
            quote.includes(searchLower) || attribution.includes(searchLower)
          )
        }

        if (item.type === 'memeRow') {
          const desc1 = (item.items?.[0]?.description || '').toLowerCase()
          const desc2 = (item.items?.[1]?.description || '').toLowerCase()
          return desc1.includes(searchLower) || desc2.includes(searchLower)
        }

        return false
      })
    }

    return filtered
  }

  // Reset filters
  const resetFilters = () => {
    searchTerm.value = ''
    contentFilters.value = {
      claims: true,
      quotes: true,
      memes: true,
    }
  }

  return {
    searchTerm,
    contentFilters,
    activeFilters,
    hasActiveFilters,
    filterContent,
    resetFilters,
  }
}
