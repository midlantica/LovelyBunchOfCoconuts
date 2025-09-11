// Runs a one-time integrity sync to align local like counts with server authoritative map.
// @ts-ignore Nuxt global
export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  try {
    // @ts-ignore auto-imported composable
    const { integritySync } = useLikes()
    // Delay slightly more and use lightweight mode by default
    setTimeout(() => integritySync(), 900)
  } catch (e) {
    if (import.meta.dev) console.warn('[likes][integrity] failed init', e)
  }
})
