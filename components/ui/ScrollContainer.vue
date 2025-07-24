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
    @apply relative h-full overflow-hidden;
  }

  .scroll-content {
    @apply -mr-4 pr-6 h-full overflow-y-auto;
    box-sizing: content-box; /* Ensures padding doesn't affect width calculation */
  }
</style>
