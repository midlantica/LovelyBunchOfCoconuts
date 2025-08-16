// Nuxt 3 global middleware to enforce allowed domain.
// Canonicalization previously in inline <script> inside app.html; moved here for cleanliness.
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return // Only run on client

  const domainName = 'wake-up-npc.com'
  const allowedHosts = [
    window.location.host, // Always allow the current host (dev or prod)
    `www.${domainName}`,
  ]
  const currentHost = window.location.host
  const isAllowed = allowedHosts.includes(currentHost)

  // If not allowed host, redirect to canonical domain
  if (!isAllowed) {
    window.location.replace(
      window.location.protocol +
        '//' +
        (process.env.NODE_ENV === 'development'
          ? window.location.host + '/'
          : domainName)
    )
    return
  }

  // Optional root-path enforcement (kept disabled to allow future routed pages):
  // if (to.path !== '/' && process.env.ENFORCE_ROOT === '1') {
  //   return navigateTo('/')
  // }
})
