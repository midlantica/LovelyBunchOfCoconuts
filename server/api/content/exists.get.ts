// GET /api/content/exists?ids=/claims/foo,/memes/bar
// Returns { exists: string[], missing: string[] }
// @ts-ignore - virtual import provided by @nuxt/content
import { queryContent } from '#content'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const idsParam = (query.ids as string) || ''
    const rawIds = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const norm = (id: string) => {
      if (!id) return ''
      let x = id
      if (!x.startsWith('/')) x = '/' + x
      x = x
        .replace(/\/$/, '')
        .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
        .replace(/_/g, '-')
        .replace(/^\/claim\//, '/claims/')
        .replace(/^\/meme\//, '/memes/')
        .replace(/^\/quote\//, '/quotes/')
      return x
    }
    const ids = Array.from(new Set(rawIds.map(norm))).filter(Boolean)
    if (!ids.length) return { exists: [], missing: [] }

    // Use content query to check existence quickly
    const content = await queryContent().only(['_path']).find()
    const existingSet = new Set(content.map((c: any) => c._path))
    const exists: string[] = []
    const missing: string[] = []
    for (const id of ids) {
      if (existingSet.has(id)) exists.push(id)
      else missing.push(id)
    }
    return { exists, missing }
  } catch (e: any) {
    return { exists: [], missing: [], error: e?.message || 'failed' }
  }
})
