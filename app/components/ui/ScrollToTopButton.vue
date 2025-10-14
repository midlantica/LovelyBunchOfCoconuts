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
