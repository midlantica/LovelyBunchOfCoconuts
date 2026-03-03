<template>
  <button
    class="pill-btn"
    :class="on ? 'pill-on' : 'pill-off'"
    @click="$emit('click')"
    type="button"
  >
    <span class="pill-label">{{ label }}</span>
    <client-only>
      <span class="pill-count">{{ count }}</span>
    </client-only>
  </button>
</template>

<script setup>
  const props = defineProps({
    label: { type: String, required: true },
    count: { type: [Number, String], default: 0 },
    on: { type: Boolean, default: false },
  })
</script>

<style scoped>
  @reference '../../assets/css/main.css';
  .pill-btn {
    @apply font-100 bg-theme-surface text-theme-body hover:bg-theme-overlay tran outline: none flex cursor-pointer! items-center justify-between gap-1 rounded-md px-3 pt-[.2rem] pb-[0.3rem] text-base tracking-wider uppercase;
  }
  .pill-btn:focus {
    outline: none;
  }
  .pill-btn:focus-visible {
    outline: none;
  }
  .pill-label {
    @apply ml-auto;
  }
  .pill-count {
    @apply mr-auto;
  }
  .pill-on {
    @apply opacity-100;
  }
  .pill-off {
    @apply opacity-80 grayscale;
  }
</style>
