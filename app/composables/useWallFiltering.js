// composables/useWallFiltering.js
// Centralizes wall filtering & counting logic to keep TheWall.vue lean.
// Returns:
//  - filteredContent: respects active filters + search
//  - searchFilteredContent: ignores filters (used for pill / wall counts)
//  - counts: { wallCounts, totalCounts }
//  - textMatches (re-export for reuse/testing if needed)

import { expandSearchTerms } from '~/data/termRelations'

function normalizeArray(arr) {
  return Array.isArray(arr) ? arr : []
}

export function useWallFiltering(cacheRef, effectiveSearch, effectiveFilters) {
  // Robust text match with AND semantics + related term expansion
  const textMatches = (text, q) => {
    const hay = String(text || '').toLowerCase()
    const raw = String(q || '')
      .toLowerCase()
      .trim()
    if (!raw) return true
    const tokens = raw
      .replace(/[+]+/g, ' ')
      .replace(/[-_]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
    if (!tokens.length) return true
    return tokens.every((tok) => {
      const expanded =
        typeof expandSearchTerms === 'function' ? expandSearchTerms(tok) : [tok]
      return expanded.some((t) => hay.includes(String(t || '').toLowerCase()))
    })
  }

  // Raw pools (reactive via cacheRef)
  const rawPools = computed(() => ({
    grifts: normalizeArray(cacheRef.grifts),
    quotes: normalizeArray(cacheRef.quotes),
    memes: normalizeArray(cacheRef.memes),
    posts: normalizeArray(cacheRef.posts),
    profiles: normalizeArray(cacheRef.profiles),
  }))

  // Check if search query is targeting specific content types
  function getContentTypeFilter(q) {
    if (!q?.trim()) return null
    const query = q.toLowerCase().trim()
    const expanded = expandSearchTerms(query)

    // Check if any expanded terms match content type keywords
    const hasGriftsKeyword = expanded.some((term) =>
      ['grifts', 'grift', 'statement', 'assertion', 'position'].includes(term)
    )
    const hasQuotesKeyword = expanded.some((term) =>
      ['quotes', 'quote', 'quotation', 'saying', 'citation'].includes(term)
    )
    const hasMemesKeyword = expanded.some((term) =>
      ['memes', 'meme', 'image', 'picture', 'graphic'].includes(term)
    )
    const hasPostsKeyword = expanded.some((term) =>
      ['posts', 'post', 'article', 'blog'].includes(term)
    )

    // Check for hero-specific search (must NOT include zero terms)
    const hasHeroKeyword = expanded.some((term) =>
      ['hero', 'heroes'].includes(term)
    )
    const hasZeroKeyword = expanded.some((term) =>
      ['zero', 'zeros'].includes(term)
    )

    // If searching ONLY for heroes
    if (hasHeroKeyword && !hasZeroKeyword) {
      return {
        grifts: false,
        quotes: false,
        memes: false,
        profiles: true,
        profileFilter: 'heroes',
      }
    }

    // If searching ONLY for zeros
    if (hasZeroKeyword && !hasHeroKeyword) {
      return {
        grifts: false,
        quotes: false,
        memes: false,
        profiles: true,
        profileFilter: 'zeros',
      }
    }

    // Check for general profiles keyword
    const hasProfilesKeyword = expanded.some((term) =>
      ['profiles', 'profile', 'person', 'people'].includes(term)
    )

    if (hasProfilesKeyword) {
      return {
        grifts: false,
        quotes: false,
        memes: false,
        profiles: true,
        profileFilter: 'all',
      }
    }

    // If searching for specific content types, return filter
    if (
      hasGriftsKeyword ||
      hasQuotesKeyword ||
      hasMemesKeyword ||
      hasPostsKeyword
    ) {
      return {
        grifts: hasGriftsKeyword,
        quotes: hasQuotesKeyword,
        memes: hasMemesKeyword,
        posts: hasPostsKeyword,
        profiles: false,
      }
    }

    return null
  }

  // Helper function to deduplicate items by path, title, and content
  function deduplicateByPath(items) {
    if (!Array.isArray(items)) return items
    const seen = new Set()
    return items.filter((item) => {
      // Create a unique key based on multiple properties
      // For profiles, use path as the unique identifier (they all have title "Heroes and Zeros")
      // For memes and grifts, use title as primary identifier
      // For quotes, use a combination of quote text and attribution
      const title = item?.title || ''
      const path = item?._path || item?.path || item?.id || ''
      const quoteText = item?.quoteText || ''
      const attribution = item?.attribution || ''
      const grift = item?.grift || ''
      const profile = item?.meta?.profile || item?.profile || ''

      // Create a composite key that identifies truly unique content
      // Priority: path for profiles > title for others > specific content fields > path
      let uniqueKey = ''

      // Profiles: use path since they all share the same title
      if (profile || path.includes('/profiles/')) {
        uniqueKey = `path:${path}`
      } else if (title && title !== 'Heroes and Zeros') {
        uniqueKey = `title:${title.toLowerCase().trim()}`
      } else if (quoteText && attribution) {
        uniqueKey = `quote:${quoteText.toLowerCase().trim()}:${attribution.toLowerCase().trim()}`
      } else if (grift) {
        uniqueKey = `grift:${grift.toLowerCase().trim()}`
      } else if (path) {
        uniqueKey = `path:${path}`
      } else {
        return true // Keep items without any identifiable properties
      }

      if (seen.has(uniqueKey)) {
        // Only log duplicates in development mode to avoid console spam
        if (import.meta.dev) {
          console.warn(
            `Duplicate item detected and removed: ${title || path} (key: ${uniqueKey})`
          )
        }
        return false
      }
      seen.add(uniqueKey)
      return true
    })
  }

  function applySearch(groups, q) {
    if (!q?.trim()) {
      // Even without search, deduplicate to prevent rendering issues
      return {
        grifts: deduplicateByPath(groups.grifts),
        quotes: deduplicateByPath(groups.quotes),
        memes: deduplicateByPath(groups.memes),
        posts: deduplicateByPath(groups.posts),
        profiles: deduplicateByPath(groups.profiles),
      }
    }

    // Check if this is a content type search
    const contentTypeFilter = getContentTypeFilter(q)
    if (contentTypeFilter) {
      let filteredProfiles = groups.profiles

      // Apply hero/zero filtering
      if (contentTypeFilter.profileFilter === 'heroes') {
        filteredProfiles = groups.profiles.filter(
          (p) => p._path?.includes('/heroes/') || p.meta?.status === 'hero'
        )
      } else if (contentTypeFilter.profileFilter === 'zeros') {
        filteredProfiles = groups.profiles.filter(
          (p) => p._path?.includes('/zeros/') || p.meta?.status === 'zero'
        )
      }
      // profileFilter === 'all' means use all profiles

      // When searching for a specific content type (like "profiles"),
      // return ALL items of that type without text filtering
      return {
        grifts: deduplicateByPath(
          contentTypeFilter.grifts ? groups.grifts : []
        ),
        quotes: deduplicateByPath(
          contentTypeFilter.quotes ? groups.quotes : []
        ),
        memes: deduplicateByPath(contentTypeFilter.memes ? groups.memes : []),
        posts: deduplicateByPath(contentTypeFilter.posts ? groups.posts : []),
        profiles: deduplicateByPath(
          contentTypeFilter.profiles ? filteredProfiles : []
        ),
      }
    }

    // Regular text search within content with deduplication
    const out = {}
    for (const k in groups) {
      const filtered = groups[k].filter((it) =>
        textMatches(it._search || it.searchableText, q)
      )
      out[k] = deduplicateByPath(filtered)
    }
    return out
  }

  // Pools ignoring filters (for counts regardless of toggles)
  const searchFilteredContent = computed(() => {
    return applySearch(rawPools.value, effectiveSearch.value)
  })

  // Apply active filters first, then search
  const filteredContent = computed(() => {
    const f = effectiveFilters.value
    const base = {
      grifts: f.grifts ? rawPools.value.grifts : [],
      quotes: f.quotes ? rawPools.value.quotes : [],
      memes: f.memes ? rawPools.value.memes : [],
      posts: rawPools.value.posts, // Always include posts (no filter toggle)
      profiles: rawPools.value.profiles, // Always include profiles
    }
    return applySearch(base, effectiveSearch.value)
  })

  const counts = computed(() => {
    const sf = searchFilteredContent.value
    const rp = rawPools.value
    const f = effectiveFilters.value
    const wallCounts = {
      grifts: sf.grifts.length,
      quotes: sf.quotes.length,
      memes: sf.memes.length,
      posts: sf.posts?.length || 0,
      profiles: sf.profiles?.length || 0,
      total:
        (f.grifts ? sf.grifts.length : 0) +
        (f.quotes ? sf.quotes.length : 0) +
        (f.memes ? sf.memes.length : 0) +
        (sf.posts?.length || 0) +
        (sf.profiles?.length || 0),
    }
    const totalCounts = {
      grifts: rp.grifts.length,
      quotes: rp.quotes.length,
      memes: rp.memes.length,
      posts: rp.posts?.length || 0,
      profiles: rp.profiles?.length || 0,
      total:
        rp.grifts.length +
        rp.quotes.length +
        rp.memes.length +
        (rp.posts?.length || 0) +
        (rp.profiles?.length || 0),
    }
    return { wallCounts, totalCounts }
  })

  return { filteredContent, searchFilteredContent, counts, textMatches }
}
