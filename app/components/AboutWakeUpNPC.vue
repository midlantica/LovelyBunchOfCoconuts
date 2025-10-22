<template>
  <div class="flex max-md:flex-col flex-wrap items-center gap-8 mt-6 mb-6 px-3">
    <!-- About WakeUpNPC -->
    <div class="flex-1">
      <h1 class="mb-3 font-300 text-seagull-200! text-3xl">
        About Wake&hairsp;Up&hairsp;NPC
      </h1>
      <p
        class="mb-3 last:pb-0 font-100 text-seagull-100 text-lg leading-relaxed"
      >
        We highlight the Woke Left's insanity wreaking hovoc in our civilization
        that took a thousand years to build. We make fun of the Left's madness.
        We see their Guilt Grift machine and decode it. We expose their empty
        rhetoric, their regressive dogma, and their epic Big Lie gaslighting. We
        provide responses to every Leftist gaslighting argument. Try it, type in
        your favorite Leftist talking point in our search bar!
      </p>
    </div>
    <!-- Image wrapper div -->
    <div
      @click="showImageModal = true"
      role="button"
      tabindex="0"
      @keydown.enter="showImageModal = true"
      @keydown.space.prevent="showImageModal = true"
      class="flex-1 cursor-pointer"
    >
      <img
        src="/modern-woke-barbarians.jpg"
        alt="modern woke barbarians"
        class="border-2 border-white rounded-lg w-full h-auto hover:scale-105 transition-all duration-300"
        :class="{ 'border-4': showImageModal }"
      />
    </div>

    <!-- Full size image modal -->
    <div
      v-if="showImageModal"
      @click="showImageModal = false"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/90 cursor-pointer"
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <img
        src="/modern-woke-barbarians.jpg"
        alt="modern woke barbarians full size"
        class="border-4 border-white rounded-xl max-w-[90vw] max-h-[90vh] object-contain"
      />
    </div>
  </div>
</template>

<script setup>
  // Image modal state
  const showImageModal = ref(false)

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
