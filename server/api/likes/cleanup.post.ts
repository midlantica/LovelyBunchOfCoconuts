import { removeKeys } from '../../utils/likesStore'
// POST /api/likes/cleanup { ids: string[] }
export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as any
    const raw: string[] = Array.isArray(body?.ids) ? body.ids : []
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
    const ids = Array.from(new Set(raw.map(norm))).filter(Boolean)
    const out = await removeKeys(ids)
    return { ok: true, ...out }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e?.message || 'bad-request',
    })
  }
})
