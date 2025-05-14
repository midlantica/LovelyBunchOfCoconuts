<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Add web manifest for PWA support
useHead({
  link: [
    { rel: 'manifest', href: '/favicon/site.webmanifest' }
  ]
})
</script>
