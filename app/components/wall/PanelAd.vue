<!-- components/wall/WallAdPanel.vue -->
<template>
  <div
    class="relative shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-shadow duration-200 wall-ad-panel"
    :class="panelClasses"
  >
    <!-- Use the UiAdBadge component -->
    <UiAdBadge :size="size" />

    <!-- Ad link wrapper -->
    <a
      v-if="ad.link"
      :href="ad.link"
      target="_blank"
      rel="noopener noreferrer sponsored"
      class="block w-full h-full"
      :title="ad.title"
      @click="trackClick"
    >
      <img
        v-if="ad.image"
        :src="ad.image"
        :alt="ad.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div
        v-else
        class="flex justify-center items-center bg-gray-200 w-full h-full"
      >
        <span class="font-300 text-gray-500 text-lg">{{ ad.title }}</span>
      </div>
    </a>

    <!-- Non-linked ad -->
    <div v-else class="w-full h-full">
      <img
        v-if="ad.image"
        :src="ad.image"
        :alt="ad.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div
        v-else
        class="flex justify-center items-center bg-gray-200 w-full h-full"
      >
        <span class="font-300 text-gray-500 text-lg">{{ ad.title }}</span>
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
      return 'w-full h-[100px] md:h-[120px]'
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
