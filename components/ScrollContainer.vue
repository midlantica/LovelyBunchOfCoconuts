<template>
  <div class="scroll-container">
    <div class="scroll-content">
      <slot />
    </div>
  </div>
</template>

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
