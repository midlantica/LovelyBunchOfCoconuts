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
        class="rounded-xl h-full min-h-0 scroll-container-stable"
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
  import { computed, ref, provide, watch, onMounted } from 'vue'
  import { useContentCache } from '~/composables/useContentCache'
  import { useLazyImages } from '~/composables/useLazyImages'

  // Scroll container ref
  const scrollContainer = ref(null)

  const searchTerm = ref('')
  const contentFilters = ref({
    claims: true,
    quotes: true,
    memes: true,
  })

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
  const allFilteredItems = ref([])
  const displayedItems = ref([])
  const isLoaded = ref(false)
  const error = ref(null)
  const itemsToShow = ref(60) // Start with 60 items to ensure scrolling

  // Load more content function for infinite scroll
  const loadMoreContent = async (batchSize = 20) => {
    const currentCount = displayedItems.value.length
    const totalCount = allFilteredItems.value.length

    console.log(
      `� Before loading: ${currentCount} items displayed out of ${totalCount} total available`
    )

    if (currentCount >= totalCount) {
      console.log('❌ No more content to load - already showing all items')
      return { claims: 0, quotes: 0, memes: 0 } // No more content
    }

    // Calculate how many new items to add
    const newItemsToShow = Math.min(currentCount + batchSize, totalCount)
    const newItemsAdded = newItemsToShow - currentCount

    // Get the new items to add
    const newItems = allFilteredItems.value.slice(currentCount, newItemsToShow)

    // Append new items to the existing array
    displayedItems.value = [...displayedItems.value, ...newItems]

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

    console.log(`Scroll down! ${newItemsAdded} items loaded`)
    console.log(`Total: ${displayedItems.value.length} items.`)

    return {
      claims: newItemsAdded,
      quotes: newItemsAdded,
      memes: newItemsAdded,
    }
  }

  // Computed counts based on displayed (filtered) items (for infinite scroll)
  const claimCount = computed(() => {
    return displayedItems.value.flatMap((item) =>
      item.type === 'claimPair' ? item.data : []
    ).length
  })
  const quoteCount = computed(() => {
    return displayedItems.value.filter((item) => item.type === 'quote').length
  })
  const memeCount = computed(() => {
    return displayedItems.value.flatMap((item) =>
      item.type === 'memeRow' ? item.data : []
    ).length
  })
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

  // Progressive loading: Load small batch first, then rest in background
  const loadContent = async () => {
    console.log('🔥 loadContent called - checking isLoaded:', isLoaded.value)
    try {
      if (!isLoaded.value) {
        // STEP 1: Load just 20 items immediately (fast!)
        console.log('🚀 Loading initial 20 items...')
        await loadInitialContent(20)

        // Show initial batch immediately
        allFilteredItems.value = getFilteredContent(
          searchTerm.value,
          contentFilters.value
        )
        displayedItems.value = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )

        console.log(`✅ ${displayedItems.value.length} items loaded FAST!`)

        // STEP 2: Load remaining content in background (non-blocking)
        setTimeout(async () => {
          console.log('🔄 Loading remaining content in background...')
          await loadRemainingContent()

          // Refresh filtered content with all data
          allFilteredItems.value = getFilteredContent(
            searchTerm.value,
            contentFilters.value
          )

          console.log('🎉 All content loaded!')
        }, 100)

        isLoaded.value = true
      } else {
        // Get all filtered content (if already loaded)
        allFilteredItems.value = getFilteredContent(
          searchTerm.value,
          contentFilters.value
        )

        // Show initial batch of items
        displayedItems.value = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )

        console.log(`${displayedItems.value.length} items loaded on refresh.`)
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
        displayedItems.value = allFilteredItems.value.slice(
          0,
          itemsToShow.value
        )

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

  // Load content on mount
  onMounted(() => {
    loadContent()

    // Add scrollbar auto-hide behavior
    const container = scrollContainer.value
    if (container) {
      let scrollTimeout

      container.addEventListener('scroll', () => {
        container.classList.add('is-scrolling')

        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          container.classList.remove('is-scrolling')
        }, 2000) // Hide after 2 seconds of no scrolling
      })
    }
  })

  // Console logging for totals
  const logContentCounts = () => {
    const totalItems =
      cache.claims.length + cache.quotes.length + cache.memes.length
    console.log(`Total items: ${totalItems}.`)
    console.log(
      `Claims: ${cache.claims.length}; Quotes: ${cache.quotes.length}; Memes: ${cache.memes.length}`
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
  const searchClaimCount = computed(() => {
    return searchTerm.value ? filteredClaimCount.value : totalClaimCount.value
  })
  const searchQuoteCount = computed(() => {
    return searchTerm.value ? filteredQuoteCount.value : totalQuoteCount.value
  })
  const searchMemeCount = computed(() => {
    return searchTerm.value ? filteredMemeCount.value : totalMemeCount.value
  })

  // Total count display: show total when no search, filtered when searching
  const totalItemCount = computed(() => {
    return searchTerm.value
      ? filteredTotalCount.value
      : totalAvailableCount.value
  })

  provide('loadMoreContent', loadMoreContent)
</script>

<style scoped></style>
