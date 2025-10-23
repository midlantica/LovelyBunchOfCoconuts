<!-- components/TheHeader.vue -->
<template>
  <header class="top-0 left-0 z-10 sticky bg-slate-900 pt-2 pb-1 w-full">
    <div class="px-6">
      <!-- Flex container with three sections for balanced layout -->
      <div class="flex justify-between items-center">
        <!-- Left spacer (same width as hamburger menu) - hidden on mobile -->
        <div class="hidden sm:block w-10"></div>

        <!-- Center logo on desktop, left-aligned on mobile -->
        <div class="flex flex-1 justify-center">
          <button
            type="button"
            class="focus:outline-none no-underline hover:cursor-pointer"
            @click="handleMastheadClick"
          >
            <LogoComponent />
          </button>
        </div>

        <!-- Right navigation menu -->
        <div class="w-10">
          <LayoutNavigationMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  const { reseedWall } = useWallSeed()
  const route = useRoute()
  const router = useRouter()

  // Global loading state for wall refresh
  const isWallRefreshing = useState('isWallRefreshing', () => false)

  // Pre-computation system for instant refreshes
  const { usePrecomputedRefresh } = useWallPrecomputation()
  const { cache } = useContentCache()

  async function handleMastheadClick() {
    if (isWallRefreshing.value) return // Prevent multiple clicks

    // If on a sub page (not index), navigate to home
    if (route.path !== '/') {
      await router.push('/')
      return
    }

    // Otherwise, do wall refresh logic
    try {
      isWallRefreshing.value = true

      // Try to use pre-computed layout for instant refresh
      const precomputedLayout = usePrecomputedRefresh(
        cache.claims,
        cache.quotes,
        cache.memes
      )

      if (precomputedLayout) {
        // Instant refresh using pre-computed layout!
        if (import.meta.dev) {
          console.log('⚡ Instant refresh using pre-computed layout!')
        }

        // Clear search and filters
        const searchTerm = useState('searchTerm')
        const contentFilters = useState('contentFilters')
        if (searchTerm?.value) searchTerm.value = ''
        if (contentFilters?.value) {
          contentFilters.value = { claims: true, quotes: true, memes: true }
        }
        await router.replace({ path: route.path, query: {} })

        // Brief visual feedback (much shorter since it's instant)
        await new Promise((resolve) => setTimeout(resolve, 100))
      } else {
        // Fallback to full page reload if no pre-computed layout available
        if (import.meta.dev) {
          console.log(
            '🔄 No pre-computed layout available, using page reload fallback'
          )
        }

        const currentUrl = new URL(window.location)
        currentUrl.search = '' // Remove all query parameters
        window.location.href = currentUrl.toString()
        return // Don't set isWallRefreshing to false since we're reloading
      }
    } finally {
      isWallRefreshing.value = false
    }
  }
</script>

<style scoped>
  /* Logo hover effects */
  .logo-hover-effect {
    transition: filter 0.5s ease-in-out;
  }

  .logo-hover-effect:hover {
    filter: brightness(0.8) contrast(1.1);
  }
</style>
