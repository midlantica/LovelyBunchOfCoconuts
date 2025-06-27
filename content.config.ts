// content.config.ts
import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    claims: defineCollection({
      type: 'page',
      source: 'claims/*.md',
    }),
    quotes: defineCollection({
      type: 'page',
      source: 'quotes/*.md',
    }),
    memes: defineCollection({
      type: 'page',
      source: 'memes/*.md',
    }),
  },
})
