<!-- layouts/default.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />

    <main class="overflow-hidden">
      <slot />
    </main>

    <TheFooter class="w-full" />

    <!-- Global Modals -->
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

    <!-- Scroll to Top Button -->
    <ScrollToTopButton />
  </div>
</template>

<script setup>
  // Explicit imports for layout components
  import TheHeader from '~/components/layout/TheHeader.vue'
  import TheFooter from '~/components/layout/TheFooter.vue'
  import ModalMeme from '~/components/modals/ModalMeme.vue'
  import ModalClaim from '~/components/modals/ModalClaim.vue'
  import ModalQuote from '~/components/modals/ModalQuote.vue'
  import ScrollToTopButton from '~/components/ui/ScrollToTopButton.vue'

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
