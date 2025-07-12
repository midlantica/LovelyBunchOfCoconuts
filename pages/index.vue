<!-- pages/index.vue - Content Wall Page -->
<template>
  <!-- Search Bar -->
  <div class="flex justify-center">
    <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
      <SearchBar
        v-model:search="searchTerm"
        v-model:filters="contentFilters"
        :claim-count="claimCount"
        :quote-count="quoteCount"
        :meme-count="memeCount"
        :total-count="totalCount"
        :total-claim-count="totalClaimCount"
        :total-quote-count="totalQuoteCount"
        :total-meme-count="totalMemeCount"
        :total-item-count="totalItemCount"
        class="top-0 z-10 sticky w-full"
      />
    </div>
  </div>

  <!-- Content Wall -->
  <div
    ref="scrollContainer"
    class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
  >
    <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
      <main class="pb-8">
        <!-- Error State -->
        <div v-if="error" class="py-8 text-red-500 text-center">
          {{ error }}
        </div>

        <!-- Loading State -->
        <div v-else-if="!isLoaded" class="py-8 text-center">
          Loading content...
        </div>

        <!-- Content Grid -->
        <div v-else class="space-y-6">
          <template
            v-for="(item, index) in displayedItems"
            :key="item.id || index"
          >
            <!-- Claim Pair -->
            <ClaimTranslationPanel
              v-if="item.type === 'claimPair'"
              :claims="item.items"
              :class="getItemClasses(index)"
            />

            <!-- Quote -->
            <QuotePanel
              v-else-if="item.type === 'quote'"
              :quote="item.quote"
              :attribution="item.attribution"
              :class="getItemClasses(index)"
            />

            <!-- Meme Row -->
            <MemePanel
              v-else-if="item.type === 'memeRow'"
              :memes="item.items"
              :class="getItemClasses(index)"
            />
          </template>

          <!-- Load More Trigger -->
          <div ref="loadMoreTrigger" class="h-10"></div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { useContentCache } from '~/composables/useContentCache'
  import { useContentFilters } from '~/composables/useContentFilters'
  import { useContentWall } from '~/composables/useContentWall'
  import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
  import { useLazyImages } from '~/composables/useLazyImages'

  // Set layout
  // Remove the definePageMeta block entirely—Nuxt 3 now uses <script> or <script setup> with export default for page meta and layout.
  // If you want to specify a layout, use:
  // Set layout using definePageMeta in <script setup>
  definePageMeta({
    layout: 'home',
  })

  // Composables
  const {
    searchTerm,
    contentFilters,
    filterContent,
    activeFilters,
    hasActiveFilters,
  } = useContentFilters()

  const {
    displayedItems,
    allFilteredItems,
    isLoaded,
    error,
    claimCount,
    quoteCount,
    memeCount,
    totalCount,
    loadMoreContent,
    updateDisplayedItems,
    resetDisplayState,
  } = useContentWall()

  const {
    loadInitialContent,
    loadRemainingContent,
    getCachedContent,
    totalClaimCount,
    totalQuoteCount,
    totalMemeCount,
    totalItemCount,
  } = useContentCache()

  const { preloadImages } = useLazyImages()

  // Refs
  const scrollContainer = ref(null)
  const loadMoreTrigger = ref(null)

  // Initialize content
  onMounted(async () => {
    console.log('🎯 INDEX: Starting content initialization')

    try {
      // Load initial content
      await loadInitialContent(20)

      // Get all cached content and apply initial filters
      const allContent = getCachedContent()
      const filteredContent = filterContent(allContent)
      updateDisplayedItems(filteredContent)

      // Load remaining content in background
      await loadRemainingContent()

      // Re-apply filters with complete dataset
      const completeContent = getCachedContent()
      const completeFilteredContent = filterContent(completeContent)
      updateDisplayedItems(completeFilteredContent)

      console.log('✅ INDEX: Content initialization complete')

      // Preload initial images
      await nextTick()
      preloadImages()
    } catch (err) {
      console.error('❌ INDEX: Content initialization failed:', err)
      error.value = err.message
    }
  })

  // Watch for search/filter changes
  watch(
    [searchTerm, contentFilters],
    async () => {
      console.log('🔍 INDEX: Search/filters changed, refiltering content')

      const allContent = getCachedContent()
      const filteredContent = filterContent(allContent)
      updateDisplayedItems(filteredContent)

      // Reset scroll position
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0
      }

      await nextTick()
      preloadImages()
    },
    { deep: true }
  )

  // Infinite scroll setup
  const { setupInfiniteScroll, cleanupInfiniteScroll } = useInfiniteScroll({
    scrollContainer,
    loadMoreTrigger,
    loadMoreCallback: loadMoreContent,
    threshold: 200,
  })

  onMounted(() => {
    setupInfiniteScroll()
  })

  onUnmounted(() => {
    cleanupInfiniteScroll()
  })

  // Item animation classes
  const getItemClasses = (index) => {
    return [
      'transition-all duration-500 ease-out',
      index >= displayedItems.value.length - 20 ? 'animate-fade-in' : '',
    ]
  }

  // Keyboard shortcuts
  onMounted(() => {
    const handleKeydown = (event) => {
      // Slash to focus search
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        const searchInput = document.querySelector('input[type="text"]')
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Escape to clear search
      if (event.key === 'Escape') {
        searchTerm.value = ''
      }
    }

    document.addEventListener('keydown', handleKeydown)

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })
  })

  console.log('🎯 INDEX: Page setup complete')
</script>

<style scoped>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }

  .scroll-container-stable {
    scroll-behavior: smooth;
  }
</style>
