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

    // If searching for specific content types, return filter
    if (hasGriftsKeyword || hasQuotesKeyword || hasMemesKeyword) {
      return {
        grifts: hasGriftsKeyword,
        quotes: hasQuotesKeyword,
        memes: hasMemesKeyword,
      }
    }

    return null
  }

  function applySearch(groups, q) {
    if (!q?.trim()) return groups

    // Check if this is a content type search
    const contentTypeFilter = getContentTypeFilter(q)
    if (contentTypeFilter) {
      // Filter by content type only
      return {
        grifts: contentTypeFilter.grifts ? groups.grifts : [],
        quotes: contentTypeFilter.quotes ? groups.quotes : [],
        memes: contentTypeFilter.memes ? groups.memes : [],
      }
    }

    // Regular text search within content
    const out = {}
    for (const k in groups) {
      out[k] = groups[k].filter((it) =>
        textMatches(it._search || it.searchableText, q)
      )
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
      total:
        (f.grifts ? sf.grifts.length : 0) +
        (f.quotes ? sf.quotes.length : 0) +
        (f.memes ? sf.memes.length : 0),
    }
    const totalCounts = {
      grifts: rp.grifts.length,
      quotes: rp.quotes.length,
      memes: rp.memes.length,
      total: rp.grifts.length + rp.quotes.length + rp.memes.length,
    }
    return { wallCounts, totalCounts }
  })

  return { filteredContent, searchFilteredContent, counts, textMatches }
}
