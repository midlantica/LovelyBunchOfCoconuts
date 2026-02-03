// composables/useWallSeed.js
// Global wall seed state for deterministic shuffling across the app.
// - New seed on each SSR render (via useState initializer)
// - Manual reseed trigger (e.g., masthead click)

import { getCurrentInstance } from 'vue'

export function generateSeed() {
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
    }
  }

  // NOTE: We intentionally avoid auto-reseeding on client mount to prevent
  // post-hydration reshuffles that cause visible flashes in production.
  // If you want a fresh shuffle, call reseedWall() explicitly (e.g., logo click).

  return { wallSeed, reseedWall }
}
