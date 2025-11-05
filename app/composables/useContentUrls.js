/**
 * Composable for generating unique URLs for content items
 */
export const useContentUrls = () => {
  const createSlug = (text, maxLength = 50) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and dashes
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .substring(0, maxLength)
  }

  const generateContentUrl = (item, contentType) => {
    const baseUrl = import.meta.client
      ? window.location.origin
      : 'https://wakeupnpc.com'

    // If item already has a path (from Nuxt Content), transform it to route format
    if (item._path) {
      // Transform "/grifts/some-grift" to "/grift/some-grift"
      // Transform "/quotes/some-quote" to "/quote/some-quote"
      // Transform "/memes/category/some-meme" to "/meme/category/some-meme"
      const routePath = item._path
        .replace(/^\/grifts\//, '/grift/')
        .replace(/^\/quotes\//, '/quote/')
        .replace(/^\/memes\//, '/meme/')
        .replace(/^\/profiles\/heroes\//, '/hero/')
        .replace(/^\/profiles\/zeros\//, '/zero/')

      const finalUrl = `${baseUrl}${routePath}`

      return finalUrl
    }

    // Try using item.path if _path doesn't exist
    if (item.path) {
      const routePath = item.path
        .replace(/^\/grifts\//, '/grift/')
        .replace(/^\/quotes\//, '/quote/')
        .replace(/^\/memes\//, '/meme/')
        .replace(/^\/profiles\/heroes\//, '/hero/')
        .replace(/^\/profiles\/zeros\//, '/zero/')

      const finalUrl = `${baseUrl}${routePath}`

      return finalUrl
    }

    // Try using item.id as a path
    if (item.id) {
      // Remove file extension and convert to path
      const pathFromId = '/' + item.id.replace(/\.md$/, '')
      const routePath = pathFromId
        .replace(/^\/grifts\//, '/grift/')
        .replace(/^\/quotes\//, '/quote/')
        .replace(/^\/memes\//, '/meme/')
        .replace(/^\/profiles\/heroes\//, '/hero/')
        .replace(/^\/profiles\/zeros\//, '/zero/')

      const finalUrl = `${baseUrl}${routePath}`

      return finalUrl
    } // Fallback to hash URLs only if we don't have path

    return generateHashUrl(item, contentType)
  }

  const generateHashUrl = (item, contentType) => {
    const baseUrl = import.meta.client
      ? window.location.origin
      : 'https://wakeupnpc.com'

    let slug = ''

    switch (contentType) {
      case 'grift':
        slug = createSlug(item.grift || item.title || '')
        return `${baseUrl}/#grift-${slug}`

      case 'quote':
        const author = (item.attribution || 'unknown')
          .toLowerCase()
          .replace(/\s+/g, '-')
        slug = createSlug(
          (item.quoteText || item.title || '').split(' ').slice(0, 3).join(' ')
        )
        return `${baseUrl}/#quote-${author}-${slug}`

      case 'meme':
        slug = createSlug(item.title || item.description || '')
        return `${baseUrl}/#meme-${slug}`

      case 'profile':
        slug = createSlug(item.profile || item.title || '')
        const prefix = item.status === 'hero' ? 'hero' : 'zero'
        return `${baseUrl}/${prefix}/${slug}`

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
