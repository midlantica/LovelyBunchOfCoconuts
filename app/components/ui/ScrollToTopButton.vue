<!-- components/ui/ScrollToTopButton.vue -->
<template>
  <button
    class="right-3 bottom-3 z-50 fixed flex justify-center items-center bg-slate-800 hover:bg-slate-800 shadow-lg rounded-md w-[42px] h-[42px] text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
    @click="scrollToTop"
    title="Scroll to top"
  >
    <Icon name="tabler:arrow-bar-to-up" class="text-[1.5rem]" />
  </button>
</template>

<script setup>
  // Scroll to top function
  function scrollToTop() {
    // Try different scroll containers in order of priority:
    // 1. Wall-specific container (index page)
    const wallContainer = document.querySelector('.scroll-container-stable')
    if (wallContainer && wallContainer.scrollTop > 0) {
      wallContainer.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // 2. Main layout scroll container (other pages)
    const mainContainer = document.querySelector('main.overflow-y-auto')
    if (mainContainer && mainContainer.scrollTop > 0) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // 3. Fallback to window scroll
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
</script>
