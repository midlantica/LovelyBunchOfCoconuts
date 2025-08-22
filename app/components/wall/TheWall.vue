<!-- components/wall/TheWall.vue -->
<template>
  <div>
    <!-- Error state -->
    <WallErrorMessage v-if="error" :error="error" />

    <!-- Loading state -->
    <WallLoadingMessage v-else-if="!isLoaded" />

    <!-- Content wall -->
    <section v-else class="flex flex-col gap-3 xs:px-2 sm:px-2 md:px-0">
      <div
        v-for="(item, index) in interleavedContent"
        :key="itemKey(item, index)"
        class="opacity-100 transition translate-y-0 duration-300 ease-in-out"
      >
        <!-- Quotes (full width) -->
        <div
          v-if="item.type === 'quote'"
          class="cursor-pointer"
          role="button"
          tabindex="0"
          @click.capture="openModal(item.data, 'quote', true)"
          @keydown.enter.prevent="openModal(item.data, 'quote', true)"
          @keydown.space.prevent="openModal(item.data, 'quote', true)"
        >
          <WallQuotePanel
            :quote="item.data"
            :slug="item.data?.path || item.data?._path || ''"
          />
        </div>

        <!-- Claim pairs (2 columns on md+, stacked on smaller) -->
        <div
          v-else-if="item.type === 'claimPair'"
          class="gap-3 grid grid-cols-1 md:grid-cols-2"
        >
          <div
            v-for="(claimItem, idx) in item.data"
            :key="claimItem?._path || claimItem?.path || claimItem?.id || idx"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            @click.capture="openModal(claimItem, 'claim', true)"
            @keydown.enter.prevent="openModal(claimItem, 'claim', true)"
            @keydown.space.prevent="openModal(claimItem, 'claim', true)"
          >
            <WallClaimPanel
              :claim="claimItem"
              :slug="claimItem?.path || claimItem?._path || ''"
            />
          </div>
        </div>

        <!-- Meme pairs (2 columns on >=460px using custom 'meme2' breakpoint, stacked below) -->
        <div
          v-else-if="item.type === 'memeRow'"
          class="gap-3 grid grid-cols-1 meme2:grid-cols-2"
        >
          <div
            v-for="(memeItem, idx) in item.data"
            :key="memeItem._path || memeItem.path || memeItem.id || idx"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            @click.capture="openModal(memeItem, 'meme', true)"
            @keydown.enter.prevent="openModal(memeItem, 'meme', true)"
            @keydown.space.prevent="openModal(memeItem, 'meme', true)"
          >
            <WallMemePanel
              :meme="memeItem"
              :slug="memeItem?.path || memeItem?._path || ''"
            />
          </div>
        </div>
      </div>

      <!-- No content message -->
      <WallNoContent
        v-if="interleavedContent.length === 0"
        message="No content available"
      />
    </section>
  </div>
</template>

