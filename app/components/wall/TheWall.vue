<!-- components/wall/TheWall.vue -->
<template>
  <div>
    <!-- Error state -->
    <WallErrorMessage v-if="error" :error="error" />

    <!-- Loading state (initial load or masthead refresh) -->
    <WallLoadingMessage v-else-if="!isLoaded || isWallRefreshing" />

    <!-- Content wall (no transitions) -->
    <section v-else class="xs:px-2 sm:px-2 md:px-0">
      <div class="flex flex-col gap-3">
        <div
          v-for="(item, index) in displayedInterleavedContent"
          :key="itemKey(item, index)"
        >
          <!-- Quotes (full width) - or Large Ads -->
          <div
            v-if="item.type === 'quote'"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            @click.capture="
              item.data?.isAd
                ? null
                : maybeOpenModal($event, () =>
                    openModal(item.data, 'quote', true)
                  )
            "
            @keydown.enter.prevent="
              item.data?.isAd ? null : openModal(item.data, 'quote', true)
            "
            @keydown.space.prevent="
              item.data?.isAd ? null : openModal(item.data, 'quote', true)
            "
          >
            <!-- Ad Panel for horizontal ads -->
            <WallPanelAd
              v-if="item.data?.isAd"
              :ad="item.data"
              :size="item.data.size || 'horizontal'"
            />
            <!-- Regular Quote Panel -->
            <WallPanelQuote
              v-else
              :quote="item.data"
              :slug="item.data?.path || item.data?._path || ''"
            />
          </div>

          <!-- Claim pairs (2 columns on md+, stacked on smaller) - or Small Ads -->
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
              @click.capture="
                claimItem?.isAd
                  ? null
                  : maybeOpenModal($event, () =>
                      openModal(claimItem, 'claim', true)
                    )
              "
              @keydown.enter.prevent="
                claimItem?.isAd ? null : openModal(claimItem, 'claim', true)
              "
              @keydown.space.prevent="
                claimItem?.isAd ? null : openModal(claimItem, 'claim', true)
              "
            >
              <!-- Ad Panel for square ads -->
              <WallPanelAd
                v-if="claimItem?.isAd"
                :ad="claimItem"
                :size="claimItem.size || 'square'"
              />
              <!-- Regular Claim Panel -->
              <WallPanelClaim
                v-else
                :claim="claimItem"
                :slug="claimItem?.path || claimItem?._path || ''"
              />
            </div>
          </div>

          <!-- Meme pairs (2 columns on >=460px using custom 'meme2' breakpoint, stacked below) - or Small Ads -->
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
              @click.capture="
                memeItem?.isAd
                  ? null
                  : maybeOpenModal($event, () =>
                      openModal(memeItem, 'meme', true)
                    )
              "
              @keydown.enter.prevent="
                memeItem?.isAd ? null : openModal(memeItem, 'meme', true)
              "
              @keydown.space.prevent="
                memeItem?.isAd ? null : openModal(memeItem, 'meme', true)
              "
            >
              <!-- Ad Panel for square ads in meme slots -->
              <WallPanelAd
                v-if="memeItem?.isAd"
                :ad="memeItem"
                :size="memeItem.size || 'square'"
              />
              <!-- Regular Meme Panel -->
              <WallPanelMeme
                v-else
                :meme="memeItem"
                :slug="memeItem?.path || memeItem?._path || ''"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- No content message -->
      <WallNoContent
        v-if="interleavedContent.length === 0 && !hideNoContent"
        message="No content available"
        @clear-search="onClearSearch"
      />
    </section>
  </div>
</template>

