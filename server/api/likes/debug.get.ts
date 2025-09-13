import { getCounts } from '../../utils/likesStore'

// GET /api/likes/debug -> returns all stored like counts (dev helper)
export default defineEventHandler(async (event) => {
  // Allow in development always, and in production with dev=1 parameter
  const query = getQuery(event)
  const isAllowed = process.env.NODE_ENV !== 'production' || query.dev === '1'

  if (!isAllowed) {
    return { counts: {}, totalKeys: 0, restricted: true }
  }

  try {
    const counts = await getCounts([])
    return {
      counts,
      totalKeys: Object.keys(counts).length,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }
  } catch (e: any) {
    return {
      counts: {},
      totalKeys: 0,
      error: e?.message || 'storage-failed',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }
  }
})
