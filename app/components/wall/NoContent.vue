<template>
  <div class="flex flex-col justify-center items-center gap-4 mt-20">
    <h1 class="font-100 text-white text-xl text-center">
      {{ message }}
    </h1>
    <button
      class="bg-transparent hover:bg-white/10 px-4 pt-0.5 pb-1 border border-white/50 rounded-full text-white text-sm tracking-wider transition cursor-pointer"
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
