// composables/useContentUrls.ts
// Composable for generating unique URLs for content items

type ContentType = 'grift' | 'quote' | 'meme' | 'profile' | 'post' | 'general'

interface ContentItem {
  _path?: string
  path?: string
  id?: string
  grift?: string
  title?: string
  quoteText?: string
  attribution?: string
  description?: string
  profile?: string
  status?: 'hero' | 'zero'
}

export const useContentUrls = () => {
  const createSlug = (text: string, maxLength = 50): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and dashes
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .substring(0, maxLength)
  }

  /** Transform Nuxt Content collection paths to route paths */
  const _toRoutePath = (contentPath: string): string => {
    return contentPath
      .replace(/^\/grifts\//, '/grift/')
      .replace(/^\/quotes\//, '/quote/')
      .replace(/^\/posts\//, '/post/')
      .replace(/^\/memes\//, '/meme/')
      .replace(/^\/profiles\/heroes\//, '/profiles/hero/')
      .replace(/^\/profiles\/zeros\//, '/profiles/zero/')
  }

  const generateContentUrl = (
    item: ContentItem,
    contentType: ContentType
  ): string => {
    const baseUrl = import.meta.client
      ? window.location.origin
      : 'https://wakeupnpc.com'

    // If item already has a path (from Nuxt Content), transform it to route format
    if (item._path) {
      return `${baseUrl}${_toRoutePath(item._path)}`
    }

    // Try using item.path if _path doesn't exist
    if (item.path) {
      return `${baseUrl}${_toRoutePath(item.path)}`
    }

    // Try using item.id as a path
    if (item.id) {
      const pathFromId = '/' + item.id.replace(/\.md$/, '')
      return `${baseUrl}${_toRoutePath(pathFromId)}`
    }

    // Fallback to hash URLs only if we don't have path
    return generateHashUrl(item, contentType)
  }

  const generateHashUrl = (
    item: ContentItem,
    contentType: ContentType
  ): string => {
    const baseUrl = import.meta.client
      ? window.location.origin
      : 'https://wakeupnpc.com'

    let slug = ''

    switch (contentType) {
      case 'grift':
        slug = createSlug(item.grift || item.title || '')
        return `${baseUrl}/#grift-${slug}`

      case 'quote': {
        const author = (item.attribution || 'unknown')
          .toLowerCase()
          .replace(/\s+/g, '-')
        slug = createSlug(
          (item.quoteText || item.title || '').split(' ').slice(0, 3).join(' ')
        )
        return `${baseUrl}/#quote-${author}-${slug}`
      }

      case 'meme':
        slug = createSlug(item.title || item.description || '')
        return `${baseUrl}/#meme-${slug}`

      case 'profile': {
        slug = createSlug(item.profile || item.title || '')
        const prefix =
          item.status === 'hero' ? 'profiles/hero' : 'profiles/zero'
        return `${baseUrl}/${prefix}/${slug}`
      }

      default:
        return baseUrl
    }
  }

  return {
    createSlug,
    generateContentUrl,
    generateHashUrl,
  }
}
