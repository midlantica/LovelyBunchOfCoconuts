<template>
  <button
    @click="$emit('click')"
    class="top-0 right-0 z-10 absolute bg-slate-800 hover:bg-slate-700 shadow p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white -translate-y-1/2 translate-x-1/2"
    aria-label="Close"
    type="button"
  >
    <Icon name="heroicons:x-mark-solid" size="2.25rem" class="text-white" />
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
