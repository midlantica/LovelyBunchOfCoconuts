<!-- components/wall/WallAdPanel.vue -->
<template>
  <div
    class="wall-ad-panel relative overflow-hidden rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
    :class="panelClasses"
  >
    <!-- Ad link wrapper -->
    <a
      v-if="ad.link"
      :href="adHref"
      :target="adIsExternal ? '_blank' : '_self'"
      rel="noopener noreferrer sponsored"
      class="block w-full"
      :title="ad.title"
      @click="trackClick"
    >
      <img
        v-if="ad.image"
        :src="ad.image"
        :alt="ad.title"
        class="h-auto w-full object-contain"
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
    <div v-else class="w-full">
      <img
        v-if="ad.image"
        :src="ad.image"
        :alt="ad.title"
        class="h-auto w-full object-contain"
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

  // Resolve ad link — strip the production origin so same-site links work in dev too
  const PROD_ORIGIN = 'https://wakeupnpc.com'
  const adHref = computed(() => {
    const link = props.ad?.link
    if (!link) return '#'
    // If the link starts with the production origin, make it relative
    if (link.startsWith(PROD_ORIGIN)) {
      return link.slice(PROD_ORIGIN.length) || '/'
    }
    return link
  })
  // Open in same tab for internal links, new tab for external
  const adIsExternal = computed(() => {
    const link = props.ad?.link
    if (!link) return false
    // After stripping prod origin, check if it's still an absolute URL
    return link.startsWith('http') && !link.startsWith(PROD_ORIGIN)
  })

  // Compute panel classes based on size
  const panelClasses = computed(() => {
    if (props.size === 'horizontal') {
      // Horizontal ads (for quote slots) - full width, fixed height
      // Using fixed height instead of aspect ratio to avoid rendering issues
      return 'w-full h-auto _tw-keep-horizontal'
    } else {
      // Square ads (for claim/meme slots) - aspect square
      return 'aspect-square w-full _tw-keep-square'
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

  /*
    Critical: ensure Tailwind height/width utility classes are not tree-shaken.
    In production, the panel sizing classes are generated dynamically in JS
    (computed() returning strings like 'w-full h-[90px]' / 'aspect-square w-full').
    Tailwind JIT can miss these and omit the CSS, causing the horizontal ad panel
    to collapse to ~0px height (you see the background but not the image).

    These @apply rules force Tailwind to always emit the required utilities.
  */
  ._tw-keep-horizontal {
    @apply h-auto w-full;
  }
  ._tw-keep-square {
    @apply aspect-square w-full;
  }
</style>
