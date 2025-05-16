<!-- layouts/content-detail.vue -->
<template>
  <div class="gap-3 grid grid-rows-[auto_1fr_auto] h-screen">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    <main class="gap-3 mx-auto px-4 w-full max-w-screen-md overflow-y-auto">
      <!-- Content Navigation stays outside the page transition -->
      <ContentNavigation 
        :prev-slug="prevSlug" 
        :next-slug="nextSlug" 
        :content-type="contentType"
      />
      
      <!-- Page content will be rendered here with transitions -->
      <slot />
    </main>
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
