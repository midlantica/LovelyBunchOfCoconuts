export default defineNuxtPlugin((nuxtApp) => {
  // Override the router's scrollBehavior at the app level
  nuxtApp.hook('app:created', () => {
    const router = useRouter()

    // Store the original scrollBehavior
    const originalScrollBehavior = router.options.scrollBehavior

    // Override with our custom behavior
    router.options.scrollBehavior = function (to, from, savedPosition) {
      // Don't scroll to hash elements since we use hashes for content navigation
      if (to.hash && to.hash.match(/^#(claim|quote|meme)-/)) {

        return { top: 0 }
      }

      // Use original behavior for other cases
      if (originalScrollBehavior) {
        return originalScrollBehavior.call(this, to, from, savedPosition)
      }

      // Default fallback
      if (savedPosition) {
        return savedPosition
      }

      return { top: 0 }
    }
  })
})
