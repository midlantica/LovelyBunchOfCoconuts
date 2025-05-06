// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "nuxt-icon", "@nuxt/eslint"],
  css: ["@/assets/css/styles.css"],
  eslint: {
    config: {
      standalone: false, // Merge with your existing eslint.config.js
    },
  },
  plugins: [{ src: "~/plugins/dev-log.client.js", mode: "client" }],
  content: {
    documentDriven: false,
    ignores: [
      'README.md',
      'readme.md'
    ],
    api: {
      baseURL: '/api/_content'
    },
    experimental: {
      search: {
        indexed: true
      }
    },
    // Use memory driver to avoid SQLite issues
    storage: {
      fs: {
        driver: 'memory'
      }
    }
  },
  tailwindcss: {
    config: {
      plugins: [
        require('@tailwindcss/typography')
      ]
    }
  }
})
