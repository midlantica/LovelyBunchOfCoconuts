<!-- components/MemePanel.vue -->
<template>
  <router-link
    v-if="meme && meme.image && slug"
    :to="`/memes/${getSlug(meme._path)}`"
    class="block bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"
  >
    <img
      :src="meme.image"
      alt="Meme"
      class="w-full max-h-72 object-cover object-left-top aspect-square"
    />
  </router-link>
  <div
    v-else-if="meme && meme.image"
    class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"
  >
    <img
      :src="meme.image"
      alt="Meme"
      class="w-full max-h-72 object-cover object-left-top aspect-square"
    />
  </div>
  <div
    v-else
    class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"
  >
    <p class="text-white text-center">🚨 Meme image not found!</p>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  meme: Object,
  slug: String,
})

// Extract the slug from the path, handling nested paths
const getSlug = (path) => {
  if (!path) return ""
  // Remove the leading '/memes/' prefix to get the relative path
  if (path.startsWith("/memes/")) {
    return path.substring("/memes/".length)
  }
  return path
}
</script>
