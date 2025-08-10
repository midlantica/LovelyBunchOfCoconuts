<template>
  <div class="flex flex-col justify-center items-center gap-4 min-h-[40vh]">
    <h1 class="font-light text-white text-xl text-center">
      {{ message }}
    </h1>
  </div>
</template>

<script setup>
  const props = defineProps({
    message: { type: String, default: 'No content available' },
  })
</script>
