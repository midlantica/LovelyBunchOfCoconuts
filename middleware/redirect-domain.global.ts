// Nuxt 3 global middleware to enforce allowed domains and root path
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

  // If on dev or prod, but not at root path, redirect to root
  if (window.location.pathname !== '/') {
    window.location.replace(window.location.origin + '/')
  }
})
