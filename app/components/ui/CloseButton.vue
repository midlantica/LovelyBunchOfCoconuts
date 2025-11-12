<template>
  <button
    @click="$emit('click')"
    :class="buttonClass"
    aria-label="Close"
    type="button"
  >
    <svg
      viewBox="0 0 24 24"
      :class="iconClass"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
      />
    </svg>
  </button>
</template>

<script setup>
  const props = defineProps({
    // Allow custom button classes to be passed in
    buttonClass: {
      type: String,
      default:
        'close-button group border-seagull-600/30 absolute top-[26px] right-[26px] z-9999 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-t bg-slate-900 pt-1.5 hover:cursor-pointer! focus:outline-none sm:flex',
    },
    // Allow custom icon classes to be passed in
    iconClass: {
      type: String,
      default: 'close-icon h-6 w-6 transition-colors',
    },
  })

  defineEmits(['click'])
</script>

<style scoped>
  .close-icon {
    color: hsl(0 0% 70% / 1);
  }

  .close-button:hover .close-icon {
    color: hsl(0 0% 100% / 1);
  }
</style>
