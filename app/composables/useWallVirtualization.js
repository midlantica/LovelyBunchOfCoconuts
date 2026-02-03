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
    // Since we now load all content before showing the wall,
    // virtualization is no longer needed - just show everything
    wallDisplayCount.value = Infinity
    virtualizingBaseline.value = false
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
