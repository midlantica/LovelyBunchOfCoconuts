import { getCounts } from '#imports'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const idsParam = (query.ids as string) || ''
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const counts = await getCounts(ids)
  return { counts }
})
