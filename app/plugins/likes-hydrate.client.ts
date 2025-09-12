// Optimized like count hydration plugin.
// Reduces overhead: one initial full scan, then targeted scans of added subtrees.
// Disable via env: NUXT_PUBLIC_LIKES_HYDRATE=off
import { nextTick } from 'vue'

// @ts-ignore defineNuxtPlugin provided by Nuxt at runtime
export default defineNuxtPlugin(() => {
  if (import.meta.server) return
  if (import.meta.env?.NUXT_PUBLIC_LIKES_HYDRATE === 'off') return

  // PERFORMANCE: Completely disable hydration until after first user interaction
  // This ensures the first modal opens instantly
  let hasUserInteracted = false
  const enableAfterInteraction = () => {
    if (hasUserInteracted) return
    hasUserInteracted = true
    // Start hydration only after user has interacted
    setTimeout(initializeHydration, 100)
  }

  // Listen for any user interaction to enable hydration
  const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll']
  interactionEvents.forEach((event) => {
    document.addEventListener(event, enableAfterInteraction, {
      once: true,
      passive: true,
    })
  })

  // Fallback: enable after 10 seconds even without interaction
  setTimeout(enableAfterInteraction, 10000)

  function initializeHydration() {
    // @ts-ignore useLikes auto-import
    const { hydrateServer } = useLikes()
    const seen = new Set<string>()
    const queued = new Set<string>()
    let flushing = false

    function flushBatch(ids: string[]) {
      if (!ids.length) return Promise.resolve()
      return hydrateServer(ids).catch((e: any) => {
        if (
          import.meta.dev &&
          import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
        )
          console.warn('[likes][hydrate] batch failed', e)
      })
    }

    async function flush() {
      if (flushing) return
      flushing = true
      try {
        const list = Array.from(queued)
        queued.clear()
        const chunkSize = 60
        for (let i = 0; i < list.length; i += chunkSize) {
          const slice = list.slice(i, i + chunkSize)
          await flushBatch(slice)
          slice.forEach((id) => seen.add(id))
        }
      } finally {
        flushing = false
      }
    }

    function scheduleFlush(delay = 64) {
      setTimeout(() => {
        if (!queued.size) return
        flush()
      }, delay)
    }

    function queue(id: string) {
      if (!id || seen.has(id) || queued.has(id)) return
      queued.add(id)
    }

    function register(el: Element) {
      const id = el.getAttribute?.('data-like-id') || ''
      if (!id) return
      queue(id)
      // If no IO support, fallback to time-sliced immediate hydration
      if (!('IntersectionObserver' in window)) {
        scheduleFlush(80)
        return
      }
      observer.observe(el)
    }

    // Intersection-driven progressive hydration (only visible hearts first)
    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible: string[] = []
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const id = e.target.getAttribute('data-like-id') || ''
          if (id && !seen.has(id)) newlyVisible.push(id)
          observer.unobserve(e.target)
        }
        if (newlyVisible.length) {
          newlyVisible.forEach((id) => queued.add(id))
          // Visible items: hydrate quickly
          scheduleFlush(10)
        }
      },
      { rootMargin: '100px 0px' }
    )

    function scan(root: ParentNode) {
      const els = root.querySelectorAll?.('[data-like-button][data-like-id]')
      if (!els) return
      els.forEach((el) => register(el))
    }

    // Idle hydration for anything still not seen after a delay (ensures eventual completeness)
    function idleBackfill() {
      const remaining = Array.from(queued)
      if (!remaining.length) return
      flush()
    }

    // Start hydration immediately once enabled
    scan(document)
    // Mutation observer to register new like buttons (infinite scroll)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (!m.addedNodes?.length) continue
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return
          const el = n as HTMLElement
          if (
            el.hasAttribute?.('data-like-button') &&
            el.getAttribute('data-like-id')
          ) {
            register(el)
          } else {
            scan(el)
          }
        })
      }
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })

    // Start hydrating visible items quickly
    scheduleFlush(100)
    // Backfill any not yet intersected after a delay
    const idle = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb, { timeout: 5000 })
        : setTimeout(cb, 3000)
    idle(idleBackfill)
  }
})
