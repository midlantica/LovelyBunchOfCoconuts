import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    claims: defineCollection({
      source: 'claims/**',
      type: 'page',
    }),
    memes: defineCollection({
      source: 'memes/**',
      type: 'page',
    }),
    quotes: defineCollection({
      source: 'quotes/**',
      type: 'page',
    }),
  },
})

console.log('Content config loaded successfully with empty schemas')
