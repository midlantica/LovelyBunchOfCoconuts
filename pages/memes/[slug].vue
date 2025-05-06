<!-- pages/memes/[slug].vue -->
<template>
  <div class="meme-pg w-full flex flex-col gap-3">
    <div v-if="currentItem">
      <div class="flex flex-col gap-3 text-white">
        <ContentNavigation :prev-slug="prevSlug" :next-slug="nextSlug" />
        <ContentRenderer
          :value="currentItem"
          class="memes-details flex flex-col items-center [&_img]:max-w-full [&_img]:max-h-[70vh] [&_img]:h-auto [&_img]:mb-4"
        />
      </div>
    </div>
    <p v-else class="text-red-500">🚨 Meme not found!</p>
  </div>
</template>

<script setup>
  import { useContentNavigation } from "@/composables/useContentNavigation"

  const { currentItem, prevSlug, nextSlug } = useContentNavigation("memes")
</script>
