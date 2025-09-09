import { getCounts } from '../../utils/likesStore'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const idsParam = (query.ids as string) || ''
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const counts = await getCounts(ids)
    return { counts }
  } catch (e: any) {
    // Avoid 500s in prod; return empty map so clients can degrade gracefully
    return { counts: {}, error: e?.message || 'storage-failed' }
  }
})
