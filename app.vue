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
    link: [
      { rel: 'manifest', href: '/favicon/site.webmanifest' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,600;1,100;1,200;1,300;1,400;1,600&display=swap',
      },
    ],
  })
</script>
