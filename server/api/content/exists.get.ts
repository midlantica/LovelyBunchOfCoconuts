// @ts-ignore virtual module provided by @nuxt/content
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const idsParam = (query.ids as string) || ''
    const rawIds = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!rawIds.length) return { existing: [] }
    // Normalize like likes IDs
    const norm = (id: string) => {
      let x = id.replace(/\/$/, '').replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/').replace(/_/g, '-')
      x = x
        .replace(/^\/claim\//, '/claims/')
        .replace(/^\/meme\//, '/memes/')
        .replace(/^\/quote\//, '/quotes/')
      if (x && !x.startsWith('/')) x = '/' + x
      return x
    }
    const ids = Array.from(new Set(rawIds.map(norm)))
    const existing: string[] = []
    await Promise.all(
      ids.map(async (id) => {
        const doc = await serverQueryContent(event).where({ _path: id }).findOne()
        if (doc) existing.push(id)
      })
    )
    return { existing }
  } catch (e: any) {
    return { existing: [], error: e?.message || 'failed' }
  }
})
