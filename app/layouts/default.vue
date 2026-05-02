<!-- eslint-disable vue/multi-word-component-names -->
<!-- layouts/default.vue -->
<template>
  <div class="grid h-screen grid-rows-[auto_1fr_auto] gap-4 overflow-hidden">
    <!-- RAF stripe — fixed left edge, full height, behind all content -->
    <div
      class="raf-stripe-vertical pointer-events-none fixed top-0 left-0 z-0 h-full w-[40px]"
    ></div>
    <LayoutTheHeader class="sticky top-0 left-0 z-20 w-full" />

    <main class="relative z-0 min-h-0 overflow-y-auto px-0">
      <slot />
    </main>

    <LayoutTheFooter class="relative z-20 w-full" />

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
  // PERFORMANCE OPTIMIZATION: Lazy load modal components to reduce initial bundle size
  // Modals are loaded on-demand when first opened, saving ~100KB on initial page load
  const ModalsModalMeme = defineAsyncComponent(
    () => import('~/components/modals/ModalMeme.vue')
  )
  const ModalsModalQuote = defineAsyncComponent(
    () => import('~/components/modals/ModalQuote.vue')
  )
  const ModalsModalProfile = defineAsyncComponent(
    () => import('~/components/modals/ModalProfile.vue')
  )
  const ModalsModalPost = defineAsyncComponent(
    () => import('~/components/modals/ModalPost.vue')
  )

  const showModal = ref(false)
  const modalType = ref(null)
  const modalData = ref(null)

  const modalMap = {
    meme: ModalsModalMeme,
    quote: ModalsModalQuote,
    profile: ModalsModalProfile,
    post: ModalsModalPost,
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
    } catch (e) {
      if (import.meta.dev)
        console.warn('[layout] GoatCounter tracking failed:', e)
    }
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
