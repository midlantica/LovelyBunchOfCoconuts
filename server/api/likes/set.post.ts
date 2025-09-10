import { setCount } from '../../utils/likesStore'

// POST /api/likes/set  { id: string, value: number }
export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event).catch(() => ({}))) as any
    let id = String(body?.id || '').trim()
    if (!id) throw createError({ statusCode: 400, statusMessage: 'missing-id' })
    try {
      id = decodeURIComponent(id)
    } catch {}
    if (!id.startsWith('/')) id = '/' + id
    id = id
      .replace(/\/$/, '')
      .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
      .replace(/_/g, '-')
      .replace(/^\/claim\//, '/claims/')
      .replace(/^\/meme\//, '/memes/')
      .replace(/^\/quote\//, '/quotes/')
    const rawVal = body?.value
    if (typeof rawVal !== 'number' || rawVal < 0 || !Number.isFinite(rawVal)) {
      throw createError({ statusCode: 400, statusMessage: 'bad-value' })
    }
    const count = await setCount(id, Math.floor(rawVal))
    return { id, count, forced: true }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e?.statusMessage || e?.message || 'bad-request',
    })
  }
})
