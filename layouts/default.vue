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
    <button
      class="fixed bg-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md flex items-center justify-center transition-colors duration-200 z-50"
      style="bottom: 12px; right: 12px; width: 42px; height: 42px;"
      @click="scrollToTop"
      title="Scroll to top"
    >
      <Icon name="tabler:arrow-bar-to-up" style="width: 22px; height: 22px;" />
    </button>
  </div>
</template>

<script setup>
  // Explicit imports for layout components
  import TheHeader from '~/components/layout/TheHeader.vue'
  import TheFooter from '~/components/layout/TheFooter.vue'
  import ModalMeme from '~/components/modals/ModalMeme.vue'
  import ModalClaim from '~/components/modals/ModalClaim.vue'
  import ModalQuote from '~/components/modals/ModalQuote.vue'

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

  // Scroll to top function
  function scrollToTop() {
    // Target the main scroll container first
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Fallback to window scroll
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
</script>
