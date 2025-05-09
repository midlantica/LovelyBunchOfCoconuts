<!-- error.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-white">
    <div class="text-center">
      <h1 class="text-4xl font-light mb-4">Page Not Found</h1>
      <p class="text-xl mb-8">The page you're looking for doesn't exist or has been moved.</p>
      
      <NuxtLink 
        to="/" 
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
