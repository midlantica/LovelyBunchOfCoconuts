import { getCounts } from '../../utils/likesStore'

// GET /api/likes/debug -> returns all stored like counts (dev helper)
export default defineEventHandler(async () => {
  try {
    const counts = await getCounts([])
    return { counts, totalKeys: Object.keys(counts).length }
  } catch (e: any) {
    return { counts: {}, totalKeys: 0, error: e?.message || 'storage-failed' }
  }
})
