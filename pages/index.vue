<!-- pages/index.vue -->
<script setup>
  import { onMounted, onUnmounted, ref, inject, watch } from 'vue'
  import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

  definePageMeta({
    layout: 'home',
  })

  // Get values from the layout
  const displayedItems = inject('displayedItems', ref([]))
  const loadMoreFromLayout = inject('loadMoreContent')
  const error = inject('error', ref(null))
  const searchTerm = inject('searchTerm', ref(''))
  const contentFilters = inject(
    'contentFilters',
    ref({ claims: true, quotes: true, memes: true })
  )

  // Debug injected values
  console.log(
    '🔥 INDEX: displayedItems from inject:',
    displayedItems.value.length
  )
  console.log('🔥 INDEX: loadMoreFromLayout from inject:', !!loadMoreFromLayout)
  console.log('🔥 INDEX: error from inject:', error.value)

  // Watch for changes to displayedItems
  watch(
    displayedItems,
    (newValue) => {
      console.log(
        '🔥 INDEX: displayedItems changed to:',
        newValue.length,
        'items'
      )
    },
    { immediate: true }
  )

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
        // New items were added - track where the new items start
        newItemsStartIndex.value = oldLength

        // Update lastItemCount after a brief delay to ensure animation works
        setTimeout(() => {
          lastItemCount.value = newLength
        }, 100)
      }
    },
    { deep: true }
  )

  // Watch displayedItems to see what's happening
  watch(
    displayedItems,
    (newItems) => {
      // Remove debug logs
    },
    { deep: true }
  )

  // Load more content function - properly implement infinite scroll
  const loadMoreContent = async () => {
    if (!hasMore.value) {
      return
    }

    if (!loadMoreFromLayout) {
      return
    }

    try {
      const result = await loadMoreFromLayout(20) // Load 20 more items

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

  // Use infinite scroll composable
  const infiniteScrollCallback = async () => {
    return await loadMoreContent()
  }

  const scrollDebug = useInfiniteScroll(infiniteScrollCallback, {
    isLoading,
    hasMore,
  })

  // Add keyboard shortcuts
  const handleKeyboard = (e) => {
    // Escape to clear search
    if (e.key === 'Escape') {
      searchTerm.value = ''
    }

    // Ctrl/Cmd + K to focus search (when implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      // Emit event to focus search bar
      document.dispatchEvent(new CustomEvent('focusSearch'))
    }

    // Number keys to toggle filters
    if (e.key === '1') {
      contentFilters.value.claims = !contentFilters.value.claims
    }
    if (e.key === '2') {
      contentFilters.value.quotes = !contentFilters.value.quotes
    }
    if (e.key === '3') {
      contentFilters.value.memes = !contentFilters.value.memes
    }
  }

  onMounted(() => {
    // Add keyboard listeners
    document.addEventListener('keydown', handleKeyboard)
  })

  onUnmounted(() => {
    // Remove keyboard listeners
    document.removeEventListener('keydown', handleKeyboard)
  })

  // Watch displayedItems for template debugging
  watch(
    displayedItems,
    (newItems) => {
      if (newItems.length > 0) {
        console.log('🎯 TEMPLATE RENDER: displayedItems:', newItems.length)
        console.log(
          '� TEMPLATE STRUCTURE: First 3 items:',
          newItems.slice(0, 3).map((item) => ({
            type: item.type,
            hasData: !!item.data,
          }))
        )
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div class="grid grid-cols-1 w-full">
    <div id="modal-root"></div>

    <!-- Error message -->
    <div v-if="error" class="text-red-500">
      Error loading content: {{ error.message }}
    </div>

    <!-- Content wall -->
    <section v-if="displayedItems.length" class="flex flex-col gap-3">
      <!-- DEBUG: Show first 12 items pattern -->
      {{ console.log('🎯 WALL PATTERN (first 12):') }}
      {{
        displayedItems
          .slice(0, 12)
          .forEach((item, i) => console.log(`  ${i}: ${item.type}`))
      }}

      <div
        v-for="(item, index) in displayedItems"
        :key="index"
        class="content-item"
        :class="{ 'fade-in-item': index >= newItemsStartIndex }"
      >
        <!-- Quotes (full width) -->
        <QuotePanel
          v-if="item.type === 'quote'"
          :quote="item.data"
          :slug="item.data?.path || item.data?._path || ''"
        />

        <!-- Claim pairs (2 columns on md+, stacked on smaller) -->
        <div
          v-else-if="item.type === 'claimPair'"
          class="gap-3 grid grid-cols-1 md:grid-cols-2"
        >
          <ClaimTranslationPanel
            v-for="(claimItem, idx) in item.data"
            :key="idx"
            :claim="claimItem"
            :slug="claimItem?.path || claimItem?._path || ''"
          />
        </div>

        <!-- Meme pairs (2 columns on md+, stacked on smaller) -->
        <div
          v-else-if="item.type === 'memeRow'"
          class="gap-3 grid grid-cols-1 md:grid-cols-2"
        >
          <MemePanel
            v-for="(memeItem, idx) in item.data"
            :key="idx"
            :meme="memeItem"
            :slug="memeItem?.path || memeItem?._path || ''"
          />
        </div>
      </div>
    </section>

    <!-- Infinite scroll loading indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="flex flex-col items-center gap-3">
        <Icon
          name="svg-spinners:ring-resize"
          size="1.5rem"
          class="text-white"
        />
        <div class="text-white text-sm">Loading more content...</div>
      </div>
    </div>

    <!-- No content message -->
    <div
      v-else-if="!displayedItems.length"
      class="flex flex-col justify-center items-center gap-4 min-h-[60vh]"
    >
      <!-- Loading spinner when no search term and all filters are enabled -->
      <div
        v-if="
          !searchTerm &&
          contentFilters.claims &&
          contentFilters.quotes &&
          contentFilters.memes
        "
        class="flex flex-col items-center gap-4"
      >
        <Icon name="svg-spinners:ring-resize" size="2rem" class="text-white" />
        <h1 class="font-light text-white text-xl text-center">
          Loading content...
        </h1>
      </div>

      <!-- Other states -->
      <div v-else-if="searchTerm" class="flex flex-col items-center gap-4">
        <Icon
          name="heroicons:magnifying-glass"
          size="3rem"
          class="text-slate-500"
        />
        <h1 class="font-light text-white text-2xl text-center">
          No results found.
        </h1>
        <p class="max-w-md text-slate-400 text-center">
          Try adjusting your search terms or check different content types
          above.
        </p>
        <button
          @click="searchTerm = ''"
          class="bg-seagull-600 hover:bg-seagull-700 px-4 py-2 rounded-lg font-light text-white transition-colors"
        >
          Clear Search
        </button>
      </div>

      <h1 v-else class="font-light text-white text-2xl text-center">
        {{
          !contentFilters.claims &&
          !contentFilters.quotes &&
          !contentFilters.memes
            ? 'No content found. Select a category above.'
            : 'Loading content...'
        }}
      </h1>
    </div>
  </div>
</template>

<style scoped>
  .content-item {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .fade-in-item {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeIn 0.6s ease-in-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
