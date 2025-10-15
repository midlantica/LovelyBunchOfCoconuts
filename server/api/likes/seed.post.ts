// POST /api/likes/seed  (dev utility) - randomly seeds several like ids with counts 5-10
// Optional JSON body: { ids: string[], min?: number, max?: number, limit?: number, force?: boolean }
// If ids omitted, this endpoint attempts to derive some content paths from the public json lists if present.

import { setCount, getCounts } from '#imports'
import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production' && !getQuery(event).dev) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Disabled in production',
    })
  }
  const body = (await readBody(event).catch(() => ({}))) as any
  let { ids, min = 5, max = 10, limit = 8, force = false } = body || {}
  if (!Array.isArray(ids) || ids.length === 0) {
    // Try to load from public JSON lists if they exist
    const base = join(process.cwd(), 'public')
    async function readList(name: string) {
      try {
        const p = join(base, name)
        const raw = await fsp.readFile(p, 'utf8')
        return JSON.parse(raw)
      } catch {
        return []
      }
    }
    const [claims, quotes, memes] = await Promise.all([
      readList('content-claims.json'),
      readList('content-quotes.json'),
      readList('content-memes.json'),
    ])
    ids = [
      ...claims.slice(0, 50).map((c: any) => c._path || c.path),
      ...quotes.slice(0, 50).map((c: any) => c._path || c.path),
      ...memes.slice(0, 50).map((c: any) => c._path || c.path),
    ].filter(Boolean)
  }
  ids = Array.from(new Set(ids)).filter(Boolean)
  if (ids.length === 0) return { seeded: [], message: 'No ids available' }

  // Shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }

  const pick = ids.slice(0, Math.min(limit, ids.length))
  if (min > max) [min, max] = [max, min]

  const existing = await getCounts(pick)
  const seeded: { id: string; value: number; existed: boolean }[] = []
  for (let id of pick) {
    // Normalize like client canonicalization (keep plural form)
    id = id
      .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
      .replace(/_/g, '-')
      .replace(/\/$/, '')
      .replace(/^\/claim\//, '/grifts/')
      .replace(/^\/meme\//, '/memes/')
      .replace(/^\/quote\//, '/quotes/')
    const existed = existing[id] !== undefined && existing[id] > 0
    if (existed && !force) {
      seeded.push({ id, value: existing[id], existed: true })
      continue
    }
    const value = Math.floor(Math.random() * (max - min + 1)) + min
    await setCount(id, value)
    seeded.push({ id, value, existed: !!existed })
  }

  return { seeded, range: { min, max }, limit: pick.length }
})
