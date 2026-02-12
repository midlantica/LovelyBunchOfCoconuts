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

    // ── Instant in-place reseed (no loading spinner) ──
    // Content is already cached in memory. We just reseed the wall seed
    // and let TheWall's computed property rebuild the baseline synchronously.
    // This avoids the slow flash-of-loading that isWallRefreshing caused.

    // Clear search and filters FIRST (before reseed) so the baseline path
    // is active when the seed change triggers the rebuild.
    const searchTerm = useState('searchTerm')
    const contentFilters = useState('contentFilters')
    if (searchTerm?.value) searchTerm.value = ''
    if (contentFilters?.value) {
      contentFilters.value = { grifts: true, quotes: true, memes: true }
    }

    // Try to use pre-computed layout for truly instant refresh
    const precomputedLayout = usePrecomputedRefresh(
      cache.grifts,
      cache.quotes,
      cache.memes,
      cache.profiles || []
    )

    if (precomputedLayout) {
      // usePrecomputedRefresh already set wallSeed to the precomputed seed.
      // Inject the precomputed layout directly into the baseline state
      // so TheWall doesn't have to rebuild it from scratch.
      const baselineState = useState('wallBaselinePattern')
      if (baselineState.value) {
        const { wallSeed } = useWallSeed()
        const { deriveBaselineOrder } = useWallBaseline()

        const order = deriveBaselineOrder(precomputedLayout)

        baselineState.value = {
          ...baselineState.value,
          seed: wallSeed.value,
          pattern: precomputedLayout,
          order,
          grifts: cache.grifts.length,
          quotes: cache.quotes.length,
          memes: cache.memes.length,
          rebuilding: false,
        }
      }
    } else {
      // No precomputed layout — just reseed. TheWall's computed will
      // detect the seed change and rebuild the baseline instantly
      // since all content is already cached in memory.
      reseedWall('logo click')
    }

    // Scroll to top for the fresh view
    const scrollEl = document.querySelector('.scroll-container-stable')
    if (scrollEl) scrollEl.scrollTop = 0
    else window.scrollTo(0, 0)
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
