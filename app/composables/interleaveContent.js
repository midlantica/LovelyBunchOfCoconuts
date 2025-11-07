// composables/interleaveContent.js
// Core pattern engine: Creates visual layout pattern [ grift | grift ] → [ quote ] → [ meme | meme ] → [ quote ]
// Improvements:
// - Deterministic (seeded) optional shuffle for idempotence
// - Non‑mutating (does not splice input arrays)
// - Graceful fallback ordering remains stable & deterministic
// - Optional ad placeholder injection every N pattern items (as quote with isAd flag)
// - Never introduces new template types (still only: griftPair, quote, memeRow)
// - Avoids partial singles except when content exhaustion leaves 1 item (last resort)

function createSeededRng(seed) {
  if (!seed) return Math.random // fallback
  // xmur3 hash to seed mulberry32
  function xmur3(str) {
    let h = 1779033703 ^ str.length
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
      h = (h << 13) | (h >>> 19)
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
  function mulberry32(a) {
    return function () {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  return mulberry32(xmur3(seed))
}

function seededShuffle(arr, rng) {
  if (!rng || rng === Math.random) {
    // keep original random behavior only if no seed provided
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Interleave grifts, quotes, memes, and profiles into strict visual pattern with stable fallbacks.
 * @param {Array} grifts
 * @param {Array} quotes
 * @param {Array} memes
 * @param {Object} options
 * @param {string} [options.seed] - Seed for deterministic shuffle
 * @param {number} [options.adInterval=0] - Inject ad placeholder every N pattern items (0 = disabled)
 * @param {Function} [options.adProvider] - () => { id, title, body, size } returns data for ad. If returns falsy, ad skipped.
 * @param {boolean} [options.enableShuffle=true] - Disable to keep original order
 * @param {Array} [options.profiles] - Array of profile objects to interleave
 * @param {number} [options.profileInterval=4] - Insert profile after every N complete patterns (0 = disabled)
 * @returns {Array} pattern items (types: griftPair | quote | memeRow | profile)
 */
export function interleaveContent(grifts, quotes, memes, options = {}) {
  const {
    seed,
    adInterval = 0,
    adProvider,
    enableShuffle = true,
    profiles = [],
    profileInterval = 4,
  } = options

  const rng = seed ? createSeededRng(seed) : null

  // Create non‑mutated working arrays (optionally shuffled)
  const c = enableShuffle ? seededShuffle(grifts, rng) : [...grifts]
  const q = enableShuffle ? seededShuffle(quotes, rng) : [...quotes]
  const m = enableShuffle ? seededShuffle(memes, rng) : [...memes]
  const p = enableShuffle ? seededShuffle(profiles, rng) : [...profiles]

  // Indices instead of splicing (preserves idempotence)
  let ci = 0
  let qi = 0
  let mi = 0
  let pi = 0

  const output = []
  const pattern = ['griftPair', 'quote', 'memeRow', 'quote']
  let patternIndex = 0
  let producedCoreItems = 0 // counts non‑ad items only
  let lastItemWasAd = false // Track if last item added was an ad
  let itemsSinceLastAd = 0 // Track items since last ad
  let completedPatterns = 0 // Track number of complete 4-item patterns

  const haveGrifts = () => ci < c.length
  const haveMemes = () => mi < m.length
  const haveQuotes = () => qi < q.length
  const griftRemaining = () => c.length - ci
  const memeRemaining = () => m.length - mi
  const quoteRemaining = () => q.length - qi

  const pushGriftPair = (count = 2, includeAd = false) => {
    const slice = c.slice(ci, ci + count)
    ci += slice.length

    let hadAd = false

    // If we should include an ad and have an ad provider
    // But don't add if last item was an ad
    if (includeAd && adProvider && slice.length > 0 && !lastItemWasAd) {
      const adData = adProvider()
      if (adData && (adData.size === 'square' || adData.size === 'small')) {
        // Replace one grift with an ad (push the grift back)
        if (slice.length === 2) {
          // Put the second grift back
          ci -= 1
          slice.pop()
        }
        // Add the ad as a grift-like item
        slice.push({
          ...adData,
          isAd: true,
          _type: 'grift',
        })
        hadAd = true
        itemsSinceLastAd = 0
      }
    }

    output.push({ type: 'griftPair', data: slice })
    producedCoreItems++
    lastItemWasAd = hadAd
    if (!hadAd) itemsSinceLastAd++
  }
  const pushMemeRow = (count = 2, includeAd = false) => {
    const slice = m.slice(mi, mi + count)
    mi += slice.length

    let hadAd = false

    // If we should include an ad and have an ad provider
    // But don't add if last item was an ad
    if (includeAd && adProvider && slice.length > 0 && !lastItemWasAd) {
      const adData = adProvider()
      if (adData && (adData.size === 'square' || adData.size === 'small')) {
        // Replace one meme with an ad (push the meme back)
        if (slice.length === 2) {
          // Put the second meme back
          mi -= 1
          slice.pop()
        }
        // Add the ad as a meme-like item
        slice.push({
          ...adData,
          isAd: true,
          _type: 'meme',
        })
        hadAd = true
        itemsSinceLastAd = 0
      }
    }

    output.push({ type: 'memeRow', data: slice })
    producedCoreItems++
    lastItemWasAd = hadAd
    if (!hadAd) itemsSinceLastAd++
  }
  const pushQuote = (quoteObj, isAd = false) => {
    output.push({
      type: 'quote',
      data: isAd ? { ...quoteObj, isAd: true } : quoteObj,
    })
    if (!isAd) {
      producedCoreItems++
      itemsSinceLastAd++
    } else {
      itemsSinceLastAd = 0
    }
    lastItemWasAd = isAd
  }
  const pushProfile = (profileObj) => {
    output.push({
      type: 'profile',
      data: profileObj,
    })
    producedCoreItems++
    itemsSinceLastAd++
    lastItemWasAd = false
  }

  // Main build loop
  while (true) {
    const expected = pattern[patternIndex % pattern.length]
    let created = false

    if (expected === 'griftPair') {
      if (griftRemaining() >= 2) {
        // Check if we should inject a square ad in this grift pair
        const shouldInjectAd =
          adInterval > 0 &&
          producedCoreItems > 0 &&
          producedCoreItems % adInterval === 0 &&
          adProvider

        pushGriftPair(2, shouldInjectAd)
        created = true
      }
    } else if (expected === 'memeRow') {
      if (memeRemaining() >= 2) {
        // Check if we should inject a small ad in this meme row
        const shouldInjectAd =
          adInterval > 0 &&
          producedCoreItems > 0 &&
          producedCoreItems % adInterval === 0 &&
          adProvider

        pushMemeRow(2, shouldInjectAd)
        created = true
      }
    } else if (expected === 'quote') {
      if (quoteRemaining() >= 1) {
        pushQuote(q[qi])
        qi += 1
        created = true
      }
    }

    // Fallbacks (stable priority): griftPair(2) → memeRow(2) → quote(1) → grift single → meme single
    if (!created) {
      if (griftRemaining() >= 2) {
        pushGriftPair(2)
        created = true
      } else if (memeRemaining() >= 2) {
        pushMemeRow(2)
        created = true
      } else if (quoteRemaining() >= 1) {
        pushQuote(q[qi])
        qi += 1
        created = true
      } else if (griftRemaining() === 1) {
        pushGriftPair(1) // single wrapped as griftPair for template compatibility
        created = true
      } else if (memeRemaining() === 1) {
        pushMemeRow(1)
        created = true
      }
    }

    if (!created) break // nothing left to place

    // Optional ad injection (as quote placeholder) AFTER creating a core item
    // Only inject if we haven't just placed an ad and have had enough items since last ad
    if (
      adInterval > 0 &&
      producedCoreItems > 0 &&
      producedCoreItems % adInterval === 0 &&
      adProvider &&
      !lastItemWasAd &&
      itemsSinceLastAd >= 2 // Ensure at least 2 items between ads
    ) {
      const adData = adProvider()
      if (adData && (adData.size === 'horizontal' || adData.size === 'large')) {
        pushQuote(
          {
            id: adData.id || `ad-${producedCoreItems}`,
            title: adData.title || 'Sponsored',
            body: adData.body || '',
            isAd: true,
            ...adData,
          },
          true
        )
      }
    }

    patternIndex++

    // Check if we just completed a full pattern (4 items: griftPair, quote, memeRow, quote)
    if (patternIndex % 4 === 0) {
      completedPatterns++

      // Insert profile after every profileInterval complete patterns
      const shouldInsert =
        profileInterval > 0 &&
        completedPatterns % profileInterval === 0 &&
        pi < p.length

      if (shouldInsert) {
        pushProfile(p[pi])
        pi++
      }
    }
  }

  // Add any remaining profiles that weren't inserted during normal flow
  // This ensures profiles show up even when they're the only search results
  while (pi < p.length) {
    pushProfile(p[pi])
    pi++
  }

  // Attach meta (non-enumerable so existing renders over arrays stay safe)
  Object.defineProperty(output, '_meta', {
    value: {
      seed: seed || null,
      counts: {
        griftsUsed: ci,
        quotesUsed: qi,
        memesUsed: mi,
        profilesUsed: pi,
        total: output.length,
      },
      exhausted: {
        grifts: ci >= c.length,
        quotes: qi >= q.length,
        memes: mi >= m.length,
        profiles: pi >= p.length,
      },
    },
    enumerable: false,
  })

  if (import.meta?.env?.DEV && seed) {
    // Lightweight debug hook, safe in dev only
    try {
    } catch (_) {}
  }

  return output
}
