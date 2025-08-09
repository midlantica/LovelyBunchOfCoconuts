<!-- components/MemePanel.vue -->
<template>
  <div>
    <div
      v-if="meme && meme.image && slug"
      class="block bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 border hover:border hover:border-seagull-400 border-transparent rounded-md w-full h-full overflow-hidden cursor-pointer"
      @click="openModal"
    >
      <img
        ref="lazyImg"
        :data-src="meme.image"
        :alt="imageAlt"
        decoding="async"
        loading="lazy"
        class="bg-black/40 rounded-md w-full min-w-0 max-w-full h-full min-h-0 max-h-full object-contain aspect-square"
      />
    </div>
    <div
      v-else-if="meme && meme.image"
      class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-md w-full h-full overflow-hidden"
    >
      <img
        ref="lazyImg"
        :data-src="meme.image"
        :alt="imageAlt"
        decoding="async"
        loading="lazy"
        class="bg-black/40 rounded-md w-full min-w-0 max-w-full h-full min-h-0 max-h-full object-contain aspect-square"
      />
    </div>
    <div
      v-else
      class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-md w-full h-full overflow-hidden"
    >
      <p class="text-white text-center">🚨 Meme image not found!</p>
      <p class="mt-1 text-red-400 text-xs text-center">
        {{ getFileName(meme) }}
      </p>
    </div>
    <!-- Modal removed: now handled as singleton in pages/index.vue -->
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useLazyImages } from '~/composables/useLazyImages'

  const props = defineProps({
    meme: Object,
    slug: String,
  })

  const { registerLazyImage } = useLazyImages()
  const lazyImg = ref(null)

  // Get the image filename for alt text
  const imageAlt = computed(() => {
    if (!props.meme?.image) return 'Meme'

    // Extract filename from image path
    const imagePath = props.meme.image
    const parts = imagePath.split('/')
    const filename = parts[parts.length - 1]

    // Remove file extension and clean up the name
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

    // Convert underscores/hyphens to spaces and capitalize words
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

    return `${cleanName}`
  })

  // Register lazy loading when component mounts
  onMounted(() => {
    if (lazyImg.value && props.meme?.image) {
      registerLazyImage(lazyImg.value)
    }
  })

  // Extract the slug from the path, handling nested paths
  const getSlug = (path) => {
    if (!path || typeof path !== 'string') {
      console.warn('⚠️ Invalid path in getSlug:', path)
      return ''
    }
    // Remove leading slash and memes prefix
    let cleanPath = path.replace(/^\/+/, '').replace(/^memes\/+/, '')
    return cleanPath
  }

  // Get the filename for error display
  const getFileName = (meme) => {
    if (!meme) {
      console.error('🚨 Broken meme: unknown-file')
      return 'unknown-file'
    }

    // Try different path properties
    const path = meme._path || meme.path || props.slug || 'unknown'

    // Extract just the filename from the path
    const parts = path.split('/')
    const filename = parts[parts.length - 1]

    // Add .md extension if not present
    const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`

    console.error('🚨 Broken meme:', finalFilename)
    return finalFilename
  }
</script>
