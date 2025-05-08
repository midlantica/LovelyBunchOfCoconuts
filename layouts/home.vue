<!-- layouts/home.vue -->
<template>
  <div class="grid-rows-[auto_auto_1fr_auto] h-screen grid gap-3 bg-slate-950">
    <TheHeader class="w-full sticky top-0 left-0 z-10" />
    <SearchBar
      v-model:search="searchTerm"
      v-model:filters="contentFilters"
      class="w-full max-w-screen-md sticky top-0 z-10 justify-self-center px-4"
    />
    <main class="grid-rows-[auto] mx-auto w-full max-w-screen-md overflow-y-auto grid gap-3 px-4">
      <slot />
    </main>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup>
  import { ref, provide, watch } from "vue"

  const searchTerm = ref("")
  const contentFilters = ref({
    claims: true,
    quotes: true,
    memes: true
  })
  
  provide("searchTerm", searchTerm)
  provide("contentFilters", contentFilters)

  watch(searchTerm, (newVal) => {
    console.log("Home layout searchTerm:", newVal)
  })
  
  watch(contentFilters, (newVal) => {
    console.log("Home layout contentFilters:", newVal)
  }, { deep: true })
</script>
