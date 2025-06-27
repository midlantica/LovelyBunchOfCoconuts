<!-- layouts/default.vue -->
<template>
  <div class="gap-3 grid grid-rows-[auto_1fr_auto] h-screen">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    <ScrollContainer>
      <main class="gap-3 mx-auto px-4 w-full max-w-screen-md">
        <slot />
      </main>
    </ScrollContainer>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
  import ScrollContainer from '~/components/ScrollContainer.vue'
</script>
