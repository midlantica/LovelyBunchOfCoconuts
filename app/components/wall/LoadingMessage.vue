<template>
  <div class="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
    <div class="flex flex-col items-center gap-4">
      <Icon
        name="svg-spinners:ring-resize"
        size="2rem"
        class="text-white spinner-continuous"
      />
      <h1 class="font-100 text-white text-xl text-center">
        {{ message }}
      </h1>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    message: { type: String, default: 'loading content...' },
  })
</script>

<style scoped>
  .spinner-continuous {
    animation: spin 1s linear infinite;
    transform-origin: center;
    /* Prevent animation interruption during DOM updates */
    animation-fill-mode: both;
    will-change: transform;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Ensure the spinner keeps spinning even during DOM updates */
  .spinner-continuous * {
    animation: inherit;
  }

  /* Prevent white flash by ensuring background stays consistent */
  .spinner-continuous,
  .spinner-continuous * {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
</style>
