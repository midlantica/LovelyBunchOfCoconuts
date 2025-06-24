// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/content", "nuxt-icon", "@nuxtjs/tailwindcss", "@nuxthub/core"],
  css: ["~/assets/css/main.css", "~/assets/css/transitions.css"],
  target: "static", // Enable static site generation
  ssr: true, // Enable SSR for pre-rendering content
  content: {
    markdown: {
      html: true, // Allow raw HTML tags like <wbr> in markdown
      highlight: {
        // Theme used in all color schemes.
        theme: {
          // Default theme (same as single string)
          default: "github-light",
          // Theme used if `html.dark`
          dark: "github-dark",
        },
      },
    },
    // Ensure content is sourced from the content/ directory
    sources: {
      content: {
        driver: "fs",
        base: "content",
      },
    },
    build: {
      // ...existing code...
    },
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
    // Add compatibility date for Nitro
    preset: "netlify", // Optimize for Netlify
    compatibilityDate: "2025-06-20",
    experimental: {
      openAPI: true,
    },
    prerender: {
      // Pre-render the homepage
      routes: ["/"],
      // Then crawl all the links on the page
      crawlLinks: true,
    },
  },
  // Pre-render dynamic routes for content
  generate: {
    routes: async () => {
      const { $content } = require("@nuxt/content")
      const claims = await $content("claims").fetch()
      const quotes = await $content("quotes").fetch()
      const memes = await $content("memes").fetch()
      return [
        ...claims.map((item) => `/claims/${item.slug || item._path.split("/").pop()}`),
        ...quotes.map((item) => `/quotes/${item.slug || item._path.split("/").pop()}`),
        ...memes.map((item) => `/memes/${item.slug || item._path.split("/").pop()}`),
      ]
    },
  },
})
