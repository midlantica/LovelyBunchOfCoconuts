// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/content", "nuxt-icon", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/main.css"],
  content: {
    build: {
      markdown: {
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
    },
  },
  app: {
    head: {
      title: "WakeUpNPC2",
      meta: [{ name: "description", content: "A wall of claims, quotes, and memes" }],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  nitro: {
    // Add compatibility date for Nitro
    compatibilityDate: "2025-05-07",
  },
})
