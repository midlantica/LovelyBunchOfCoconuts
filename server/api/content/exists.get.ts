// GET /api/content/exists?ids=/claims/foo,/memes/bar
// Returns { exists: string[], missing: string[] }
// @ts-ignore - virtual import provided by @nuxt/content
import { queryContent } from '#content'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const idsParam = (query.ids as string) || ''
  try {
    const rawIds = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const norm = (id: string) => {
      if (!id) return ''
      let x = id
      try {
        x = decodeURIComponent(x)
      } catch {}
      if (!x.startsWith('/')) x = '/' + x
      x = x
        .replace(/\/$/, '')
        .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
        .replace(/_/g, '-')
        .replace(/^\/claim\//, '/claims/')
        .replace(/^\/meme\//, '/memes/')
        .replace(/^\/quote\//, '/quotes/')
        .replace(/\/+/, '/')
      return x
    }
    const ids = Array.from(new Set(rawIds.map(norm))).filter(Boolean)
    if (!ids.length) return { exists: [], missing: [] }

    // Narrow query to only requested paths to reduce load & potential serialization issues
    const found = await queryContent()
      // @ts-ignore - $in operator supported by content query builder
      .where({ _path: { $in: ids } })
      .only(['_path'])
      .find()
    const foundSet = new Set(found.map((c: any) => c._path))
    const exists: string[] = []
    const missing: string[] = []
    for (const id of ids) (foundSet.has(id) ? exists : missing).push(id)
    return { exists, missing }
  } catch (e: any) {
    // Graceful fallback to avoid 500 loops; treat all as existing so UI won't spam
    return {
      exists: idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      missing: [],
      error: e?.message || 'failed',
    }
  }
})
