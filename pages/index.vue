<!-- pages/index.vue -->
<template>
  <div class="gap-3 grid grid-rows-[auto_1fr] h-full overflow-hidden">
    <!-- Search Bar -->
    <div class="flex justify-center">
      <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
        <SearchBar
          v-model:search="searchTerm"
          v-model:filters="contentFilters"
          :claim-count="wallCounts.claims"
          :quote-count="wallCounts.quotes"
          :meme-count="wallCounts.memes"
          :total-count="wallCounts.total"
          :total-claim-count="totalCounts.claims"
          :total-quote-count="totalCounts.quotes"
          :total-meme-count="totalCounts.memes"
          :total-item-count="totalCounts.total"
          class="top-0 z-10 sticky w-full"
        />
      </div>
    </div>

    <!-- Content Wall -->
    <div
      class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
    >
      <div class="mx-auto md:px-0 pr-3 pl-2 w-full max-w-screen-md">
        <main class="pb-8">
          <TheWall
            :search="searchTerm"
            :filters="contentFilters"
            @modal="handleModal"
            @counts="handleCounts"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
  // Explicit imports to ensure components resolve
  import SearchBar from '~/components/searchbar/SearchBar.vue'
  import TheWall from '~/components/wall/TheWall.vue'

  // Simple SSR-safe search/filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))

  // Count tracking
  const wallCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })

  // Get modal handlers from layout
  const handleModal = inject('openModal')

  // Count handlers
  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }

  // Provide search state for child components
  provide('searchTerm', searchTerm)
  provide('contentFilters', contentFilters)
</script>
