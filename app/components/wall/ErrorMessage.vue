<template>
  <div class="py-8 text-red-500 text-center">
    <strong>Error loading content:</strong>
    <span>{{ errorMessage }}</span>
  </div>
</template>

<script setup>
  const props = defineProps({
    error: { type: [String, Object], default: '' },
  })

  const errorMessage = computed(() => {
    if (props.error && typeof props.error === 'object') {
      return props.error.message || JSON.stringify(props.error)
    }
    return props.error || 'Unknown error'
  })
</script>
