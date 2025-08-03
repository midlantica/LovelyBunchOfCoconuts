<!-- layouts/default.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
    <LayoutTheHeader class="top-0 left-0 z-10 sticky w-full" />

    <main class="overflow-hidden">
      <slot />
    </main>

    <LayoutTheFooter class="w-full" />

    <!-- Global Modals -->
    <ModalsModalMeme
      v-if="modalType === 'meme'"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />
    <ModalsModalClaim
      v-if="modalType === 'claim'"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />
    <ModalsModalQuote
      v-if="modalType === 'quote'"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />

    <!-- Scroll to Top Button -->
    <UiScrollToTopButton />
  </div>
</template>

<script setup>
  // Global modal state
  const showModal = ref(false)
  const modalType = ref(null)
  const modalData = ref(null)

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

  // Provide modal handlers globally
  provide('openModal', handleModal)
  provide('closeModal', closeModal)
</script>
