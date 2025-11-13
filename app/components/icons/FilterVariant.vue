<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE -->
    <path d="M6 13h12v-2H6M3 6v2h18V6M10 18h4v-2h-4z" />
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
