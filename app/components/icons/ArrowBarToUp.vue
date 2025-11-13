<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
  >
    <!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE -->
    <path d="M12 10v10m0-10l4 4m-4-4l-4 4M4 4h16" />
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
