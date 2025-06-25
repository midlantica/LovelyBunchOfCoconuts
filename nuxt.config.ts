export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/content", "nuxt-icon", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/main.css", "~/assets/css/transitions.css"],
  ssr: false,
  content: {
    mdc: true,
    highlight: {
      theme: {
        default: "github-light",
        dark: "github-dark",
      },
    },
    sources: {
      content: {
        documentDriven: true,
      },
    },
  },
  build: {
    transpile: ["~/composables"], // 👈 This is the fix
  },
  app: {
    head: {
      title: "WakeUpNPC2",
      meta: [
        { name: "description", content: "A wall of claims, quotes, and memes" },
        { name: "theme-color", content: "#68D2FF" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "36x36", href: "/favicon/favicon-36x36.png" },
        { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon/favicon-48x48.png" },
        { rel: "icon", type: "image/png", sizes: "57x57", href: "/favicon/favicon-57x57.png" },
        { rel: "icon", type: "image/png", sizes: "60x60", href: "/favicon/favicon-60x60.png" },
        { rel: "icon", type: "image/png", sizes: "72x72", href: "/favicon/favicon-72x72.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon/favicon-96x96.png" },
        { rel: "icon", type: "image/png", sizes: "120x120", href: "/favicon/favicon-120x120.png" },
        { rel: "icon", type: "image/png", sizes: "144x144", href: "/favicon/favicon-144x144.png" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon/favicon-192x192.png" },
        { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon/favicon-512x512.png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },
  nitro: {
    preset: "netlify",
    compatibilityDate: "2025-06-25",
    experimental: {
      openAPI: true,
    },
    prerender: {
      routes: ["/"],
      crawlLinks: false,
    },
  },
})
