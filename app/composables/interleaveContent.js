// composables/interleaveContent.js
// Core pattern engine: Creates visual layout pattern [ quote ] → [ meme | meme ] → [ quote ] → [ meme | meme ]
// - Deterministic (seeded) optional shuffle for idempotence
// - Non‑mutating (does not splice input arrays)
// - Graceful fallback ordering remains stable & deterministic

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
 * Interleave quotes, posts, memes, and profiles into strict visual pattern with stable fallbacks.
 * @param {Array} _grifts - Ignored (kept for API compatibility)
 * @param {Array} quotes
 * @param {Array} memes
 * @param {Object} options
 * @param {string} [options.seed] - Seed for deterministic shuffle
 * @param {boolean} [options.enableShuffle=true] - Disable to keep original order
 * @param {Array} [options.profiles] - Array of profile objects to interleave
 * @param {number} [options.profileInterval=4] - Insert profile after every N complete patterns (0 = disabled)
 * @param {Array} [options.posts] - Array of post objects to interleave with quotes
 * @returns {Array} pattern items (types: quote | post | memeRow | profile)
 */
export function interleaveContent(_grifts, quotes, memes, options = {}) {
  const {
    seed,
    enableShuffle = true,
    profiles = [],
    profileInterval = 4,
    posts = [],
  } = options

  const rng = seed ? createSeededRng(seed) : null

  // Create non‑mutated working arrays (optionally shuffled)
  const q = enableShuffle ? seededShuffle(quotes, rng) : [...quotes]
  const m = enableShuffle ? seededShuffle(memes, rng) : [...memes]
  const po = enableShuffle ? seededShuffle(posts, rng) : [...posts]
  const p = enableShuffle ? seededShuffle(profiles, rng) : [...profiles]

  // Indices instead of splicing (preserves idempotence)
  let qi = 0
  let mi = 0
  let poi = 0
  let pi = 0

  const output = []
  const pattern = ['quote', 'memeRow', 'quote', 'memeRow']
  let patternIndex = 0
  let producedCoreItems = 0
  let completedPatterns = 0
  let memeRowCount = 0

  const haveMemes = () => mi < m.length
  const haveQuotes = () => qi < q.length
  const havePosts = () => poi < po.length
  const memeRemaining = () => m.length - mi
  const quoteRemaining = () => q.length - qi
  const postRemaining = () => po.length - poi

  const pushMemeRow = (count = 2) => {
    memeRowCount++

    // Every 2nd meme row: try to create mixed [Meme | Post] pair
    if (memeRowCount % 2 === 0 && havePosts() && haveMemes()) {
      const meme = { ...m[mi], _type: 'meme' }
      mi++
      const post = { ...po[poi], _type: 'post' }
      poi++

      const items =
        (rng ? rng() : Math.random()) > 0.5 ? [meme, post] : [post, meme]

      output.push({ type: 'memeRow', data: items })
      producedCoreItems++
      return
    }

    // Normal meme pair [Meme | Meme]
    const slice = m
      .slice(mi, mi + count)
      .map((item) => ({ ...item, _type: 'meme' }))
    mi += slice.length

    output.push({ type: 'memeRow', data: slice })
    producedCoreItems++
  }

  const pushQuote = (quoteObj) => {
    output.push({ type: 'quote', data: quoteObj })
    producedCoreItems++
  }

  const pushPost = (postObj) => {
    output.push({
      type: 'post',
      data: { ...postObj, _type: 'post' },
    })
    producedCoreItems++
  }

  const pushProfile = (profileObj) => {
    output.push({
      type: 'profile',
      data: profileObj,
    })
    producedCoreItems++
  }

  // Main build loop
  while (true) {
    const expected = pattern[patternIndex % pattern.length]
    let created = false

    if (expected === 'memeRow') {
      if (memeRemaining() >= 2) {
        pushMemeRow(2)
        created = true
      }
    } else if (expected === 'quote') {
      if (quoteRemaining() >= 1) {
        pushQuote(q[qi])
        qi += 1
        created = true
      }
    }

    // Fallbacks: memeRow(2) → quote(1) → post(1) → meme single
    if (!created) {
      if (memeRemaining() >= 2) {
        pushMemeRow(2)
        created = true
      } else if (quoteRemaining() >= 1) {
        pushQuote(q[qi])
        qi += 1
        created = true
      } else if (postRemaining() >= 2) {
        const post1 = { ...po[poi], _type: 'post' }
        poi++
        const post2 = { ...po[poi], _type: 'post' }
        poi++
        output.push({ type: 'memeRow', data: [post1, post2] })
        producedCoreItems++
        created = true
      } else if (postRemaining() >= 1 && memeRemaining() >= 1) {
        const meme = { ...m[mi], _type: 'meme' }
        mi++
        const post = { ...po[poi], _type: 'post' }
        poi++
        const items =
          (rng ? rng() : Math.random()) > 0.5 ? [meme, post] : [post, meme]
        output.push({ type: 'memeRow', data: items })
        producedCoreItems++
        created = true
      } else if (postRemaining() === 1) {
        const post = { ...po[poi], _type: 'post' }
        poi++
        output.push({ type: 'memeRow', data: [post] })
        producedCoreItems++
        created = true
      } else if (memeRemaining() === 1) {
        pushMemeRow(1)
        created = true
      }
    }

    if (!created) break // nothing left to place

    patternIndex++

    // Check if we just completed a full pattern (4 items)
    if (patternIndex % 4 === 0) {
      completedPatterns++

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
  while (pi < p.length) {
    pushProfile(p[pi])
    pi++
  }

  // Attach meta (non-enumerable so existing renders over arrays stay safe)
  Object.defineProperty(output, '_meta', {
    value: {
      seed: seed || null,
      counts: {
        quotesUsed: qi,
        memesUsed: mi,
        postsUsed: poi,
        profilesUsed: pi,
        total: output.length,
      },
      exhausted: {
        quotes: qi >= q.length,
        memes: mi >= m.length,
        posts: poi >= po.length,
        profiles: pi >= p.length,
      },
    },
    enumerable: false,
  })

  return output
}
