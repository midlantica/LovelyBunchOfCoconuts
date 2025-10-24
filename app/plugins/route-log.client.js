// Dev-only route logger to debug why a page might 404.
// Wrapped in a Nuxt plugin so it isn't ignored.
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return
  // Delay to allow routes to finish registering (esp. from content).
  setTimeout(() => {
    try {
      const router = useRouter?.()
      if (!router) return
      const names = router
        .getRoutes()
        .map((r) => ({ path: r.path, name: r.name }))
      const target = names.filter((r) => /tokens|tailwind-viewer/.test(r.path))
      // Route logging disabled
      // console.groupCollapsed(
      //   '%c[ROUTES]%c design token debug',
      //   'color:#68D2FF',
      //   'color:#999'
      // )
      // console.table(names)
      // if (!target.length) {
      //   console.warn(
      //     '[ROUTES] No dev tokens viewer route registered. Expected /dev/tokens or /tailwind-viewer'
      //   )
      // }
      // console.groupEnd()
    } catch (e) {
      console.warn('Route logger failed', e)
    }
  }, 600)
})
