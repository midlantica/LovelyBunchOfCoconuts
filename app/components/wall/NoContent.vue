<template>
  <div class="mt-20 flex flex-col items-center justify-center gap-4">
    <h1 class="font-100 text-theme-body text-center text-xl">
      {{ message }}
    </h1>
    <button
      class="border-theme-border-subtle text-theme-body hover:bg-theme-overlay cursor-pointer! rounded-full border bg-transparent px-4 pt-0.5 pb-1 text-sm tracking-wider transition"
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
