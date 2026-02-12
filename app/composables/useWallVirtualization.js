// composables/useWallVirtualization.js
// Progressive virtualization system for baseline view
//
// Strategy:
//   Phase 1 – Show the initial above-the-fold items instantly (initialCount).
//   Phase 2 – As background content loads, grow the visible window in idle
//             frames so the user never sees a blank gap or a reshuffle.
//   Scroll-boost – If the user scrolls near the bottom while we're still
//             growing, jump ahead by scrollBoost items so they never hit a wall.

export function useWallVirtualization(options = {}) {
  const initialCount = options.initialCount ?? 20
  const growthChunk = options.growthChunk ?? 25
  const scrollBoost = options.scrollBoost ?? 60
  const wallDisplayCount = ref(initialCount) // start capped for fast first paint
  const virtualizingBaseline = ref(false)
  // Track whether we were previously in a search/filtered view so we can
  // avoid re-capping when the user clears the search (X button).
  let _wasInSearchView = false
  let growthTimer = null
  let _scrollHandler = null
  let _scrollListenerAttached = false

  // Pre-search state snapshot: saved when entering search, restored on clear
  // This allows instant restoration of the wall when the X button is pressed.
  let _preSearchSnapshot = null

  /**
   * Save the current scroll position and display count before entering search.
   * Called once when transitioning from baseline → search view.
   */
  function _savePreSearchSnapshot() {
    if (typeof window === 'undefined') return
    const el = document.querySelector('.scroll-container-stable')
    _preSearchSnapshot = {
      scrollTop: el ? el.scrollTop : 0,
      displayCount: wallDisplayCount.value,
      timestamp: Date.now(),
    }
  }

  /**
   * Restore the saved scroll position after clearing search (X button).
   * Uses requestAnimationFrame to ensure the DOM has updated with baseline
   * content before scrolling, giving an instant feel.
   */
  function _restorePreSearchSnapshot() {
    if (!_preSearchSnapshot || typeof window === 'undefined') {
      _preSearchSnapshot = null
      return
    }

    const snapshot = _preSearchSnapshot
    _preSearchSnapshot = null

    // Only restore if the snapshot is recent (within 5 minutes)
    // Stale snapshots from long-ago searches aren't useful
    if (Date.now() - snapshot.timestamp > 5 * 60 * 1000) return

    // Use double-rAF to ensure Vue has flushed DOM updates from the
    // baseline pattern restore before we scroll. This is faster than
    // nextTick + setTimeout because it syncs with the browser's paint cycle.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector('.scroll-container-stable')
        if (el && snapshot.scrollTop > 0) {
          // Use instant scroll (no smooth) for snappy feel
          el.scrollTo({ top: snapshot.scrollTop, behavior: 'instant' })
        }
      })
    })
  }

  function isBaselineView(effectiveSearch, effectiveFilters) {
    return (
      !effectiveSearch?.trim() &&
      effectiveFilters.grifts &&
      effectiveFilters.quotes &&
      effectiveFilters.memes
    )
  }

  // Incrementally reveal more items using requestIdleCallback / rAF
  function scheduleGrowBaseline(total) {
    if (!virtualizingBaseline.value) return
    if (wallDisplayCount.value >= total) {
      // Done growing – turn off virtualization
      virtualizingBaseline.value = false
      return
    }
    const next = Math.min(wallDisplayCount.value + growthChunk, total)
    const cb = () => {
      if (!virtualizingBaseline.value) return
      wallDisplayCount.value = next
      if (next < total) {
        scheduleGrowBaseline(total)
      } else {
        virtualizingBaseline.value = false
      }
    }
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      growthTimer = requestIdleCallback(cb, { timeout: 80 })
    } else {
      growthTimer = setTimeout(cb, 16)
    }
  }

  // Boost growth if user scrolls near bottom during virtualization
  function onScrollBoost(getTotal) {
    if (!virtualizingBaseline.value) return
    const el = document.querySelector('.scroll-container-stable')
    if (!el) return
    const scrollTop = el.scrollTop
    const clientHeight = el.clientHeight
    const scrollHeight = el.scrollHeight
    // If within 1.4 viewports of the bottom, boost
    if (scrollTop + clientHeight * 1.4 > scrollHeight) {
      const total = getTotal()
      wallDisplayCount.value = Math.min(
        wallDisplayCount.value + scrollBoost,
        total
      )
      // If we've caught up, stop virtualizing
      if (wallDisplayCount.value >= total) {
        virtualizingBaseline.value = false
      }
    }
  }

  function setupScrollListener(getTotal) {
    if (typeof window === 'undefined') return
    if (_scrollListenerAttached) return

    _scrollHandler = () => onScrollBoost(getTotal)
    const el = document.querySelector('.scroll-container-stable')
    if (el) {
      el.addEventListener('scroll', _scrollHandler, { passive: true })
      _scrollListenerAttached = true
    }
  }

  function cleanupScrollListener() {
    if (typeof window === 'undefined') return
    if (!_scrollListenerAttached) return
    const el = document.querySelector('.scroll-container-stable')
    if (el && _scrollHandler) {
      el.removeEventListener('scroll', _scrollHandler)
    }
    _scrollHandler = null
    _scrollListenerAttached = false
    if (growthTimer) {
      if (typeof window !== 'undefined' && window.cancelIdleCallback) {
        cancelIdleCallback(growthTimer)
      } else {
        clearTimeout(growthTimer)
      }
      growthTimer = null
    }
  }

  /**
   * Called whenever interleavedContent changes.
   * Decides whether to virtualize (cap + grow) or show everything.
   */
  function handleInterleavedChange(
    val,
    prev,
    effectiveSearch,
    effectiveFilters
  ) {
    const total = val?.length || 0

    // For search / filtered views: show everything immediately (no virtualization)
    if (!isBaselineView(effectiveSearch, effectiveFilters)) {
      // Save pre-search snapshot the first time we enter search view
      // so we can restore scroll position instantly when the user hits X.
      if (!_wasInSearchView) {
        _savePreSearchSnapshot()
      }
      wallDisplayCount.value = Infinity
      virtualizingBaseline.value = false
      _wasInSearchView = true
      return
    }

    // Returning from search/filter view (user cleared search / X button):
    // Show all baseline items immediately — don't re-cap to initialCount.
    // The user expects to see the same wall they had before searching.
    if (_wasInSearchView) {
      _wasInSearchView = false
      wallDisplayCount.value = total
      virtualizingBaseline.value = false
      // Restore the scroll position the user had before searching
      _restorePreSearchSnapshot()
      return
    }

    // Baseline view: if total is small enough, show all
    if (total <= initialCount) {
      wallDisplayCount.value = total
      virtualizingBaseline.value = false
      return
    }

    // Detect a reseed / logo-click: the content array reference changed but
    // the total is roughly the same (±20%). This means the baseline was
    // rebuilt with a new seed. Show the first batch instantly and grow.
    const prevTotal = prev?.length || 0
    const isSeedChange =
      prevTotal > 0 &&
      total > 0 &&
      val !== prev &&
      Math.abs(total - prevTotal) / prevTotal < 0.2

    if (isSeedChange && wallDisplayCount.value >= prevTotal) {
      // Reseed detected – show first batch instantly, then grow
      wallDisplayCount.value = Math.min(initialCount, total)
      virtualizingBaseline.value = true
      scheduleGrowBaseline(total)
      return
    }

    // If we're already showing everything (e.g. after full load completed),
    // don't re-cap. Only cap on the very first render or when content grows
    // significantly (background load just finished).
    const alreadyShowingAll =
      wallDisplayCount.value >= prevTotal && prevTotal > 0

    if (alreadyShowingAll && total > prevTotal) {
      // Background content just arrived – grow smoothly from current position
      virtualizingBaseline.value = true
      scheduleGrowBaseline(total)
      return
    }

    if (!virtualizingBaseline.value && wallDisplayCount.value < total) {
      // First time seeing baseline content – cap and grow
      virtualizingBaseline.value = true
      wallDisplayCount.value = Math.min(initialCount, total)
      scheduleGrowBaseline(total)
    }
  }

  /**
   * Explicitly start virtualization from the current display count.
   * Called by TheWall after Phase 1 baseline is built.
   */
  function startVirtualization(total) {
    if (total <= wallDisplayCount.value) {
      virtualizingBaseline.value = false
      return
    }
    virtualizingBaseline.value = true
    scheduleGrowBaseline(total)
  }

  /**
   * Reset display count for a fresh initial load (Phase 1).
   */
  function resetForInitialLoad() {
    wallDisplayCount.value = initialCount
    virtualizingBaseline.value = false
  }

  return {
    wallDisplayCount,
    virtualizingBaseline,
    isBaselineView,
    scheduleGrowBaseline,
    startVirtualization,
    resetForInitialLoad,
    onScrollBoost,
    setupScrollListener,
    cleanupScrollListener,
    handleInterleavedChange,
  }
}
