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

          <!-- Grift pairs (2 columns on md+, stacked on smaller) - or Small Ads -->
          <div
            v-else-if="item.type === 'griftPair'"
            class="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <div
              v-for="(griftItem, idx) in item.data"
              :key="griftItem?._path || griftItem?.path || griftItem?.id || idx"
              class="cursor-pointer"
              role="button"
              tabindex="0"
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
              <!-- Ad Panel for square ads -->
              <WallPanelAd
                v-if="griftItem?.isAd"
                :ad="griftItem"
                :size="griftItem.size || 'square'"
              />
              <!-- Regular Grift Panel -->
              <WallPanelGrift
                v-else
                :grift="griftItem"
                :slug="griftItem?.path || griftItem?._path || ''"
              />
            </div>
          </div>

          <!-- Meme pairs (2 columns on >=460px using custom 'meme2' breakpoint, stacked below) -->
          <!-- Can now contain: Memes, Posts (every 5th pair), or Ads -->
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
              <!-- Ad Panel for square ads -->
              <WallPanelAd
                v-if="rowItem?.isAd"
                :ad="rowItem"
                :size="rowItem.size || 'square'"
              />
              <!-- Meme Panel -->
              <WallPanelMeme
                v-else-if="rowItem._type === 'meme'"
                :meme="rowItem"
                :slug="rowItem?.path || rowItem?._path || ''"
                :index="index"
              />
              <!-- Post Panel (mixed with memes every 5th pair) -->
              <WallPanelPost
                v-else-if="rowItem._type === 'post'"
                :post="rowItem"
                :slug="rowItem?.path || rowItem?._path || ''"
              />
            </div>
          </div>

          <!-- Posts (standalone, single item centered) -->
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

          <!-- Profiles (full width) -->
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

  // Initialize profiles system
  const { fetchAllProfiles } = useProfiles()

  // Initialize ads system
  const { loadAds, createAdProvider, calculateAdInterval } = useAds()

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
  const emit = defineEmits(['counts', 'modal', 'content-updated'])

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
    emit,
  })

  // Frozen baseline pattern (no search, all filters) returned instantly when clearing search.
  // Built once after initial load; later growth triggers an idle rebuild (non-blocking).
  const baselineState = useState('wallBaselinePattern', () => ({
    seed: null,
    grifts: 0,
    quotes: 0,
    memes: 0,
    pattern: [],
    order: { grifts: [], quotes: [], memes: [] },
    rebuilding: false,
  }))

  function deriveBaselineOrder(pattern) {
    const order = { grifts: [], quotes: [], memes: [] }
    const seen = { grifts: new Set(), quotes: new Set(), memes: new Set() }
    for (const item of pattern) {
      if (!item) continue
      if (item.type === 'griftPair') {
        for (const c of item.data || []) {
          const p = c?._path || c?.path || ''
          if (p && !seen.grifts.has(p)) {
            seen.grifts.add(p)
            order.grifts.push(p)
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
      // Create ad provider if ads are enabled AND not searching for ads
      // When searching for ads, we don't want them interleaved - we want them as results
      // Note: ads should be loaded in onMounted before this is called
      const adProvider =
        adsEnabled.value && !isSearchingForAds.value
          ? createAdProvider({ smallWeight: 0.7 })
          : null
      const interval =
        adsEnabled.value && !isSearchingForAds.value
          ? calculateAdInterval(adInterval.value)
          : 0

      const pattern = interleaveContent(
        cache.grifts,
        cache.quotes,
        cache.memes,
        {
          seed: wallSeed.value,
          enableShuffle: true,
          adInterval: interval,
          adProvider: adProvider,
          profiles: profiles.value,
          profileInterval: 4,
          posts: cache.posts,
        }
      )
      const order = deriveBaselineOrder(pattern)
      baselineState.value = {
        seed: wallSeed.value,
        grifts: cache.grifts.length,
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
      if (baselineEmpty) {
        buildBaselineNow()
      } else if (countsChanged && typeof window !== 'undefined') {
        // Rebuild later; return stale instantly
        scheduleBaselineRebuild()
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
    if (baseOrder && baseOrder.grifts?.length) {
      orderedGrifts = reorderByBaseline(
        grifts,
        new Map(baseOrder.grifts.map((p, i) => [p, i]))
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
      } else if (item.type === 'griftPair' || item.type === 'memeRow') {
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
      Object.entries(adCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([id, count]) => {})

      adSummaryShown.value = true
    }
  }

  function isBaselineView() {
    return (
      !effectiveSearch.value?.trim() &&
      effectiveFilters.value.grifts &&
      effectiveFilters.value.quotes &&
      effectiveFilters.value.memes
    )
  }

  function scheduleGrowBaseline(total) {
    if (!virtualizingBaseline.value) return
    if (wallDisplayCount.value >= total) return
    const chunk = 30 // pattern items per growth step (reduced from 40)
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
        const initial = 25 // Reduced from 70 to 25 for faster initial render
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
        wallDisplayCount.value + 80, // Reduced from 120 to 80 for smoother growth
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
      cache.grifts.length,
      cache.quotes.length,
      cache.memes.length,
      wallSeed.value,
      profiles.value.length, // Watch for profile changes!
    ],
    () => {
      const bs = baselineState.value
      if (!bs.pattern.length) return // nothing yet
      const emptySearch = !effectiveSearch.value?.trim()
      const allFiltersActive =
        effectiveFilters.value.grifts &&
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
    (cache.grifts?.length || cache.quotes?.length || cache.memes?.length) &&
    wallHasLoadedOnce.value
  ) {
    isLoaded.value = true
  }

  onMounted(async () => {
    if (isLoaded.value) return // already ready
    try {
      if (
        cache.grifts.length === 0 &&
        cache.quotes.length === 0 &&
        cache.memes.length === 0
      ) {
        // PERFORMANCE FIX: Load initial batch first for instant display
        // This makes the wall interactive in ~200ms instead of waiting for everything
        await loadInitialContent(30) // Load first 30 items of each type

        // Load profiles in parallel with initial content
        const profilesPromise = fetchAllProfiles()
          .then((loadedProfiles) => {
            profiles.value = loadedProfiles || []
            cache.profiles = loadedProfiles || []
            console.log(`✅ Loaded ${profiles.value.length} profiles`)
          })
          .catch((e) => {
            console.warn('Could not load profiles:', e)
            profiles.value = []
            cache.profiles = []
          })

        // Load ads in parallel
        const adsPromise = adsEnabled.value
          ? $fetch('/api/content/ads')
              .then((response) => {
                const adContent = response?.data || []
                if (adContent.length > 0) {
                  return loadAds(null, adContent)
                }
              })
              .catch((e) => {
                console.warn('Could not load ads:', e)
              })
          : Promise.resolve()

        // Wait for profiles and ads before showing content
        await Promise.all([profilesPromise, adsPromise])

        // Mark as loaded - wall is now interactive!
        isLoaded.value = true
        wallHasLoadedOnce.value = true

        console.log('🚀 Wall is now interactive!')

        // Load remaining content in the background (non-blocking)
        // This happens AFTER the wall is already interactive
        setTimeout(() => {
          loadRemainingContent()
            .then(() => {
              console.log('✅ All content loaded in background')
              // Show ad summary after full load
              setTimeout(() => showAdSummary(), 500)

              // Schedule background pre-computation for instant refreshes
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
            })
            .catch((e) => {
              console.warn('Error loading remaining content:', e)
            })
        }, 100)
      } else {
        // Cache had content but first visit this session
        // Still need to load profiles if not already loaded
        if (!profiles.value.length) {
          try {
            const loadedProfiles = await fetchAllProfiles()
            profiles.value = loadedProfiles || []
            cache.profiles = loadedProfiles || []
            console.log(`Loaded ${profiles.value.length} profiles`)
          } catch (e) {
            console.warn('Could not load profiles:', e)
            profiles.value = []
            cache.profiles = []
          }
        }

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

  @media (prefers-reduced-motion: reduce) {
    .wall-row-move,
    .wall-col-move {
      transition-duration: 1ms !important;
    }
  }
</style>
