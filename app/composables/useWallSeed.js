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
      console.log(`🎲 Wall reseeded: ${reason}`)
    }
  }

  // On every client-side page load (full navigation / Cmd-R), generate a fresh
  // seed so the user always sees a new shuffle.  We use a *session-level* flag
  // stored in sessionStorage so the reseed fires exactly once per page load
  // (not on every component re-mount during SPA navigation).
  if (import.meta.client) {
    const _seedApplied = useState('_seedAppliedThisLoad', () => false)
    if (!_seedApplied.value) {
      _seedApplied.value = true
      // Generate a brand-new seed on this page load, overriding the SSR seed.
      // This ensures Cmd-R always produces a fresh shuffle.
      wallSeed.value = generateSeed()
    }
  }

  return { wallSeed, reseedWall }
}
