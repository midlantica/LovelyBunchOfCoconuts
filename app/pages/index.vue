<!-- pages/index.vue -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="gap-3 grid grid-rows-[auto_1fr] px-0 h-full overflow-hidden">
    <!-- Search Bar -->
    <div class="flex justify-center">
      <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
        <SearchbarSearchBar
          v-model:search="searchTerm"
          v-model:filters="contentFilters"
          :counts="liveCounts"
          class="top-0 z-5 sticky w-full"
        />
      </div>
    </div>

    <!-- Content Wall -->
    <div
      class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
    >
      <div class="mx-auto md:px-0 pr-3 pl-2 w-full max-w-screen-md">
        <main class="pb-8">
          <WallTheWall
            :search="searchTerm"
            :filters="contentFilters"
            @counts="handleCounts"
            @modal="handleModalEvent"
            @content-updated="handleContentUpdated"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
  // Simple SSR-safe search/filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))
  // Persist wall scroll position globally
  const wallScrollTop = useState('wallScrollTop', () => 0)

  const route = useRoute()
  const router = useRouter()

  // Get modal handlers from layout
  const openModal = inject('openModal')
  const isModalOpen = inject('isModalOpen', ref(false))

  // Client-only init: query handling, scroll persistence, and hash routing
  if (import.meta.client) {
    let cleanupScroll = null
    const handleHashChange = () => {
      const hash = window.location.hash
      if (!hash || (isModalOpen && isModalOpen.value)) return
      const match = hash.match(/^(#)(claim|quote|meme)[\/-](.+)$/)
      if (match) {
        const [, , contentType, slug] = match
        try {
          const u = new URL(window.location.href)
          u.hash = ''
          window.history.replaceState({}, '', u.toString())
        } catch {}
        openContentFromSlug(contentType, slug)
      }
    }

    const initClient = () => {
      // 1) Handle ?q= and ?nf= with better error handling
      try {
        const modalSuppressed = useState(
          'modalSuppressedFromQuery',
          () => false
        )

        // Parse query string manually to preserve + as separator (not decode to space)
        const queryString = window.location.search.substring(1)
        const params = new URLSearchParams()
        let rawQ = ''

        // Manually parse to get raw q value before URL decoding
        if (queryString) {
          const pairs = queryString.split('&')
          for (const pair of pairs) {
            const [key, value] = pair.split('=')
            if (key === 'q' && value) {
              // Don't use decodeURIComponent yet - keep + as is
              rawQ = value.replace(/_/g, ' ') // Convert underscores to spaces
              // Only decode %XX sequences, not +
              try {
                rawQ = rawQ.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
                  return String.fromCharCode(parseInt(hex, 16))
                })
              } catch (e) {
                console.warn('Failed to decode search query:', e)
              }
            }
          }
        }

        // Handle the search query parameter
        if (rawQ) {
          // Sanitize and limit the search term length to prevent issues
          const sanitized = rawQ
            .toLowerCase()
            .trim()
            .substring(0, 100) // Limit length
            .replace(/[^\w\s+_-]/g, '') // Preserve +, _, spaces, and hyphens for multi-token parsing

          searchTerm.value = sanitized
          modalSuppressed.value = true
        }

        // Clean up URL parameters after processing
        const url = new URL(window.location.href)
        if (url.searchParams.has('nf') || url.searchParams.has('q')) {
          url.searchParams.delete('nf')
          url.searchParams.delete('q')
          // Use replaceState to avoid adding to history
          window.history.replaceState({}, '', url.toString())
        }
      } catch (e) {
        console.error('Error processing URL parameters:', e)
        // Continue execution even if URL processing fails
      }

      // 2) Scroll persistence
      try {
        const el = document.querySelector('.scroll-container-stable')
        if (el) {
          const onScroll = () => {
            wallScrollTop.value = el.scrollTop || 0
          }
          el.addEventListener('scroll', onScroll, { passive: true })
          if (wallScrollTop.value > 0) {
            el.scrollTo({ top: wallScrollTop.value })
          }
          cleanupScroll = () => el.removeEventListener('scroll', onScroll)
        }
      } catch {}

      // 3) Hash routing
      handleHashChange()
      window.addEventListener('hashchange', handleHashChange)
    }

    // Delay initialization slightly to ensure DOM is ready
    setTimeout(initClient, 100)

    onBeforeUnmount(() => {
      if (typeof cleanupScroll === 'function') cleanupScroll()
      window.removeEventListener('hashchange', handleHashChange)
    })
  }

  // Count tracking
  const wallCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ claims: 0, quotes: 0, memes: 0 })
  const liveCounts = computed(() => ({
    wall: wallCounts.value,
    total: totalCounts.value,
  }))

  // (hash handling handled in client-only init above)

  const openContentFromSlug = async (contentType, slug) => {
    try {
      const { useContentCache } = await import('~/composables/useContentCache')
      const { claims, quotes, memes, loadAllContent, slugMaps } =
        useContentCache()

      await nextTick()

      if (
        !claims?.value?.length ||
        !quotes?.value?.length ||
        !memes?.value?.length
      ) {
        await loadAllContent()
        await nextTick()
        if (
          !claims?.value?.length ||
          !quotes?.value?.length ||
          !memes?.value?.length
        ) {
          setTimeout(() => openContentFromSlug(contentType, slug), 500)
          return
        }
      }

      let item = null
      if (contentType === 'claim') item = slugMaps.claims.get(slug)
      else if (contentType === 'quote') item = slugMaps.quotes.get(slug)
      else if (contentType === 'meme') item = slugMaps.memes.get(slug)

      if (item && openModal) openModal({ type: contentType, data: item })
    } catch (error) {
      console.error('💥 Error in openContentFromSlug:', error)
    }
  }

  // Handle content updates and scroll to top for search results (but not during modal)
  function handleContentUpdated({ hasContent, isSearchResult }) {
    if (isModalOpen?.value) return
    if (isSearchResult && hasContent) {
      nextTick(() => {
        const scrollContainer = document.querySelector(
          '.scroll-container-stable'
        )
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    }
  }

  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }

  // Expose handler to receive modal events from TheWall when it doesn't have injected modal
  function handleModalEvent(payload) {
    const modalSuppressed = useState('modalSuppressedFromQuery', () => false)
    if (modalSuppressed.value) {
      // Allow first user interaction before enabling auto modal
      modalSuppressed.value = false
      // Still open on explicit click, only suppress automatic programmatic ones
      if (payload && payload.__userClick) {
        openModal && openModal(payload)
      }
      return
    }
    if (openModal) openModal(payload)
  }

  // Provide search state for child components
  provide('searchTerm', searchTerm)
  provide('contentFilters', contentFilters)

  // Provide wall seed in context (optional; components also use useWallSeed directly)
  const { wallSeed } = useWallSeed()
  provide('wallSeed', wallSeed)
</script>
