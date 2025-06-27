<!-- error.vue -->
<template>
  <div
    class="flex flex-col justify-center items-center px-4 py-16 min-h-screen text-white"
  >
    <div class="text-center">
      <h1 class="mb-4 font-light text-4xl">Page Not Found</h1>
      <p class="mb-8 text-xl">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <!-- <NuxtLink 
        to="/" 
        class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white transition-colors"
        @click="handleError"
      >
        Return to Home
      </NuxtLink> -->
    </div>
  </div>
</template>

<script setup>
  const error = useError()

  function handleError() {
    clearError({ redirect: '/' })
  }
</script>
