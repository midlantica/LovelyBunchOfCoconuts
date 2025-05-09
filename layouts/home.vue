<!-- layouts/home.vue -->
<template>
  <div class="gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden baser">
    <TheHeader class="top-0 left-0 z-10 sticky w-full" />
    <div class="gap-3 grid grid-rows-[auto_1fr] px-4 overflow-hidden">
      <SearchBar
        v-model:search="searchTerm"
        v-model:filters="contentFilters"
        class="top-0 z-10 sticky justify-self-center max-w-screen-md"
      />
      <main class="grid grid-rows-[auto] mx-auto pr-3 w-full max-w-screen-md overflow-y-auto">
        <slot />
      </main>
    </div>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
import { ref, provide, watch } from "vue"

const searchTerm = ref("")
const contentFilters = ref({
  claims: true,
  quotes: true,
  memes: true,
})

provide("searchTerm", searchTerm)
provide("contentFilters", contentFilters)

watch(searchTerm, (newVal) => {
  console.log("Home layout searchTerm:", newVal)
})

watch(
  contentFilters,
  (newVal) => {
    console.log("Home layout contentFilters:", newVal)
  },
  { deep: true }
)
</script>

<style scoped>
.baser {
  /* @apply bg-[url('/grainy-background.jpg')] bg-cover; */
}
</style>
