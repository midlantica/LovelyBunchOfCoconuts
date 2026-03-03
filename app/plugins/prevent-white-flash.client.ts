export default defineNuxtPlugin(() => {
  // Apply the correct theme immediately to prevent flash of wrong theme.
  //
  // Logic (mirrors useTheme.ts):
  // 1. If the user has an explicit override stored → use it
  // 2. Otherwise → follow the OS/browser prefers-color-scheme
  if (process.client) {
    const OVERRIDE_KEY = 'wakeupnpc-theme-override'
    const OLD_KEY = 'wakeupnpc-theme'

    // Migrate old stored preference to new override key (one-time migration)
    const oldStored = localStorage.getItem(OLD_KEY)
    if (oldStored === 'light' || oldStored === 'dark') {
      localStorage.setItem(OVERRIDE_KEY, oldStored)
      localStorage.removeItem(OLD_KEY)
    }

    const override = localStorage.getItem(OVERRIDE_KEY)
    let theme: string
    if (override === 'light' || override === 'dark') {
      theme = override
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    // Apply data-theme attribute — CSS vars handle all colors
    document.documentElement.setAttribute('data-theme', theme)

    // Remove any inline background overrides that may have been set previously
    document.documentElement.style.removeProperty('background-color')
    document.documentElement.style.removeProperty('color-scheme')
    if (document.body) {
      document.body.style.removeProperty('background-color')
      document.body.style.removeProperty('color')
    }
  }
})
