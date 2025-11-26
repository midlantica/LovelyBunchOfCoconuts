<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 256 256"
    fill="currentColor"
  >
    <!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE -->
    <path
      d="M126 136v64a6 6 0 0 1-12 0v-49.51l-69.76 69.75a6 6 0 0 1-8.48-8.48L105.51 142H56a6 6 0 0 1 0-12h64a6 6 0 0 1 6 6m82-102H80a14 14 0 0 0-14 14v48a6 6 0 0 0 12 0V48a2 2 0 0 1 2-2h128a2 2 0 0 1 2 2v128a2 2 0 0 1-2 2h-48a6 6 0 0 0 0 12h48a14 14 0 0 0 14-14V48a14 14 0 0 0-14-14"
    />
  </svg>
</template>

<script setup>
  defineProps({
    size: {
      type: [String, Number],
      default: 24,
    },
  })
</script>
