<!-- pages/claims/[slug].vue -->
<template>
  <div v-if="claim" class="mx-auto py-2 max-w-3xl">
    <div class="bg-gray-800 shadow-lg mb-3 p-6 rounded-lg text-white">
      <div class="flex items-center gap-3 mb-4">
        <img src="../../assets/icons/npc_icon.svg" alt="NPC" class="w-10" />
        <h1 class="font-light text-2xl tracking-wide">{{ claim.claim }}</h1>
      </div>

      <hr class="my-4 border-white/10" />

      <div class="flex items-center gap-3">
        <img src="../../assets/icons/player_icon.svg" alt="Player" class="w-10" />
        <h2 class="font-light text-2xl tracking-wide">{{ claim.translation }}</h2>
      </div>
    </div>

    <Button to="index" iconLeft="heroicons:arrow-left-16-solid" text="BACK" />
  </div>
  <div v-else class="mx-auto py-2 max-w-3xl text-white">
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
