// Middleware to handle shared links with query parameters
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (import.meta.server) return

  // Check if we're coming from a shared link with query parameters
  if (to.path === '/' && to.query.nf && to.query.q) {
    // Check if we're in a redirect loop
    const redirectCount = parseInt(
      sessionStorage.getItem('redirect_count') || '0'
    )

    if (redirectCount > 2) {
      // Clear the redirect count and query parameters to break the loop
      sessionStorage.removeItem('redirect_count')
      console.warn('Breaking redirect loop, clearing query parameters')
      return navigateTo('/', { replace: true })
    }

    // Increment redirect count
    sessionStorage.setItem('redirect_count', String(redirectCount + 1))

    // Clear redirect count after a delay
    setTimeout(() => {
      sessionStorage.removeItem('redirect_count')
    }, 5000)
  } else {
    // Clear redirect count for non-shared links
    sessionStorage.removeItem('redirect_count')
  }
})
