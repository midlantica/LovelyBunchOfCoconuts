<template>
  <div class="scroll-container">
    <div class="scroll-content" ref="scrollContent">
      <slot />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const scrollContent = ref(null)

  const scrollToTop = () => {
    if (scrollContent.value) {
      scrollContent.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Expose the scrollToTop method so parent components can call it
  defineExpose({
    scrollToTop,
  })
</script>

<style scoped>
  .scroll-container {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .scroll-content {
    height: 100%;
    overflow-y: auto;
    padding-right: 1.5rem; /* Extra padding to ensure content doesn't go under scrollbar */
    margin-right: -1rem; /* Pull the scrollbar 1rem to the right */
    box-sizing: content-box; /* Ensures padding doesn't affect width calculation */
  }
</style>
