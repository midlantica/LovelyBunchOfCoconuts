<!-- components/ui/DividerArrow.vue -->
<template>
  <div class="relative my-2" :class="wrapperClass">
    <hr :class="['border-t', colorClass, hrClass]" />
    <span
      class="absolute left-1/2 -translate-x-1/2"
      :style="triangleStyle"
    ></span>
  </div>
</template>

<script setup>
  const props = defineProps({
    colorClass: { type: String, default: '' },
    hrClass: { type: String, default: '' },
    wrapperClass: { type: String, default: '' },
    size: { type: Number, default: 5 },
    opacity: { type: Number, default: 0.3 },
    offset: { type: Number, default: -4.5 },
  })

  const triangleStyle = computed(() => {
    const s = props.size
    return {
      height: 0,
      width: 0,
      borderLeft: `${s}px solid transparent`,
      borderRight: `${s}px solid transparent`,
      borderTop: `${s}px solid var(--color-divider-arrow)`,
      bottom: `${props.offset}px`,
    }
  })
</script>

<style scoped>
  hr {
    border-color: var(--color-divider-line);
  }
</style>
