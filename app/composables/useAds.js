// composables/useAds.js
// Manages ad content loading and provider creation

// Debug logging — only active in dev mode with VITE_AD_DEBUG=1
const adDebug = import.meta.dev && import.meta.env?.VITE_AD_DEBUG === '1'
const debugLog = (...args) => {
  if (adDebug) console.log(...args)
}

export function useAds() {
  const ads = useState('adsContent', () => ({
    square: [],
    horizontal: [],
    loaded: false,
  }))

  // Load ads from content - accepts pre-loaded content or queryContent function
  async function loadAds(queryContent = null, preloadedContent = null) {
    if (ads.value.loaded) return ads.value

    try {
      let adContent = []

      // Use pre-loaded content if provided
      if (preloadedContent) {
        adContent = preloadedContent
      }
      // Try to load from Nuxt Content if queryContent is provided
      else if (queryContent) {
        try {
          adContent = await queryContent('ads').where({ active: true }).find()
        } catch (error) {
          console.warn('Could not load ads from content:', error)
        }
      }

      if (adContent && adContent.length > 0) {
        // Separate ads by size - support both old and new naming
        ads.value.square = adContent.filter(
          (ad) => ad.size === 'square' || ad.size === 'small'
        )
        ads.value.horizontal = adContent.filter(
          (ad) => ad.size === 'horizontal' || ad.size === 'large'
        )
        ads.value.loaded = true

        // Debug: Show which ads were loaded with their frequencies
        debugLog(
          'Square ads loaded:',
          ads.value.square.map((ad) => ({
            id: ad.id,
            frequency: ad.frequency,
          }))
        )
        debugLog(
          'Horizontal ads loaded:',
          ads.value.horizontal.map((ad) => ({
            id: ad.id,
            frequency: ad.frequency,
          }))
        )
      } else {
        ads.value.loaded = true // Mark as loaded even if empty
      }
    } catch (error) {
      console.error('Failed to load ads:', error)
      ads.value.loaded = true // Mark as loaded to prevent infinite retries
    }

    return ads.value
  }

  // Create an ad provider function for interleaveContent
  function createAdProviderInternal(options = {}) {
    const { squareWeight = 0.6 } = options

    // Helper function to select ad based on frequency weights
    function selectWeightedAd(adArray) {
      if (!adArray || adArray.length === 0) return null

      // Calculate total weight
      const totalWeight = adArray.reduce(
        (sum, ad) => sum + (ad.frequency || 10),
        0
      )

      // Random number between 0 and totalWeight
      let random = Math.random() * totalWeight

      // Find which ad this random number falls into
      for (const ad of adArray) {
        const freq = ad.frequency || 10
        random -= freq
        if (random <= 0) {
          return ad
        }
      }

      // Fallback to last ad (shouldn't happen)
      return adArray[adArray.length - 1]
    }

    return () => {
      // Decide whether to show square or horizontal ad based on weight
      const trySquareFirst = Math.random() < squareWeight

      let selectedAd = null

      if (trySquareFirst) {
        // Try square first
        selectedAd = selectWeightedAd(ads.value.square)
        if (!selectedAd) {
          // Fall back to horizontal if no square ad selected
          selectedAd = selectWeightedAd(ads.value.horizontal)
        }
      } else {
        // Try horizontal first
        selectedAd = selectWeightedAd(ads.value.horizontal)
        if (!selectedAd) {
          // Fall back to square if no horizontal ad selected
          selectedAd = selectWeightedAd(ads.value.square)
        }
      }

      if (selectedAd) {
        // Map old size values to new ones for compatibility
        let size = selectedAd.size
        if (size === 'small') size = 'square'
        if (size === 'large') size = 'horizontal'

        return {
          ...selectedAd,
          size: size || 'square',
          isAd: true,
        }
      }

      return null
    }
  }

  // Calculate ad interval based on setting
  function calculateAdIntervalInternal(baseSetting = 10) {
    // Lower number = more frequent ads
    // baseSetting of 10 means show ad every 10 content items
    return Math.max(3, baseSetting) // Minimum of 3 items between ads
  }

  return {
    ads: readonly(ads),
    loadAds,
    createAdProvider: createAdProviderInternal,
    calculateAdInterval: calculateAdIntervalInternal,
  }
}

// Export standalone versions for use outside composable (e.g., in precomputation)
export function createAdProvider(options = {}) {
  const { ads } = useAds()

  const { squareWeight = 0.6 } = options

  // Helper function to select ad based on frequency weights
  function selectWeightedAd(adArray) {
    if (!adArray || adArray.length === 0) return null

    const totalWeight = adArray.reduce(
      (sum, ad) => sum + (ad.frequency || 10),
      0
    )

    let random = Math.random() * totalWeight

    for (const ad of adArray) {
      const freq = ad.frequency || 10
      random -= freq
      if (random <= 0) {
        return ad
      }
    }

    return adArray[adArray.length - 1]
  }

  return () => {
    const trySquareFirst = Math.random() < squareWeight
    let selectedAd = null

    if (trySquareFirst) {
      selectedAd = selectWeightedAd(ads.value.square)
      if (!selectedAd) {
        selectedAd = selectWeightedAd(ads.value.horizontal)
      }
    } else {
      selectedAd = selectWeightedAd(ads.value.horizontal)
      if (!selectedAd) {
        selectedAd = selectWeightedAd(ads.value.square)
      }
    }

    if (selectedAd) {
      let size = selectedAd.size
      if (size === 'small') size = 'square'
      if (size === 'large') size = 'horizontal'

      return {
        ...selectedAd,
        size: size || 'square',
        isAd: true,
      }
    }

    return null
  }
}

export function calculateAdInterval(baseSetting = 10) {
  return Math.max(3, baseSetting)
}
