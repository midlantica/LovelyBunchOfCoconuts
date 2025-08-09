<template>
  <button
    @click="$emit('click')"
    class="-translate-y-1/2 pt-[5px] right-[26px] top-[26px] z-[9999] w-10 h-10 absolute flex justify-center items-center bg-slate-800 rounded-full translate-x-1/2 focus:outline-none focus:ring-2 focus:ring-white hover:bg-slate-700"
    aria-label="Close"
    type="button"
  >
    <Icon name="heroicons:x-mark-solid" size="1.5rem" class="text-white" />
  </button>
</template>

<script setup>
  // No script needed, emits click
</script>
