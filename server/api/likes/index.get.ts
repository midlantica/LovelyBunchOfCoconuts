import { getCounts } from '../../utils/likesStore'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const idsParam = (query.ids as string) || ''
    const idsRaw = idsParam
      .split(',')
      .map((s) => {
        const t = s.trim()
        if (!t) return ''
        try {
          return decodeURIComponent(t)
        } catch {
          return t
        }
      })
      .filter(Boolean)
    // Server-side normalization to match storage keys
    const ids = Array.from(
      new Set(
        idsRaw.map((id) => {
          let x = id
          // ensure leading slash
          if (x && !x.startsWith('/')) x = '/' + x
          // remove trailing slash
          x = x.replace(/\/$/, '')
          // collapse duplicate content prefixes
          x = x.replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
          // underscores to hyphens
          x = x.replace(/_/g, '-')
          // singular route variants
          x = x
            .replace(/^\/claim\//, '/grifts/')
            .replace(/^\/meme\//, '/memes/')
            .replace(/^\/quote\//, '/quotes/')
          // collapse duplicate slashes
          x = x.replace(/\/+/g, '/')
          return x
        })
      )
    )
    const counts = await getCounts(ids)
    return { counts }
  } catch (e: any) {
    // Avoid 500s in prod; return empty map so clients can degrade gracefully
    return { counts: {}, error: e?.message || 'storage-failed' }
  }
})
