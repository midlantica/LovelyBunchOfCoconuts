<!-- Global error handler page -->
<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-white"
  >
    <div class="text-center">
      <h1 class="font-100 mb-4 text-4xl">
        {{
          error?.statusCode === 404 ? 'Page Not Found' : 'Something went wrong'
        }}
      </h1>
      <p class="mb-8 text-xl">
        {{
          error?.statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : "We're having trouble loading this content. Please try again."
        }}
      </p>

      <div class="space-x-4">
        <NuxtLink
          to="/"
          class="bg-union-blue-600 hover:bg-union-blue-700 font-100 inline-block rounded-lg px-6 py-3 text-white transition-colors"
        >
          Return to Home
        </NuxtLink>

        <button
          v-if="searchQuery"
          @click="searchFromHome"
          class="font-100 inline-block rounded-lg bg-slate-700 px-6 py-3 text-white transition-colors hover:bg-slate-600"
        >
          Search for "{{ searchQuery }}"
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    error: Object,
  })

  const route = useRoute()
  const router = useRouter()

  // Extract search query from URL if present
  const searchQuery = computed(() => {
    // Try to get from query params
    if (route.query.q) return route.query.q

    // Try to extract from path
    const path = route.path || error?.url || ''
    const parts = path.split('/').filter(Boolean)
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1]
      return lastPart.replace(/-/g, ' ')
    }

    return ''
  })

  const searchFromHome = () => {
    router.push({
      path: '/',
      query: { q: searchQuery.value },
    })
  }

  // Auto-redirect if we have a search query
  onMounted(() => {
    if (searchQuery.value && route.query.q) {
      // If we're already on a search URL that failed, redirect to home with search
      setTimeout(() => {
        searchFromHome()
      }, 2000)
    }
  })
</script>
