// composables/useModalContentLoader.js
// Lazy loads individual content items for modals without requiring full content cache
// This enables instant modal functionality even before the wall has loaded all content

const contentDebug =
  import.meta.dev && import.meta.env?.VITE_CONTENT_DEBUG === '1'
const debugLog = (...args) => {
  if (contentDebug) console.log('[ModalContentLoader]', ...args)
}

// extractSearchableText is auto-imported from ~/utils/searchText.ts

// Extract plain text from a Nuxt Content body node.
// element[2] can be a plain string OR an array of inline nodes.
// Nuxt Content minimark format:
//   - A single element node: ["tagname", {attrs}, ...children]
//   - A list of child nodes: [child1, child2, ...]  where children can be strings or element nodes
// We distinguish them by checking if node[0] is a known HTML tag name (short string, no spaces).
function extractNodeText(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    // Detect if this array IS an element node: first item is a tag name string
    const isElementNode =
      typeof node[0] === 'string' &&
      /^[a-z][a-z0-9]*$/i.test(node[0]) &&
      (node.length < 2 ||
        (typeof node[1] === 'object' && !Array.isArray(node[1])))
    if (isElementNode) {
      // Recurse into children (index 2+)
      return node.slice(2).map(extractNodeText).join('')
    }
    // Otherwise it's a list of child nodes — recurse each
    return node.map(extractNodeText).join('')
  }
  return ''
}

// Extract HTML from a Nuxt Content body node, preserving inline formatting (em, strong, etc.)
// Only allows safe inline tags; everything else is rendered as plain text.
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

// Transform content for component compatibility
const transformContentItem = (item, type) => {
  if (!item) return null

  const transformed = { ...item }

  // For grifts
  if (type === 'grift' || type === 'grifts') {
    transformed.grift = item.meta?.grift || item.meta?.claim || item.title
    transformed.decode = item.meta?.decode || item.meta?.translation
  }

  // For quotes
  if (type === 'quote' || type === 'quotes') {
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
      // Attribution is always the LAST paragraph (after the heading and any
      // continuation paragraphs that are part of the quote itself)
      transformed.attribution = paragraphs[paragraphs.length - 1] || ''
      // Also store HTML version to preserve inline formatting (e.g. <em> for source titles)
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

  // For memes
  if (type === 'meme' || type === 'memes') {
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
              if (Array.isArray(child) && child[0] === 'img' && child[1]?.src) {
                transformed.image = child[1].src
                break
              }
            }
            if (transformed.image) break
          }
        }
      }
    }
    if (!transformed.image) transformed.image = ''
    if (item.title) transformed.description = item.title

    if (item.body && item.body.value) {
      const textParts = []
      for (const element of item.body.value) {
        if (Array.isArray(element)) {
          if (
            element[0] === 'p' &&
            typeof element[2] === 'string' &&
            !element[2].includes('![')
          ) {
            textParts.push(element[2])
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

  // For posts
  if (type === 'post' || type === 'posts') {
    if (item.body && item.body.value) {
      transformed.body = item.body
      const bodyText = extractSearchableText(item.body, {
        itemPath: item._path || item.path,
      })
      transformed.bodyText = bodyText
    }
  }

  // Add searchable text
  const rawSearch = extractSearchableText(item.body, {
    itemPath: item._path || item.path,
  })
  transformed.searchableText = rawSearch

  const searchParts = [
    transformed.grift,
    transformed.decode,
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

  return transformed
}

export function useModalContentLoader() {
  // Cache for loaded items to avoid re-fetching
  const itemCache = new Map()

  /**
   * Load a single content item by slug for modal display
   * This is much faster than loading all content first
   */
  const loadContentItemForModal = async (contentType, slug) => {
    if (!slug || !contentType) {
      debugLog('❌ Missing slug or contentType', { contentType, slug })
      return null
    }

    // Normalize content type (remove 's' if plural)
    const normalizedType = contentType.replace(/s$/, '')
    const collectionName = contentType.endsWith('s')
      ? contentType
      : `${contentType}s`

    // Check cache first
    const cacheKey = `${normalizedType}:${slug}`
    if (itemCache.has(cacheKey)) {
      debugLog('✅ Cache hit for', cacheKey)
      return itemCache.get(cacheKey)
    }

    debugLog('🔍 Loading item:', { contentType, slug, collectionName })

    try {
      // Try multiple path variations
      const pathVariations = [
        slug,
        `/${slug}`,
        slug.replace(/^\/+/, ''),
        `${collectionName}/${slug}`,
        `/${collectionName}/${slug}`,
        slug.replace(/_/g, '-'),
        slug.replace(/-/g, '_'),
      ]

      // Try each path variation
      for (const pathVar of pathVariations) {
        try {
          if (!pathVar || typeof pathVar !== 'string') continue

          const item = await queryCollection(collectionName)
            .where({ _path: pathVar })
            .first()

          if (item) {
            const transformed = transformContentItem(item, normalizedType)
            itemCache.set(cacheKey, transformed)
            debugLog('✅ Found item via path:', pathVar)
            return transformed
          }
        } catch (e) {
          // Try next variation
        }
      }

      // If path matching fails, try searching by filename
      const filenameFromSlug =
        slug
          .split('/')
          .pop()
          ?.replace(/\.[^/.]+$/, '') || slug
      const allItems = await queryCollection(collectionName).all()

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

      if (matchingItem) {
        const transformed = transformContentItem(matchingItem, normalizedType)
        itemCache.set(cacheKey, transformed)
        debugLog('✅ Found item via filename search')
        return transformed
      }

      debugLog('❌ Could not find item:', { contentType, slug })
      return null
    } catch (error) {
      console.error(`Error loading ${contentType} item:`, error)
      return null
    }
  }

  /**
   * Preload content items in the background (optional optimization)
   */
  const preloadContentItems = async (items) => {
    if (!Array.isArray(items)) return

    for (const { type, slug } of items) {
      if (type && slug) {
        // Fire and forget - load in background
        loadContentItemForModal(type, slug).catch(() => {})
      }
    }
  }

  /**
   * Clear the cache (useful for development or when content updates)
   */
  const clearCache = () => {
    itemCache.clear()
    debugLog('🗑️ Cache cleared')
  }

  return {
    loadContentItemForModal,
    preloadContentItems,
    clearCache,
  }
}
