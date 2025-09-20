<!-- components/wall/AdBadge.vue -->
<template>
  <div class="top-1 right-2 z-10 absolute">
    <span
      class="px-2 pt-0.5 pb-1 rounded-md font-semibold text-xs leading-0"
      :class="badgeClasses"
    >
      AD
    </span>
  </div>
</template>

<script setup>
  const props = defineProps({
    size: {
      type: String,
      default: 'square',
      validator: (value) =>
        ['square', 'horizontal', 'small', 'large'].includes(value),
    },
  })

  const badgeClasses = computed(() => {
    // Map old size values to new ones for backward compatibility
    const mappedSize =
      props.size === 'small'
        ? 'square'
        : props.size === 'large'
        ? 'horizontal'
        : props.size

    return mappedSize === 'horizontal'
      ? 'bg-seagull-200 text-seagull-800'
      : 'bg-seagull-200 text-seagull-800'
  })
</script>
