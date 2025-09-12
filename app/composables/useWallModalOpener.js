// composables/useWallModalOpener.js
// Centralizes wall modal opening logic: slug derivation, history mutation, and popularity tracking.
// Usage:
// const { openModal } = useWallModalOpener({ modalGuardUntil, effectiveSearch, openGlobalModal, emit })

export function useWallModalOpener({
  modalGuardUntil,
  effectiveSearch,
  openGlobalModal,
  emit, // fallback emitter when no injected global modal
}) {
  const slugify = (s = '') =>
    s
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)

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
      if (type === 'claim') slug = slugify(data?.claim || data?.title || '')
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

  function mutateHistory(type, slug) {
    if (typeof window === 'undefined' || !slug) return
    const preModalUrl = useState('preModalUrl', () => null)
    if (!preModalUrl.value) {
      preModalUrl.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
    }
    // Keep path clean (omit query) so share URLs stay tidy.
    window.history.replaceState({}, '', `/${type}/${slug}`)
  }

  function openModal(data, type, userInitiated = false) {
    if (Date.now() < modalGuardUntil.value) return

    const slug = buildSlug(data, type)
    const payload = { type, data, slug }
    if (userInitiated) payload.__userClick = true

    mutateHistory(type, slug)

    if (openGlobalModal) openGlobalModal(payload)
    else emit?.('modal', payload)

    trackPopularity(userInitiated)
  }

  return { openModal }
}
