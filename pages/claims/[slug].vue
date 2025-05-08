<!-- pages/claims/[slug].vue -->
<template>
  <div v-if="claim" class="mx-auto max-w-3xl px-4 py-8">
    <div class="p-6 mb-3 text-white bg-gray-800 rounded-lg shadow-lg">
      <div class="flex items-center gap-3 mb-4">
        <img src="../../assets/icons/npc_icon.svg" alt="NPC" class="w-10" />
        <h1 class="text-2xl font-light tracking-wide">{{ claim.claim }}</h1>
      </div>

      <hr class="border-white/10 my-4" />

      <div class="flex items-center gap-3">
        <img src="../../assets/icons/player_icon.svg" alt="Player" class="w-10" />
        <h2 class="text-2xl font-light tracking-wide">{{ claim.translation }}</h2>
      </div>
    </div>

    <Button to="index" iconLeft="heroicons:arrow-left-16-solid" text="BACK" />
  </div>
  <div v-else class="mx-auto max-w-3xl px-4 py-8 text-white">
    <p>Loading claim...</p>
    <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const claim = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    // Get the slug from the route
    const slug = route.params.slug

    // Fetch the claim data
    const response = await fetch(`/api/content?type=claims`)
    const data = await response.json()

    // Find the claim with matching slug
    const fullPath = `/claims/${slug}`
    const foundClaim = data.find((item) => item._path === fullPath)

    if (foundClaim) {
      claim.value = foundClaim
    } else {
      error.value = "Claim not found"
    }
  } catch (err) {
    console.error("Error fetching claim:", err)
    error.value = err.message
  }
})
</script>
