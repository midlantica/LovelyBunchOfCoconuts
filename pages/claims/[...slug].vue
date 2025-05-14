<!-- pages/claims/[...slug].vue -->
<template>
  <ContentNavigation :prev-slug="navigation?.prevSlug" :next-slug="navigation?.nextSlug" />
  <div v-if="claim" class="mx-auto pb-3 max-w-3xl">
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
  </div>
  <div v-else class="mx-auto pb-3 max-w-3xl text-white">
    <p>Loading claim...</p>
    <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useNavigation } from "~/composables/useNavigation"

const route = useRoute()
const claim = ref(null)
const error = ref(null)
const allClaims = ref([])

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

onMounted(async () => {
  try {
    // Get the slug from the route - handle nested paths
    const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
    const fullPath = `/claims/${slugParts.join("/")}`

    console.log("Fetching claim with path:", fullPath)

    // Fetch all claims data
    const response = await fetch(`/api/content?type=claims`)
    const data = await response.json()

    // Store all claims for navigation
    allClaims.value = data

    // Find the claim with matching path
    const foundClaim = data.find((item) => item._path === fullPath)

    if (foundClaim) {
      claim.value = foundClaim
      console.log("Found claim:", foundClaim)
    } else {
      console.error("Claim not found with path:", fullPath)
      console.log(
        "Available paths:",
        data.map((item) => item._path)
      )
      error.value = "Claim not found"
    }
  } catch (err) {
    console.error("Error fetching claim:", err)
    error.value = err.message
  }
})
</script>
