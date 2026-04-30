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
          <!-- Quotes (full width) -->
          <div
            v-if="item.type === 'quote'"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            @click.capture="
              maybeOpenModal($event, () => openModal(item.data, 'quote', true))
            "
            @keydown.enter.prevent="openModal(item.data, 'quote', true)"
            @keydown.space.prevent="openModal(item.data, 'quote', true)"
          >
            <WallPanelQuote
              :quote="item.data"
              :slug="item.data?.path || item.data?._path || ''"
            />
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
              role="button"
              tabindex="0"
              @click.capture="
                maybeOpenModal($event, () =>
                  openModal(rowItem, rowItem._type || 'meme', true)
                )
              "
              @keydown.enter.prevent="
                openModal(rowItem, rowItem._type || 'meme', true)
              "
              @keydown.space.prevent="
                openModal(rowItem, rowItem._type || 'meme', true)
              "
            >
              <WallPanelMeme
                v-if="rowItem._type === 'meme'"
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
            class="mx-auto w-full max-w-115"
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
            <!-- Quotes (full width) -->
            <div
              v-if="item.type === 'quote'"
              class="cursor-pointer"
              role="button"
              tabindex="0"
              @click.capture="
                maybeOpenModal($event, () =>
                  openModal(item.data, 'quote', true)
                )
              "
              @keydown.enter.prevent="openModal(item.data, 'quote', true)"
              @keydown.space.prevent="openModal(item.data, 'quote', true)"
            >
              <WallPanelQuote
                :quote="item.data"
                :slug="item.data?.path || item.data?._path || ''"
              />
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
                role="button"
                tabindex="0"
                @click.capture="
                  maybeOpenModal($event, () =>
                    openModal(rowItem, rowItem._type || 'meme', true)
                  )
                "
                @keydown.enter.prevent="
                  openModal(rowItem, rowItem._type || 'meme', true)
                "
                @keydown.space.prevent="
                  openModal(rowItem, rowItem._type || 'meme', true)
                "
              >
                <WallPanelMeme
                  v-if="rowItem._type === 'meme'"
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
              class="mx-auto w-full max-w-115"
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
  // Auto-imports components/composables
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

  // Props for search/filters from parent
  const props = defineProps({
    search: { type: String, default: '' },
    filters: {
      type: Object,
      default: () => ({ quotes: true, memes: true }),
    },
    hideNoContent: { type: Boolean, default: false },
  })

  // Inject global state (provided by index.vue) and fallback to useState so it persists across routes
  const injectedSearch = inject('searchTerm', null)
  const injectedFilters = inject('contentFilters', null)
  const globalSearch = useState('searchTerm', () => '')
  const globalFilters = useState('contentFilters', () => ({
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
    return {
      quotes:
        typeof base?.quotes === 'boolean' ? base.quotes : props.filters.quotes,
      memes:
        typeof base?.memes === 'boolean' ? base.memes : props.filters.memes,
    }
  })

  // State
  const isLoaded = ref(false)
  const error = ref(null)
  const profiles = ref([]) // Loaded profiles

  // Emit counts for search bar
  const emit = defineEmits(['counts', 'content-updated'])

  // Clear search and reset filters (triggered from WallNoContent button)
  function onClearSearch() {
    const defaults = { quotes: true, memes: true }
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
      const baseKey = q._path || q.path || q.id || idx
      return `q-${baseKey}-${idx}`
    }
    if (item.type === 'post') {
      const p = item.data || {}
      const baseKey = p._path || p.path || p.id || idx
      return `post-${baseKey}-${idx}`
    }
    const joinIds = (arr = [], index) =>
      (arr || [])
        .map((d) => d?._path || d?.path || d?.id || '')
        .filter(Boolean)
        .join('|') || index

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

  // Modal opener composable
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

  // Convenience wrappers that pass current state to the composable
  function buildBaselineNow(opts = {}) {
    _buildBaseline(
      cache,
      wallSeed.value,
      profiles.value,
      { adProvider: null, interval: 0 },
      opts
    )
  }

  function scheduleBaselineRebuild() {
    _scheduleRebuild(cache, wallSeed.value, profiles.value, {
      adProvider: null,
      interval: 0,
    })
  }

  const interleavedContent = computed(() => {
    const { quotes, memes } = filteredContent.value
    const emptySearch = !effectiveSearch.value?.trim()
    const allFiltersActive =
      effectiveFilters.value.quotes && effectiveFilters.value.memes

    // Fast path: empty search & all filters -> return frozen baseline reference
    if (emptySearch && allFiltersActive) {
      const bs = baselineState.value
      const baselineEmpty = !bs.pattern.length
      const countsChanged =
        bs.seed !== wallSeed.value ||
        bs.quotes !== cache.quotes.length ||
        bs.memes !== cache.memes.length
      const seedChanged = bs.seed !== wallSeed.value

      if (baselineEmpty) {
        buildBaselineNow()
      } else if (seedChanged) {
        buildBaselineNow()
      } else if (countsChanged) {
        return baselineState.value.pattern
      }

      return baselineState.value.pattern
    }

    // Filtered / searched path: impose baseline ordering for stability, no shuffle.
    const baseOrder = baselineState.value.order
    let orderedQuotes = quotes
    let orderedMemes = memes
    if (baseOrder?.quotes?.length) {
      orderedQuotes = reorderByBaseline(quotes, baseOrder.quotes)
    }
    if (baseOrder?.memes?.length) {
      orderedMemes = reorderByBaseline(memes, baseOrder.memes)
    }
    return interleaveContent([], orderedQuotes, orderedMemes, {
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

  const displayedInterleavedContent = computed(() =>
    interleavedContent.value.slice(0, wallDisplayCount.value)
  )

  // ── Dual-layer system for instant search clear ──
  const isActiveSearch = computed(() => {
    const hasSearch = !!effectiveSearch.value?.trim()
    const allFiltersActive =
      effectiveFilters.value.quotes && effectiveFilters.value.memes
    return hasSearch || !allFiltersActive
  })

  // Baseline content: the full wall pattern (kept alive in DOM via v-show).
  const displayedBaselineContent = computed(() => {
    const bs = baselineState.value
    if (!bs.pattern.length) return displayedInterleavedContent.value
    return bs.pattern.slice(0, wallDisplayCount.value)
  })

  // Search results: only computed when actively searching.
  const searchResultsContent = computed(() => {
    if (!isActiveSearch.value) return []
    return interleavedContent.value
  })

  // Watch for interleaved changes & decide virtualization (SSR-safe)
  watch(
    interleavedContent,
    (val, prev) =>
      handleInterleavedChange(val, prev, effectiveSearch.value, {
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
    if (typeof window !== 'undefined' && scrollListenerAttached) {
      cleanupScrollListener()
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
      cache.quotes.length,
      cache.memes.length,
      wallSeed.value,
      profiles.value.length,
    ],
    () => {
      if (initialLoadInProgress.value) return

      const bs = baselineState.value
      if (!bs.pattern.length) return
      if (bs.blockUpdates) return

      const emptySearch = !effectiveSearch.value?.trim()
      const allFiltersActive =
        effectiveFilters.value.quotes && effectiveFilters.value.memes
      if (emptySearch && allFiltersActive) {
        scheduleBaselineRebuild()
      }
    }
  )

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
    (cache.quotes?.length || cache.memes?.length) &&
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
      if (cache.quotes.length === 0 && cache.memes.length === 0) {
        // ─────────────────────────────────────────────
        // FAST PATH – Restore from sessionStorage (Cmd-R reload)
        // ─────────────────────────────────────────────
        const restoredFromSession = restoreFromSessionStorage()

        if (restoredFromSession) {
          // Reseed + build baseline
          initialLoadInProgress.value = false
          baselineState.value.blockUpdates = false
          buildBaselineNow()

          startVirtualization(interleavedContent.value.length)
          isLoaded.value = true
          wallHasLoadedOnce.value = true

          // Load profiles in background
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

          await profilesPromise

          // Rebuild baseline with profiles now included
          if (profiles.value.length) {
            buildBaselineNow()
            startVirtualization(interleavedContent.value.length)
          }

          // Pre-compute next seed for instant logo-click refresh
          schedulePrecomputation(
            cache.grifts || [],
            cache.quotes,
            cache.memes,
            profiles.value,
            {
              adsEnabled: false,
              adInterval: 0,
              profileInterval: 4,
            }
          )

          return // Done — skip the slow path entirely
        }

        // ─────────────────────────────────────────────
        // SLOW PATH – First visit (no sessionStorage cache)
        // ─────────────────────────────────────────────

        // ── PHASE 1 – Above-the-fold: load a small subset ──
        await loadInitialContent(12)

        // Build baseline with the initial subset
        initialLoadInProgress.value = false
        baselineState.value.blockUpdates = false
        buildBaselineNow()

        resetForInitialLoad()
        isLoaded.value = true
        wallHasLoadedOnce.value = true

        // ── PHASE 2 – Below-the-fold: load remaining content + profiles ──
        baselineState.value.blockUpdates = true

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

        await Promise.all([remainingPromise, profilesPromise])

        // Unblock and EXTEND baseline with ALL content + profiles
        baselineState.value.blockUpdates = false
        buildBaselineNow({ extend: true })

        startVirtualization(interleavedContent.value.length)

        // ── Save to sessionStorage for fast Cmd-R next time ──
        saveToSessionStorage()

        // ── PHASE 3 – Pre-compute next seed for instant refresh ──
        schedulePrecomputation(
          cache.grifts || [],
          cache.quotes,
          cache.memes,
          profiles.value,
          {
            adsEnabled: false,
            adInterval: 0,
            profileInterval: 4,
          }
        )
      } else {
        // Cache had content but first visit this session
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

  /* ── Search results layer: fade + slide transition ── */
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
