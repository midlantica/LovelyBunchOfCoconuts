<!-- pages/memes/[...slug].vue -->
<template>
  <div v-if="meme" class="mx-auto py-2 max-w-3xl">
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

    <Button to="/" iconLeft="heroicons:arrow-left-16-solid" text="BACK" />
  </div>
  <div v-else class="mx-auto py-2 max-w-3xl text-white">
    <p>Loading meme...</p>
    <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const meme = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    // Get the slug from the route - handle nested paths
    const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
    const fullPath = `/memes/${slugParts.join('/')}`
    
    console.log("Fetching meme with path:", fullPath)

    // Fetch the meme data
    const response = await fetch(`/api/content?type=memes`)
    const data = await response.json()

    // Find the meme with matching path
    const foundMeme = data.find((item) => item._path === fullPath)

    if (foundMeme) {
      meme.value = foundMeme
      console.log("Found meme:", foundMeme)
    } else {
      console.error("Meme not found with path:", fullPath)
      console.log("Available paths:", data.map(item => item._path))
      error.value = "Meme not found"
    }
  } catch (err) {
    console.error("Error fetching meme:", err)
    error.value = err.message
  }
})
</script>
