import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  // NOTE: Ignore patterns moved to nuxt.config.ts (content.ignores) because defineContentConfig schema doesn't expose `ignores`.
  collections: {
    grifts: defineCollection({ source: 'grifts/**', type: 'page' }),
    memes: defineCollection({ source: 'memes/**', type: 'page' }),
    quotes: defineCollection({ source: 'quotes/**', type: 'page' }),
    ads: defineCollection({ source: 'ads/**', type: 'page' }),
    profiles: defineCollection({ source: 'profiles/**', type: 'page' }),
  },
})
// No schemas defined here on purpose — we only declare collections/sources.
