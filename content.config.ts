import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  ignores: [
    '\\.DS_Store$', // Ignore .DS_Store files
    '\\._.*', // Ignore any ._* resource fork files
    'Thumbs\\.db$', // Also ignore Windows thumbnail files
  ],
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
