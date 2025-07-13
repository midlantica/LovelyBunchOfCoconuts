<!-- layouts/home.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    <div class="gap-3 grid grid-rows-[auto_1fr] overflow-hidden">
      <div class="flex justify-center">
        <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
          <SearchBar
            v-model:search="searchTerm"
            v-model:filters="contentFilters"
            :claim-count="searchClaimCount"
            :quote-count="searchQuoteCount"
            :meme-count="searchMemeCount"
            :total-count="totalCount"
            :total-claim-count="totalClaimCount"
            :total-quote-count="totalQuoteCount"
            :total-meme-count="totalMemeCount"
            :total-item-count="totalItemCount"
            class="top-0 z-10 sticky w-full"
          />
        </div>
      </div>
      <div
        class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
        ref="scrollContainer"
      >
        <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
          <main class="pb-8">
            <slot />
          </main>
        </div>
      </div>
    </div>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
  import {
    computed,
    ref,
    provide,
    watch,
    onMounted,
    nextTick,
    onServerPrefetch,
  } from 'vue'
  import { useContentCache } from '~/composables/useContentCache'
  import { useLazyImages } from '~/composables/useLazyImages'
  import { useSearchAndFilters } from '~/composables/useSearchAndFilters'

  // Scroll container ref
  const scrollContainer = ref(null)

  // Extract search and filter logic to composable
  const {
    searchTerm,
    contentFilters,
    activeFilterCount,
    hasActiveFilters,
    activeFilterTypes,
    clearSearch,
    resetFilters,
    clearAll,
  } = useSearchAndFilters()

  // Smart image preloading
  const { preloadImages } = useLazyImages()

  provide('searchTerm', searchTerm)
  provide('contentFilters', contentFilters)

  // Move content management to layout level
  const {
    cache,
    loadAllContent,
    loadInitialContent,
    loadRemainingContent,
    getFilteredContent,
  } = useContentCache()

  // CRITICAL HYDRATION FIX: Use Nuxt's state hydration
  const ssrDisplayedItems = useState('displayedItems', () => [])
  const ssrIsLoaded = useState('isLoaded', () => false)

  const allFilteredItems = ref([])
  const displayedItems = ssrDisplayedItems // Use the SSR-safe state
  const isLoaded = ssrIsLoaded // Use the SSR-safe state
  const error = ref(null)
  const itemsToShow = ref(60) // Start with 60 items to ensure scrolling

  // Load more content function for infinite scroll
  const loadMoreContent = async (batchSize = 20) => {
    const currentCount = displayedItems.value.length
    const totalCount = allFilteredItems.value.length

    if (currentCount >= totalCount) {
      return { claims: 0, quotes: 0, memes: 0 } // No more content
    }

    // Calculate how many new items to add
    const newItemsToShow = Math.min(currentCount + batchSize, totalCount)
    const newItemsAdded = newItemsToShow - currentCount

    // Get the new items to add
    const newItems = allFilteredItems.value.slice(currentCount, newItemsToShow)

    // Append new items to the existing array
    const newDisplayedItems = [...displayedItems.value, ...newItems]
    displayedItems.value = newDisplayedItems

    // Update counts after adding new items
    updateCounts()

    // Preload images for the next batch during infinite scroll
    const nextBatch = allFilteredItems.value.slice(
      newItemsToShow,
      newItemsToShow + 20
    )
    const imagesToPreload = nextBatch
      .filter((item) => item.type === 'memeRow')
      .flatMap((item) => item.data.map((meme) => meme.image))
      .filter(Boolean)

    if (imagesToPreload.length > 0) {
      preloadImages(imagesToPreload)
    }

    return {
      claims: newItemsAdded,
      quotes: newItemsAdded,
      memes: newItemsAdded,
    }
  }

  // Reactive counts based on displayed (filtered) items (for infinite scroll)
  // Use useState for SSR hydration safety
  const claimCount = useState('claimCount', () => 0)
  const quoteCount = useState('quoteCount', () => 0)
  const memeCount = useState('memeCount', () => 0)
  const totalCount = computed(
    () => claimCount.value + quoteCount.value + memeCount.value
  )

  // Function to update counts
  const updateCounts = () => {
    claimCount.value = displayedItems.value.flatMap((item) =>
      item.type === 'claimPair' ? item.data : []
    ).length
    quoteCount.value = displayedItems.value.filter(
      (item) => item.type === 'quote'
    ).length
    memeCount.value = displayedItems.value.flatMap((item) =>
      item.type === 'memeRow' ? item.data : []
    ).length
  }

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

  // Progressive loading: Load small batch first, then rest in background
  const loadContent = async () => {
    // Don't reload if we already have content from SSR
    if (displayedItems.value.length > 0) {
      return
    }

    try {
      if (!isLoaded.value) {
        // STEP 1: Load just 20 items immediately (fast!)
        await loadInitialContent(20)

        // Show initial batch immediately
        allFilteredItems.value = getFilteredContent(
          searchTerm.value,
          contentFilters.value
        )

        const newDisplayedItems = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )
        displayedItems.value = newDisplayedItems

        // Update counts after setting displayed items
        updateCounts()

        // STEP 2: Load remaining content in background (non-blocking)
        setTimeout(async () => {
          await loadRemainingContent()

          // Refresh filtered content with all data
          allFilteredItems.value = getFilteredContent(
            searchTerm.value,
            contentFilters.value
          )
        }, 100)

        isLoaded.value = true
      } else {
        // Get all filtered content (if already loaded)
        allFilteredItems.value = getFilteredContent(
          searchTerm.value,
          contentFilters.value
        )

        // Show initial batch of items
        const newDisplayedItems = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )
        displayedItems.value = newDisplayedItems

        // Update counts after setting displayed items
        updateCounts()
      }

      error.value = null
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
    }
  }

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Watch for search/filter changes
  watch(
    [searchTerm, contentFilters],
    () => {
      if (isLoaded.value) {
        // Scroll to top when search/filter changes
        scrollToTop()

        // Get all filtered content
        allFilteredItems.value = getFilteredContent(
          searchTerm.value,
          contentFilters.value
        )

        // Reset to initial batch when search/filter changes
        itemsToShow.value = 60
        const newDisplayedItems = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )
        displayedItems.value = newDisplayedItems

        // Update counts after setting displayed items
        updateCounts()

        // Smart preload next batch of images when search changes
        if (searchTerm.value) {
          const nextBatch = allFilteredItems.value.slice(
            itemsToShow.value,
            itemsToShow.value + 40
          )
          const imagesToPreload = nextBatch
            .filter((item) => item.type === 'memeRow')
            .flatMap((item) => item.data.map((meme) => meme.image))
            .filter(Boolean)

          if (imagesToPreload.length > 0) {
            preloadImages(imagesToPreload)
          }
        }
      }
    },
    { deep: true }
  )

  // Watch for displayedItems changes
  watch(
    displayedItems,
    (newValue, oldValue) => {
      updateCounts() // Update counts whenever displayedItems changes

      // DEFENSIVE: If displayedItems gets reset incorrectly, try to restore from allFilteredItems
      if (
        newValue.length === 0 &&
        oldValue &&
        oldValue.length > 0 &&
        allFilteredItems.value.length > 0
      ) {
        displayedItems.value = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )
      }
    },
    { deep: true }
  )

  // Load content on mount
  onMounted(async () => {
    // CRITICAL: Check if we have SSR data AND if we're in a client-side context
    // The client reinitializes empty arrays, so we need to restore from cache
    if (displayedItems.value.length > 0) {
      // CRITICAL FIX: We have SSR displayedItems but need to load the full content set
      // for search, filtering, and infinite scroll to work
      if (cache.claims.length === 0) {
        await loadAllContent()

        // Populate allFilteredItems with the full content set
        allFilteredItems.value = getFilteredContent(
          searchTerm.value,
          contentFilters.value
        )
      }
    } else if (isLoaded.value && cache.claims.length > 0) {
      // CRITICAL FIX: Restore content from cache if we lost SSR data during hydration
      allFilteredItems.value = getFilteredContent(
        searchTerm.value,
        contentFilters.value
      )

      const newDisplayedItems = allFilteredItems.value.slice(
        0,
        itemsToShow.value
      )
      displayedItems.value = newDisplayedItems
    } else {
      // No SSR data and not loaded - need to load content
      await loadContent()
    }

    // Set up scroll and images
    await nextTick()

    // Ensure scrolling functionality
    const scrollContainerElement = scrollContainer.value
    if (scrollContainerElement) {
      let scrollTimeout

      scrollContainerElement.addEventListener('scroll', () => {
        scrollContainerElement.classList.add('is-scrolling')

        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          scrollContainerElement.classList.remove('is-scrolling')
        }, 2000) // Hide after 2 seconds of no scrolling
      })
    }

    // Preload meme images
    const memeImagePaths = displayedItems.value
      .filter((item) => item.type === 'memeRow')
      .flatMap((item) => item.data.map((meme) => meme.image))
      .filter(Boolean)

    if (memeImagePaths.length > 0) {
      await preloadImages(memeImagePaths)
    }
  })

  onServerPrefetch(async () => {
    try {
      await loadInitialContent(20)
      allFilteredItems.value = getFilteredContent(
        searchTerm.value,
        contentFilters.value
      )
      const newDisplayedItems = allFilteredItems.value.slice(
        0,
        itemsToShow.value
      )
      displayedItems.value = newDisplayedItems

      // Update counts for SSR - CRITICAL for hydration
      updateCounts()

      // Mark as loaded to prevent reloading on client
      isLoaded.value = true
    } catch (err) {
      console.error('Error during onServerPrefetch:', err)
    }
  })

  // Console logging for totals
  const logContentCounts = () => {
    const totalItems =
      cache.claims.length + cache.quotes.length + cache.memes.length
    console.log(
      `Total items: ${totalItems} (Claims: ${cache.claims.length}, Quotes: ${cache.quotes.length}, Memes: ${cache.memes.length})`
    )
  }

  // Watch for cache changes and log
  watch(
    () => [cache.claims.length, cache.quotes.length, cache.memes.length],
    () => {
      if (
        cache.claims.length > 0 ||
        cache.quotes.length > 0 ||
        cache.memes.length > 0
      ) {
        logContentCounts()
      }
    },
    { immediate: true }
  )

  // Provide the filtered content and counts to children
  provide('displayedItems', displayedItems)
  provide('loadMoreContent', loadMoreContent)
  provide('error', error)
  provide('claimCount', claimCount)
  provide('quoteCount', quoteCount)
  provide('memeCount', memeCount)
  provide('totalCount', totalCount)

  // Badge counts: show total when no search, filtered when searching
  // Use computed values that work correctly with SSR hydration
  const searchClaimCount = computed(() => {
    return searchTerm.value ? filteredClaimCount.value : totalClaimCount.value
  })
  const searchQuoteCount = computed(() => {
    return searchTerm.value ? filteredQuoteCount.value : totalQuoteCount.value
  })
  const searchMemeCount = computed(() => {
    return searchTerm.value ? filteredMemeCount.value : totalMemeCount.value
  })
  const totalItemCount = computed(() => {
    return searchTerm.value
      ? filteredTotalCount.value
      : totalAvailableCount.value
  })

  provide('loadMoreContent', loadMoreContent)
</script>

<style scoped></style>
