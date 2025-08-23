import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  // NOTE: Ignore patterns moved to nuxt.config.ts (content.ignores) because defineContentConfig schema doesn't expose `ignores`.
  collections: {
    claims: defineCollection({ source: 'claims/**', type: 'page' }),
    memes: defineCollection({ source: 'memes/**', type: 'page' }),
    quotes: defineCollection({ source: 'quotes/**', type: 'page' }),
  },
})
// No schemas defined here on purpose — we only declare collections/sources.
