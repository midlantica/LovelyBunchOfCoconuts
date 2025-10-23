<template>
  <button
    type="button"
    @click.stop="emit('click')"
    class="hover:bg-slate-800 p-2 rounded-lg focus:outline-none transition-colors"
    aria-label="Toggle navigation menu"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M1.5 3.5h12M1.5 7.5h12M1.5 11.5h12" />
    </svg>
  </button>
</template>

<script setup>
  const emit = defineEmits(['click'])
</script>
