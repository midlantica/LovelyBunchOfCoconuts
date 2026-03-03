/**
 * useTheme — dark/light theme toggle
 *
 * Sets `data-theme` on <html> and persists the choice to localStorage.
 *
 * Behaviour:
 * - On every page load, the OS/browser `prefers-color-scheme` is checked.
 * - If the user has explicitly toggled the theme (stored in OVERRIDE_KEY),
 *   that override is used instead of the OS preference.
 * - Toggling the theme button saves an explicit override to localStorage.
 */
import { ref, computed, readonly } from 'vue'

type Theme = 'dark' | 'light'

// Key that stores an explicit user override (set only when user toggles)
const OVERRIDE_KEY = 'wakeupnpc-theme-override'

// Shared reactive state (module-level singleton)
const theme = ref<Theme>('dark')

function getOsTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(t: Theme) {
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', t)
  }
}

export function useTheme() {
  /**
   * Initialise theme on page load.
   * Always re-checks OS preference unless the user has an explicit override.
   */
  function init() {
    if (!import.meta.client) return
    const override = localStorage.getItem(OVERRIDE_KEY) as Theme | null
    const resolved: Theme =
      override === 'light' || override === 'dark' ? override : getOsTheme()
    theme.value = resolved
    applyTheme(resolved)
  }

  function setTheme(t: Theme) {
    theme.value = t
    applyTheme(t)
    if (import.meta.client) {
      localStorage.setItem(OVERRIDE_KEY, t)
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  /**
   * Clear the explicit override so the app follows the OS preference again.
   */
  function resetToOsTheme() {
    if (import.meta.client) {
      localStorage.removeItem(OVERRIDE_KEY)
    }
    const resolved = getOsTheme()
    theme.value = resolved
    applyTheme(resolved)
  }

  const isDark = computed(() => theme.value === 'dark')

  return {
    theme: readonly(theme),
    isDark,
    init,
    setTheme,
    toggleTheme,
    resetToOsTheme,
  }
}
