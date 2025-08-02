/**
 * Search and filter management for the content wall
 * Extracted from layouts/home.vue to improve separation of concerns
 */
import { ref, computed } from 'vue'

export function useSearchAndFilters() {
  // Search and filter state
  const searchTerm = ref('')
  const contentFilters = ref({
    claims: true,
    quotes: true,
    memes: true,
  })

  // Computed values for display
  const activeFilterCount = computed(() => {
    let count = 0
    if (contentFilters.value.claims) count++
    if (contentFilters.value.quotes) count++
    if (contentFilters.value.memes) count++
    return count
  })

  const hasActiveFilters = computed(() => activeFilterCount.value < 3)

  const activeFilterTypes = computed(() => {
    const types = []
    if (contentFilters.value.claims) types.push('claims')
    if (contentFilters.value.quotes) types.push('quotes')
    if (contentFilters.value.memes) types.push('memes')
    return types
  })

  // Reset functions
  const clearSearch = () => {
    searchTerm.value = ''
  }

  const resetFilters = () => {
    contentFilters.value = {
      claims: true,
      quotes: true,
      memes: true,
    }
  }

  const clearAll = () => {
    clearSearch()
    resetFilters()
  }

  return {
    // State
    searchTerm,
    contentFilters,

    // Computed
    activeFilterCount,
    hasActiveFilters,
    activeFilterTypes,

    // Actions
    clearSearch,
    resetFilters,
    clearAll,
  }
}
