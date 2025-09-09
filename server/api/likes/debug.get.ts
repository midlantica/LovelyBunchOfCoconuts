import { getCounts } from '#imports'

// GET /api/likes/debug -> returns all stored like counts (dev helper)
export default defineEventHandler(async () => {
  const counts = await getCounts([])
  return { counts, totalKeys: Object.keys(counts).length }
})
