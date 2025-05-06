<!-- layouts/home.vue -->
<template>
  <div class="grid-rows-[auto_auto_1fr_auto] h-screen grid gap-3 bg-slate-950">
    <TheHeader class="w-full sticky top-0 left-0 z-10" />
    <SearchBar
      v-model:search="searchTerm"
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
  provide("searchTerm", searchTerm)

  watch(searchTerm, (newVal) => {
    console.log("Home layout searchTerm:", newVal)
  })
</script>
