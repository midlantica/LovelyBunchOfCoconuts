<!-- layouts/home.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden baser">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    <div class="gap-3 grid grid-rows-[auto_1fr] px-4 overflow-hidden">
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
        class="top-0 z-10 sticky justify-self-center max-w-screen-md"
      />
      <div class="overflow-y-auto">
        <div class="mx-auto w-full max-w-screen-md">
          <main class="grid grid-rows-[auto]">
            <slot />
          </main>
        </div>
      </div>
    </div>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
import { computed, ref, provide, watch } from "vue"
import { useContentFeed } from "~/composables/useContentFeed"

const searchTerm = ref("")
const contentFilters = ref({
  claims: true,
  quotes: true,
  memes: true,
})

provide("searchTerm", searchTerm)
provide("contentFilters", contentFilters)

// --- Add result counts for claims, quotes, memes ---
const { displayedItems, contentCollections } = useContentFeed(searchTerm, contentFilters)

const totalClaimCount = computed(() => contentCollections.claims.value.length)
const totalQuoteCount = computed(() => contentCollections.quotes.value.length)
const totalMemeCount = computed(() => contentCollections.memes.value.length)
const totalItemCount = computed(
  () => totalClaimCount.value + totalQuoteCount.value + totalMemeCount.value
)

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

watch(
  contentFilters,
  (newVal) => {
    // This ensures pills in SearchBar stay in sync with the content wall
    // and that the correct filters are passed as props
  },
  { deep: true }
)
</script>

<style scoped></style>
