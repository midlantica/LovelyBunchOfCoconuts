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
        'close-button group border-union-blue-600/30 absolute z-9999 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-t bg-theme-elevated hover:cursor-pointer! focus:outline-none sm:flex',
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
  /* Dark mode (default): light grey at rest, near-white on hover. */
  .close-button {
    color: hsl(0 0% 65% / 1) !important;
  }

  .close-button:hover {
    color: hsl(0 0% 95% / 1) !important;
  }

  /* Light mode: override via :global so it beats the scoped !important above.
     The [data-theme] attribute selector adds specificity to beat the scoped rule. */
  :global([data-theme='light'] .close-button) {
    color: hsl(0 0% 55% / 1) !important;
  }

  :global([data-theme='light'] .close-button:hover) {
    color: hsl(0 0% 15% / 1) !important;
  }

  /* The SVG icon inherits color from the button via currentColor */
  .close-icon {
    color: inherit;
  }

  /* Explicit border styling for larger screens */
  @media (width >= 40rem) {
    .close-button {
      border-top-width: 1px;
      border-top-style: solid;
    }
  }
</style>