<script setup>
  // Auto-impoorts components/composables
  // Global guard to avoid click-through reopen after closing a modal
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  // Global loading state for wall refresh (from masthead click)
  const isWallRefreshing = useState('isWallRefreshing', () => false)

  // Use the proven content cache system instead of direct queryContent
  const {
    cache,
    loadAllContent, // kept in case we need full reload
    loadInitialContent,
    loadRemainingContent,
  } = useContentCache()

  // Initialize ads system
  const { loadAds, createAdProvider, calculateAdInterval } = useAds()

  // Props for search/filters from parent
  const props = defineProps({
    search: { type: String, default: '' },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true }),
    },
    hideNoContent: { type: Boolean, default: false },
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
  const adsEnabled = ref(true) // Toggle for ads
  const adInterval = ref(5) // Show ad every N content items (reduced for testing)

  // Emit counts for search bar
  const emit = defineEmits(['counts', 'modal', 'content-updated'])

  // Clear search and reset filters (triggered from WallNoContent button)
  function onClearSearch() {
    const defaults = { claims: true, quotes: true, memes: true }
    if (injectedSearch) injectedSearch.value = ''
    else globalSearch.value = ''
    if (injectedFilters) injectedFilters.value = { ...defaults }
    else globalFilters.value = { ...defaults }
  }
  // Centralized filtering & counts (DRY extraction)
  const { filteredContent, searchFilteredContent, counts } = useWallFiltering(
    cache,
    effectiveSearch,
    effectiveFilters
  )

  // Stable key generator for top-level pattern items
  function itemKey(item, idx) {
    if (!item) return idx
    if (item.type === 'quote') {
      const q = item.data || {}
      // Include index for ads to ensure uniqueness
      const baseKey = q._path || q.path || q.id || idx
      return q.isAd ? `q-${baseKey}-${idx}` : `q-${baseKey}`
    }
    const joinIds = (arr = [], index) =>
      (arr || [])
        .map((d, i) => {
          const base = d?._path || d?.path || d?.id || ''
          // Add index for ads to ensure uniqueness
          return d?.isAd ? `${base}-${index}-${i}` : base
        })
        .filter(Boolean)
        .join('|') || idx

    if (item.type === 'claimPair') return `cp-${joinIds(item.data, idx)}`
    if (item.type === 'memeRow') return `mr-${joinIds(item.data, idx)}`
    return idx
  }

  // Use global wall seed for deterministic shuffle per reload/reseed
  const { wallSeed } = useWallSeed()

  // Background pre-computation system for instant refreshes
  const {
    schedulePrecomputation,
    clearStalePrecomputations,
    usePrecomputedRefresh,
    precomputationReady,
  } = useWallPrecomputation()

  // Modal opener composable (was lost during refactor)
  const { openModal } = useWallModalOpener({
    modalGuardUntil,
    effectiveSearch,
    openGlobalModal,
    emit,
  })

  // Frozen baseline pattern (no search, all filters) returned instantly when clearing search.
  // Built once after initial load; later growth triggers an idle rebuild (non-blocking).
  const baselineState = useState('wallBaselinePattern', () => ({
    seed: null,
    claims: 0,
    quotes: 0,
    memes: 0,
    pattern: [],
    order: { claims: [], quotes: [], memes: [] },
    rebuilding: false,
  }))

  function deriveBaselineOrder(pattern) {
    const order = { claims: [], quotes: [], memes: [] }
    const seen = { claims: new Set(), quotes: new Set(), memes: new Set() }
    for (const item of pattern) {
      if (!item) continue
      if (item.type === 'claimPair') {
        for (const c of item.data || []) {
          const p = c?._path || c?.path || ''
          if (p && !seen.claims.has(p)) {
            seen.claims.add(p)
            order.claims.push(p)
          }
        }
      } else if (item.type === 'memeRow') {
        for (const m of item.data || []) {
          const p = m?._path || m?.path || ''
          if (p && !seen.memes.has(p)) {
            seen.memes.add(p)
            order.memes.push(p)
          }
        }
      } else if (item.type === 'quote') {
        const q = item.data || {}
        const p = q?._path || q?.path || ''
        if (p && !seen.quotes.has(p)) {
          seen.quotes.add(p)
          order.quotes.push(p)
        }
      }
    }
    return order
  }

  function reorderByBaseline(arr, orderMap) {
    if (!Array.isArray(arr) || !orderMap || !orderMap.size) return arr
    return [...arr].sort((a, b) => {
      const ap = a?._path || a?.path || ''
      const bp = b?._path || b?.path || ''
      return (orderMap.get(ap) ?? 0) - (orderMap.get(bp) ?? 0)
    })
  }

  function buildBaselineNow() {
    try {
      // Create ad provider if ads are enabled
      // Note: ads should be loaded in onMounted before this is called
      const adProvider = adsEnabled.value
        ? createAdProvider({ smallWeight: 0.7 })
        : null
      const interval = adsEnabled.value
        ? calculateAdInterval(adInterval.value)
        : 0

      const pattern = interleaveContent(
        cache.claims,
        cache.quotes,
        cache.memes,
        {
          seed: wallSeed.value,
          enableShuffle: true,
          adInterval: interval,
          adProvider: adProvider,
        }
      )
      const order = deriveBaselineOrder(pattern)
      baselineState.value = {
        seed: wallSeed.value,
        claims: cache.claims.length,
        quotes: cache.quotes.length,
        memes: cache.memes.length,
        pattern,
        order,
        rebuilding: false,
      }
    } catch (e) {
      baselineState.value.rebuilding = false
    }
  }

  function scheduleBaselineRebuild() {
    const bs = baselineState.value
    if (bs.rebuilding) return
    bs.rebuilding = true
    if (typeof window === 'undefined') {
      // SSR: skip; will build on client mount
      bs.rebuilding = false
      return
    }
    const schedule = (cb) =>
      window.requestIdleCallback
        ? window.requestIdleCallback(cb, { timeout: 1200 })
        : setTimeout(cb, 16)
    schedule(() => {
      buildBaselineNow()
    })
  }

  const interleavedContent = computed(() => {
    const { claims, quotes, memes } = filteredContent.value
    const emptySearch = !effectiveSearch.value?.trim()
    const allFiltersActive =
      effectiveFilters.value.claims &&
      effectiveFilters.value.quotes &&
      effectiveFilters.value.memes

    // Fast path: empty search & all filters -> return frozen baseline reference
    if (emptySearch && allFiltersActive) {
      const bs = baselineState.value
      const baselineEmpty = !bs.pattern.length
      const countsChanged =
        bs.seed !== wallSeed.value ||
        bs.claims !== cache.claims.length ||
        bs.quotes !== cache.quotes.length ||
        bs.memes !== cache.memes.length
      if (baselineEmpty) {
        buildBaselineNow()
      } else if (countsChanged && typeof window !== 'undefined') {
        // Rebuild later; return stale instantly
        scheduleBaselineRebuild()
      }
      return baselineState.value.pattern
    }

    // Filtered / searched path: impose baseline ordering for stability, no shuffle.
    const baseOrder = baselineState.value.order
    let orderedClaims = claims
    let orderedQuotes = quotes
    let orderedMemes = memes
    if (baseOrder && baseOrder.claims?.length) {
      orderedClaims = reorderByBaseline(
        claims,
        new Map(baseOrder.claims.map((p, i) => [p, i]))
      )
    }
    if (baseOrder && baseOrder.quotes?.length) {
      orderedQuotes = reorderByBaseline(
        quotes,
        new Map(baseOrder.quotes.map((p, i) => [p, i]))
      )
    }
    if (baseOrder && baseOrder.memes?.length) {
      orderedMemes = reorderByBaseline(
        memes,
        new Map(baseOrder.memes.map((p, i) => [p, i]))
      )
    }
    return interleaveContent(orderedClaims, orderedQuotes, orderedMemes, {
      seed: wallSeed.value,
      enableShuffle: false,
    })
  })

  // --------------------------------------------------
  // Progressive virtualization for baseline view
  // --------------------------------------------------
  const wallDisplayCount = ref(Infinity) // full for SSR & non-baseline / search views
  const virtualizingBaseline = ref(false)
  // Track if we've shown the ad summary
  const adSummaryShown = ref(false)

  const displayedInterleavedContent = computed(() => {
    const content = interleavedContent.value.slice(0, wallDisplayCount.value)
    return content
  })

  // Show ad summary once when loading is complete
  function showAdSummary() {
    if (adSummaryShown.value) return

    // Count ALL ads in the full interleaved content (not just displayed)
    const adCounts = {}
    let totalAds = 0

    // Use interleavedContent.value to get ALL content, not just displayed
    interleavedContent.value.forEach((item) => {
      if (item.type === 'quote' && item.data?.isAd) {
        const adId = item.data.id || 'unknown'
        adCounts[adId] = (adCounts[adId] || 0) + 1
        totalAds++
      } else if (item.type === 'claimPair' || item.type === 'memeRow') {
        item.data?.forEach((d) => {
          if (d?.isAd) {
            const adId = d.id || 'unknown'
            adCounts[adId] = (adCounts[adId] || 0) + 1
            totalAds++
          }
        })
      }
    })

    // Log ad summary only when there are ads
    if (Object.keys(adCounts).length > 0) {
      console.log('📊 Ad Display Summary:')
      Object.entries(adCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([id, count]) => {
          console.log(`  ${id}: ${count}`)
        })
      console.log(`Total Ads: ${totalAds}`)
      adSummaryShown.value = true
    }
  }

  function isBaselineView() {
    return (
      !effectiveSearch.value?.trim() &&
      effectiveFilters.value.claims &&
      effectiveFilters.value.quotes &&
      effectiveFilters.value.memes
    )
  }

  function scheduleGrowBaseline(total) {
    if (!virtualizingBaseline.value) return
    if (wallDisplayCount.value >= total) return
    const chunk = 40 // pattern items per growth step
    const next = Math.min(wallDisplayCount.value + chunk, total)
    const cb = () => {
      wallDisplayCount.value = next
      if (next < total) scheduleGrowBaseline(total)
    }
    if (window.requestIdleCallback) {
      requestIdleCallback(cb, { timeout: 60 })
    } else {
      setTimeout(cb, 16)
    }
  }

  // Watch for interleaved changes & decide virtualization (SSR-safe)
  watch(
    interleavedContent,
    (val, prev) => {
      if (typeof window === 'undefined') {
        // SSR: render full list to avoid hydration mismatch
        wallDisplayCount.value = Infinity
        virtualizingBaseline.value = false
        return
      }
      const baseline = isBaselineView()
      if (!baseline) {
        wallDisplayCount.value = Infinity
        virtualizingBaseline.value = false
        return
      }
      const total = val.length
      if (!total) {
        wallDisplayCount.value = 0
        virtualizingBaseline.value = false
        return
      }
      const baselineReset =
        prev &&
        prev.length &&
        prev.length !== total &&
        wallDisplayCount.value !== Infinity
      if (!virtualizingBaseline.value || baselineReset) {
        const initial = 70
        wallDisplayCount.value = Math.min(initial, total)
        virtualizingBaseline.value = true
        scheduleGrowBaseline(total)
      }
    },
    { immediate: true }
  )

  // Boost growth if user scrolls near bottom during virtualization
  function onScrollBoost() {
    if (!virtualizingBaseline.value) return
    const scrollY = window.scrollY || document.documentElement.scrollTop
    const vh = window.innerHeight
    const full = document.documentElement.scrollHeight
    if (scrollY + vh * 1.4 > full) {
      wallDisplayCount.value = Math.min(
        wallDisplayCount.value + 120,
        interleavedContent.value.length
      )
    }
  }
  let scrollListenerAttached = false
  watch(
    virtualizingBaseline,
    (v) => {
      if (v && !scrollListenerAttached) {
        window.addEventListener('scroll', onScrollBoost, { passive: true })
        scrollListenerAttached = true
      } else if (!v && scrollListenerAttached) {
        window.removeEventListener('scroll', onScrollBoost)
        scrollListenerAttached = false
        watch(
          virtualizingBaseline,
          (v) => {
            if (typeof window === 'undefined') return
            if (v && !scrollListenerAttached) {
              window.addEventListener('scroll', onScrollBoost, {
                passive: true,
              })
              scrollListenerAttached = true
            } else if (!v && scrollListenerAttached) {
              window.removeEventListener('scroll', onScrollBoost)
              scrollListenerAttached = false
            }
          },
          { immediate: true }
        )
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined' && scrollListenerAttached) {
      window.removeEventListener('scroll', onScrollBoost)
      scrollListenerAttached = false
    }
  })

  // Build baseline soon after initial load; if already populated skip.
  watch(
    () => isLoaded.value,
    (ready) => {
      if (!ready) return
      if (baselineState.value.pattern.length) return
      requestAnimationFrame(() => buildBaselineNow())
    },
    { immediate: true }
  )

  // Detect content growth after background load and schedule a rebuild (idle) if user is on baseline view.
  watch(
    () => [
      cache.claims.length,
      cache.quotes.length,
      cache.memes.length,
      wallSeed.value,
    ],
    () => {
      const bs = baselineState.value
      if (!bs.pattern.length) return // nothing yet
      const emptySearch = !effectiveSearch.value?.trim()
      const allFiltersActive =
        effectiveFilters.value.claims &&
        effectiveFilters.value.quotes &&
        effectiveFilters.value.memes
      if (emptySearch && allFiltersActive) scheduleBaselineRebuild()
    }
  )

  // Update displayed items when content changes
  function maybeOpenModal(ev, fn) {
    const target = ev?.target
    if (target && target.closest && target.closest('[data-like-button]')) return
    fn && fn()
  }

  // Emit counts reactively
  watch(
    counts,
    (c) => {
      emit('counts', c)
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

      // Load ads if enabled - fetch from API endpoint
      if (adsEnabled.value) {
        try {
          // Fetch ads from the API endpoint
          const response = await $fetch('/api/content/ads')
          const adContent = response?.data || []

          // Pass the loaded content to the ads system
          if (adContent.length > 0) {
            await loadAds(null, adContent)
          } else {
            console.log('No ads returned from API')
          }
        } catch (e) {
          console.warn('Could not load ads:', e)
        }
      }

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
        loadRemainingContent()
          .then(() => {
            // Show ad summary after all content is loaded
            // Wait a bit longer to ensure baseline is fully built
            setTimeout(() => showAdSummary(), 1500)

            // Schedule background pre-computation for instant refreshes
            schedulePrecomputation(cache.claims, cache.quotes, cache.memes, {
              adsEnabled: adsEnabled.value,
              adInterval: adInterval.value,
            })
          })
          .catch((e) => console.error('Error loading remaining content:', e))
      } else {
        // Cache had content but first visit this session
        isLoaded.value = true
        wallHasLoadedOnce.value = true
        // Show ad summary after a delay to ensure baseline is built
        setTimeout(() => showAdSummary(), 1500)
      }
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
      isLoaded.value = true // fail open so UI still renders
    }
  })
</script>

<style scoped>
  /* Row transitions */
  .wall-row-enter-active,
  .wall-row-leave-active {
    transition: opacity 220ms ease,
      transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  /* Keep layout stable while an item fades out */
  .wall-row-leave-active {
    position: absolute;
    width: 100%;
  }
  .wall-row-enter-from,
  .wall-row-leave-to {
    opacity: 0;
    transform: translateY(4px);
  }
  .wall-row-move {
    transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Inner grid items */
  .wall-col-enter-active,
  .wall-col-leave-active {
    transition: opacity 200ms ease,
      transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .wall-col-leave-active {
    position: absolute;
    width: 100%;
  }
  .wall-col-enter-from,
  .wall-col-leave-to {
    opacity: 0;
    transform: translateY(3px);
  }
  .wall-col-move {
    transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .wall-row-move,
    .wall-col-move {
      transition-duration: 1ms !important;
    }
  }
</style>
