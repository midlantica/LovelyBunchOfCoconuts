<!-- components/ContentNavigation.vue -->
<template>
  <div class="flex flex-wrap justify-between gap-3">
    <button
      class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded-sm text-slate-400 hover:text-white"
      @click.prevent="goHome"
    >
      <Icon name="heroicons:home-20-solid" size="1.25rem" />
    </button>
    <div class="flex gap-4">
      <button
        class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"
        @click.prevent="goToPrev"
        :disabled="!prevSlug"
        :class="{ 'opacity-50 cursor-not-allowed': !prevSlug }"
      >
        <Icon name="heroicons:arrow-left-16-solid" size="1.5rem" />
      </button>
      <button
        class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"
        @click.prevent="goToNext"
        :disabled="!nextSlug"
        :class="{ 'opacity-50 cursor-not-allowed': !nextSlug }"
      >
        <Icon name="heroicons:arrow-right-16-solid" size="1.5rem" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { onMounted, watch } from "vue"

const router = useRouter()
const props = defineProps({
  prevSlug: String,
  nextSlug: String,
  contentType: {
    type: String,
    default: "",
  },
})

// Pre-fetch content for smoother navigation - without using router.prefetch
const prefetchContent = async (slug) => {
  if (!slug || slug === "/") return

  try {
    // Extract the content type from the slug path
    const pathParts = slug.split("/")
    const contentType = pathParts[1] // e.g., 'claims', 'quotes', 'memes'

    // Only prefetch if we have a valid content type
    if (contentType && ["claims", "quotes", "memes"].includes(contentType)) {
      console.log(`Pre-fetching content for: ${slug}`)

      // Prefetch the actual content data
      const slugParts = pathParts.slice(2)
      const fullPath = `/${contentType}/${slugParts.join("/")}`

      // Fetch the specific content item
      await fetch(`/api/content/item?path=${encodeURIComponent(fullPath)}`, {
        method: "GET",
        headers: {
          "X-Purpose": "prefetch",
        },
      })

      console.log(`Pre-fetched content for: ${slug}`)
    }
  } catch (error) {
    console.error(`Error pre-fetching content for ${slug}:`, error)
  }
}

// Pre-fetch content when component mounts
onMounted(() => {
  if (props.prevSlug) prefetchContent(props.prevSlug)
  if (props.nextSlug) prefetchContent(props.nextSlug)
})

// Watch for changes in navigation props to prefetch new content
watch(
  () => props.prevSlug,
  (newSlug) => {
    if (newSlug) prefetchContent(newSlug)
  }
)

watch(
  () => props.nextSlug,
  (newSlug) => {
    if (newSlug) prefetchContent(newSlug)
  }
)

// Navigation functions with debounce to prevent double-click issues
let isNavigating = false

const goHome = () => {
  if (isNavigating) return
  isNavigating = true

  router.push("/")

  // Reset after a short delay
  setTimeout(() => {
    isNavigating = false
  }, 300)
}

const goToPrev = () => {
  if (isNavigating || !props.prevSlug) return
  isNavigating = true

  // Store navigation direction in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("navDirection", "prev")
  }

  router.push(props.prevSlug)

  // Reset after a short delay
  setTimeout(() => {
    isNavigating = false
  }, 300)
}

const goToNext = () => {
  if (isNavigating || !props.nextSlug) return
  isNavigating = true

  // Store navigation direction in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("navDirection", "next")
  }

  router.push(props.nextSlug)

  // Reset after a short delay
  setTimeout(() => {
    isNavigating = false
  }, 300)
}
</script>
