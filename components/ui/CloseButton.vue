<template>
  <button
    @click="$emit('click')"
    class="top-[26px] right-[26px] z-[9999] absolute flex justify-center items-center bg-slate-800 hover:bg-slate-700 pt-[5px] rounded-full focus:outline-none focus:ring-2 focus:ring-white w-10 h-10 -translate-y-1/2 translate-x-1/2"
    aria-label="Close"
    type="button"
  >
    <Icon name="heroicons:x-mark-solid" size="1.5rem" class="text-white" />
  </button>
</template>

<script setup>
  // No script needed, emits click
</script>
