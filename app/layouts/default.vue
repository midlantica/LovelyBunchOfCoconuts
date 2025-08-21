<!-- eslint-disable vue/multi-word-component-names -->
<!-- layouts/default.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
    <LayoutTheHeader class="top-0 left-0 z-10 sticky w-full" />

    <main class="min-h-0 overflow-hidden">
      <slot />
    </main>

    <LayoutTheFooter class="w-full" />

    <!-- Global Modals (used for hash-based opens or explicit openModal) -->
    <component
      v-if="showModal && modalType && modalMap[modalType]"
      :is="modalMap[modalType]"
      :show="showModal"
      :modal-data="modalData"
      @close="closeModal"
    />

    <UiScrollToTopButton />
  </div>
</template>

<script setup>
  const showModal = ref(false)
  const modalType = ref(null)
  const modalData = ref(null)

  // Map modal types to actual component objects (async) so :is can resolve them
  const ModalsModalMeme = defineAsyncComponent(() =>
    import('~/components/modals/ModalMeme.vue')
  )
  const ModalsModalClaim = defineAsyncComponent(() =>
    import('~/components/modals/ModalClaim.vue')
  )
  const ModalsModalQuote = defineAsyncComponent(() =>
    import('~/components/modals/ModalQuote.vue')
  )

  const modalMap = {
    meme: ModalsModalMeme,
    claim: ModalsModalClaim,
    quote: ModalsModalQuote,
  }

  // Allow calling with either (type, data) or ({ type, data, slug })
  function handleModal(arg1, arg2) {
    let type, data
    if (typeof arg1 === 'string') {
      type = arg1
      data = arg2
    } else if (arg1 && typeof arg1 === 'object') {
      type = arg1.type
      data = arg1.data
    }
    if (!type || !data) return

    modalType.value = type
    modalData.value = data
    showModal.value = true

    // GoatCounter virtual pageview for modal open
    try {
      if (
        typeof window !== 'undefined' &&
        window.goatcounter &&
        window.goatcounter.count
      ) {
        const rawSlug =
          (data && (data.slug || data._path || data.title)) || 'unknown'
        const slug = rawSlug
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, ' ')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(-80) // keep tail uniqueness (titles often end with distinctive part)
        window.goatcounter.count({
          path: `/modal/${type}/${encodeURIComponent(slug)}`,
        })
      }
    } catch (e) {}
  }

  function closeModal() {
    showModal.value = false
    modalType.value = null
    modalData.value = null

    // Restore the pre-modal URL without a navigation to keep scroll and wall intact
    if (typeof window !== 'undefined') {
      const preModalUrl = useState('preModalUrl', () => null)
      if (preModalUrl.value) {
        window.history.replaceState({}, '', preModalUrl.value)
        preModalUrl.value = null
      } else {
        // Fallback: remove hash
        const url = `${window.location.pathname}${window.location.search}`
        window.history.replaceState({}, '', url)
      }
    }
  }

  provide('openModal', handleModal)
  provide('closeModal', closeModal)
  provide('isModalOpen', showModal)
</script>
