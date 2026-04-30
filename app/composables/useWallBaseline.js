// composables/useWallBaseline.js
// Baseline pattern caching system for the content wall.
// Extracted from TheWall.vue to keep the component focused on rendering.

export function useWallBaseline() {
  const baselineState = useState('wallBaselinePattern', () => ({
    seed: null,
    quotes: 0,
    memes: 0,
    pattern: [],
    order: { quotes: [], memes: [] },
    rebuilding: false,
    blockUpdates: false,
  }))

  // Track if we're in initial load phase (prevents watcher from triggering rebuilds)
  const initialLoadInProgress = ref(false)

  function deriveBaselineOrder(pattern) {
    const order = { quotes: [], memes: [] }
    const seen = { quotes: new Set(), memes: new Set() }
    for (const item of pattern) {
      if (!item) continue
      if (item.type === 'memeRow') {
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

  function reorderByBaseline(arr, orderList) {
    if (!Array.isArray(arr) || !orderList?.length) return arr
    const orderMap = new Map(orderList.map((p, i) => [p, i]))
    const known = []
    const unknown = []
    arr.forEach((item) => {
      const key = item?._path || item?.path || ''
      if (orderMap.has(key)) {
        known.push({ order: orderMap.get(key), item })
      } else {
        unknown.push(item)
      }
    })
    known.sort((a, b) => a.order - b.order)
    return [...known.map((entry) => entry.item), ...unknown]
  }

  /**
   * Build the baseline pattern from cache data.
   * @param {Object} cache - The content cache (quotes, memes, posts)
   * @param {number} wallSeed - The current wall seed
   * @param {Array} profiles - Loaded profiles
   * @param {Object} adSettings - Kept for API compatibility (unused)
   * @param {Object} opts - { extend: boolean } for Phase 2 extend mode
   */
  function buildBaselineNow(cache, wallSeed, profiles, adSettings, opts = {}) {
    try {
      const pattern = interleaveContent(
        [], // no grifts
        cache.quotes,
        cache.memes,
        {
          seed: wallSeed,
          enableShuffle: true,
          profiles: profiles,
          profileInterval: 4,
          posts: cache.posts,
        }
      )

      // If extending (Phase 2), keep the existing visible items in place
      // and only append new items after them to prevent the double-flash.
      if (opts.extend && baselineState.value.pattern.length > 0) {
        const prevPattern = baselineState.value.pattern

        // Build a set of paths already visible in the old pattern
        const visiblePaths = new Set()
        for (const item of prevPattern) {
          if (!item) continue
          if (
            item.type === 'quote' ||
            item.type === 'post' ||
            item.type === 'profile'
          ) {
            const p = item.data?._path || item.data?.path || ''
            if (p) visiblePaths.add(p)
          } else if (item.type === 'memeRow') {
            for (const d of item.data || []) {
              const p = d?._path || d?.path || ''
              if (p) visiblePaths.add(p)
            }
          }
        }

        // From the new full pattern, collect items that contain NEW content
        const newItems = pattern.filter((item) => {
          if (!item) return false
          if (
            item.type === 'quote' ||
            item.type === 'post' ||
            item.type === 'profile'
          ) {
            const p = item.data?._path || item.data?.path || ''
            return p && !visiblePaths.has(p)
          }
          if (item.type === 'memeRow') {
            return (item.data || []).some((d) => {
              const p = d?._path || d?.path || ''
              return p && !visiblePaths.has(p)
            })
          }
          return true
        })

        const merged = [...prevPattern, ...newItems]
        const order = deriveBaselineOrder(merged)
        baselineState.value = {
          seed: wallSeed,
          quotes: cache.quotes.length,
          memes: cache.memes.length,
          pattern: merged,
          order,
          rebuilding: false,
        }
        return
      }

      const order = deriveBaselineOrder(pattern)
      baselineState.value = {
        seed: wallSeed,
        quotes: cache.quotes.length,
        memes: cache.memes.length,
        pattern,
        order,
        rebuilding: false,
      }
    } catch (e) {
      if (import.meta.dev)
        console.warn('[useWallBaseline] buildBaselineNow failed:', e)
      baselineState.value.rebuilding = false
    }
  }

  function scheduleBaselineRebuild(cache, wallSeed, profiles, adSettings) {
    const bs = baselineState.value
    if (bs.rebuilding) return
    bs.rebuilding = true
    if (typeof window === 'undefined') {
      bs.rebuilding = false
      return
    }
    const schedule = (cb) =>
      window.requestIdleCallback
        ? window.requestIdleCallback(cb, { timeout: 1200 })
        : setTimeout(cb, 16)
    schedule(() => {
      buildBaselineNow(cache, wallSeed, profiles, adSettings)
    })
  }

  return {
    baselineState,
    initialLoadInProgress,
    deriveBaselineOrder,
    reorderByBaseline,
    buildBaselineNow,
    scheduleBaselineRebuild,
  }
}
