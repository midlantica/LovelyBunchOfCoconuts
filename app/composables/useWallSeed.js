// composables/useWallSeed.js
// Global wall seed state for deterministic shuffling across the app.
// - New seed on each SSR render (via useState initializer)
// - Manual reseed trigger (e.g., masthead click)

function generateSeed() {
  try {
    // Prefer crypto for better entropy if available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buf = new Uint32Array(2)
      crypto.getRandomValues(buf)
      return buf[0].toString(36) + buf[1].toString(36) + Date.now().toString(36)
    }
  } catch (_) {
    // fall through to Math.random
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useWallSeed() {
  const wallSeed = useState('wallSeed', () => generateSeed())

  const reseedWall = (reason = '') => {
    wallSeed.value = generateSeed()
    if (import.meta.dev && reason) {
      console.log(`🔁 Wall reseeded: ${wallSeed.value} (${reason})`)
    }
  }

  // In a fully static (nuxt generate) deployment, the initial seed comes from the
  // prerendered payload and is therefore identical on every hard refresh.
  // To ensure a fresh randomized ordering on each browser refresh (matching
  // desired behavior observed in dev SSR), we reseed once on client mount.
  // This runs only after hydration and only once per page load.
  if (process.client) {
    // Use a global guard so internal navigations don't reseed unintentionally.
    if (!window.__WALL_SEEDED_ON_LOAD__) {
      // Delay until mounted to avoid interfering with Nuxt hydration.
      // Auto-imported onMounted works in composables.
      onMounted(() => {
        reseedWall('page-load')
        window.__WALL_SEEDED_ON_LOAD__ = true
      })
    }
  }

  return { wallSeed, reseedWall }
}
