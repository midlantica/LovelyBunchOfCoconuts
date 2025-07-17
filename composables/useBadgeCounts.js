// composables/useBadgeCounts.js
import { computed } from 'vue'

export function useBadgeCounts({
  searchTerm,
  allFilteredItems,
  cache,
  contentFilters,
  totalClaimCount,
  totalQuoteCount,
  totalMemeCount,
  totalAvailableCount,
}) {
  // Pills: always show count of matches for search term, regardless of filter toggles
  const filteredClaimCount = computed(() => {
    return allFilteredItems.value.flatMap((item) =>
      item.type === 'claimPair' ? item.data : []
    ).length
  })
  const filteredQuoteCount = computed(() => {
    return allFilteredItems.value.filter((item) => item.type === 'quote').length
  })
  const filteredMemeCount = computed(() => {
    return allFilteredItems.value.flatMap((item) =>
      item.type === 'memeRow' ? item.data : []
    ).length
  })

  const searchClaimCount = computed(() =>
    searchTerm.value ? filteredClaimCount.value : totalClaimCount.value
  )
  const searchQuoteCount = computed(() =>
    searchTerm.value ? filteredQuoteCount.value : totalQuoteCount.value
  )
  const searchMemeCount = computed(() =>
    searchTerm.value ? filteredMemeCount.value : totalMemeCount.value
  )

  // Total: only count enabled types
  const totalItemCount = computed(() => {
    let total = 0
    if (contentFilters.value.claims) total += searchClaimCount.value
    if (contentFilters.value.quotes) total += searchQuoteCount.value
    if (contentFilters.value.memes) total += searchMemeCount.value
    return total
  })

  return {
    searchClaimCount,
    searchQuoteCount,
    searchMemeCount,
    totalItemCount,
  }
}
