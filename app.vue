<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <!-- Keep the index page alive to preserve wall state and scroll -->
      <NuxtPage keepalive :keepalive-props="{ include: ['index'] }" />
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
