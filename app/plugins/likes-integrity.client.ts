// Runs a one-time integrity sync to align local like counts with server authoritative map.
// @ts-ignore Nuxt global
export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  try {
    // @ts-ignore auto-imported composable
    const { integritySync } = useLikes()
    // PERFORMANCE: Increased delay significantly to avoid blocking modal loads
    // Only run after user has had time to interact with the site
    setTimeout(() => integritySync(), 5000)
  } catch (e) {
    if (import.meta.dev) console.warn('[likes][integrity] failed init', e)
  }
})
