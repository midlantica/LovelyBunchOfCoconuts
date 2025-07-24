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
  .pill-btn {
    @apply flex justify-between items-center gap-1 bg-slate-800 px-3 pt-[.2rem] pb-[0.3rem] rounded-md w-[100px] font-light text-slate-200 text-base uppercase tracking-wider transition;
    outline: none;
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
