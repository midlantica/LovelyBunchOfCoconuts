// composables/useContentCache.js
// Reactive content cache with transformation pipeline: loads, transforms, and caches all content types
// Provides progressive loading (initial batch + remaining) with search enhancement and SSR compatibility

import { interleaveContent } from '~/composables/interleaveContent'

// Unified debug flag (enable by setting VITE_CONTENT_DEBUG=1)
const contentDebug =
  import.meta.dev && import.meta.env?.VITE_CONTENT_DEBUG === '1'
const debugLog = (...args) => {
  if (contentDebug) console.log(...args)
}

// extractSearchableText is auto-imported from ~/utils/searchText.ts

// Global cache instance - shared across all components
const globalCache = reactive({
  quotes: [],
  memes: [],
  posts: [],
  profiles: [],
  isLoading: false,
  error: null,
  // Progressive loading state
  _initialLoadComplete: false,
  _fullLoadComplete: false,
  // Whether cache was restored from sessionStorage (fast path)
  _restoredFromSession: false,
})

// ─── SessionStorage persistence for instant Cmd-R reloads ───
const SESSION_CACHE_KEY = 'lboc_content_cache'

function saveToSessionStorage() {
  if (typeof sessionStorage === 'undefined') return
  try {
    const slim = {
      quotes: globalCache.quotes,
      memes: globalCache.memes.map((m) => {
        const { body, ...rest } = m
        return rest
      }),
      posts: globalCache.posts,
      ts: Date.now(),
    }
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(slim))
    debugLog('💾 Content saved to sessionStorage')
  } catch (e) {
    debugLog('⚠️ Could not save to sessionStorage:', e.message)
  }
}

function restoreFromSessionStorage() {
  if (typeof sessionStorage === 'undefined') return false
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    // Reject stale cache (older than 30 minutes)
    if (Date.now() - (data.ts || 0) > 30 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_CACHE_KEY)
      return false
    }
    // Must have meaningful content
    if (!data.quotes?.length && !data.memes?.length) {
      return false
    }
    globalCache.quotes = data.quotes || []
    globalCache.memes = data.memes || []
    globalCache.posts = data.posts || []
    globalCache._initialLoadComplete = true
    globalCache._fullLoadComplete = true
    globalCache._restoredFromSession = true

    // Rebuild slug maps from restored data
    rebuildSlugMaps()

    debugLog(
      `⚡ Restored from sessionStorage: ${globalCache.quotes.length} quotes, ${globalCache.memes.length} memes, ${globalCache.posts.length} posts`
    )
    return true
  } catch (e) {
    debugLog('⚠️ Could not restore from sessionStorage:', e.message)
    return false
  }
}

function rebuildSlugMaps() {
  slugMaps.quotes.clear()
  slugMaps.memes.clear()
  slugMaps.posts.clear()

  for (const item of globalCache.quotes) {
    const fileBase = (item.id || item._path || '')
      .toString()
      .split('/')
      .pop()
      ?.replace(/\.md$/, '')
      .toLowerCase()
    const fileSlugDash = fileBase?.replace(/_/g, '-')
    const fileSlugUnderscore = fileBase?.replace(/-/g, '_')
    const author = slugify(item.attribution || 'unknown')
    const qt = slugify(item.quoteText || item.title || '')
    const s = `${author}-${qt}`.substring(0, 80)
    registerSlugKeys(
      slugMaps.quotes,
      [s, fileSlugDash, fileSlugUnderscore, fileBase],
      item
    )
  }
  for (const item of globalCache.memes) {
    const fileBase = (item.id || item._path || '')
      .toString()
      .split('/')
      .pop()
      ?.replace(/\.md$/, '')
      .toLowerCase()
    const fileSlugDash = fileBase?.replace(/_/g, '-')
    const fileSlugUnderscore = fileBase?.replace(/-/g, '_')
    const s = slugify(item.title || item.description || '')
    registerSlugKeys(
      slugMaps.memes,
      [s, fileSlugDash, fileSlugUnderscore, fileBase],
      item
    )
  }
  for (const item of globalCache.posts) {
    const fileBase = (item.id || item._path || '')
      .toString()
      .split('/')
      .pop()
      ?.replace(/\.md$/, '')
      .toLowerCase()
    const fileSlugDash = fileBase?.replace(/_/g, '-')
    const fileSlugUnderscore = fileBase?.replace(/-/g, '_')
    const s = slugify(item.title || '')
    registerSlugKeys(
      slugMaps.posts,
      [s, fileSlugDash, fileSlugUnderscore, fileBase],
      item
    )
  }
}

