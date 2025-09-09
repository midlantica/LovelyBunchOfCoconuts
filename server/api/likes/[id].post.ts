import { increment } from '../../utils/likesStore'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id || ''
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    }
    const body = (await readBody(event).catch(() => ({}))) as any
    // direction: +1 (like) or -1 (unlike). Default +1.
    let delta = 1
    if (typeof body?.delta === 'number') {
      delta = body.delta > 0 ? 1 : -1
    }
    const count = await increment(id, delta)
    return { id, count }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e?.message || 'bad-request',
    })
  }
})
