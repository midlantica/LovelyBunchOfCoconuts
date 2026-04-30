// composables/useWallPrecomputation.js
// Background pre-computation system for instant wall refreshes

export function useWallPrecomputation() {
  const precomputedWalls = useState('precomputedWalls', () => new Map())
  const isPrecomputing = useState('isPrecomputing', () => false)
  const precomputationReady = useState('precomputationReady', () => false)

  // Generate a pre-computed wall layout
  async function precomputeWallLayout(
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

      // Ensure all parameters are arrays
      const safeQuotes = quotes || []
      const safeMemes = memes || []
      const safeProfiles = profiles || []

      // Pre-compute the wall layout
      const precomputedLayout = interleaveContent(
        [], // no grifts
        safeQuotes,
        safeMemes,
        {
          seed: newSeed,
          enableShuffle: true,
          profiles: safeProfiles,
          profileInterval: options.profileInterval || 4,
        }
      )

      // Store the pre-computed layout
      const layoutKey = `${safeQuotes.length}-${safeMemes.length}-${safeProfiles.length}`
      precomputedWalls.value.set(layoutKey, {
        seed: newSeed,
        layout: precomputedLayout,
        timestamp: Date.now(),
        quotes: safeQuotes.length,
        memes: safeMemes.length,
        profiles: safeProfiles.length,
      })

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
  function getPrecomputedLayout(quotes, memes, profiles = []) {
    const safeQuotes = quotes || []
    const safeMemes = memes || []
    const safeProfiles = profiles || []
    const layoutKey = `${safeQuotes.length}-${safeMemes.length}-${safeProfiles.length}`
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
  function schedulePrecomputation(quotes, memes, profiles = [], options = {}) {
    if (typeof window === 'undefined') return

    // Wait 10 seconds after initial load, then pre-compute
    setTimeout(() => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(
          () => precomputeWallLayout(quotes, memes, profiles, options),
          { timeout: 5000 }
        )
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(
          () => precomputeWallLayout(quotes, memes, profiles, options),
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
  function usePrecomputedRefresh(quotes, memes, profiles = []) {
    const cached = getPrecomputedLayout(quotes, memes, profiles)

    if (cached) {
      // Update wall seed to the pre-computed seed
      const { wallSeed } = useWallSeed()
      wallSeed.value = cached.seed

      // Schedule next pre-computation
      schedulePrecomputation(quotes, memes, profiles, {
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
