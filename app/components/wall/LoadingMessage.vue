<template>
  <div class="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
    <div class="flex flex-col items-center gap-4">
      <Icon name="svg-spinners:ring-resize" size="2rem" class="text-white" />
      <h1 class="font-light text-white text-xl text-center">
        {{ message }}
      </h1>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    message: { type: String, default: 'Loading content...' },
  })
</script>
