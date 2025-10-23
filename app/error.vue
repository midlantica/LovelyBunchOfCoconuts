<!-- error.vue -->
<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-white"
  >
    <div class="text-center">
      <h1 class="font-100 mb-4 text-4xl">Page Not Found</h1>
      <p class="mb-8 text-xl">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <NuxtLink
        to="/"
        class="bg-seagull-600 hover:bg-seagull-700 font-100 rounded-lg px-6 py-3 text-white transition-colors"
        @click="handleError"
      >
        Return to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
  const error = useError()

  function handleError() {
    clearError({ redirect: '/' })
  }
</script>
