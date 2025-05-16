<!-- pages/memes/[...slug].vue -->
<template>
  <div class="mx-auto pb-3 max-w-3xl">
    <div
      v-if="meme"
      class="bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mb-3 p-3 rounded-lg text-white"
    >
      <!-- Main meme content - just the image, no title -->

      <div class="mb-4 text-center">
        <img
          v-if="extractedImageUrl"
          :src="extractedImageUrl"
          :alt="meme.title"
          class="mx-auto rounded-lg max-h-[60vh]"
          loading="eager"
          @error="handleImageError"
        />
        <p v-if="imageError || !extractedImageUrl" class="text-red-500">Image not found</p>
      </div>

      <!-- Full markdown content -->
      <div v-if="markdownContent" class="px-3">
        <div class="prose-invert max-w-none prose prose-sm" v-html="markdownContent"></div>
      </div>
    </div>

    <!-- Only show loading state on initial page load, not during navigation -->
    <div v-else-if="initialLoad" class="bg-slate-800 shadow-lg mb-3 p-6 rounded-lg text-white">
      <p>Loading meme...</p>
      <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
    </div>

    <!-- Placeholder during navigation to prevent layout shift -->
    <div
      v-else
      class="flex justify-center items-center bg-slate-800 shadow-lg mb-3 p-6 rounded-lg min-h-[300px] text-white"
    >
      <div class="flex flex-col items-center">
        <Icon name="svg-spinners:90-ring-with-bg" size="2rem" class="mb-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useNavigation } from "~/composables/useNavigation"
import { useContentCache } from "~/composables/useContentCache"
import MarkdownIt from "markdown-it"

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// Define page transition with dynamic direction and layout
definePageMeta({
  layout: "content-detail",
  pageTransition: {
    name: "slide-right",
    mode: "out-in",
  },
  middleware(to, from) {
    // Default to slide-right
    let transitionName = "slide-right"

    // If we have navigation info in localStorage, use it to determine direction
    if (typeof window !== "undefined") {
      const navDirection = localStorage.getItem("navDirection")
      if (navDirection === "next") {
        transitionName = "slide-left"
      } else if (navDirection === "prev") {
        transitionName = "slide-right"
      }
      // Clear the stored direction
      localStorage.removeItem("navDirection")
    }

    // Apply the transition
    if (to.meta.pageTransition && typeof to.meta.pageTransition !== "boolean") {
      to.meta.pageTransition.name = transitionName
    }
  },
})

const route = useRoute()
const router = useRouter()
const meme = ref(null)
const error = ref(null)
const allMemes = ref([])
const initialLoad = ref(true)
const imageError = ref(false)
const extractedImageUrl = ref(null)
const markdownContent = ref(null)

// Get content cache
const { getAllContent, getContentItem, prefetchContentItem } = useContentCache()

// Extract image URL from markdown content
const extractImageUrl = (content) => {
  if (!content) return null

  // Look for markdown image syntax: ![alt text](image-url)
  const imageRegex = /!\[.*?\]\(([^)]+)\)/
  const match = content.match(imageRegex)

  if (match && match[1]) {
    return match[1]
  }

  // If no markdown image, check if there's an image property
  return null
}

