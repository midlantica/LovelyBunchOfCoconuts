// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

const vueMcpPlugin =
  process.env.NUXT_VUE_MCP === '1'
    ? (await import('vite-plugin-vue-mcp')).VueMcp({
        appendTo: 'nuxt/dist/app/entry.js',
      })
    : null

export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  components: true,
  devtools: {
    enabled: false,
    timeline: {
      enabled: true,
    },
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/mdc',
    '@nuxtjs/sitemap',
    './modules/hide-system-files',
    // Only load @netlify/nuxt in production builds — it crashes the dev server
    // by trying to connect to Netlify's edge functions runtime (ECONNREFUSED)
    ...(process.env.NODE_ENV === 'production' ? ['@netlify/nuxt'] : []),
  ],
  // @nuxt/fonts — expand default weight range to include thin (100) and light (300)
  // Default is "400 700" which misses the lighter weights we use throughout the site
  // @ts-ignore - @nuxt/fonts augments NuxtConfig at runtime
  fonts: {
    defaults: {
      weights: [100, 200, 300, 400, 500],
    },
    families: [
      {
        name: 'Barlow Condensed',
        provider: 'google',
        global: true,
        weights: [100, 200, 300, 400, 500],
      },
    ],
  },
  // @nuxt/image — automatic optimization, lazy loading, responsive sizes
  // @ts-ignore - @nuxt/image augments NuxtConfig at runtime
  image: {
    // Use Netlify's built-in image CDN in production; fall back to default (ipx) in dev
    provider: process.env.NODE_ENV === 'production' ? 'netlify' : 'ipx',
    // Quality default for optimized images
    quality: 80,
    // Common screen breakpoints for responsive srcset
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    // Format preference order
    format: ['webp', 'png', 'jpg'],
  },
  css: ['./app/assets/css/main.css'],
  // Use Tailwind v4 via official Vite plugin
  vite: {
    plugins: [tailwindcss(), ...(vueMcpPlugin ? [vueMcpPlugin] : [])],
    // Reduce Vite verbosity; set SILENT_VITE=1 to only show errors
    logLevel: (process.env.SILENT_VITE === '1' ? 'error' : 'warn') as any,
    build: {
      // Enable minification for production performance
      minify: 'esbuild',
      // Enable code splitting
      rollupOptions: {
        onwarn(warning, handler) {
          const msg = String(warning?.message || '')
          // Hide Tailwind Vite plugin sourcemap warning noise
          if (/Sourcemap is likely to be incorrect/.test(msg)) return
          handler(warning)
        },
        output: {
          // Simplified chunk splitting to avoid circular dependencies
          manualChunks(id) {
            // Only split out node_modules as vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 500, // Reduced from 1000 to catch large bundles
      cssCodeSplit: true,
      // Target modern browsers for smaller bundles
      target: 'es2020',
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
    // Ensure Netlify Functions v2 features (incl. Blobs) are enabled
    compatibilityDate: '2025-06-27',
    // Enable compression for all responses
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    // Add security headers including CSP for Iconify + aggressive caching
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy':
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gc.zgo.at; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: http: https: blob:; connect-src 'self' https://wakeupnpc.goatcounter.com https://api.iconify.design; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
        },
      },
      // Aggressive caching for static assets with hashed filenames
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Cache images for 1 year (they have content-based paths)
      '/memes/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      '/profiles/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      '/ads/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Cache fonts
      '/fonts/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Shorter cache for HTML pages
      '/': {
        headers: {
          'Cache-Control': 'public, max-age=3600, must-revalidate',
        },
      },
    },
    minify: true,
    prerender: {
      routes: ['/', '/about', '/advertising'],
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
      external: [
        '@oxc-minify/binding-linux-x64-gnu',
        '@oxc-parser/binding-linux-x64-gnu',
        '@oxc-transform/binding-linux-x64-gnu',
      ],
    },
    // Persist likes in production using Netlify Blobs; use FS locally
    storage: {
      wakeupnpc_likes: {
        driver: 'netlify-blobs',
        // Netlify Blobs requires a store name (global across deploys)
        name: 'wakeupnpc_likes',
        // Ensure immediate read-after-write behavior for small counters
        consistency: 'strong',
        // Optional: default consistency is 'eventual'; keep default
      },
    },
    devStorage: {
      wakeupnpc_likes: {
        driver: 'fs',
        base: './server/.data/likes',
      },
    },
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
    build: { markdown: { contentHeading: false } },
    renderer: {
      anchorLinks: false, // Disable automatic anchor link generation in headings
    },
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
      htmlAttrs: {
        lang: 'en', // Fix accessibility issue
      },
      title: 'WakeUpNPC - Political Grifts, Quotes & Memes',
      meta: [
        {
          name: 'description',
          content:
            'A curated wall of political grifts, insightful quotes, and thought-provoking memes. Explore diverse perspectives and challenge your thinking.',
        },
        { name: 'theme-color', content: '#68D2FF' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        {
          property: 'og:title',
          content: 'WakeUpNPC - Political Grifts, Quotes & Memes',
        },
        {
          property: 'og:description',
          content:
            'A curated wall of political grifts, insightful quotes, and thought-provoking memes. Explore diverse perspectives and challenge your thinking.',
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
          content: 'WakeUpNPC - Political Grifts, Quotes & Memes',
        },
        {
          name: 'twitter:description',
          content:
            'A curated wall of political grifts, insightful quotes, and thought-provoking memes.',
        },
        {
          name: 'twitter:image',
          content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
        },

        // Additional SEO
        {
          name: 'keywords',
          content:
            'politics, quotes, memes, grifts, political discourse, critical thinking',
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
        // Preload LCP image (welcome modal) with fetchpriority
        {
          rel: 'preload',
          href: '/welcome-modal-image.svg',
          as: 'image',
          type: 'image/svg+xml',
          fetchpriority: 'high',
        },
        // Preload critical logo image
        {
          rel: 'preload',
          href: '/WakeUpNPC-logo.svg',
          as: 'image',
          type: 'image/svg+xml',
          fetchpriority: 'high',
        },
        // Favicon sizes
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/favicon/favicon-192x192.png',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      // Inline critical styles — background is handled by CSS vars via data-theme attribute
      style: [
        {
          children:
            'html,body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;}#__nuxt{min-height:100vh;}*{box-sizing:border-box;}#modal-root{position:fixed;inset:0;pointer-events:none;}',
        } as any,
      ],
      script: [
        // GoatCounter analytics (enabled only when env var is present)
        ...(process.env.NUXT_PUBLIC_GOATCOUNTER
          ? [
              {
                'data-goatcounter': 'https://wakeupnpc.goatcounter.com/count',
                async: true,
                defer: true,
                src: 'https://gc.zgo.at/count.js',
              },
            ]
          : []),
      ],
      // Add security headers and font fallback
      noscript: [
        {
          innerHTML: 'JavaScript is required to view this website.',
        },
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
  // Performance optimizations
  experimental: {
    payloadExtraction: true, // Extract payload for better caching
    renderJsonPayloads: true, // Optimize JSON payloads
    extractAsyncDataHandlers: true, // ⭐ NEW: Extract data handlers for 39% bundle reduction
    viteEnvironmentApi: true, // ⭐ NEW: Faster dev server with Vite environment API
  },
})
