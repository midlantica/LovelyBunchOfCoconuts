<template>
  <div class="mt-6 mb-6 flex flex-wrap items-center gap-8 px-3 max-md:flex-col">
    <!-- About WakeUpNPC -->
    <div class="flex-1">
      <h1 class="font-300 text-seagull-200! mb-3 text-3xl">
        About Wake&hairsp;Up&hairsp;NPC
      </h1>
      <p
        class="font-100 text-seagull-100 mb-3 text-xl leading-relaxed last:pb-0"
      >
        It took millennia to build the West—Greeks to cathedrals to locomotives
        to microchips. Day Zero Woke Left barbarians would burn it to the
        ground. We lay out the receipts, translate the jargon, and decode the
        guilt‑grift—arming you with devastating replies. Type any talking
        point—we’ll expose the Left’s grift. Everything the Left touches, it
        destroys.
      </p>
    </div>
    <!-- Image wrapper div -->
    <div
      @click="showImageModal = true"
      role="button"
      tabindex="0"
      @keydown.enter="showImageModal = true"
      @keydown.space.prevent="showImageModal = true"
      class="group flex-1 cursor-pointer"
    >
      <img
        src="/modern-woke-barbarians.jpg"
        alt="modern woke barbarians"
        class="h-auto w-full rounded-lg border-2 border-white transition-all duration-300 hover:scale-105"
        :class="{
          'border-4': showImageModal,
          'duotone-blue': !hasBeenViewed,
        }"
      />
    </div>

    <!-- Full size image modal -->
    <div
      v-if="showImageModal"
      @click="showImageModal = false"
      class="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <img
        src="/modern-woke-barbarians.jpg"
        alt="modern woke barbarians full size"
        class="max-h-[90vh] max-w-[90vw] rounded-xl border-4 border-white object-contain"
      />
    </div>
  </div>
</template>

<script setup>
  // Image modal state
  const showImageModal = ref(false)
  const hasBeenViewed = ref(false)

  // Watch for modal opening to mark as viewed
  watch(showImageModal, (newValue) => {
    if (newValue === true) {
      hasBeenViewed.value = true
    }
  })

  // Close modal on escape key
  if (import.meta.client) {
    onMounted(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          showImageModal.value = false
        }
      }
      window.addEventListener('keydown', handleEscape)
      onUnmounted(() => window.removeEventListener('keydown', handleEscape))
    })
  }
</script>

<style scoped>
  .duotone-blue {
    filter: grayscale(100%) contrast(1.2) sepia(100%) hue-rotate(210deg)
      saturate(150%);
    transition: filter 0.3s ease;
  }

  .duotone-blue:hover {
    filter: none;
  }
</style>
