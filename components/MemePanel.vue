<!-- components/MemePanel.vue -->
<template>
  <div>
    <div
      v-if="meme && meme.image && slug"
      class="block bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 border hover:border hover:border-seagull-400 border-transparent rounded-lg w-full h-full overflow-hidden cursor-pointer"
      @click="openModal"
    >
      <img
        :src="meme.image"
        alt="Meme"
        class="bg-black/40 rounded-lg w-full h-full object-contain aspect-square"
        style="max-width: 100%; max-height: 100%; min-width: 0; min-height: 0"
      />
    </div>
    <div
      v-else-if="meme && meme.image"
      class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"
    >
      <img
        :src="meme.image"
        alt="Meme"
        class="bg-black/40 rounded-lg w-full h-full object-contain aspect-square"
        style="max-width: 100%; max-height: 100%; min-width: 0; min-height: 0"
      />
    </div>
    <div
      v-else
      class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"
    >
      <p class="text-white text-center">🚨 Meme image not found!</p>
    </div>
    <MemeDetailModal
      v-if="showModal"
      :slug="getSlug(meme._path)"
      :show="showModal"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import MemeDetailModal from './MemeDetailModal.vue'

  const props = defineProps({
    meme: Object,
    slug: String,
  })

  const showModal = ref(false)
  const openModal = () => (showModal.value = true)
  const closeModal = () => (showModal.value = false)

  // Extract the slug from the path, handling nested paths
  const getSlug = (path) => {
    if (!path) return ''
    // Remove the leading '/memes/' prefix to get the relative path
    if (path.startsWith('/memes/')) {
      return path.substring('/memes/'.length)
    }
    return path
  }
</script>
