<!-- layouts/home.vue - Clean Layout (Structure Only) -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
    <!-- Header -->
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    
    <!-- Main Content Area with Slot -->
    <div class="gap-3 grid grid-rows-[auto_1fr] overflow-hidden">
      <slot />
    </div>
    
    <!-- Footer -->
    <TheFooter />
  </div>
</template>

<script setup>
// Layout should only handle basic structure
// All business logic moved to pages and composables
console.log('🏠 Clean layout loaded')
</script>

<style scoped></style>
