// Periodic global like count poller to ensure UI reflects multi-user totals.
// Lightweight safety net if per-button / batch hydration misses.
// Enable by default; disable with NUXT_PUBLIC_LIKES_GLOBAL_POLL=off.
// Poll interval can be tuned via NUXT_PUBLIC_LIKES_GLOBAL_POLL_MS (default 15000).

// @ts-ignore - provided globally by Nuxt at runtime
export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  // Enable global polling by default to sync likes across browsers
  // Can be disabled with NUXT_PUBLIC_LIKES_GLOBAL_POLL=off
  if (import.meta.env?.NUXT_PUBLIC_LIKES_GLOBAL_POLL === 'off') return
  // @ts-ignore auto-import composable
  const { _countMap, _canonicalizeId } = useLikes()
  let timer: any = null
  const interval =
    Number(import.meta.env?.NUXT_PUBLIC_LIKES_GLOBAL_POLL_MS) || 15000

  async function tick() {
    // Skip polling if tab is hidden (optimization from likes-live-poll)
    if (typeof document !== 'undefined' && document.hidden) {
      return schedule()
    }
    try {
      const isProd =
        typeof window !== 'undefined' &&
        (location.hostname.endsWith('lovelybunchofcoconuts.com') ||
          location.hostname.includes('netlify.app'))
      const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`

      if (
        import.meta.dev &&
        import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
      ) {
      }

      const res = await fetch(url).catch(() => null as any)
      if (!res || !res.ok) {
        if (
          import.meta.dev &&
          import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
        ) {
          console.warn(
            '[likes][global-poll] fetch failed:',
            res?.status,
            res?.statusText
          )
        }
        return schedule()
      }

      const data = await res.json().catch(() => ({}))

      if (
        import.meta.dev &&
        import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
      ) {
      }

      if (data?.restricted) {
        console.warn(
          '[likes][global-poll] API restricted - likes may not sync across browsers'
        )
        return schedule()
      }

      const counts: Record<string, number> = data?.counts || {}
      let changed = false
      let updatedCount = 0

      for (const [k, v] of Object.entries(counts)) {
        const cid = _canonicalizeId(k)
        if (!cid) continue
        if (typeof v === 'number' && v >= 0) {
          if (_countMap.value[cid] !== v) {
            _countMap.value[cid] = v
            changed = true
            updatedCount++
          }
        }
      }

      if (changed) {
        if (
          import.meta.dev &&
          import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
        ) {
        }
        // Persist the updated counts to localStorage
        try {
          localStorage.setItem(
            'lboc.likeCounts.v1',
            JSON.stringify(_countMap.value)
          )
        } catch (e) {
          console.warn('[likes][global-poll] failed to persist counts', e)
        }
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

  // Resume polling when tab becomes visible again
  const onVisibilityChange = () => {
    if (!document.hidden) {
      tick()
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', onVisibilityChange)
  }

  // Start after a short delay to not contend with initial hydration
  setTimeout(tick, 2500)

  // HMR safety (typings may not expose .hot)
  // @ts-ignore
  if ((import.meta as any).hot) {
    // @ts-ignore
    ;(import.meta as any).hot.dispose(() => {
      if (timer) clearTimeout(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', onVisibilityChange)
      }
    })
  }
})
