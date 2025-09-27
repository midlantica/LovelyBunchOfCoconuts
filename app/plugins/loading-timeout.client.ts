// Plugin to handle stuck loading states and redirect to home with search
export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  // Only run this check on initial page load
  let hasChecked = false

  const checkLoadingState = () => {
    if (hasChecked) return
    hasChecked = true

    // Check if we're on a URL with query parameters that might be stuck
    const url = new URL(window.location.href)
    const hasSearchQuery = url.searchParams.has('q')
    const hasNfParam = url.searchParams.has('nf')

    // If we have these params and the page seems stuck, handle it
    if (hasSearchQuery && hasNfParam) {
      // Set a timeout to check if content has loaded
      const loadingTimeout = setTimeout(() => {
        // Check if we're still showing "Loading content..."
        const loadingElement = document.querySelector('body')
        const pageText = loadingElement?.textContent || ''

        if (
          pageText.includes('loading content...') ||
          pageText.trim().length < 100
        ) {
          console.warn('Page appears stuck on loading, attempting recovery...')

          // Extract the search query
          const searchQuery = url.searchParams.get('q') || ''

          // Clear the problematic URL and just go home with the search
          window.history.replaceState({}, '', '/')

          // Force a clean navigation
          setTimeout(() => {
            window.location.href = `/?q=${encodeURIComponent(searchQuery)}`
          }, 100)
        }
      }, 3000) // Check after 3 seconds

      // Also set a hard timeout as a fallback
      const hardTimeout = setTimeout(() => {
        const loadingElement = document.querySelector('body')
        const pageText = loadingElement?.textContent || ''

        if (pageText.includes('loading content...')) {
          console.error('Page stuck on loading - forcing redirect')
          window.location.href = '/'
        }
      }, 8000) // Hard timeout after 8 seconds

      // Clean up timeouts if navigation happens
      const cleanup = () => {
        clearTimeout(loadingTimeout)
        clearTimeout(hardTimeout)
      }

      window.addEventListener('beforeunload', cleanup, { once: true })
    }
  }

  // Run check after a small delay to ensure page has started rendering
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(checkLoadingState, 500)
    })
  } else {
    setTimeout(checkLoadingState, 500)
  }
})
