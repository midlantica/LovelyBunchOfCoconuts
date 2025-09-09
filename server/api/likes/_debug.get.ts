// TEMPORARY DEBUG ENDPOINT - REMOVE FOR PRODUCTION
// GET /api/likes/_debug  -> returns all stored like counts
// Provides a simple way to verify persistence when the filesystem file isn't obvious yet.
// Uses same getter; passing empty ids array returns full map.

import { getCounts } from '../../utils/likesStore'

export default defineEventHandler(async () => {
  const counts = await getCounts([])
  return { counts, totalKeys: Object.keys(counts).length }
})
