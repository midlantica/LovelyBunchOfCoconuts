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
 *
 * Nuxt 4.4 update: also persists theme in a cookie (useCookie with refresh: true)
 * so SSR can read the user's theme preference and avoid flash-of-wrong-theme
 * on the very first server render (before JS runs).
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
  // useCookie with refresh: true (Nuxt 4.4) — extends cookie expiry on each write
  // without changing the value. This keeps the SSR theme cookie alive across sessions
  // so the server can read it on the first request and avoid a theme flash.
  // @ts-expect-error — useCookie is a Nuxt auto-import resolved at runtime
  const themeCookie = useCookie<Theme>('wakeupnpc-theme', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: false, // theme is not sensitive
    refresh: true, // Nuxt 4.4: auto-extend expiry on each write
  })

  /**
   * Initialise theme on page load.
   * Always re-checks OS preference unless the user has an explicit override.
   * Priority: localStorage override > cookie > OS preference
   */
  function init() {
    if (!import.meta.client) return
    const override = localStorage.getItem(OVERRIDE_KEY) as Theme | null
    // Fall back to cookie value (set by SSR or previous session) if no localStorage override
    const cookieVal = themeCookie.value
    const resolved: Theme =
      override === 'light' || override === 'dark'
        ? override
        : cookieVal === 'light' || cookieVal === 'dark'
          ? cookieVal
          : getOsTheme()
    theme.value = resolved
    applyTheme(resolved)
  }

  function setTheme(t: Theme) {
    theme.value = t
    applyTheme(t)
    if (import.meta.client) {
      localStorage.setItem(OVERRIDE_KEY, t)
    }
    // Also write to cookie so SSR can read it on next request
    themeCookie.value = t
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
    themeCookie.value = resolved
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
