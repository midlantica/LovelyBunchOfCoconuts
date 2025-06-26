<!-- pages/index.vue -->
<script setup>
import { onMounted, onUnmounted, ref, inject, computed } from "vue"
// Use Nuxt's auto-imported composables instead
import { queryContent } from "#content"

definePageMeta({
  layout: "home",
})

// Get search term and content filters from parent component/layout
const searchTerm = inject("searchTerm", ref(""))
const contentFilters = inject("contentFilters", ref({ claims: true, quotes: true, memes: true }))

// Replace useContentFeed with direct Nuxt Content queries
const loading = ref(false)
const hasMore = ref(true)
const error = ref(null)

// Ensure proper initialization of displayedItems
const displayedItems = ref([])

// Add logic to interleave content types dynamically
const interleavedContent = computed(() => {
  const claims = displayedItems.value.filter((item) => item.type === "claimPair")
  const quotes = displayedItems.value.filter((item) => item.type === "quote")
  const memes = displayedItems.value.filter((item) => item.type === "memeRow")

  const interleaved = []
  const maxLength = Math.max(claims.length, quotes.length, memes.length)

  for (let i = 0; i < maxLength; i++) {
    if (claims[i]) interleaved.push(claims[i])
    if (quotes[i]) interleaved.push(quotes[i])
    if (memes[i]) interleaved.push(memes[i])
  }

  return interleaved
})

// --- Add result counts for claims, quotes, memes ---
const claimCount = computed(() => {
  return displayedItems.value
    .flatMap((item) => (item.type === "claimPair" ? item.data : []))
    .filter((item) => item.type === "claim").length
})
const quoteCount = computed(() => {
  return displayedItems.value.filter((item) => item.type === "quote").length
})
const memeCount = computed(() => {
  return displayedItems.value
    .flatMap((item) => (item.type === "memeRow" ? item.data : []))
    .filter((item) => item.type === "meme").length
})
const totalCount = computed(() => claimCount.value + quoteCount.value + memeCount.value)

// Add fallback logic in loadMoreContent
const loadMoreContent = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const filters = contentFilters.value
    const search = searchTerm.value

    const claims = filters.claims
      ? (await queryContent("claims")
          .where({ title: { $contains: search } })
          .find()) || []
      : []
    const quotes = filters.quotes
      ? (await queryContent("quotes")
          .where({ text: { $contains: search } })
          .find()) || []
      : []
    const memes = filters.memes
      ? (await queryContent("memes")
          .where({ description: { $contains: search } })
          .find()) || []
      : []

    const newItems = [...claims, ...quotes, ...memes]

    if (newItems.length === 0) {
      hasMore.value = false
    } else {
      displayedItems.value.push(...newItems)
    }
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

// Set up infinite scrolling
const loadMoreTrigger = ref(null)
let observer = null

onMounted(() => {
  loadMoreContent()

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

console.log(queryContent)
</script>

<template>
  <div class="grid grid-cols-1 w-full">
    <div id="modal-root"></div>

    <!-- Error message -->
    <div v-if="error" class="text-red-500">Error loading content: {{ error.message }}</div>

    <!-- Content wall -->
    <section
      v-if="displayedItems.length"
      class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 auto-rows-min"
    >
      <div
        v-for="(item, index) in displayedItems"
        :key="index"
        class="col-span-1 sm:col-span-2 lg:col-span-2"
      >
        <!-- Claim translations (displayed in pairs) -->
        <div
          v-if="item.type === 'claimPair'"
          class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
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
          class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
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
      class="flex flex-col justify-center justify-self-center content-center place-content-center self-center place-items-center gap-4 py-4 text-white text-center align-center"
    >
      <Icon name="svg-spinners:90-ring-with-bg" size="1.75rem" />
    </div>

    <!-- No content message -->
    <div v-else class="flex flex-col justify-center items-center min-h-[60vh]">
      <h1 class="font-light text-white text-2xl text-center">
        {{
          searchTerm
            ? "No results found."
            : !contentFilters.claims && !contentFilters.quotes && !contentFilters.memes
            ? "No content found. Select a category above."
            : "No content found."
        }}
      </h1>
    </div>

    <!-- Loading more indicator -->
    <div
      v-if="loading && displayedItems.length"
      class="flex flex-col justify-center justify-self-center content-center place-content-center self-center place-items-center gap-4 py-4 text-white text-center align-center"
    >
      <Icon name="svg-spinners:90-ring-with-bg" size="1.75rem" />
    </div>

    <!-- Infinite scroll trigger -->
    <div ref="loadMoreTrigger" class="h-10"></div>
  </div>
</template>
