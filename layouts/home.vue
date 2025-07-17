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
            :pills-loading="!isCountsReady"
            class="top-0 z-10 sticky w-full"
          />
        </div>
      </div>

      <div
        class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
        ref="scrollContainer"
      >
        <div class="mx-auto md:px-0 pr-3 pl-2 w-full max-w-screen-md">
          <main class="pb-8">
            <slot />
          </main>
        </div>
        <!-- Scroll to top button -->
        <Button
          v-if="displayedItems.length > 20"
          class="group right-3 bottom-3 z-50 fixed bg-slate-800 hover:bg-slate-900 shadow-xl hover:border hover:border-seagull-200/20 rounded-md text-slate-950 hover:text-white"
          aria-label="scroll to the top"
          :on="false"
          @click="scrollToTop()"
        >
          <Icon
            name="heroicons:arrow-small-up-solid"
            size="2rem"
            class="text-slate-950 group-hover:text-white/50 transition-colors"
          />
        </Button>
      </div>
    </div>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
  import { useContentCache } from '~/composables/useContentCache'
  import { useLazyImages } from '~/composables/useLazyImages'

  // DRY: Use composable for scroll-to-top and scroll event
  import { useScrollToTop } from '~/composables/useScrollToTop'
  const { scrollContainer, scrollToTop } = useScrollToTop()

  // SSR-safe search/filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))

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
  const searchOnlyFilteredItems = ref([]) // NEW: filtered by search only, all types enabled
  const displayedItems = ssrDisplayedItems // Use the SSR-safe state
  const isLoaded = ssrIsLoaded // Use the SSR-safe state
  const error = ref(null)
  const itemsToShow = ref(60) // Start with 60 items to ensure scrolling

  // Load more content function for infinite scroll
  const loadMoreContent = async (batchSize = 40) => {
    const currentCount = displayedItems.value.length
    const totalCount = allFilteredItems.value.length

    if (currentCount >= totalCount) {
      // Already loaded all items
      return { claims: 0, quotes: 0, memes: 0 }
    }

    // Always load up to the next batch, or all remaining
    const newItemsToShow = Math.min(currentCount + batchSize, totalCount)
    const newItems = allFilteredItems.value.slice(currentCount, newItemsToShow)
    displayedItems.value = [...displayedItems.value, ...newItems]

    // Preload images for the next batch during infinite scroll
    const nextBatch = allFilteredItems.value.slice(
      newItemsToShow,
      newItemsToShow + 40
    )
    const imagesToPreload = nextBatch
      .filter((item) => item.type === 'memeRow')
      .flatMap((item) => item.data.map((meme) => meme.image))
      .filter(Boolean)

    if (imagesToPreload.length > 0) {
      preloadImages(imagesToPreload)
    }

    return {
      claims: newItems.length,
      quotes: newItems.length,
      memes: newItems.length,
    }
  }

  // DRY: Use composable for all content counts (SSR-safe)
  import { useContentCounts } from '~/composables/useContentCounts'
  const {
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
  } = useContentCounts({
    displayedItems,
    cache,
    allFilteredItems,
    searchTerm,
    contentFilters,
  })

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
      }

      error.value = null
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
    }
  }

  // (Scroll-to-top and scroll event logic now handled by useScrollToTop)

  // Watch for search/filter changes and update filtered/displayed items reactively
  watch(
    [searchTerm, contentFilters],
    () => {
      if (!isLoaded.value) return
      scrollToTop()
      // Update filtered items for wall (search + type filters)
      allFilteredItems.value = getFilteredContent(
        searchTerm.value,
        contentFilters.value
      )
      // Update search-only filtered items (search only, all types enabled)
      searchOnlyFilteredItems.value = getFilteredContent(searchTerm.value, {
        claims: true,
        quotes: true,
        memes: true,
      })
      // Reset to initial batch
      itemsToShow.value = 60
      displayedItems.value = allFilteredItems.value.slice(0, itemsToShow.value)
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
    },
    { deep: true }
  )

  // Watch for displayedItems changes (defensive restore only)
  watch(
    displayedItems,
    (newValue, oldValue) => {
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

  // DRY: Use composable for badge counts
  import { useBadgeCounts } from '~/composables/useBadgeCounts'
  const {
    searchClaimCount,
    searchQuoteCount,
    searchMemeCount,
    totalItemCount,
  } = useBadgeCounts({
    searchTerm,
    allFilteredItems: searchOnlyFilteredItems, // Use search-only filtered items for pill counts
    cache,
    contentFilters,
    totalClaimCount,
    totalQuoteCount,
    totalMemeCount,
    totalAvailableCount,
  })

  // SSR-safe: isCountsReady is true when all content is loaded
  const isCountsReady = computed(() => {
    return (
      cache.claims.length > 0 &&
      cache.quotes.length > 0 &&
      cache.memes.length > 0
    )
  })

  provide('loadMoreContent', loadMoreContent)
</script>

<style scoped></style>
