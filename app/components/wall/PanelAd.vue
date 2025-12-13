<!-- components/wall/WallAdPanel.vue -->
<template>
  <div
    class="wall-ad-panel relative overflow-hidden rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
    :class="panelClasses"
  >
    <!-- Ad link wrapper -->
    <a
      v-if="ad.link"
      :href="ad.link"
      target="_blank"
      rel="noopener noreferrer sponsored"
      class="block h-full w-full"
      :title="ad.title"
      @click="trackClick"
    >
      <img
        v-if="ad.image"
        :src="ad.image"
        :alt="ad.title"
        class="h-full w-full object-contain"
        @error="handleImageError"
        loading="eager"
        fetchpriority="high"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gray-200"
      >
        <span class="font-300 text-lg text-gray-500">{{ ad.title }}</span>
      </div>
    </a>

    <!-- Non-linked ad -->
    <div v-else class="h-full w-full">
      <img
        v-if="ad.image"
        :src="ad.image"
        :alt="ad.title"
        class="h-full w-full object-contain"
        @error="handleImageError"
        loading="eager"
        fetchpriority="high"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gray-200"
      >
        <span class="font-300 text-lg text-gray-500">{{ ad.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    ad: {
      type: Object,
      required: true,
    },
    size: {
      type: String,
      default: 'square',
      validator: (value) => ['square', 'horizontal'].includes(value),
    },
  })

  // Compute panel classes based on size
  const panelClasses = computed(() => {
    if (props.size === 'horizontal') {
      // Horizontal ads (for quote slots) - full width, fixed height
      // Using fixed height instead of aspect ratio to avoid rendering issues
      return 'w-full h-[90px]'
    } else {
      // Square ads (for claim/meme slots) - aspect square
      return 'aspect-square w-full'
    }
  })

  // Track ad clicks (for analytics)
  const trackClick = () => {
    if (import.meta.client) {
      // Here you could send analytics events
    }
  }

  // Handle image loading errors
  const handleImageError = (event) => {
    console.error('Failed to load ad image:', props.ad.image)
    // Could set a fallback image here if needed
  }
</script>

<style scoped>
  .wall-ad-panel {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  }
</style>
