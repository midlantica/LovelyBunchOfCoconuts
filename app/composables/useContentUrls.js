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

    console.log('🔗 generateContentUrl called:', {
      contentType,
      hasPath: !!item._path,
      path: item._path,
      hasId: !!item.id,
      id: item.id,
      hasPathProp: !!item.path,
      pathProp: item.path,
      title: item.title || item.claim || item.quoteText,
      allKeys: Object.keys(item),
    })

    // If item already has a path (from Nuxt Content), transform it to route format
    if (item._path) {
      // Transform "/claims/some-claim" to "/claim/some-claim"
      // Transform "/quotes/some-quote" to "/quote/some-quote"
      // Transform "/memes/category/some-meme" to "/meme/category/some-meme"
      const routePath = item._path
        .replace(/^\/claims\//, '/claim/')
        .replace(/^\/quotes\//, '/quote/')
        .replace(/^\/memes\//, '/meme/')

      const finalUrl = `${baseUrl}${routePath}`
      console.log('🎯 Generated route URL:', finalUrl)
      return finalUrl
    }

    // Try using item.path if _path doesn't exist
    if (item.path) {
      const routePath = item.path
        .replace(/^\/claims\//, '/claim/')
        .replace(/^\/quotes\//, '/quote/')
        .replace(/^\/memes\//, '/meme/')

      const finalUrl = `${baseUrl}${routePath}`
      console.log('🎯 Generated route URL from path:', finalUrl)
      return finalUrl
    }

    // Try using item.id as a path
    if (item.id) {
      // Remove file extension and convert to path
      const pathFromId = '/' + item.id.replace(/\.md$/, '')
      const routePath = pathFromId
        .replace(/^\/claims\//, '/claim/')
        .replace(/^\/quotes\//, '/quote/')
        .replace(/^\/memes\//, '/meme/')

      const finalUrl = `${baseUrl}${routePath}`
      console.log('🎯 Generated route URL from id:', finalUrl)
      return finalUrl
    } // Fallback to hash URLs only if we don't have path
    console.log('⚠️ No _path found, falling back to hash URL')
    return generateHashUrl(item, contentType)
  }

  const generateHashUrl = (item, contentType) => {
    const baseUrl = import.meta.client
      ? window.location.origin
      : 'https://wakeupnpc.com'

    let slug = ''

    switch (contentType) {
      case 'claim':
        slug = createSlug(item.claim || item.title || '')
        return `${baseUrl}/#claim-${slug}`

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
