<template>
  <button
    @click="$emit('click')"
    class="hidden z-[9999] absolute sm:flex justify-center items-center bg-slate-800 hover:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-white w-10 h-10 close-button"
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
  .close-button {
    /* Position the button in the top-right corner with proper offset */
    top: 26px;
    right: 26px;
    /* Transform to center the button on the corner */
    transform: translate(50%, -50%);
  }
</style>
