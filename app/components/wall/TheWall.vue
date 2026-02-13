<!-- components/wall/TheWall.vue -->
<template>
  <div>
    <!-- Error state -->
    <WallErrorMessage v-if="error" :error="error" />

    <!-- Loading state (initial load) -->
    <WallLoadingMessage v-else-if="!isLoaded" />

    <!-- Content wall: dual-layer for instant search clear restore -->
    <!-- BASELINE LAYER: kept alive in DOM via v-show, hidden during search.
         When user hits X to clear search, this layer is instantly revealed
         with zero re-rendering — the DOM nodes are already there. -->
    <section v-else class="xs:px-2 sm:px-2 md:px-0">
      <!-- Baseline layer (v-show keeps DOM alive, display:none during search) -->
      <div v-show="!isActiveSearch" class="flex flex-col gap-3">
        <div
          v-for="(item, index) in displayedBaselineContent"
          :key="'bl-' + itemKey(item, index)"
        >
          <!-- Quotes (full width) - or Large Ads -->
          <div
            v-if="item.type === 'quote'"
            class="cursor-pointer"
            :role="item.data?.isAd ? null : 'button'"
            :tabindex="item.data?.isAd ? null : 0"
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
            <WallPanelAd
              v-if="item.data?.isAd"
              :ad="item.data"
              :size="item.data.size || 'horizontal'"
            />
            <WallPanelQuote
              v-else
              :quote="item.data"
              :slug="item.data?.path || item.data?._path || ''"
            />
          </div>

          <!-- Grift pairs -->
          <div
            v-else-if="item.type === 'griftPair'"
            class="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <div
              v-for="(griftItem, idx) in item.data"
              :key="griftItem?._path || griftItem?.path || griftItem?.id || idx"
              class="cursor-pointer"
              :role="griftItem?.isAd ? null : 'button'"
              :tabindex="griftItem?.isAd ? null : 0"
              @click.capture="
                griftItem?.isAd
                  ? null
                  : maybeOpenModal($event, () =>
                      openModal(griftItem, 'grift', true)
                    )
              "
              @keydown.enter.prevent="
                griftItem?.isAd ? null : openModal(griftItem, 'grift', true)
              "
              @keydown.space.prevent="
                griftItem?.isAd ? null : openModal(griftItem, 'grift', true)
              "
            >
              <WallPanelAd
                v-if="griftItem?.isAd"
                :ad="griftItem"
                :size="griftItem.size || 'square'"
              />
              <WallPanelGrift
                v-else
                :grift="griftItem"
                :slug="griftItem?.path || griftItem?._path || ''"
              />
            </div>
          </div>

          <!-- Meme pairs -->
          <div
            v-else-if="item.type === 'memeRow'"
            class="meme2:grid-cols-2 grid grid-cols-1 gap-3"
          >
            <div
              v-for="(rowItem, idx) in item.data"
              :key="rowItem._path || rowItem.path || rowItem.id || idx"
              class="cursor-pointer"
              :role="rowItem?.isAd ? null : 'button'"
              :tabindex="rowItem?.isAd ? null : 0"
              @click.capture="
                rowItem?.isAd
                  ? null
                  : maybeOpenModal($event, () =>
                      openModal(rowItem, rowItem._type || 'meme', true)
                    )
              "
              @keydown.enter.prevent="
                rowItem?.isAd
                  ? null
                  : openModal(rowItem, rowItem._type || 'meme', true)
              "
              @keydown.space.prevent="
                rowItem?.isAd
                  ? null
                  : openModal(rowItem, rowItem._type || 'meme', true)
              "
            >
              <WallPanelAd
                v-if="rowItem?.isAd"
                :ad="rowItem"
                :size="rowItem.size || 'square'"
              />
              <WallPanelMeme
                v-else-if="rowItem._type === 'meme'"
                :meme="rowItem"
                :slug="rowItem?.path || rowItem?._path || ''"
                :index="index"
              />
              <WallPanelPost
                v-else-if="rowItem._type === 'post'"
                :post="rowItem"
                :slug="rowItem?.path || rowItem?._path || ''"
              />
            </div>
          </div>

          <!-- Posts (standalone) -->
          <div
            v-else-if="item.type === 'post'"
            class="mx-auto w-full max-w-[460px]"
          >
            <div
              class="cursor-pointer"
              role="button"
              tabindex="0"
              @click.capture="
                maybeOpenModal($event, () => openModal(item.data, 'post', true))
              "
              @keydown.enter.prevent="openModal(item.data, 'post', true)"
              @keydown.space.prevent="openModal(item.data, 'post', true)"
            >
              <WallPanelPost
                :post="item.data"
                :slug="item.data?.path || item.data?._path || ''"
              />
            </div>
          </div>

          <!-- Profiles -->
          <div
            v-else-if="item.type === 'profile'"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            @click.capture="
              maybeOpenModal($event, () =>
                openModal(item.data, 'profile', true)
              )
            "
            @keydown.enter.prevent="openModal(item.data, 'profile', true)"
            @keydown.space.prevent="openModal(item.data, 'profile', true)"
          >
            <WallPanelProfile
              :profile="item.data"
              :slug="item.data?.path || item.data?._path || ''"
            />
          </div>
        </div>
      </div>

      <!-- SEARCH RESULTS LAYER: only rendered when actively searching.
           Uses v-if so it's destroyed when search clears — no stale DOM.
           Wrapped in Transition for a subtle fade-in/fade-out. -->
      <Transition name="wall-search" appear>
        <div
          v-if="isActiveSearch"
          class="wall-layer wall-layer-search flex flex-col gap-3"
        >
          <div
            v-for="(item, index) in searchResultsContent"
            :key="'sr-' + itemKey(item, index)"
          >
            <!-- Quotes (full width) - or Large Ads -->
            <div
              v-if="item.type === 'quote'"
              class="cursor-pointer"
              :role="item.data?.isAd ? null : 'button'"
              :tabindex="item.data?.isAd ? null : 0"
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
              <WallPanelAd
                v-if="item.data?.isAd"
                :ad="item.data"
                :size="item.data.size || 'horizontal'"
              />
              <WallPanelQuote
                v-else
                :quote="item.data"
                :slug="item.data?.path || item.data?._path || ''"
              />
            </div>

            <!-- Grift pairs -->
            <div
              v-else-if="item.type === 'griftPair'"
              class="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              <div
                v-for="(griftItem, idx) in item.data"
                :key="
                  griftItem?._path || griftItem?.path || griftItem?.id || idx
                "
                class="cursor-pointer"
                :role="griftItem?.isAd ? null : 'button'"
                :tabindex="griftItem?.isAd ? null : 0"
                @click.capture="
                  griftItem?.isAd
                    ? null
                    : maybeOpenModal($event, () =>
                        openModal(griftItem, 'grift', true)
                      )
                "
                @keydown.enter.prevent="
                  griftItem?.isAd ? null : openModal(griftItem, 'grift', true)
                "
                @keydown.space.prevent="
                  griftItem?.isAd ? null : openModal(griftItem, 'grift', true)
                "
              >
                <WallPanelAd
                  v-if="griftItem?.isAd"
                  :ad="griftItem"
                  :size="griftItem.size || 'square'"
                />
                <WallPanelGrift
                  v-else
                  :grift="griftItem"
                  :slug="griftItem?.path || griftItem?._path || ''"
                />
              </div>
            </div>

            <!-- Meme pairs -->
            <div
              v-else-if="item.type === 'memeRow'"
              class="meme2:grid-cols-2 grid grid-cols-1 gap-3"
            >
              <div
                v-for="(rowItem, idx) in item.data"
                :key="rowItem._path || rowItem.path || rowItem.id || idx"
                class="cursor-pointer"
                :role="rowItem?.isAd ? null : 'button'"
                :tabindex="rowItem?.isAd ? null : 0"
                @click.capture="
                  rowItem?.isAd
                    ? null
                    : maybeOpenModal($event, () =>
                        openModal(rowItem, rowItem._type || 'meme', true)
                      )
                "
                @keydown.enter.prevent="
                  rowItem?.isAd
                    ? null
                    : openModal(rowItem, rowItem._type || 'meme', true)
                "
                @keydown.space.prevent="
                  rowItem?.isAd
                    ? null
                    : openModal(rowItem, rowItem._type || 'meme', true)
                "
              >
                <WallPanelAd
                  v-if="rowItem?.isAd"
                  :ad="rowItem"
                  :size="rowItem.size || 'square'"
                />
                <WallPanelMeme
                  v-else-if="rowItem._type === 'meme'"
                  :meme="rowItem"
                  :slug="rowItem?.path || rowItem?._path || ''"
                  :index="index"
                />
                <WallPanelPost
                  v-else-if="rowItem._type === 'post'"
                  :post="rowItem"
                  :slug="rowItem?.path || rowItem?._path || ''"
                />
              </div>
            </div>

            <!-- Posts (standalone) -->
            <div
              v-else-if="item.type === 'post'"
              class="mx-auto w-full max-w-[460px]"
            >
              <div
                class="cursor-pointer"
                role="button"
                tabindex="0"
                @click.capture="
                  maybeOpenModal($event, () =>
                    openModal(item.data, 'post', true)
                  )
                "
                @keydown.enter.prevent="openModal(item.data, 'post', true)"
                @keydown.space.prevent="openModal(item.data, 'post', true)"
              >
                <WallPanelPost
                  :post="item.data"
                  :slug="item.data?.path || item.data?._path || ''"
                />
              </div>
            </div>

            <!-- Profiles -->
            <div
              v-else-if="item.type === 'profile'"
              class="cursor-pointer"
              role="button"
              tabindex="0"
              @click.capture="
                maybeOpenModal($event, () =>
                  openModal(item.data, 'profile', true)
                )
              "
              @keydown.enter.prevent="openModal(item.data, 'profile', true)"
              @keydown.space.prevent="openModal(item.data, 'profile', true)"
            >
              <WallPanelProfile
                :profile="item.data"
                :slug="item.data?.path || item.data?._path || ''"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- No content message -->
      <WallNoContent
        v-if="
          isActiveSearch && searchResultsContent.length === 0 && !hideNoContent
        "
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

  // Use the proven content cache system instead of direct queryContent
  const {
    cache,
    loadAllContent, // kept in case we need full reload
    loadInitialContent,
    loadRemainingContent,
    saveToSessionStorage,
    restoreFromSessionStorage,
  } = useContentCache()

  // Initialize profiles system
  const { fetchAllProfiles } = useProfiles()

  // Initialize ads system
  const { loadAds, createAdProvider, calculateAdInterval } = useAds()

  // AbortController for canceling pending requests
  const adsAbortController = ref(null)

  // Props for search/filters from parent
  const props = defineProps({
    search: { type: String, default: '' },
    filters: {
      type: Object,
      default: () => ({ grifts: true, quotes: true, memes: true }),
    },
    hideNoContent: { type: Boolean, default: false },
  })

  // Inject global state (provided by index.vue) and fallback to useState so it persists across routes
  const injectedSearch = inject('searchTerm', null)
  const injectedFilters = inject('contentFilters', null)
  const globalSearch = useState('searchTerm', () => '')
  const globalFilters = useState('contentFilters', () => ({
    grifts: true,
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
      grifts:
        typeof base?.grifts === 'boolean' ? base.grifts : props.filters.grifts,
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
  const profiles = ref([]) // Loaded profiles

  // Emit counts for search bar
  const emit = defineEmits(['counts', 'content-updated'])

  // Clear search and reset filters (triggered from WallNoContent button)
  function onClearSearch() {
    const defaults = { grifts: true, quotes: true, memes: true }
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
  // ALWAYS include index to ensure uniqueness and prevent duplicate rendering
  function itemKey(item, idx) {
    if (!item) return idx
    if (item.type === 'quote') {
      const q = item.data || {}
      const baseKey = q._path || q.path || q.id || idx
      // Always include index to ensure uniqueness
      return q.isAd ? `q-${baseKey}-${idx}` : `q-${baseKey}-${idx}`
    }
    if (item.type === 'post') {
      const p = item.data || {}
      const baseKey = p._path || p.path || p.id || idx
      return `post-${baseKey}-${idx}`
    }
    const joinIds = (arr = [], index) =>
      (arr || [])
        .map((d, i) => {
          const base = d?._path || d?.path || d?.id || ''
          return base
        })
        .filter(Boolean)
        .join('|') || index

    // Always include index to ensure uniqueness
    if (item.type === 'griftPair') return `gp-${joinIds(item.data, idx)}-${idx}`
    if (item.type === 'memeRow') return `mr-${joinIds(item.data, idx)}-${idx}`
    if (item.type === 'postRow') return `pr-${joinIds(item.data, idx)}-${idx}`
    if (item.type === 'profile') {
      const p = item.data || {}
      const baseKey = p._path || p.path || p.id || idx
      return `prof-${baseKey}-${idx}`
    }
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
  })

  // Baseline pattern caching (extracted to composable)
  const {
    baselineState,
    initialLoadInProgress,
    reorderByBaseline,
    buildBaselineNow: _buildBaseline,
    scheduleBaselineRebuild: _scheduleRebuild,
  } = useWallBaseline()

  // Helper to get ad settings for baseline builds
  function getBaselineAdSettings() {
    const adProvider =
      adsEnabled.value && !isSearchingForAds.value
        ? createAdProvider({ smallWeight: 0.7 })
        : null
    const interval =
      adsEnabled.value && !isSearchingForAds.value
        ? calculateAdInterval(adInterval.value)
        : 0
    return { adProvider, interval }
  }

  // Convenience wrappers that pass current state to the composable
  function buildBaselineNow(opts = {}) {
    _buildBaseline(
      cache,
      wallSeed.value,
      profiles.value,
      getBaselineAdSettings(),
      opts
    )
  }

  function scheduleBaselineRebuild() {
    _scheduleRebuild(
      cache,
      wallSeed.value,
      profiles.value,
      getBaselineAdSettings()
    )
  }

  // Check if user is searching for ads (dev feature)
  const isSearchingForAds = computed(() => {
    const search = effectiveSearch.value?.toLowerCase().trim()
    if (!search) return false
    return ['ads', 'ad', 'advertisement', 'advertisements'].includes(search)
  })

  const interleavedContent = computed(() => {
    const { grifts, quotes, memes } = filteredContent.value
    const emptySearch = !effectiveSearch.value?.trim()
    const allFiltersActive =
      effectiveFilters.value.grifts &&
      effectiveFilters.value.quotes &&
      effectiveFilters.value.memes

    // Fast path: empty search & all filters -> return frozen baseline reference
    if (emptySearch && allFiltersActive) {
      const bs = baselineState.value
      const baselineEmpty = !bs.pattern.length
      const countsChanged =
        bs.seed !== wallSeed.value ||
        bs.grifts !== cache.grifts.length ||
        bs.quotes !== cache.quotes.length ||
        bs.memes !== cache.memes.length
      const seedChanged = bs.seed !== wallSeed.value

      if (baselineEmpty) {
        buildBaselineNow()
      } else if (seedChanged) {
        // Seed changed (e.g. logo click) – full rebuild is intentional
        buildBaselineNow()
      } else if (countsChanged) {
        // Content counts changed (Phase 2 background load finished).
        // Don't rebuild here – the onMounted handler calls
        // buildBaselineNow({ extend: true }) explicitly.
        // Just return the current pattern to avoid a flash.
        return baselineState.value.pattern
      }

      return baselineState.value.pattern
    }

    // Special case: if searching for ads, show ads as content items
    if (isSearchingForAds.value) {
      // Return ads as quote-type items so they display properly
      const { ads } = useAds()
      const allAds = [
        ...(ads.value.square || []),
        ...(ads.value.horizontal || []),
      ]

      return allAds.map((ad) => ({
        type: 'quote',
        data: {
          ...ad,
          isAd: true,
          _type: 'ad',
        },
      }))
    }

    // Filtered / searched path: impose baseline ordering for stability, no shuffle.
    const baseOrder = baselineState.value.order
    let orderedGrifts = grifts
    let orderedQuotes = quotes
    let orderedMemes = memes
    if (baseOrder?.grifts?.length) {
      orderedGrifts = reorderByBaseline(grifts, baseOrder.grifts)
    }
    if (baseOrder?.quotes?.length) {
      orderedQuotes = reorderByBaseline(quotes, baseOrder.quotes)
    }
    if (baseOrder?.memes?.length) {
      orderedMemes = reorderByBaseline(memes, baseOrder.memes)
    }
    return interleaveContent(orderedGrifts, orderedQuotes, orderedMemes, {
      seed: wallSeed.value,
      enableShuffle: false,
      profiles: filteredContent.value.profiles || [],
      profileInterval: 4,
      posts: filteredContent.value.posts || [],
    })
  })

  // --------------------------------------------------
  // Progressive virtualization for baseline view
  // --------------------------------------------------
  const {
    wallDisplayCount,
    virtualizingBaseline,
    handleInterleavedChange,
    setupScrollListener,
    cleanupScrollListener,
    startVirtualization,
    resetForInitialLoad,
  } = useWallVirtualization({
    initialCount: 20,
    growthChunk: 25,
    scrollBoost: 60,
  })

  // Track if we've shown the ad summary
  const adSummaryShown = ref(false)

  const displayedInterleavedContent = computed(() =>
    interleavedContent.value.slice(0, wallDisplayCount.value)
  )

  // ── Dual-layer system for instant search clear ──
  // isActiveSearch: true when user has an active search/filter
  const isActiveSearch = computed(() => {
    const hasSearch = !!effectiveSearch.value?.trim()
    const allFiltersActive =
      effectiveFilters.value.grifts &&
      effectiveFilters.value.quotes &&
      effectiveFilters.value.memes
    return hasSearch || !allFiltersActive
  })

  // Baseline content: the full wall pattern (kept alive in DOM via v-show).
  // This never changes during search — it's the frozen baseline.
  const displayedBaselineContent = computed(() => {
    const bs = baselineState.value
    if (!bs.pattern.length) return displayedInterleavedContent.value
    return bs.pattern.slice(0, wallDisplayCount.value)
  })

  // Search results: only computed when actively searching.
  // Uses the filtered/searched interleaved content.
  const searchResultsContent = computed(() => {
    if (!isActiveSearch.value) return []
    return interleavedContent.value
  })

  // Show ad summary once when loading is complete
  function showAdSummary() {
    if (adSummaryShown.value) return

    // Count ALL ads in the full interleaved content (not just displayed)
    const adCounts = {}
    let totalAds = 0
    let horizontalAds = 0
    let squareAds = 0

    // Use interleavedContent.value to get ALL content, not just displayed
    interleavedContent.value.forEach((item) => {
      if (item.type === 'quote' && item.data?.isAd) {
        const adId = item.data.id || 'unknown'
        adCounts[adId] = (adCounts[adId] || 0) + 1
        totalAds++
        if (item.data.size === 'horizontal') horizontalAds++
      } else if (item.type === 'griftPair' || item.type === 'memeRow') {
        item.data?.forEach((d) => {
          if (d?.isAd) {
            const adId = d.id || 'unknown'
            adCounts[adId] = (adCounts[adId] || 0) + 1
            totalAds++
            if (d.size === 'square') squareAds++
          }
        })
      }
    })

    // Log ad summary only in dev mode when there are ads
    if (Object.keys(adCounts).length > 0) {
      if (import.meta.dev) {
        console.log(`\n📊 Ad Summary:`)
        console.log(`Horizontal ads: ${horizontalAds}`)
        console.log(`Square ads: ${squareAds}`)
        console.log(`Ads total: ${totalAds}\n`)
      }
      adSummaryShown.value = true
    }
  }

  // Watch for interleaved changes & decide virtualization (SSR-safe)
  watch(
    interleavedContent,
    (val, prev) =>
      handleInterleavedChange(val, prev, effectiveSearch.value, {
        grifts: effectiveFilters.value.grifts,
        quotes: effectiveFilters.value.quotes,
        memes: effectiveFilters.value.memes,
      }),
    { immediate: true }
  )

  let scrollListenerAttached = false
  watch(
    virtualizingBaseline,
    (v) => {
      if (typeof window === 'undefined') return
      if (v && !scrollListenerAttached) {
        setupScrollListener(() => interleavedContent.value.length)
        scrollListenerAttached = true
      } else if (!v && scrollListenerAttached) {
        cleanupScrollListener()
        scrollListenerAttached = false
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    // Clean up scroll listener
    if (typeof window !== 'undefined' && scrollListenerAttached) {
      cleanupScrollListener()
      scrollListenerAttached = false
    }

    // Cancel any pending ad requests
    if (adsAbortController.value) {
      adsAbortController.value.abort()
      adsAbortController.value = null
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
      cache.grifts.length,
      cache.quotes.length,
      cache.memes.length,
      wallSeed.value,
      profiles.value.length, // Watch for profile changes!
    ],
    () => {
      // Skip watcher activity during initial load
      if (initialLoadInProgress.value) return

      const bs = baselineState.value
      if (!bs.pattern.length) return // nothing yet
      if (bs.blockUpdates) return // Skip updates during background loading

      const emptySearch = !effectiveSearch.value?.trim()
      const allFiltersActive =
        effectiveFilters.value.grifts &&
        effectiveFilters.value.quotes &&
        effectiveFilters.value.memes
      if (emptySearch && allFiltersActive) {
        scheduleBaselineRebuild()
      }
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
    (cache.grifts?.length || cache.quotes?.length || cache.memes?.length) &&
    wallHasLoadedOnce.value
  ) {
    isLoaded.value = true
  }

  onMounted(async () => {
    if (isLoaded.value) return // already ready

    // Block watchers during load
    initialLoadInProgress.value = true
    baselineState.value.blockUpdates = true

    try {
      if (
        cache.grifts.length === 0 &&
        cache.quotes.length === 0 &&
        cache.memes.length === 0
      ) {
        // ─────────────────────────────────────────────
        // FAST PATH – Restore from sessionStorage (Cmd-R reload)
        // ─────────────────────────────────────────────
        // On Cmd-R the JS module cache is wiped but sessionStorage persists.
        // Restoring from sessionStorage is synchronous and skips the slow
        // queryCollection() calls entirely. The wall seed was already
        // regenerated by useWallSeed() during hydration, so we just
        // reseed + build baseline — the SAME code path as logo-click.
        const restoredFromSession = restoreFromSessionStorage()

        if (restoredFromSession) {
          if (import.meta.dev) {
            console.log(
              `⚡ SessionStorage fast path: ${cache.grifts.length} grifts, ${cache.quotes.length} quotes, ${cache.memes.length} memes`
            )
          }

          // Reseed + build baseline (identical to logo-click path)
          initialLoadInProgress.value = false
          baselineState.value.blockUpdates = false
          buildBaselineNow()

          // Show the wall immediately with all content
          startVirtualization(interleavedContent.value.length)
          isLoaded.value = true
          wallHasLoadedOnce.value = true

          // Load profiles and ads in background (not in sessionStorage)
          const profilesPromise = fetchAllProfiles()
            .then((loadedProfiles) => {
              profiles.value = loadedProfiles || []
              cache.profiles = loadedProfiles || []
            })
            .catch((e) => {
              console.warn('Could not load profiles:', e)
              profiles.value = []
              cache.profiles = []
            })

          const adsPromise = adsEnabled.value
            ? (() => {
                if (adsAbortController.value) {
                  adsAbortController.value.abort()
                }
                adsAbortController.value = new AbortController()
                return $fetch('/api/content/ads', {
                  signal: adsAbortController.value.signal,
                })
                  .then((response) => {
                    const adContent = response?.data || []
                    if (adContent.length > 0) {
                      return loadAds(null, adContent)
                    }
                  })
                  .catch((e) => {
                    if (e.name !== 'AbortError') {
                      console.warn('Could not load ads:', e)
                    }
                  })
              })()
            : Promise.resolve()

          await Promise.all([profilesPromise, adsPromise])

          // Rebuild baseline with profiles + ads now included
          if (profiles.value.length) {
            buildBaselineNow()
            startVirtualization(interleavedContent.value.length)
          }

          // Pre-compute next seed for instant logo-click refresh
          schedulePrecomputation(
            cache.grifts,
            cache.quotes,
            cache.memes,
            profiles.value,
            {
              adsEnabled: adsEnabled.value,
              adInterval: adInterval.value,
              profileInterval: 4,
            }
          )

          setTimeout(() => showAdSummary(), 500)
          return // Done — skip the slow path entirely
        }

        // ─────────────────────────────────────────────
        // SLOW PATH – First visit (no sessionStorage cache)
        // ─────────────────────────────────────────────

        // ── PHASE 1 – Above-the-fold: load a small subset ──
        // Load ~12 items per type – enough to fill the first viewport.
        await loadInitialContent(12)

        if (import.meta.dev) {
          console.log(
            `⚡ Phase 1 loaded: ${cache.grifts.length} grifts, ${cache.quotes.length} quotes, ${cache.memes.length} memes`
          )
        }

        // Build baseline with the initial subset (same seed used later)
        initialLoadInProgress.value = false
        baselineState.value.blockUpdates = false
        buildBaselineNow()

        // Cap virtualization to initial items and show the wall NOW
        resetForInitialLoad()
        isLoaded.value = true
        wallHasLoadedOnce.value = true

        // ── PHASE 2 – Below-the-fold: load remaining content + extras ──
        // Everything below runs in the background while the user sees content.
        baselineState.value.blockUpdates = true

        // Kick off remaining content, profiles, and ads in parallel
        const remainingPromise = loadRemainingContent()

        const profilesPromise = fetchAllProfiles()
          .then((loadedProfiles) => {
            profiles.value = loadedProfiles || []
            cache.profiles = loadedProfiles || []
          })
          .catch((e) => {
            console.warn('Could not load profiles:', e)
            profiles.value = []
            cache.profiles = []
          })

        const adsPromise = adsEnabled.value
          ? (() => {
              if (adsAbortController.value) {
                adsAbortController.value.abort()
              }
              adsAbortController.value = new AbortController()

              return $fetch('/api/content/ads', {
                signal: adsAbortController.value.signal,
              })
                .then((response) => {
                  const adContent = response?.data || []
                  if (adContent.length > 0) {
                    return loadAds(null, adContent)
                  }
                })
                .catch((e) => {
                  if (e.name !== 'AbortError') {
                    console.warn('Could not load ads:', e)
                  }
                })
            })()
          : Promise.resolve()

        // Wait for everything to finish in background
        await Promise.all([remainingPromise, profilesPromise, adsPromise])

        if (import.meta.dev) {
          console.log(
            `✅ Phase 2 complete: ${cache.grifts.length} grifts, ${cache.quotes.length} quotes, ${cache.memes.length} memes`
          )
        }

        // Unblock and EXTEND baseline with ALL content + ads + profiles
        baselineState.value.blockUpdates = false
        buildBaselineNow({ extend: true })

        // Grow the virtualized display to reveal the new items smoothly
        startVirtualization(interleavedContent.value.length)

        // Show ad summary
        setTimeout(() => showAdSummary(), 500)

        // ── Save to sessionStorage for fast Cmd-R next time ──
        saveToSessionStorage()

        // ── PHASE 3 – Pre-compute next seed for instant refresh ──
        schedulePrecomputation(
          cache.grifts,
          cache.quotes,
          cache.memes,
          profiles.value,
          {
            adsEnabled: adsEnabled.value,
            adInterval: adInterval.value,
            profileInterval: 4,
          }
        )
      } else {
        // Cache had content but first visit this session
        // Still need to load profiles if not already loaded
        if (!profiles.value.length) {
          try {
            const loadedProfiles = await fetchAllProfiles()
            profiles.value = loadedProfiles || []
            cache.profiles = loadedProfiles || []
          } catch (e) {
            console.warn('Could not load profiles:', e)
            profiles.value = []
            cache.profiles = []
          }
        }

        initialLoadInProgress.value = false
        baselineState.value.blockUpdates = false
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
    transition:
      opacity 220ms ease,
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
    transition:
      opacity 200ms ease,
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

  /* ── Search results layer: fade + slide transition ──
     Baseline layer uses v-show (instant toggle via display:none).
     Search results use Vue <Transition> for a polished appearance. */
  .wall-search-enter-active {
    transition:
      opacity 350ms ease-out,
      transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .wall-search-leave-active {
    transition:
      opacity 150ms ease-in,
      transform 150ms ease-in;
  }
  .wall-search-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
  .wall-search-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  @media (prefers-reduced-motion: reduce) {
    .wall-row-move,
    .wall-col-move {
      transition-duration: 1ms !important;
    }
    .wall-layer-baseline,
    .wall-layer--hidden {
      transition-duration: 1ms !important;
    }
    .wall-search-enter-active,
    .wall-search-leave-active {
      transition-duration: 1ms !important;
    }
  }
</style>
