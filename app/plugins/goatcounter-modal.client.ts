// GoatCounter modal view tracking plugin
import { defineNuxtPlugin } from '#imports'
// Sends a manual hit when a content modal (claim/quote/meme) is opened.
// Each modal is reported as a virtual path under /modal/<type>/<slug>
// Guarded so it only runs when GoatCounter script present.

interface GoatCounterWindow extends Window {
  goatcounter?: {
    count?: (opts?: Record<string, any>) => void
  }
}

declare const window: GoatCounterWindow

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  // Provide a composable helper to trigger a modal hit.
  const trackModal = (type: string, slug?: string) => {
    try {
      if (!window.goatcounter || typeof window.goatcounter.count !== 'function')
        return
      const path = `/modal/${type}/${slug || 'unknown'}`
      window.goatcounter.count({ path })
    } catch (e) {
      // Silently ignore
    }
  }

  // Inject so components can call via `const { $trackModal } = useNuxtApp()`
  return {
    provide: {
      trackModal,
    },
  }
})
