<!-- pages/index.vue -->
<script setup>
import { onMounted, onUnmounted, ref, inject } from "vue"
import { useContentFeed } from "~/composables/useContentFeed"

definePageMeta({
  layout: "home",
})

// Get search term and content filters from parent component/layout
const searchTerm = inject("searchTerm", ref(""))
const contentFilters = inject("contentFilters", ref({ claims: true, quotes: true, memes: true }))

// Initialize content feed
const { loadMoreContent, displayedItems, loading, hasMore, error } = useContentFeed(
  searchTerm,
  contentFilters
)

// Set up infinite scrolling
const loadMoreTrigger = ref(null)
let observer = null

onMounted(() => {
  // Create intersection observer for infinite scrolling
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        loadMoreContent()
      }
    },
    { threshold: 0.1 }
  )

  // Start observing the trigger element
  if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value)
})

onUnmounted(() => {
  // Clean up observer when component is destroyed
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="w-full grid grid-cols-1 gap-3">
    <!-- Error message -->
    <div v-if="error" class="text-red-500">Error loading content: {{ error.message }}</div>

    <!-- Content wall -->
    <section
      v-if="displayedItems.length"
      class="grid grid-cols-1 auto-rows-min gap-3 lg:grid-cols-2 sm:grid-cols-2"
    >
      <div
        v-for="(item, index) in displayedItems"
        :key="index"
        class="col-span-1 lg:col-span-2 sm:col-span-2"
      >
        <!-- Claim translations (displayed in pairs) -->
        <div
          v-if="item.type === 'claimPair'"
          class="grid grid-cols-1 gap-3 lg:grid-cols-2 sm:grid-cols-2"
        >
          <ClaimTranslationPanel
            v-for="(claimItem, idx) in item.data"
            :key="idx"
            :claim="claimItem.data"
            :slug="claimItem.data?._path || ''"
          />
        </div>

        <!-- Quotes -->
        <QuotePanel
          v-else-if="item.type === 'quote'"
          :quote="item.data"
          :slug="item.data?._path || ''"
        />

        <!-- Memes (displayed in pairs) -->
        <div
          v-else-if="item.type === 'memeRow'"
          class="grid grid-cols-1 gap-3 lg:grid-cols-2 sm:grid-cols-2"
        >
          <MemePanel
            v-for="(memeItem, idx) in item.data"
            :key="idx"
            :meme="memeItem.data"
            :slug="memeItem.data?._path || ''"
          />
        </div>
      </div>
    </section>

    <!-- Initial loading state -->
    <div
      v-else-if="loading"
      class="align-center flex flex-col justify-center justify-self-center content-center self-center place-content-center place-items-center gap-4 py-4 text-center text-white"
    >
      <Icon name="svg-spinners:90-ring-with-bg" size="1.75rem" />
    </div>

    <!-- No content message -->
    <h1 
      v-else 
      class="text-white text-center"
      :class="{ 'mt-8': !contentFilters.claims && !contentFilters.quotes && !contentFilters.memes }"
    >
      {{ searchTerm 
        ? "No results found." 
        : (!contentFilters.claims && !contentFilters.quotes && !contentFilters.memes) 
          ? "No content found. Select a category above." 
          : "No content found." 
      }}
    </h1>

    <!-- Loading more indicator -->
    <div
      v-if="loading && displayedItems.length"
      class="align-center flex flex-col justify-center justify-self-center content-center self-center place-content-center place-items-center gap-4 py-4 text-center text-white"
    >
      <Icon name="svg-spinners:90-ring-with-bg" size="1.75rem" />
    </div>

    <!-- Infinite scroll trigger -->
    <div ref="loadMoreTrigger" class="h-10"></div>
  </div>
</template>
