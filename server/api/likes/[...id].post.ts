import { increment } from '../../utils/likesStore'

export default defineEventHandler(async (event) => {
  try {
    const raw = event.context.params?.id
    let id = ''
    if (Array.isArray(raw)) {
      // Join segments and decode each (client sent encodeURIComponent for each segment)
      id =
        '/' +
        raw
          .map((seg) => {
            try {
              return decodeURIComponent(seg)
            } catch {
              return seg
            }
          })
          .filter(Boolean)
          .join('/')
    } else if (typeof raw === 'string') {
      try {
        id = decodeURIComponent(raw)
      } catch {
        id = raw
      }
      if (!id.startsWith('/')) id = '/' + id
    }
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    }
    // Normalize a little to match client canonicalization
    id = id
      .replace(/\/$/, '')
      .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
      .replace(/_/g, '-')
      .replace(/^\/claim\//, '/claims/')
      .replace(/^\/meme\//, '/memes/')
      .replace(/^\/quote\//, '/quotes/')
    if (id && !id.startsWith('/')) id = '/' + id

    const body = (await readBody(event).catch(() => ({}))) as any
    let delta = 1
    if (typeof body?.delta === 'number') delta = body.delta > 0 ? 1 : -1

    const count = await increment(id, delta)
    return { id, count }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e?.message || 'bad-request',
    })
  }
})
