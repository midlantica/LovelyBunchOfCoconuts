<!-- layouts/home.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />

    <div class="gap-3 grid grid-rows-[auto_1fr] overflow-hidden">
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

    <TheFooter class="w-full" />

    <!-- Modals -->
    <ModalMeme
      v-if="modalType === 'meme'"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />
    <ModalClaim
      v-if="modalType === 'claim'"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />
    <ModalQuote
      v-if="modalType === 'quote'"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
  // Simple SSR-safe search/filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))

  // Modal state
  const showModal = ref(false)
  const modalType = ref(null)
  const modalData = ref(null)

  // Count tracking
  const wallCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })

  // Modal handlers
  function handleModal({ type, data }) {
    modalType.value = type
    modalData.value = data
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    modalType.value = null
    modalData.value = null
  }

  // Count handlers
  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }

  // Provide search state for child components
  provide('searchTerm', searchTerm)
  provide('contentFilters', contentFilters)
</script>

<style scoped></style>