// slugify is auto-imported from ~/utils/slugify.ts

const slugMaps = reactive({
  quotes: new Map(),
  memes: new Map(),
  posts: new Map(),
  profiles: new Map(),
})

// Helper to register multiple keys for the same item
const registerSlugKeys = (map, keys, value) => {
  ;(Array.isArray(keys) ? keys : [keys])
    .filter(Boolean)
    .forEach((k) => map.set(k, value))
}

// Extract plain text from a Nuxt Content body node.
function extractNodeText(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    const isElementNode =
      typeof node[0] === 'string' &&
      /^[a-z][a-z0-9]*$/i.test(node[0]) &&
      (node.length < 2 ||
        (typeof node[1] === 'object' && !Array.isArray(node[1])))
    if (isElementNode) {
      return node.slice(2).map(extractNodeText).join('')
    }
    return node.map(extractNodeText).join('')
  }
  return ''
}

// Extract HTML from a Nuxt Content body node, preserving inline formatting
const INLINE_TAGS = new Set(['em', 'strong', 'b', 'i', 's', 'code', 'span'])
function extractNodeHtml(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    const isElementNode =
      typeof node[0] === 'string' &&
      /^[a-z][a-z0-9]*$/i.test(node[0]) &&
      (node.length < 2 ||
        (typeof node[1] === 'object' && !Array.isArray(node[1])))
    if (isElementNode) {
      const tag = node[0]
      const inner = node.slice(2).map(extractNodeHtml).join('')
      if (INLINE_TAGS.has(tag)) return `<${tag}>${inner}</${tag}>`
      return inner
    }
    return node.map(extractNodeHtml).join('')
  }
  return ''
}

