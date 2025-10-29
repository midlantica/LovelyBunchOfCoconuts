<template>
  <div class="mt-20 flex flex-col items-center justify-center gap-4">
    <h1 class="font-100 text-center text-xl text-white">
      {{ message }}
    </h1>
    <button
      class="cursor-pointer! rounded-full border border-white/50 bg-transparent px-4 pt-0.5 pb-1 text-sm tracking-wider text-white transition hover:bg-white/10"
      @click="$emit('clear-search')"
    >
      Clear Search
    </button>
  </div>
</template>

<script setup>
  const props = defineProps({
    message: { type: String, default: 'No content available' },
  })
</script>
