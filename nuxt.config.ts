// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  components: true,
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
    '@nuxtjs/mdc',
    '@nuxtjs/sitemap',
    './modules/hide-system-files',
  ],
  css: ['./app/assets/css/main.css'],
  // Use Tailwind v4 via official Vite plugin
  vite: {
    plugins: [tailwindcss()],
    // Reduce Vite verbosity; set SILENT_VITE=1 to only show errors
    logLevel: (process.env.SILENT_VITE === '1' ? 'error' : 'warn') as any,
    build: {
      rollupOptions: {
        onwarn(warning, handler) {
          const msg = String(warning?.message || '')
          // Hide Tailwind Vite plugin sourcemap warning noise
          if (/Sourcemap is likely to be incorrect/.test(msg)) return
          handler(warning)
        },
      },
    },
    // Filter chatty plugin warnings in both dev and build
    // Note: This keeps errors visible; set SILENT_VITE=1 to hide infos/warns entirely
    customLogger: {
      hasWarned: false,
      info(msg: string) {
        if (process.env.SILENT_VITE === '1') return
        console.log(msg)
      },
      warn(msg: string) {
        const str = String(msg || '')
        if (
          /Sourcemap is likely to be incorrect/.test(str) ||
          /plugin @tailwindcss\/vite/.test(str)
        ) {
          return
        }
        if (process.env.SILENT_VITE === '1') return
        console.warn(str)
      },
      error(msg: string) {
        console.error(String(msg || ''))
      },
      clearScreen() {
        // noop: keep logs visible when needed
      },
    } as any,
  },
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
    ignore: [
      // Ignore all files and directories starting with one or more underscores
      '**/_*', // Files/directories starting with single underscore
      '**/__*', // Files/directories starting with double underscore or more
      // Ignore macOS and Windows system files
      '**/.DS_Store',
      '**/._*',
      '**/Thumbs.db',
    ],
    experimental: {
      openAPI: true,
    },
    externals: {
      inline: ['@nuxt/content'],
    },
    // Enable lossless compression for built public assets (gz/br)
    compressPublicAssets: true,
    // Silence harmless node-resolve warnings for virtual "#content/server" module
    rollupConfig: {
      onwarn(warning, handler) {
        const msg = String(warning?.message || '')
        // Silence unresolved virtual import warnings for Nuxt Content's server helper
        if (
          (warning as any)?.code === 'UNRESOLVED_IMPORT' &&
          /#content\/server/.test(msg)
        )
          return
        // Also silence node-resolve noise mentioning the same
        if (
          (warning as any)?.plugin === 'node-resolve' &&
          /#content\/server/.test(msg)
        )
          return
        // Hide circular dependency spam from third-party libs
        if ((warning as any)?.code === 'CIRCULAR_DEPENDENCY') return
        handler(warning)
      },
    },
  },
  // @ts-ignore - @nuxt/content module augments config at runtime
  content: {
    build: { markdown: { contentHeading: true } },
    // NOTE: File ignore patterns handled via content/.nuxtignore and transformation filters (useContentCache).
  },

  // Site + sitemap configuration
  // Newer @nuxtjs/sitemap expects site.url to be present (or NUXT_PUBLIC_SITE_URL env)
  site: {
    url: 'https://wakeupnpc.com',
  },
  sitemap: {
    autoI18n: false,
    xsl: false, // disable XSL stylesheet to avoid prerendering /__sitemap__/style.xsl
  } as any,

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
        { property: 'og:url', content: 'https://wakeupnpc.com' },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        {
          property: 'og:image',
          content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
        },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },

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
        {
          name: 'twitter:image',
          content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
        },

        // Additional SEO
        {
          name: 'keywords',
          content:
            'politics, quotes, memes, claims, political discourse, critical thinking',
        },
        { name: 'author', content: 'WakeUpNPC' },
        { name: 'robots', content: 'index, follow' },

        // Mobile optimization (fix a11y):
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Canonical home URL
        { rel: 'canonical', href: 'https://wakeupnpc.com/' },
        // Preload key background images used above the fold
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
      script: [
        // GoatCounter analytics (enabled only when env var is present)
        ...(process.env.NUXT_PUBLIC_GOATCOUNTER
          ? [
              {
                'data-goatcounter': 'https://wakeupnpc.goatcounter.com/count',
                async: true,
                src: 'https://gc.zgo.at/count.js',
              },
            ]
          : []),
      ],
    },
  },
  hooks: {
    // Optional build-time suppression of noisy plugin warnings
    'build:before': () => {
      if (process.env.QUIET_BUILD !== '1') return
      const origWarn = console.warn
      console.warn = (...args: any[]) => {
        try {
          const msg = args.map((a) => String(a)).join(' ')
          if (
            /Sourcemap is likely to be incorrect/.test(msg) ||
            /plugin @tailwindcss\/vite/.test(msg)
          ) {
            return
          }
        } catch {}
        origWarn(...args)
      }
    },
    // content:file:beforeParse hook registered via inline module below for type safety
  },
  runtimeConfig: {
    public: {
      siteUrl: 'https://wakeupnpc.com',
    },
  },
})
