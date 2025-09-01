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
          class="top-0 z-10 sticky w-full"
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

  // If redirected from a not-found deep link, prefill search and clean URL
  onMounted(() => {
    // Read raw q from the URL to preserve literal '+' between tokens
    let q = ''
    try {
      const m = window.location.search.match(/[?&]q=([^&]*)/)
      q = m ? m[1] : ''
    } catch {}
    const nf = route.query.nf
    const modalSuppressed = useState('modalSuppressedFromQuery', () => false)

    if (q) {
      // Keep '+' separators intact; SearchBar will parse tokens and URL will stay stable
      const decoded = (() => {
        try {
          return decodeURIComponent(q)
        } catch {
          return q
        }
      })()
      searchTerm.value = decoded.toLowerCase().trim()
      // Prevent immediate modal reopen after closing if refresh with query param
      modalSuppressed.value = true
    }
    if (nf) {
      // Remove nf from URL but keep q exactly as typed (preserve literal '+')
      try {
        const raw = window.location.search.replace(/^\?/, '')
        const parts = raw ? raw.split('&').filter(Boolean) : []
        const kept = parts.filter(
          (p) => decodeURIComponent(p.split('=')[0]) !== 'nf'
        )
        const query = kept.length ? `?${kept.join('&')}` : ''
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}${query}${window.location.hash || ''}`
        )
      } catch {}
    }

    // Attach scroll listener to persist position
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer) {
      const onScroll = () => {
        wallScrollTop.value = scrollContainer.scrollTop || 0
      }
      scrollContainer.addEventListener('scroll', onScroll, { passive: true })
      // Restore if coming back without remount
      if (wallScrollTop.value > 0) {
        scrollContainer.scrollTo({ top: wallScrollTop.value })
      }
      onUnmounted(() => {
        scrollContainer.removeEventListener('scroll', onScroll)
      })
    }
  })

  // Count tracking
  const wallCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ claims: 0, quotes: 0, memes: 0 })
  const liveCounts = computed(() => ({
    wall: wallCounts.value,
    total: totalCounts.value,
  }))

  // Handle hash URLs for backward compatibility (Twitter shares, bookmarks, etc.)
  onMounted(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (!hash || isModalOpen?.value) return
      // Accept both #type-slug and #type/slug
      const match = hash.match(/^(#)(claim|quote|meme)[\/-](.+)$/)
      if (match) {
        const [, , contentType, slug] = match
        // Clear the hash to prevent router scroll warnings
        window.history.replaceState(
          {},
          '',
          window.location.pathname + window.location.search
        )
        openContentFromSlug(contentType, slug)
      }
    }

    // Handle initial hash and hash changes
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    onUnmounted(() => {
      window.removeEventListener('hashchange', handleHashChange)
    })
  })

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