// Extract markdown content from the body
const extractMarkdownContent = (body) => {
  if (!body) return null

  // Remove the frontmatter section
  const contentWithoutFrontmatter = body.replace(/^---[\s\S]*?---/, "").trim()

  // Find the image markdown
  const imageMatch = contentWithoutFrontmatter.match(/!\[.*?\]\(.*?\)/)

  if (imageMatch) {
    // Get the content after the image
    const contentAfterImage = contentWithoutFrontmatter
      .substring(imageMatch.index + imageMatch[0].length)
      .trim()

    // Remove the title line if it exists (it's often just the filename repeated)
    const titleLine = meme.value?.title || ""
    const contentWithoutTitle = contentAfterImage
      .replace(new RegExp(`^${titleLine}\\s*$`, "m"), "")
      .trim()

    // Look for "### Explained:" or any other content
    const explainedMatch = contentWithoutTitle.match(/###\s+Explained:[\s\S]*/i)

    if (explainedMatch) {
      // Get the content starting from "### Explained:"
      return md.render(explainedMatch[0])
    } else if (contentWithoutTitle) {
      // If there's any content left after removing the image and title
      return md.render(contentWithoutTitle)
    }
  }

  return null
}

// Handle image load errors
const handleImageError = () => {
  console.log("Image failed to load")
  imageError.value = true
}

// Get the current slug from the route
const currentSlug = computed(() => {
  const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
  return slugParts.join("/")
})

// Format memes for navigation
const formattedMemes = computed(() => {
  return allMemes.value.map((item) => ({
    path: item._path,
  }))
})

// Use the navigation composable
const navigation = computed(() => {
  // Only call useNavigation when we have memes loaded
  if (allMemes.value.length > 0) {
    return useNavigation(formattedMemes, currentSlug.value, "/memes").value
  }
  return { prevSlug: "/", nextSlug: "/" }
})

// Update navigation data for the layout
watch(
  navigation,
  (newNavigation) => {
    if (newNavigation) {
      route.meta.navigation = {
        prevSlug: newNavigation.prevSlug,
        nextSlug: newNavigation.nextSlug,
        contentType: "memes",
      }
    }
  },
  { immediate: true, deep: true }
)

// Load meme content
const loadMeme = async () => {
  try {
    // Reset image error state, extracted URL, and markdown content
    imageError.value = false
    extractedImageUrl.value = null
    markdownContent.value = null

    // Get the slug from the route - handle nested paths
    const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
    const slug = slugParts.join("/")
    const fullPath = `/memes/${slug}`

    console.log("Fetching meme with path:", fullPath)

    // First, ensure we have all memes for navigation
    if (allMemes.value.length === 0) {
      const data = await getAllContent("memes")
      allMemes.value = data || []
    }

    // Get the specific meme
    const foundMeme = await getContentItem("memes", slug)

    if (foundMeme && !foundMeme.error) {
      meme.value = foundMeme
      console.log("Found meme:", foundMeme)

      // Extract image URL from body or use image property
      if (foundMeme.body) {
        extractedImageUrl.value = extractImageUrl(foundMeme.body)
      }

      if (!extractedImageUrl.value && foundMeme.image) {
        extractedImageUrl.value = foundMeme.image
      }

      console.log("Extracted image URL:", extractedImageUrl.value)

      // Extract markdown content
      if (foundMeme.body) {
        markdownContent.value = extractMarkdownContent(foundMeme.body)
        console.log("Extracted markdown content:", !!markdownContent.value)
      }

      // Prefetch adjacent memes for smoother navigation
      if (navigation.value.prevSlug) {
        prefetchContentItem(navigation.value.prevSlug)
      }
      if (navigation.value.nextSlug) {
        prefetchContentItem(navigation.value.nextSlug)
      }
    } else {
      console.error("Meme not found with path:", fullPath)
      error.value = "Meme not found"
    }
  } catch (err) {
    console.error("Error fetching meme:", err)
    error.value = err.message
  } finally {
    // After first load, set initialLoad to false
    initialLoad.value = false
  }
}

// Watch for route changes to load new content without showing loading state
watch(
  () => route.params.slug,
  () => {
    // Clear current meme to show placeholder during navigation
    meme.value = null
    error.value = null

    // Load the new meme
    loadMeme()
  }
)

// Initial load
onMounted(() => {
  loadMeme()
})
</script>

<style>
/* Basic styling for the markdown content */
.prose p {
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}
.prose h2 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 300;
}
.prose h3 {
  font-size: 1.25rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}
.prose img {
  margin: 1.5rem auto;
  border-radius: 0.375rem;
  max-width: 100%;
}
</style>
