<!-- components/TheHeader.vue -->
<template>
  <header
    class="sticky top-0 left-0 z-10 w-full bg-slate-900 px-2 pt-2 pb-1 sm:p-0 sm:pt-2 sm:pb-1"
  >
    <div class="pr-2 pl-4 sm:pr-4">
      <!-- Flex container with three sections for balanced layout -->
      <div class="flex items-center justify-between">
        <!-- Left spacer (same width as hamburger menu) - hidden on mobile -->
        <div class="hidden w-10 sm:block"></div>

        <!-- Center logo on desktop, left-aligned on mobile -->
        <div class="flex flex-1 justify-center">
          <button
            type="button"
            class="no-underline hover:cursor-pointer! focus:outline-none"
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

      // Reseed the wall to get new random content
      reseedWall()

      // Try to use pre-computed layout for instant refresh
      const precomputedLayout = usePrecomputedRefresh(
        cache.grifts,
        cache.quotes,
        cache.memes,
        cache.profiles || []
      )

      if (precomputedLayout) {
        // Instant refresh using pre-computed layout!
        if (import.meta.dev) {
        }

        // Clear search and filters
        const searchTerm = useState('searchTerm')
        const contentFilters = useState('contentFilters')
        if (searchTerm?.value) searchTerm.value = ''
        if (contentFilters?.value) {
          contentFilters.value = { grifts: true, quotes: true, memes: true }
        }
        await router.replace({ path: route.path, query: {} })

        // Brief visual feedback (much shorter since it's instant)
        await new Promise((resolve) => setTimeout(resolve, 100))
      } else {
        // Fallback to full page reload if no pre-computed layout available
        if (import.meta.dev) {
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
