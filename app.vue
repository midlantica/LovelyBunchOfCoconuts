<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Modal root for teleport -->
  <div id="modal-root"></div>
</template>

<script setup>
  // Add web manifest for PWA support
  useHead({
    link: [{ rel: 'manifest', href: '/favicon/site.webmanifest' }],
  })
</script>
