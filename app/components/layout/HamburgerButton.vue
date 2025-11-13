<template>
  <button
    type="button"
    @click.stop="emit('click')"
    class="rounded-lg p-2 transition-colors hover:bg-slate-800 focus:outline-none"
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
      <path d="M1.5 2.5h12M1.5 7.5h12M1.5 12.5h12" />
    </svg>
  </button>
</template>

<script setup>
  const emit = defineEmits(['click'])
</script>
