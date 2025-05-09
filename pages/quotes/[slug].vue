<!-- pages/quotes/[slug].vue -->
<template>
  <div v-if="quote" class="mx-auto max-w-3xl px-6 py-3">
    <div class="flex flex-col flex-wrap gap-1 p-6 text-slate-100 bg-gray-800 rounded-lg shadow-lg">
      <h1 class="text-2xl font-light tracking-wide">
        {{ quote.headings && quote.headings.length > 0 ? quote.headings[0] : quote.title }}
      </h1>
      <p class="text-xl font-light tracking-wide text-slate-200" v-if="quote.attribution">
        — {{ quote.attribution }}
      </p>
    </div>

    <Button to="index" iconLeft="heroicons:arrow-left-16-solid" text="BACK" />
  </div>
  <div v-else class="mx-auto max-w-3xl px-6 py-4 text-white">
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
    // Get the slug from the route
    const slug = route.params.slug

    // Fetch the quote data
    const response = await fetch(`/api/content?type=quotes`)
    const data = await response.json()

    // Find the quote with matching slug
    const fullPath = `/quotes/${slug}`
    const foundQuote = data.find((item) => item._path === fullPath)

    if (foundQuote) {
      quote.value = foundQuote
    } else {
      error.value = "Quote not found"
    }
  } catch (err) {
    console.error("Error fetching quote:", err)
    error.value = err.message
  }
})
</script>
