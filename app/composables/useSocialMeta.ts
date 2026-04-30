// composables/useSocialMeta.ts
// Provide helper to set social/open graph meta tags for dynamic pages
//
// Migrated from useHead() to useSeoMeta() (Nuxt 4 best practice):
//   - Fully typed meta properties (no raw string keys)
//   - Tree-shakeable at build time
//   - Prevents XSS via raw innerHTML injection
//   - useSeoMeta/useHead are Nuxt auto-imports (available without explicit import)

interface SocialMetaOptions {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function useSocialMeta(options: SocialMetaOptions = {}) {
  const { title, description, image, url } = options

  // useSeoMeta is the Nuxt 4 recommended API for all SEO/social meta tags.
  // It sets both <title> and all meta tags in a single typed call.
  // @ts-expect-error — useSeoMeta/useHead are Nuxt auto-imports resolved at runtime
  return useSeoMeta({
    title: title || 'Lovely Bunch of Coconuts',
    description: description || 'British humour, quotes, comedy & wit.',
    ogTitle: title || 'Lovely Bunch of Coconuts',
    ogDescription: description || 'British humour, quotes, comedy & wit.',
    ...(image ? { ogImage: image } : {}),
    ...(url ? { ogUrl: url } : {}),
    twitterCard: image ? 'summary_large_image' : 'summary',
    twitterTitle: title || 'Lovely Bunch of Coconuts',
    twitterDescription: description || 'British humour, quotes, comedy & wit.',
    ...(image ? { twitterImage: image } : {}),
  })
}
