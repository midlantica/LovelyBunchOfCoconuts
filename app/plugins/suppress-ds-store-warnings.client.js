export default defineNuxtPlugin(() => {
  // Suppress specific Nuxt Content warnings about .DS_Store files
  if (process.dev) {
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      // Filter out Symbol values to avoid join error
      const safeArgs = args.map((a) => (typeof a === 'symbol' ? '[Symbol]' : a))
      const message = safeArgs.join(' ')

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

      // Skip duplicate item warnings (these are expected and handled)
      if (message.includes('Duplicate item detected and removed:')) {
        return
      }

      // Skip Suspense experimental feature warning
      if (message.includes('<Suspense> is an experimental feature')) {
        return
      }

      // Skip CSP violation warnings for Iconify (will be fixed after server restart)
      if (
        message.includes('api.iconify.design') &&
        message.includes('Content Security Policy')
      ) {
        return
      }

      // Pass through all other warnings
      originalConsoleWarn.apply(console, args)
    }
  }
})
