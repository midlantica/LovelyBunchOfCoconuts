// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/mdc',
  ],
  css: ['~/assets/css/main.css'],
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },
  content: {
    build: {
      markdown: {
        contentHeading: true,
      },
    },
  },
  app: {
    head: {
      title: 'WakeUpNPC - Political Claims, Quotes & Memes',
      meta: [
        {
          name: 'description',
          content:
            'A curated wall of political claims, insightful quotes, and thought-provoking memes. Explore diverse perspectives and challenge your thinking.',
        },
        { name: 'theme-color', content: '#68D2FF' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        {
          property: 'og:title',
          content: 'WakeUpNPC - Political Claims, Quotes & Memes',
        },
        {
          property: 'og:description',
          content:
            'A curated wall of political claims, insightful quotes, and thought-provoking memes. Explore diverse perspectives and challenge your thinking.',
        },
        { property: 'og:url', content: 'https://www.wakeupnpc.com' },
        { property: 'og:site_name', content: 'WakeUpNPC' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'WakeUpNPC - Political Claims, Quotes & Memes',
        },
        {
          name: 'twitter:description',
          content:
            'A curated wall of political claims, insightful quotes, and thought-provoking memes.',
        },

        // Additional SEO
        {
          name: 'keywords',
          content:
            'politics, quotes, memes, claims, political discourse, critical thinking',
        },
        { name: 'author', content: 'WakeUpNPC' },
        { name: 'robots', content: 'index, follow' },

        // Mobile optimization - Updated
        {
          name: 'viewport',
          content:
            'width=375, initial-scale=1, maximum-scale=1, user-scalable=no',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '36x36',
          href: '/favicon/favicon-36x36.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '48x48',
          href: '/favicon/favicon-48x48.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '57x57',
          href: '/favicon/favicon-57x57.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '60x60',
          href: '/favicon/favicon-60x60.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '72x72',
          href: '/favicon/favicon-72x72.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '96x96',
          href: '/favicon/favicon-96x96.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '120x120',
          href: '/favicon/favicon-120x120.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '144x144',
          href: '/favicon/favicon-144x144.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/favicon/favicon-192x192.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '512x512',
          href: '/favicon/favicon-512x512.png',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
