// composables/useWallVirtualization.js
// Progressive virtualization system for baseline view

export function useWallVirtualization(options = {}) {
  const initialCount = options.initialCount ?? 25
  const growthChunk = options.growthChunk ?? 30
  const scrollBoost = options.scrollBoost ?? 80
  const wallDisplayCount = ref(Infinity) // full for SSR & non-baseline / search views
  const virtualizingBaseline = ref(false)
  let scrollListenerAttached = false

  function isBaselineView(effectiveSearch, effectiveFilters) {
    return (
      !effectiveSearch?.trim() &&
      effectiveFilters.grifts &&
      effectiveFilters.quotes &&
      effectiveFilters.memes
    )
  }

  function scheduleGrowBaseline(total) {
    if (!virtualizingBaseline.value) return
    if (wallDisplayCount.value >= total) return
    const next = Math.min(wallDisplayCount.value + growthChunk, total)
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

  // Boost growth if user scrolls near bottom during virtualization
  function onScrollBoost(getTotal) {
    if (!virtualizingBaseline.value) return
    const scrollY = window.scrollY || document.documentElement.scrollTop
    const vh = window.innerHeight
    const full = document.documentElement.scrollHeight
    if (scrollY + vh * 1.4 > full) {
      wallDisplayCount.value = Math.min(
        wallDisplayCount.value + scrollBoost,
        getTotal()
      )
    }
  }

  function setupScrollListener(getTotal) {
    if (typeof window === 'undefined') return

    const scrollHandler = () => onScrollBoost(getTotal)

    if (virtualizingBaseline.value && !scrollListenerAttached) {
      window.addEventListener('scroll', scrollHandler, { passive: true })
      scrollListenerAttached = true
    } else if (!virtualizingBaseline.value && scrollListenerAttached) {
      window.removeEventListener('scroll', scrollHandler)
      scrollListenerAttached = false
    }
  }

  function cleanupScrollListener() {
    if (typeof window !== 'undefined' && scrollListenerAttached) {
      window.removeEventListener('scroll', onScrollBoost)
      scrollListenerAttached = false
    }
  }

  function handleInterleavedChange(
    val,
    prev,
    effectiveSearch,
    effectiveFilters
  ) {
    if (typeof window === 'undefined') {
      // SSR: render full list to avoid hydration mismatch
      wallDisplayCount.value = Infinity
      virtualizingBaseline.value = false
      return
    }
    const baseline = isBaselineView(effectiveSearch, effectiveFilters)
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
      wallDisplayCount.value = Math.min(initialCount, total)
      virtualizingBaseline.value = true
      scheduleGrowBaseline(total)
    }
  }

  return {
    wallDisplayCount,
    virtualizingBaseline,
    isBaselineView,
    scheduleGrowBaseline,
    onScrollBoost,
    setupScrollListener,
    cleanupScrollListener,
    handleInterleavedChange,
  }
}
