// composables/useSocialMeta.js
// Provide helper to set social/open graph meta tags for dynamic pages
export function useSocialMeta({ title, description, image, url } = {}) {
  const head = useHead({
    title: title || 'WakeUpNPC',
    meta: [
      {
        name: 'description',
        content: description || 'Political claims, quotes, memes.',
      },
      { property: 'og:title', content: title || 'WakeUpNPC' },
      {
        property: 'og:description',
        content: description || 'Political claims, quotes, memes.',
      },
      image && { property: 'og:image', content: image },
      url && { property: 'og:url', content: url },
      {
        name: 'twitter:card',
        content: image ? 'summary_large_image' : 'summary',
      },
    ].filter(Boolean),
  })
  return head
}
