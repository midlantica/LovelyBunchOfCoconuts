// composables/useWallModalOpener.js
// Centralizes wall modal opening logic: slug derivation, history mutation, and popularity tracking.
// Usage:
// const { openModal } = useWallModalOpener({ modalGuardUntil, effectiveSearch, openGlobalModal, emit })

export function useWallModalOpener({
  modalGuardUntil,
  effectiveSearch,
  openGlobalModal,
}) {
  // slugify is auto-imported from ~/utils/slugify.ts

  const deriveFileBase = (data) => {
    const id = data?.id || data?._id || ''
    if (id) return id.split('/').pop()?.replace(/\.md$/, '') || ''
    const p = data?._path || data?.path || ''
    if (p) return p.split('/').pop()?.replace(/\.md$/, '') || ''
    return ''
  }

  function buildSlug(data, type) {
    let slug = deriveFileBase(data)
    if (!slug) {
      if (type === 'grift') slug = slugify(data?.claim || data?.title || '')
      else if (type === 'quote')
        slug = slugify(data?.title || data?.quoteText || '')
      else if (type === 'meme')
        slug = slugify(data?.title || data?.description || '')
    }
    return slug
  }

  function trackPopularity(userInitiated) {
    if (!userInitiated) return
    try {
      const key = (effectiveSearch?.value || '').trim().toLowerCase()
      if (!key) return
      const pop = JSON.parse(localStorage.getItem('wunu_popular_terms') || '{}')
      pop[key] = (pop[key] || 0) + 1
      localStorage.setItem('wunu_popular_terms', JSON.stringify(pop))
    } catch (_) {
      /* silent */
    }
  }

  function mutateHistory(type, slug, data) {
    if (typeof window === 'undefined' || !slug) return
    const preModalUrl = useState('preModalUrl', () => null)
    if (!preModalUrl.value) {
      preModalUrl.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
    }

    // For profiles, determine the correct route prefix based on status
    let routeType = type
    if (type === 'profile') {
      const status = data?.meta?.status || data?.status
      routeType = status === 'hero' ? 'hero' : 'zero'
    }

    // Keep path clean (omit query) so share URLs stay tidy.
    window.history.replaceState({}, '', `/${routeType}/${slug}`)
  }

  function openModal(data, type, userInitiated = false) {
    if (Date.now() < modalGuardUntil.value) return

    const modalSuppressed = useState('modalSuppressedFromQuery', () => false)
    if (modalSuppressed.value && !userInitiated) return
    if (modalSuppressed.value && userInitiated) {
      modalSuppressed.value = false
    }

    const slug = buildSlug(data, type)
    const payload = { type, data, slug }
    if (userInitiated) payload.__userClick = true

    mutateHistory(type, slug, data)

    if (openGlobalModal) openGlobalModal(payload)

    trackPopularity(userInitiated)
  }

  return { openModal }
}
