// Periodic global like count poller to ensure UI reflects multi-user totals.
// Lightweight safety net if per-button / batch hydration misses.
// Enable by default; disable with NUXT_PUBLIC_LIKES_GLOBAL_POLL=off.
// Poll interval can be tuned via NUXT_PUBLIC_LIKES_GLOBAL_POLL_MS (default 15000).

// @ts-ignore - provided globally by Nuxt at runtime
export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  // Default OFF; opt-in if you really need background merging
  if (import.meta.env?.NUXT_PUBLIC_LIKES_GLOBAL_POLL !== 'on') return
  // @ts-ignore auto-import composable
  const { _countMap, _canonicalizeId } = useLikes()
  let timer: any = null
  const interval =
    Number(import.meta.env?.NUXT_PUBLIC_LIKES_GLOBAL_POLL_MS) || 15000

  async function tick() {
    try {
      const isProd =
        typeof window !== 'undefined' &&
        location.hostname.endsWith('wakeupnpc.com')
      const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
      const res = await fetch(url).catch(() => null as any)
      if (!res || !res.ok) return schedule()
      const data = await res.json().catch(() => ({}))
      const counts: Record<string, number> = data?.counts || {}
      let changed = false
      for (const [k, v] of Object.entries(counts)) {
        const cid = _canonicalizeId(k)
        if (!cid) continue
        if (typeof v === 'number' && v >= 0) {
          if (_countMap.value[cid] !== v) {
            _countMap.value[cid] = v
            changed = true
          }
        }
      }
      if (
        changed &&
        import.meta.dev &&
        import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
      ) {
        console.info('[likes][global-poll] merged higher counts')
      }
    } catch (e) {
      if (import.meta.dev && import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1')
        console.warn('[likes][global-poll] tick failed', e)
    } finally {
      schedule()
    }
  }

  function schedule() {
    timer = setTimeout(tick, interval)
  }

  // Start after a short delay to not contend with initial hydration
  setTimeout(tick, 2500)

  // HMR safety (typings may not expose .hot)
  // @ts-ignore
  if ((import.meta as any).hot) {
    // @ts-ignore
    ;(import.meta as any).hot.dispose(() => timer && clearTimeout(timer))
  }
})
