<template>
  <button
    @click="$emit('click')"
    class="hidden top-1 right-1 z-10 absolute sm:flex justify-center items-center bg-slate-800 hover:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-white w-10 h-10 -translate-y-1/2 translate-x-1/2"
    aria-label="Close"
    type="button"
  >
    <Icon name="heroicons:x-mark-solid" size="1.5rem" class="text-white" />
  </button>
</template>

<script setup>
  // No script needed, emits click
</script>

<style scoped>
  button {
    /* Ensures the button overlays the corner and does not affect layout */
  }
</style>
