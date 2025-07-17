// composables/useContentCounts.js
import { computed } from 'vue'

export function useContentCounts({ displayedItems, cache, allFilteredItems }) {
  // Reactive counts based on displayed (filtered) items (for infinite scroll)
  const claimCount = computed(
    () =>
      displayedItems.value.flatMap((item) =>
        item.type === 'claimPair' ? item.data : []
      ).length
  )
  const quoteCount = computed(
    () => displayedItems.value.filter((item) => item.type === 'quote').length
  )
  const memeCount = computed(
    () =>
      displayedItems.value.flatMap((item) =>
        item.type === 'memeRow' ? item.data : []
      ).length
  )
  const totalCount = computed(
    () => claimCount.value + quoteCount.value + memeCount.value
  )

  // Computed counts based on total available content (never changes)
  const totalClaimCount = computed(() => cache.claims.length)
  const totalQuoteCount = computed(() => cache.quotes.length)
  const totalMemeCount = computed(() => cache.memes.length)
  const totalAvailableCount = computed(
    () => totalClaimCount.value + totalQuoteCount.value + totalMemeCount.value
  )

  // Computed counts based on all filtered content (changes with search)
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
  const filteredTotalCount = computed(
    () =>
      filteredClaimCount.value +
      filteredQuoteCount.value +
      filteredMemeCount.value
  )

  return {
    claimCount,
    quoteCount,
    memeCount,
    totalCount,
    totalClaimCount,
    totalQuoteCount,
    totalMemeCount,
    totalAvailableCount,
    filteredClaimCount,
    filteredQuoteCount,
    filteredMemeCount,
    filteredTotalCount,
  }
}
