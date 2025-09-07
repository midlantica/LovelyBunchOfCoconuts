// GET /api/likes/range?min=5&max=10
// Development helper: returns all like ids whose counts are within [min,max].
// Do NOT ship to production unless access restricted.
import { getCounts } from '#imports'

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production' && !getQuery(event).dev) {
    throw createError({ statusCode: 403, statusMessage: 'Disabled in production' })
  }
  const query = getQuery(event)
  const min = Number(query.min ?? 0)
  const max = Number(query.max ?? Number.MAX_SAFE_INTEGER)
  const all = await getCounts([]) // all counts
  const matches: { id: string; count: number }[] = []
  for (const [id, count] of Object.entries(all)) {
    if (count >= min && count <= max) matches.push({ id, count })
  }
  matches.sort((a, b) => a.id.localeCompare(b.id))
  return { range: { min, max }, total: matches.length, matches }
})
