// Small background poller to keep like counts relatively live across sessions.
// Runs only on client, visible tabs, every 10s. Opt-out with NUXT_PUBLIC_LIKES_LIVE=off
// @ts-ignore defineNuxtPlugin provided by Nuxt at runtime
export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  if (import.meta.env?.NUXT_PUBLIC_LIKES_LIVE === 'off') return
  // @ts-ignore useLikes auto-import
  const { _countMap, hydrateServer } = useLikes()
  let timer: any
  const tick = async () => {
    try {
      const ids = Object.keys(_countMap.value || {})
      if (!ids.length) return
      await hydrateServer(ids)
    } catch {}
  }
  const onVis = () => {
    if (document.hidden) return
    tick()
  }
  const start = () => {
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      if (document.hidden) return
      tick()
    }, 10000)
  }
  window.addEventListener('visibilitychange', onVis)
  start()
  tick()
})