<script setup>
  // Auto-impoorts components/wall/...
  import { expandSearchTerms } from '~/data/termRelations'

  // Global guard to avoid click-through reopen after closing a modal
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  // Use the proven content cache system instead of direct queryContent
  const {
    cache,
    loadAllContent, // kept in case we need full reload
    loadInitialContent,
    loadRemainingContent,
  } = useContentCache()

  // Props for search/filters from parent
  const props = defineProps({
    search: { type: String, default: '' },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true }),
    },
  })

  // Inject global state (provided by index.vue) and fallback to useState so it persists across routes
  const injectedSearch = inject('searchTerm', null)
  const injectedFilters = inject('contentFilters', null)
  const globalSearch = useState('searchTerm', () => '')
  const globalFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))

  // Also get global modal opener so we can emit in a stable way through parent
  const openGlobalModal = inject('openModal', null)

  // Effective values: prefer injected (shared) state; fallback to global; finally props
  const effectiveSearch = computed(
    () =>
      (injectedSearch ? injectedSearch.value : globalSearch.value) ??
      props.search
  )
  const effectiveFilters = computed(() => {
    const base = injectedFilters ? injectedFilters.value : globalFilters.value
    // Ensure keys exist
    return {
      claims:
        typeof base?.claims === 'boolean' ? base.claims : props.filters.claims,
      quotes:
        typeof base?.quotes === 'boolean' ? base.quotes : props.filters.quotes,
      memes:
        typeof base?.memes === 'boolean' ? base.memes : props.filters.memes,
    }
  })

  // State
  const isLoaded = ref(false)
  const error = ref(null)

  // Emit counts for search bar
  const emit = defineEmits(['counts', 'modal', 'content-updated'])

  // Computed content arrays from cache
  const allClaims = computed(() => cache.claims || [])
  const allQuotes = computed(() => cache.quotes || [])
  const allMemes = computed(() => cache.memes || [])

  // Term relations support (optional, lightweight)
  const textMatches = (text, q) => {
    const hay = String(text || '').toLowerCase()
    const fallback = [String(q || '').toLowerCase()].filter(Boolean)
    const terms =
      typeof expandSearchTerms === 'function' ? expandSearchTerms(q) : fallback
    return terms.some((t) => hay.includes(t))
  }

  // Search-only filtered content (for pill counts)
  const searchFilteredContent = computed(() => {
    // Early return if cache isn't ready yet
    if (!cache.claims && !cache.quotes && !cache.memes) {
      return { claims: [], quotes: [], memes: [] }
    }

    let searchClaims = allClaims.value
    let searchQuotes = allQuotes.value
    let searchMemes = allMemes.value

    // Apply search filter using searchableText from useContentCache
    if (effectiveSearch.value?.trim()) {
      const q = effectiveSearch.value
      searchClaims = searchClaims.filter((it) =>
        textMatches(it.searchableText, q)
      )
      searchQuotes = searchQuotes.filter((it) =>
        textMatches(it.searchableText, q)
      )
      searchMemes = searchMemes.filter((it) =>
        textMatches(it.searchableText, q)
      )
    }

    return {
      claims: searchClaims,
      quotes: searchQuotes,
      memes: searchMemes,
    }
  })

  // Simple content filtering
  const filteredContent = computed(() => {
    // Early return if cache isn't ready yet
    if (!cache.claims && !cache.quotes && !cache.memes) {
      return { claims: [], quotes: [], memes: [] }
    }

    let filteredClaims = effectiveFilters.value.claims ? allClaims.value : []
    let filteredQuotes = effectiveFilters.value.quotes ? allQuotes.value : []
    let filteredMemes = effectiveFilters.value.memes ? allMemes.value : []

    // Apply search filter using searchableText from useContentCache
    if (effectiveSearch.value?.trim()) {
      const q = effectiveSearch.value
      filteredClaims = filteredClaims.filter((it) =>
        textMatches(it.searchableText, q)
      )
      filteredQuotes = filteredQuotes.filter((it) =>
        textMatches(it.searchableText, q)
      )
      filteredMemes = filteredMemes.filter((it) =>
        textMatches(it.searchableText, q)
      )
    }

    return {
      claims: filteredClaims,
      quotes: filteredQuotes,
      memes: filteredMemes,
    }
  })

  // Stable key generator for top-level pattern items
  function itemKey(item, idx) {
    if (!item) return idx
    if (item.type === 'quote') {
      const q = item.data || {}
      return `q-${q._path || q.path || q.id || idx}`
    }
    const joinIds = (arr = []) =>
      (arr || [])
        .map((d) => d?._path || d?.path || d?.id || '')
        .filter(Boolean)
        .join('|') || idx

    if (item.type === 'claimPair') return `cp-${joinIds(item.data)}`
    if (item.type === 'memeRow') return `mr-${joinIds(item.data)}`
    return idx
  }

  // Use global wall seed for deterministic shuffle per reload/reseed
  const { wallSeed } = useWallSeed()

  // Interleave using seeded shuffle so a reload or explicit reseed changes order,
  // while search/filters just constrain the pools.
  const interleavedContent = computed(() => {
    const { claims, quotes, memes } = filteredContent.value
    const result = interleaveContent(claims, quotes, memes, {
      seed: wallSeed.value,
      enableShuffle: true,
    })
    return result
  })

  // Update displayed items when content changes
  watch(
    interleavedContent,
    (newContent) => {
      if (import.meta.dev && import.meta.env?.VITE_CONTENT_DEBUG === '1')
        console.log('Content updated:', newContent?.length || 0, 'items')
      // Emit that content has been updated (for scroll-to-top)
      emit('content-updated', {
        hasContent: newContent?.length > 0,
        isSearchResult: !!effectiveSearch.value?.trim(),
      })
    },
    { immediate: true }
  )

  // Modal handler: emit event instead of navigating so URL can be managed without re-rendering the wall
  const openModal = (data, type, userInitiated = false) => {
    if (Date.now() < modalGuardUntil.value) return

    const fileBase = () => {
      const id = data?.id || data?._id || ''
      if (id) return id.split('/').pop()?.replace(/\.md$/, '') || ''
      const p = data?._path || data?.path || ''
      if (p) return p.split('/').pop()?.replace(/\.md$/, '') || ''
      return ''
    }
    const slugify = (s = '') =>
      s
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s-_]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80)

    let slug = fileBase()
    if (!slug) {
      if (type === 'claim') slug = slugify(data?.claim || data?.title || '')
      else if (type === 'quote')
        slug = slugify(data?.title || data?.quoteText || '')
      else if (type === 'meme')
        slug = slugify(data?.title || data?.description || '')
    }

    const payload = { type, data, slug }
    if (userInitiated) payload.__userClick = true

    // Update URL path to /type/slug without navigating, and remember previous URL
    if (typeof window !== 'undefined' && slug) {
      const preModalUrl = useState('preModalUrl', () => null)
      if (!preModalUrl.value) {
        preModalUrl.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
      }
      // Use replaceState so we don't add a history entry; omit query to keep the path clean
      window.history.replaceState({}, '', `/${type}/${slug}`)
    }

    // Prefer injected global modal if available; otherwise emit to parent
    if (openGlobalModal) openGlobalModal(payload)
    else emit('modal', payload)

    // Popularity tracking: only count when modal opened by explicit user click
    try {
      if (userInitiated) {
        const searchTerm = inject('searchTerm', ref(''))
        const key = (searchTerm?.value || '').trim().toLowerCase()
        if (key) {
          const pop = JSON.parse(
            localStorage.getItem('wunu_popular_terms') || '{}'
          )
          pop[key] = (pop[key] || 0) + 1
          localStorage.setItem('wunu_popular_terms', JSON.stringify(pop))
        }
      }
    } catch {}
  }

  watch(
    filteredContent,
    (content) => {
      emit('counts', {
        wallCounts: {
          claims: searchFilteredContent.value.claims.length,
          quotes: searchFilteredContent.value.quotes.length,
          memes: searchFilteredContent.value.memes.length,
          total:
            (effectiveFilters.value.claims
              ? searchFilteredContent.value.claims.length
              : 0) +
            (effectiveFilters.value.quotes
              ? searchFilteredContent.value.quotes.length
              : 0) +
            (effectiveFilters.value.memes
              ? searchFilteredContent.value.memes.length
              : 0),
        },
        totalCounts: {
          claims: allClaims.value.length,
          quotes: allQuotes.value.length,
          memes: allMemes.value.length,
          total:
            allClaims.value.length +
            allQuotes.value.length +
            allMemes.value.length,
        },
      })
    },
    { immediate: true }
  )

  const wallHasLoadedOnce = useState('wallHasLoadedOnce', () => false)

  // If cache already populated (e.g. SPA nav), skip spinner entirely
  if (
    (cache.claims?.length || cache.quotes?.length || cache.memes?.length) &&
    wallHasLoadedOnce.value
  ) {
    isLoaded.value = true
  }

  onMounted(async () => {
    if (isLoaded.value) return // already ready
    try {
      if (import.meta.dev)
        console.log('TheWall mount (progressive load start)', {
          hasLoadedOnce: wallHasLoadedOnce.value,
        })

      if (
        cache.claims.length === 0 &&
        cache.quotes.length === 0 &&
        cache.memes.length === 0
      ) {
        // Progressive: show something fast
        await loadInitialContent(24)
        isLoaded.value = true
        wallHasLoadedOnce.value = true
        // Background full load (don't await; no spinner)
        loadRemainingContent().catch((e) =>
          console.error('Error loading remaining content:', e)
        )
      } else {
        // Cache had content but first visit this session
        isLoaded.value = true
        wallHasLoadedOnce.value = true
      }
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
      isLoaded.value = true // fail open so UI still renders
    }
  })
</script>
