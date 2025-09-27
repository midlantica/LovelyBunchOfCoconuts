export default defineNuxtPlugin(() => {
  // Set background color immediately to prevent white flash
  if (process.client) {
    // Set styles as early as possible
    const style = document.createElement('style')
    style.textContent = `
      html, body, #__nuxt {
        background-color: #020617 !important;
        color: #e2e8f0 !important;
        color-scheme: dark !important;
      }
      body {
        margin: 0;
        padding: 0;
      }
      #__nuxt {
        min-height: 100vh;
      }
    `
    document.head.insertBefore(style, document.head.firstChild)

    // Also set directly on elements
    document.documentElement.style.backgroundColor = '#020617'
    document.documentElement.style.colorScheme = 'dark'
    document.body.style.backgroundColor = '#020617'
    document.body.style.color = '#e2e8f0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
  }
})
