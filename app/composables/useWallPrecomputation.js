// composables/useWallPrecomputation.js
// Background pre-computation system for instant wall refreshes

export function useWallPrecomputation() {
  const precomputedWalls = useState('precomputedWalls', () => new Map())
  const isPrecomputing = useState('isPrecomputing', () => false)
  const precomputationReady = useState('precomputationReady', () => false)

  // Generate a pre-computed wall layout
  async function precomputeWallLayout(
    claims,
    quotes,
    memes,
    profiles = [],
    options = {}
  ) {
    if (isPrecomputing.value) return null

    try {
      isPrecomputing.value = true

      // Generate new seed for this pre-computation
      const { generateSeed } = await import('./useWallSeed.js')
      const newSeed = generateSeed()

      // Import interleaving function
      const { interleaveContent } = await import('./interleaveContent.js')

      // Create ad provider if ads are enabled
      const { createAdProvider, calculateAdInterval } = await import(
        './useAds.js'
      )
      const adProvider = options.adsEnabled
        ? createAdProvider({ smallWeight: 0.7 })
        : null
      const interval = options.adsEnabled
        ? calculateAdInterval(options.adInterval || 5)
        : 0

      // Pre-compute the wall layout
      const precomputedLayout = interleaveContent(claims, quotes, memes, {
        seed: newSeed,
        enableShuffle: true,
        adInterval: interval,
        adProvider: adProvider,
        profiles: profiles,
        profileInterval: options.profileInterval || 4,
      })

      // Store the pre-computed layout
      const layoutKey = `${claims.length}-${quotes.length}-${memes.length}-${profiles.length}`
      precomputedWalls.value.set(layoutKey, {
        seed: newSeed,
        layout: precomputedLayout,
        timestamp: Date.now(),
        claims: claims.length,
        quotes: quotes.length,
        memes: memes.length,
        profiles: profiles.length,
      })

      if (import.meta.dev) {
      }

      precomputationReady.value = true
      return precomputedLayout
    } catch (error) {
      console.warn('Pre-computation failed:', error)
      return null
    } finally {
      isPrecomputing.value = false
    }
  }

  // Get a pre-computed layout if available
  function getPrecomputedLayout(claims, quotes, memes, profiles = []) {
    const layoutKey = `${claims.length}-${quotes.length}-${memes.length}-${profiles.length}`
    const cached = precomputedWalls.value.get(layoutKey)

    if (!cached) return null

    // Check if cache is still fresh (within 5 minutes)
    const maxAge = 5 * 60 * 1000 // 5 minutes
    if (Date.now() - cached.timestamp > maxAge) {
      precomputedWalls.value.delete(layoutKey)
      return null
    }

    return cached
  }

  // Schedule background pre-computation
  function schedulePrecomputation(
    claims,
    quotes,
    memes,
    profiles = [],
    options = {}
  ) {
    if (typeof window === 'undefined') return

    // Wait 10 seconds after initial load, then pre-compute
    setTimeout(() => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(
          () => precomputeWallLayout(claims, quotes, memes, profiles, options),
          { timeout: 5000 }
        )
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(
          () => precomputeWallLayout(claims, quotes, memes, profiles, options),
          100
        )
      }
    }, 10000)
  }

  // Clear old pre-computed layouts
  function clearStalePrecomputations() {
    const maxAge = 5 * 60 * 1000 // 5 minutes
    const now = Date.now()

    for (const [key, cached] of precomputedWalls.value.entries()) {
      if (now - cached.timestamp > maxAge) {
        precomputedWalls.value.delete(key)
      }
    }
  }

  // Use pre-computed layout for instant refresh
  function usePrecomputedRefresh(claims, quotes, memes, profiles = []) {
    const cached = getPrecomputedLayout(claims, quotes, memes, profiles)

    if (cached) {
      // Update wall seed to the pre-computed seed
      const { wallSeed } = useWallSeed()
      wallSeed.value = cached.seed

      if (import.meta.dev) {
      }

      // Schedule next pre-computation
      schedulePrecomputation(claims, quotes, memes, profiles, {
        adsEnabled: true,
        adInterval: 5,
        profileInterval: 4,
      })

      return cached.layout
    }

    return null
  }

  return {
    precomputedWalls,
    isPrecomputing,
    precomputationReady,
    precomputeWallLayout,
    getPrecomputedLayout,
    schedulePrecomputation,
    clearStalePrecomputations,
    usePrecomputedRefresh,
  }
}
