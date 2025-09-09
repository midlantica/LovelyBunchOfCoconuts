import { mergeLikes } from '../../utils/likesStore'

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as any
    let from = String(body?.from || '').trim()
    let to = String(body?.to || '').trim()
    if (!from || !to)
      throw createError({ statusCode: 400, statusMessage: 'Missing from/to' })
    // Normalize like other routes
    const norm = (id: string) => {
      id = id
        .replace(/\/$/, '')
        .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
        .replace(/_/g, '-')
      id = id
        .replace(/^\/claim\//, '/claims/')
        .replace(/^\/meme\//, '/memes/')
        .replace(/^\/quote\//, '/quotes/')
      if (id && !id.startsWith('/')) id = '/' + id
      return id
    }
    from = norm(from)
    to = norm(to)
    const out = await mergeLikes(from, to)
    return { ok: true, ...out }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e?.message || 'bad-request',
    })
  }
})
