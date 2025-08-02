export default defineNuxtPlugin(() => {
  // Suppress specific Nuxt Content warnings about .DS_Store files
  if (process.dev) {
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      const message = args.join(' ')

      // Skip .DS_Store related warnings
      if (
        message.includes('.DS_Store') &&
        message.includes('is ignored because parsing is failed')
      ) {
        return
      }

      // Skip Thumbs.db related warnings
      if (
        message.includes('Thumbs.db') &&
        message.includes('is ignored because parsing is failed')
      ) {
        return
      }

      // Pass through all other warnings
      originalConsoleWarn.apply(console, args)
    }
  }
})
