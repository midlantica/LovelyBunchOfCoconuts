<!-- pages/claims/[...slug].vue -->
<template>
  <div class="mx-auto pb-3 max-w-3xl">
    <div
      v-if="claim"
      class="bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mb-3 p-6 rounded-lg text-white"
    >
      <!-- Main claim content -->

      <div class="flex items-center gap-3 mb-4">
        <img src="../../assets/icons/npc_icon.svg" alt="NPC" class="w-10" />
        <h1 class="font-light text-2xl tracking-wide">{{ claim.claim }}</h1>
      </div>

      <hr class="my-4 border-white/10" />

      <div class="flex items-center gap-3">
        <img src="../../assets/icons/player_icon.svg" alt="Player" class="w-10" />
        <h2 class="font-light text-2xl tracking-wide">{{ claim.translation }}</h2>
      </div>

      <!-- Full markdown content -->
      <div v-if="markdownContent" class="mt-6 pt-4 border-slate-700 border-t">
        <div class="prose-invert max-w-none prose prose-sm" v-html="markdownContent"></div>
      </div>
    </div>

    <!-- Only show loading state on initial page load, not during navigation -->
    <div v-else-if="initialLoad" class="bg-slate-800 shadow-lg mb-3 p-6 rounded-lg text-white">
      <p>Loading claim...</p>
      <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
    </div>

    <!-- Placeholder during navigation to prevent layout shift -->
    <div
      v-else
      class="flex justify-center items-center bg-slate-800 shadow-lg mb-3 p-6 rounded-lg min-h-[200px] text-white"
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
const claim = ref(null)
const error = ref(null)
const allClaims = ref([])
const initialLoad = ref(true)
const markdownContent = ref(null)

// Get content cache
const { getAllContent, getContentItem, prefetchContentItem } = useContentCache()

// Extract markdown content from the body
const extractMarkdownContent = (body) => {
  if (!body) return null

  // Remove the frontmatter section
  const contentWithoutFrontmatter = body.replace(/^---[\s\S]*?---/, "").trim()

  // Find all heading sections
  const sections = contentWithoutFrontmatter.split(/^##\s+/m)

  // We need to skip the first two sections (claim and translation)
  if (sections.length > 2) {
    // Skip the first two sections and look for any additional content
    const remainingSections = sections.slice(2)

    // Check if there's any non-empty content in the remaining sections
    const additionalContent = remainingSections
      .filter((section) => section.trim())
      .join("\n\n")
      .trim()

    if (additionalContent) {
      // Process the content to remove any redundant headings that match the translation
      const translation = claim.value?.translation || ""
      const cleanedContent = additionalContent
        .replace(new RegExp(`^${translation}\\s*$`, "mi"), "")
        .trim()

      if (cleanedContent) {
        // Convert markdown to HTML, but don't add back the heading markers
        return md.render(cleanedContent)
      }
    }
  }

  return null
}

// Get the current slug from the route
const currentSlug = computed(() => {
  const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
  return slugParts.join("/")
})

// Format claims for navigation
const formattedClaims = computed(() => {
  return allClaims.value.map((item) => ({
    path: item._path,
  }))
})

// Use the navigation composable
const navigation = computed(() => {
  // Only call useNavigation when we have claims loaded
  if (allClaims.value.length > 0) {
    return useNavigation(formattedClaims, currentSlug.value, "/claims").value
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
        contentType: "claims",
      }
    }
  },
  { immediate: true, deep: true }
)

// Load claim content
const loadClaim = async () => {
  try {
    // Reset markdown content
    markdownContent.value = null

    // Get the slug from the route - handle nested paths
    const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
    const slug = slugParts.join("/")
    const fullPath = `/claims/${slug}`

    console.log("Fetching claim with path:", fullPath)

    // First, ensure we have all claims for navigation
    if (allClaims.value.length === 0) {
      const data = await getAllContent("claims")
      allClaims.value = data || []
    }

    // Get the specific claim
    const foundClaim = await getContentItem("claims", slug)

    if (foundClaim && !foundClaim.error) {
      claim.value = foundClaim
      console.log("Found claim:", foundClaim)

      // Extract markdown content
      if (foundClaim.body) {
        markdownContent.value = extractMarkdownContent(foundClaim.body)
        console.log("Extracted markdown content:", !!markdownContent.value)
      }

      // Prefetch adjacent claims for smoother navigation
      if (navigation.value.prevSlug) {
        prefetchContentItem(navigation.value.prevSlug)
      }
      if (navigation.value.nextSlug) {
        prefetchContentItem(navigation.value.nextSlug)
      }
    } else {
      console.error("Claim not found with path:", fullPath)
      error.value = "Claim not found"
    }
  } catch (err) {
    console.error("Error fetching claim:", err)
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
    // Clear current claim to show placeholder during navigation
    claim.value = null
    error.value = null

    // Load the new claim
    loadClaim()
  }
)

// Initial load
onMounted(() => {
  loadClaim()
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
