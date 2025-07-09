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

  // Add escape key handler for clearing search
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      searchTerm.value = ''
    }
  }

  onMounted(() => {
    // Add escape key listener
    document.addEventListener('keydown', handleEscape)
  })

  onUnmounted(() => {
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscape)
  })
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
      <div class="text-white text-lg">Loading more content...</div>
    </div>

    <!-- No content message -->
    <div
      v-else-if="!displayedItems.length"
      class="flex flex-col justify-center items-center min-h-[60vh]"
    >
      <h1 class="font-light text-white text-2xl text-center">
        {{
          searchTerm
            ? 'No results found.'
            : !contentFilters.claims &&
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
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
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
