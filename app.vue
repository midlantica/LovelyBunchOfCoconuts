<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <!-- Modal root for teleport -->
  <div id="modal-root"></div>
</template>

<script setup>
  // Add web manifest for PWA support
  useHead({
    link: [{ rel: 'manifest', href: '/favicon/site.webmanifest' }],
  })
</script>
