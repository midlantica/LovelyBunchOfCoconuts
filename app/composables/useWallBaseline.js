// composables/useWallBaseline.js
// Baseline pattern caching system for instant wall refreshes

export function useWallBaseline() {
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

  function buildBaselineNow(cache, wallSeed, profiles, adsEnabled, adInterval) {
    try {
      // Import dependencies
      const { interleaveContent } = require('./interleaveContent')
      const { createAdProvider, calculateAdInterval } = require('./useAds')

      // Create ad provider if ads are enabled
      const adProvider = adsEnabled
        ? createAdProvider({ smallWeight: 0.7 })
        : null
      const interval = adsEnabled ? calculateAdInterval(adInterval) : 0

      const pattern = interleaveContent(
        cache.grifts,
        cache.quotes,
        cache.memes,
        {
          seed: wallSeed,
          enableShuffle: true,
          adInterval: interval,
          adProvider: adProvider,
          profiles: profiles,
          profileInterval: 4,
          posts: cache.posts,
        }
      )
      const order = deriveBaselineOrder(pattern)
      baselineState.value = {
        seed: wallSeed,
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

  function scheduleBaselineRebuild(
    cache,
    wallSeed,
    profiles,
    adsEnabled,
    adInterval
  ) {
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
      buildBaselineNow(cache, wallSeed, profiles, adsEnabled, adInterval)
    })
  }

  return {
    baselineState,
    deriveBaselineOrder,
    reorderByBaseline,
    buildBaselineNow,
    scheduleBaselineRebuild,
  }
}
