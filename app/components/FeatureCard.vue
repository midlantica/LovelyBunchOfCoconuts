<template>
  <div
    class="card flex flex-1 cursor-pointer! flex-col gap-2 p-4 transition-all duration-300 hover:scale-105"
  >
    <h3 class="text-2xl leading-tight uppercase">
      <slot name="title">{{ title }}</slot>
    </h3>
    <p
      class="font-100 block w-full text-left text-lg last:pb-0"
      style="color: var(--color-text-body)"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  })
</script>
