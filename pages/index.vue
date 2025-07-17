<!-- pages/index.vue -->
<script setup>
  import { useInfiniteWall } from '~/composables/useInfiniteWall'
  import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
  import MemeDetailModal from '~/components/MemeDetailModal.vue'

  definePageMeta({
    layout: 'home',
  })

  // Use composable for all wall, modal, and infinite scroll logic
  const {
    displayedItems,
    loadMoreContent,
    error,
    searchTerm,
    contentFilters,
    selectedMeme,
    openMemeModal,
    isLoading,
    hasMore,
    lastItemCount,
    newItemsStartIndex,
  } = useInfiniteWall()

  // Use infinite scroll composable
  const infiniteScrollCallback = async () => {
    return await loadMoreContent()
  }
  useInfiniteScroll(infiniteScrollCallback, {
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
      document.dispatchEvent(new CustomEvent('focusSearch'))
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyboard)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyboard)
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
    <section
      v-if="displayedItems.length"
      class="flex flex-col gap-3 xs:px-2 sm:px-2 md:px-0"
    >
      <!-- DEBUG: Show first 12 items pattern -->
      <!-- Clean pattern display -->

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
            :key="memeItem._path || memeItem.path || idx"
            :meme="memeItem"
            :slug="memeItem?.path || memeItem?._path || ''"
            @click="openMemeModal(memeItem._path || memeItem.path)"
          />
        </div>
      </div>

      <!-- Meme Modal (single instance, outside v-for) -->
      <MemeDetailModal
        v-if="selectedMeme"
        :slug="selectedMeme._path || selectedMeme.path"
        :show="!!selectedMeme"
        @close="selectedMeme = null"
      />
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
