<!-- pages/quotes/[...slug].vue -->
<template>
  <div v-if="quote" class="mx-auto px-0 py-2 max-w-3xl">
    <div class="flex flex-col flex-wrap gap-1 bg-gray-800 shadow-lg p-6 rounded-lg text-slate-100">
      <h1 class="font-light text-2xl tracking-wide">
        {{ quote.headings && quote.headings.length > 0 ? quote.headings[0] : quote.title }}
      </h1>
      <p class="font-light text-slate-200 text-xl tracking-wide" v-if="quote.attribution">
        — {{ quote.attribution }}
      </p>
    </div>

    <Button to="index" iconLeft="heroicons:arrow-left-16-solid" text="BACK" />
  </div>
  <div v-else class="mx-auto px-0 py-2 max-w-3xl text-white">
    <p>Loading quote...</p>
    <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const quote = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    // Get the slug from the route - handle nested paths
    const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
    const fullPath = `/quotes/${slugParts.join('/')}`
    
    console.log("Fetching quote with path:", fullPath)

    // Fetch the quote data
    const response = await fetch(`/api/content?type=quotes`)
    const data = await response.json()

    // Find the quote with matching path
    const foundQuote = data.find((item) => item._path === fullPath)

    if (foundQuote) {
      quote.value = foundQuote
      console.log("Found quote:", foundQuote)
    } else {
      console.error("Quote not found with path:", fullPath)
      console.log("Available paths:", data.map(item => item._path))
      error.value = "Quote not found"
    }
  } catch (err) {
    console.error("Error fetching quote:", err)
    error.value = err.message
  }
})
</script>
