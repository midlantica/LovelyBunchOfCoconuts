<!-- layouts/content-detail.vue -->
<template>
  <div class="gap-3 grid grid-rows-[auto_auto_1fr_auto] h-screen">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    
    <!-- Content Navigation stays outside the scrolling area -->
    <div class="mx-auto px-4 w-full max-w-screen-md">
      <ContentNavigation 
        :prev-slug="prevSlug" 
        :next-slug="nextSlug" 
        :content-type="contentType"
      />
    </div>
    
    <!-- Scrollable content area -->
    <div class="detail-scroll-container">
      <main class="gap-3 mx-auto px-4 w-full max-w-screen-md">
        <slot />
      </main>
    </div>
    
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const prevSlug = ref(null)
const nextSlug = ref(null)
const contentType = ref(null)

// Watch for navigation data from the page
watch(() => route.meta.navigation, (newNavigation) => {
  if (newNavigation) {
    prevSlug.value = newNavigation.prevSlug
    nextSlug.value = newNavigation.nextSlug
    contentType.value = newNavigation.contentType
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.detail-scroll-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
}
</style>
