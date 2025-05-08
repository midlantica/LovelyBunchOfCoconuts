<!-- components/MemePanel.vue -->
<template>
  <router-link
    v-if="meme && meme.image && slug"
    :to="`/memes/${getSlug(meme._path)}`"
    class="mx-auto w-full h-full overflow-hidden block p-3 bg-gray-800 rounded-lg shadow-[inset_0_0_12px_0_#0f1e24] hover:bg-gray-700"
  >
    <img :src="meme.image" alt="Meme" class="w-full h-full object-contain object-center" />
  </router-link>
  <div 
    v-else-if="meme && meme.image"
    class="mx-auto w-full h-full overflow-hidden block p-3 bg-gray-800 rounded-lg shadow-[inset_0_0_12px_0_#0f1e24]"
  >
    <img :src="meme.image" alt="Meme" class="w-full h-full object-contain object-center" />
  </div>
  <div v-else class="mx-auto w-full h-full overflow-hidden block p-3 bg-gray-800 rounded-lg shadow-[inset_0_0_12px_0_#0f1e24]">
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
    if (!path) return '';
    // Extract the last part of the path (after the last slash)
    const parts = path.split('/');
    return parts[parts.length - 1];
  }
</script>
