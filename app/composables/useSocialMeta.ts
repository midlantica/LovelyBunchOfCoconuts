// composables/useSocialMeta.ts
// Provide helper to set social/open graph meta tags for dynamic pages

import type { MaybeRefOrGetter } from 'vue'

interface SocialMetaOptions {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function useSocialMeta(options: SocialMetaOptions = {}) {
  const { title, description, image, url } = options

  // @ts-expect-error useHead is auto-imported by Nuxt at runtime
  const head = useHead({
    title: title || 'WakeUpNPC',
    meta: [
      {
        name: 'description',
        content: description || 'Political grifts, quotes, memes.',
      },
      { property: 'og:title', content: title || 'WakeUpNPC' },
      {
        property: 'og:description',
        content: description || 'Political grifts, quotes, memes.',
      },
      ...(image ? [{ property: 'og:image', content: image }] : []),
      ...(url ? [{ property: 'og:url', content: url }] : []),
      {
        name: 'twitter:card',
        content: image ? 'summary_large_image' : 'summary',
      },
    ],
  })

  return head
}
