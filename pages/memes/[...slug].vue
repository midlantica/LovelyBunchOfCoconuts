<!-- pages/memes/[...slug].vue -->
<template>
  <ContentNavigation :prev-slug="navigation?.prevSlug" :next-slug="navigation?.nextSlug" />
  <div v-if="meme" class="mx-auto pb-3 max-w-3xl">
    <div class="bg-gray-800 shadow-lg mb-3 p-6 rounded-lg text-white">
      <h1 class="mb-2 font-light text-2xl">{{ meme.title }}</h1>

      <div class="mb-6 text-center">
        <img
          v-if="meme.image"
          :src="meme.image"
          :alt="meme.title"
          class="mx-auto rounded-lg max-w-full"
        />
        <p v-else class="text-red-500">Image not found</p>
      </div>
    </div>
  </div>
  <div v-else class="mx-auto pb-3 max-w-3xl text-white">
    <p>Loading meme...</p>
    <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useNavigation } from "~/composables/useNavigation"

const route = useRoute()
const meme = ref(null)
const error = ref(null)
const allMemes = ref([])

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

onMounted(async () => {
  try {
    // Get the slug from the route - handle nested paths
    const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
    const fullPath = `/memes/${slugParts.join("/")}`

    console.log("Fetching meme with path:", fullPath)

    // Fetch all memes data
    const response = await fetch(`/api/content?type=memes`)
    const data = await response.json()

    // Store all memes for navigation
    allMemes.value = data

    // Find the meme with matching path
    const foundMeme = data.find((item) => item._path === fullPath)

    if (foundMeme) {
      meme.value = foundMeme
      console.log("Found meme:", foundMeme)
    } else {
      console.error("Meme not found with path:", fullPath)
      console.log(
        "Available paths:",
        data.map((item) => item._path)
      )
      error.value = "Meme not found"
    }
  } catch (err) {
    console.error("Error fetching meme:", err)
    error.value = err.message
  }
})
</script>