export function useContentCache() {
  const cache = globalCache
  const { quotes, memes, posts, profiles, isLoading, error } = toRefs(cache)

  // Auto-load content if not already loaded (for dynamic routes)
  const ensureContentLoaded = async () => {
    if (
      cache.quotes.length === 0 &&
      cache.memes.length === 0 &&
      cache.posts.length === 0 &&
      cache.profiles.length === 0 &&
      !cache.isLoading
    ) {
      debugLog('🚀 Auto-loading content for dynamic route...')
      await loadAllContent()
    }
  }

  // Helper function to filter out special files
  const filterSpecialFiles = (items) => {
    return (items || []).filter((item) => {
      const path = item.path?.toLowerCase() || item._path?.toLowerCase() || ''
      const id = item.id?.toLowerCase() || ''
      const pathParts = path.split('/')
      const hasUnderscoreFolder = pathParts.some((part) => part.startsWith('_'))
      const shouldFilter =
        path.includes('readme') ||
        path.includes('test-ignore') ||
        path.includes('__') ||
        id.includes('readme') ||
        id.includes('test-ignore') ||
        hasUnderscoreFolder
      return !shouldFilter
    })
  }

  // Helper function to transform content for component compatibility
  const transformContentForComponents = (items, type) => {
    return items.map((item) => {
      const transformed = { ...item }

      if (type === 'quotes') {
        if (item.body && item.body.value) {
          const headings = item.body.value
            .filter((element) => element[0] === 'h2' || element[0] === 'h1')
            .map((element) => element[2] || '')
            .filter(Boolean)
          transformed.headings = headings
          const paragraphElements = item.body.value.filter(
            (element) => element[0] === 'p'
          )
          const paragraphs = paragraphElements
            .map((element) => element.slice(2).map(extractNodeText).join(''))
            .filter(Boolean)
          transformed.attribution = paragraphs[paragraphs.length - 1] || ''
          const paragraphsHtml = paragraphElements
            .map((element) => element.slice(2).map(extractNodeHtml).join(''))
            .filter(Boolean)
          transformed.attributionHtml =
            paragraphsHtml[paragraphsHtml.length - 1] || ''
          if (headings.length > 0) {
            transformed.quoteText = headings.join('\n\n')
          }
        }
      }

      // For memes: extract image from body content structure
      if (type === 'memes') {
        if (item.body && item.body.value) {
          for (const element of item.body.value) {
            if (Array.isArray(element)) {
              if (element[0] === 'img' && element[1]?.src) {
                transformed.image = element[1].src
                break
              }
              if (element[0] === 'p' && Array.isArray(element[2])) {
                if (element[2][0] === 'img' && element[2][1]?.src) {
                  transformed.image = element[2][1].src
                  break
                }
                for (const child of element[2]) {
                  if (
                    Array.isArray(child) &&
                    child[0] === 'img' &&
                    child[1]?.src
                  ) {
                    transformed.image = child[1].src
                    break
                  }
                }
                if (transformed.image) break
              }
              if (
                element[0] === 'p' &&
                typeof element[2] === 'string' &&
                element[2].includes('![')
              ) {
                const imageMatch = element[2].match(/!\[.*?\]\(([^)]+)\)/)
                if (imageMatch) {
                  transformed.image = imageMatch[1]
                  break
                }
              }
            }
          }
        }

        if (!transformed.image) {
          transformed.image = ''
        }

        if (item.title) {
          transformed.description = item.title
        }

        if (item.body && item.body.value) {
          const textParts = []
          for (const element of item.body.value) {
            if (Array.isArray(element)) {
              if (element[0] === 'p' && typeof element[2] === 'string') {
                if (!element[2].includes('![')) {
                  textParts.push(element[2])
                }
              }
              if (
                (element[0] === 'h1' ||
                  element[0] === 'h2' ||
                  element[0] === 'h3') &&
                typeof element[2] === 'string'
              ) {
                textParts.push(element[2])
              }
            }
          }
          transformed.bodyText = textParts.join('\n\n').trim()
        }
      }

      // For posts: extract body text for preview and search
      if (type === 'posts') {
        if (item.body && item.body.value) {
          transformed.body = item.body
          const bodyText = extractSearchableText(item.body, {
            itemPath: item._path || item.path,
          })
          transformed.bodyText = bodyText
        }
      }

      // Add searchable text field
      const rawSearch = extractSearchableText(item.body, {
        itemPath: item._path || item.path,
      })
      transformed.searchableText = rawSearch

      const searchParts = [
        transformed.title,
        transformed.quoteText,
        transformed.attribution,
        transformed.description,
        transformed.bodyText,
        rawSearch,
        item._path || '',
      ].filter(Boolean)

      transformed._search = searchParts
        .join(' ')
        .toLowerCase()
        .replace(/[-_]/g, ' ')

      // Build filename-based keys
      const fileBase = (item.id || item._path || '')
        .toString()
        .split('/')
        .pop()
        ?.replace(/\.md$/, '')
        .toLowerCase()
      const fileSlugDash = fileBase?.replace(/_/g, '-')
      const fileSlugUnderscore = fileBase?.replace(/-/g, '_')

      // Slug generation & map insertion
      if (type === 'quotes') {
        const author = slugify(transformed.attribution || 'unknown')
        const qt = slugify(transformed.quoteText || transformed.title || '')
        const s = `${author}-${qt}`.substring(0, 80)
        registerSlugKeys(
          slugMaps.quotes,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      } else if (type === 'posts') {
        const s = slugify(transformed.title || '')
        registerSlugKeys(
          slugMaps.posts,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      } else if (type === 'memes') {
        const s = slugify(transformed.title || transformed.description || '')
        registerSlugKeys(
          slugMaps.memes,
          [s, fileSlugDash, fileSlugUnderscore, fileBase],
          transformed
        )
      }
      return transformed
    })
  }

  const getContentItem = async (contentType, slug) => {
    // Fast path via slug maps
    if (slug) {
      if (contentType === 'quote' && slugMaps.quotes.has(slug))
        return slugMaps.quotes.get(slug)
      if (contentType === 'post' && slugMaps.posts.has(slug))
        return slugMaps.posts.get(slug)
      if (contentType === 'meme' && slugMaps.memes.has(slug))
        return slugMaps.memes.get(slug)
    }

    try {
      if (!slug) {
        console.error(`No slug provided for ${contentType}`)
        return null
      }

      const pathVariations = [
        slug,
        `/${slug}`,
        slug.replace(/^\/+/, ''),
        slug.replace(/^\/+/, '').replace(/^[^\/]+\//, ''),
      ]

      if (!slug.includes(contentType)) {
        pathVariations.push(`${contentType}/${slug}`)
        pathVariations.push(`/${contentType}/${slug}`)
        pathVariations.push(`${contentType}/${slug.replace(/^\/+/, '')}`)
      }

      for (const pathVar of pathVariations) {
        try {
          if (!pathVar || typeof pathVar !== 'string') continue
          const item = await queryCollection(contentType)
            .where({ _path: pathVar })
            .first()
          if (item) return item
        } catch (e) {
          // Path variation failed, try next
        }
      }

      const filenameFromSlug =
        slug
          .split('/')
          .pop()
          ?.replace(/\.[^/.]+$/, '') || slug

      const allItems = await queryCollection(contentType).all()

      const matchingItem = allItems.find((item) => {
        if (!item || typeof item !== 'object') return false
        const itemTitle = item.title || ''
        const itemPath = item._path || ''
        const itemId = item.id || ''
        const normalizedSlug = filenameFromSlug.replace(/_/g, '-')
        const normalizedSlugUnderscore = filenameFromSlug.replace(/-/g, '_')
        return (
          itemTitle === filenameFromSlug ||
          itemTitle === normalizedSlug ||
          itemTitle === normalizedSlugUnderscore ||
          itemPath.includes(filenameFromSlug) ||
          itemPath.includes(normalizedSlug) ||
          itemPath.includes(normalizedSlugUnderscore) ||
          itemId === filenameFromSlug ||
          itemId === normalizedSlug ||
          itemId === normalizedSlugUnderscore ||
          itemPath.toLowerCase().includes(filenameFromSlug.toLowerCase()) ||
          itemPath.toLowerCase().includes(normalizedSlug.toLowerCase()) ||
          itemPath
            .toLowerCase()
            .includes(normalizedSlugUnderscore.toLowerCase())
        )
      })

      if (matchingItem) return matchingItem

      console.error(`Could not find ${contentType} item with slug: ${slug}`)
      return null
    } catch (error) {
      console.error(`Error loading ${contentType} item:`, error)
      return null
    }
  }

  const getAllContent = async (contentType) => {
    try {
      const data = await queryCollection(contentType).all()
      return data || []
    } catch (error) {
      console.error(`Error fetching all ${contentType}:`, error)
      return []
    }
  }

  const loadAllContent = async () => {
    if (cache.isLoading) return
    cache.isLoading = true
    cache.error = null
    try {
      const [quotesData, memesData, postsData] = await Promise.all([
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
        queryCollection('posts').all(),
      ])

      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      cache.posts = transformContentForComponents(
        filterSpecialFiles(postsData),
        'posts'
      )
      cache._fullLoadComplete = true
      cache._initialLoadComplete = true
      debugLog(
        `Content loaded: ${cache.quotes.length} quotes, ${cache.memes.length} memes, ${cache.posts.length} posts`
      )
    } catch (error) {
      console.error('Error loading content:', error)
      cache.error = error
    } finally {
      cache.isLoading = false
    }
  }

  const getInterleavedContent = () => {
    debugLog('🎯 getInterleavedContent:', {
      quotes: cache.quotes.length,
      memes: cache.memes.length,
      posts: cache.posts.length,
    })
    return interleaveContent([], cache.quotes, cache.memes, {
      posts: cache.posts,
    })
  }

  const getFilteredContent = (
    searchTerm = '',
    contentFilters = { quotes: true, memes: true }
  ) => {
    let filteredQuotes = contentFilters.quotes ? cache.quotes : []
    let filteredMemes = contentFilters.memes ? cache.memes : []
    let filteredPosts = cache.posts // Posts are always included
    if (searchTerm && searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim()
      const match = (item) => item._search && item._search.includes(s)
      filteredQuotes = filteredQuotes.filter(match)
      filteredMemes = filteredMemes.filter(match)
      filteredPosts = filteredPosts.filter(match)
      debugLog('🔍 Search results:', {
        quotes: filteredQuotes.length,
        memes: filteredMemes.length,
        posts: filteredPosts.length,
      })
    }
    return interleaveContent([], filteredQuotes, filteredMemes, {
      posts: filteredPosts,
    })
  }

  // ─── Progressive Loading: Phase 1 (above-the-fold) ───
  const loadInitialContent = async (limit = 12) => {
    if (cache.isLoading) return
    cache.isLoading = true
    cache.error = null
    cache._initialLoadComplete = false
    cache._fullLoadComplete = false
    try {
      const [quotesData, memesData, postsData] = await Promise.all([
        queryCollection('quotes').limit(limit).all(),
        queryCollection('memes').limit(limit).all(),
        queryCollection('posts')
          .limit(Math.ceil(limit / 2))
          .all(),
      ])
      cache.quotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      cache.memes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      cache.posts = transformContentForComponents(
        filterSpecialFiles(postsData),
        'posts'
      )
      cache._initialLoadComplete = true
      debugLog(
        `✅ Initial batch loaded: ${cache.quotes.length} quotes, ${cache.memes.length} memes, ${cache.posts.length} posts`
      )
    } catch (error) {
      console.error('Error loading initial content:', error)
      cache.error = error
    } finally {
      cache.isLoading = false
    }
  }

  // ─── Progressive Loading: Phase 2 (below-the-fold / remaining) ───
  const loadRemainingContent = async () => {
    if (cache._fullLoadComplete) return
    try {
      const [quotesData, memesData, postsData] = await Promise.all([
        queryCollection('quotes').all(),
        queryCollection('memes').all(),
        queryCollection('posts').all(),
      ])

      const existingPaths = {
        quotes: new Set(cache.quotes.map((i) => i._path || i.path || i.id)),
        memes: new Set(cache.memes.map((i) => i._path || i.path || i.id)),
        posts: new Set(cache.posts.map((i) => i._path || i.path || i.id)),
      }

      const allQuotes = transformContentForComponents(
        filterSpecialFiles(quotesData),
        'quotes'
      )
      const allMemes = transformContentForComponents(
        filterSpecialFiles(memesData),
        'memes'
      )
      const allPosts = transformContentForComponents(
        filterSpecialFiles(postsData),
        'posts'
      )

      const newQuotes = allQuotes.filter(
        (i) => !existingPaths.quotes.has(i._path || i.path || i.id)
      )
      const newMemes = allMemes.filter(
        (i) => !existingPaths.memes.has(i._path || i.path || i.id)
      )
      const newPosts = allPosts.filter(
        (i) => !existingPaths.posts.has(i._path || i.path || i.id)
      )

      cache.quotes = [...cache.quotes, ...newQuotes]
      cache.memes = [...cache.memes, ...newMemes]
      cache.posts = [...cache.posts, ...newPosts]
      cache._fullLoadComplete = true

      debugLog(
        `🎉 Full content loaded: ${cache.quotes.length} quotes, ${cache.memes.length} memes, ${cache.posts.length} posts`
      )
      debugLog(
        `   (added ${newQuotes.length} quotes, ${newMemes.length} memes, ${newPosts.length} posts in background)`
      )
    } catch (error) {
      console.error('Error loading remaining content:', error)
      cache.error = error
    }
  }

  return {
    cache,
    quotes,
    memes,
    posts,
    isLoading,
    error,
    ensureContentLoaded,
    getContentItem,
    getAllContent,
    loadAllContent,
    loadInitialContent,
    loadRemainingContent,
    getInterleavedContent,
    getFilteredContent,
    slugMaps,
    saveToSessionStorage,
    restoreFromSessionStorage,
  }
}
