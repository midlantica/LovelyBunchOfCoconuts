<!-- pages/memes/[slug].vue -->
<template>
  <div v-if="meme" class="mx-auto max-w-3xl px-4 py-8">
    <div class="p-6 mb-3 text-white bg-gray-800 rounded-lg shadow-lg">
      <h1 class="mb-6 text-2xl font-light">{{ meme.title }}</h1>

      <div class="mb-6 text-center">
        <img
          v-if="meme.image"
          :src="meme.image"
          :alt="meme.title"
          class="mx-auto max-w-full rounded-lg"
        />
        <p v-else class="text-red-500">Image not found</p>
      </div>
    </div>

    <Button to="/" iconLeft="heroicons:arrow-left-16-solid" text="BACK" />
  </div>
  <div v-else class="mx-auto max-w-3xl px-4 py-8 text-white">
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
    // Get the slug from the route
    const slug = route.params.slug

    // Fetch the meme data
    const response = await fetch(`/api/content?type=memes`)
    const data = await response.json()

    // Find the meme with matching slug at the end of the path
    const foundMeme = data.find((item) => {
      if (!item._path) return false;
      const pathParts = item._path.split('/');
      const itemSlug = pathParts[pathParts.length - 1];
      return itemSlug === slug;
    })

    if (foundMeme) {
      meme.value = foundMeme
      console.log("Found meme:", foundMeme)
    } else {
      console.error("Meme not found for slug:", slug)
      console.log("Available paths:", data.map(item => item._path))
      error.value = "Meme not found"
    }
  } catch (err) {
    console.error("Error fetching meme:", err)
    error.value = err.message
  }
})
</script>
