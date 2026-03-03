<!-- components/ui/ScrollToTopButton.vue -->
<template>
  <button
    class="bg-theme-elevated text-theme-icon hover:text-theme-body fixed right-3 bottom-3 z-50 flex h-[42px] w-[42px] cursor-pointer! items-center justify-center rounded-md shadow-lg transition-colors duration-200"
    @click="scrollToTop"
    title="Scroll to top"
  >
    <IconsArrowBarToUp :size="24" class="text-[1.5rem]" />
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
