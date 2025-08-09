<template>
  <div class="relative h-full overflow-hidden">
    <div
      class="box-content -mr-4 pr-6 h-full overflow-y-auto"
      ref="scrollContent"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
  // Vue ref is auto-imported in Nuxt 3

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
