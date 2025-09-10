import { getCounts } from '../../utils/likesStore'
import { getQueryContent } from '../../utils/queryContentRuntime'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// GET /api/likes/list?offset=0&limit=100&search=foo
// Returns { total, items:[{ id, count }] } including zero-like content entries.
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production' && getQuery(event).dev !== '1') {
    return { total: 0, items: [] }
  }
  try {
    const q = getQuery(event)
    const searchRaw = String(q.search || '')
      .trim()
      .toLowerCase()
    const limit = Math.min(500, Math.max(1, Number(q.limit) || 100))
    const offsetNum = Math.max(0, Number(q.offset) || 0)

    const counts = await getCounts([])

    const normalize = (raw: string): string => {
      if (!raw) return ''
      let x = raw
      try {
        x = decodeURIComponent(x)
      } catch {}
      x = x.replace(/%2F/gi, '/')
      if (!x.startsWith('/')) x = '/' + x
      x = x
        .replace(/\/$/, '')
        .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
        .replace(/_/g, '-')
        .replace(/^\/claim\//, '/claims/')
        .replace(/^\/meme\//, '/memes/')
        .replace(/^\/quote\//, '/quotes/')
        .replace(/\/+/, '/')
      return x
    }

    // Collect all content paths
    let contentPaths: string[] = []
    try {
      const qc = await getQueryContent()
      if (qc) {
        const docs = await qc().only(['_path']).find()
        contentPaths = docs
          .map((d: any) => normalize(d._path))
          .filter(
            (p: string) =>
              p &&
              (p.startsWith('/claims/') ||
                p.startsWith('/memes/') ||
                p.startsWith('/quotes/'))
          )
      }
    } catch {}
    if (!contentPaths.length) {
      const pub = process.cwd() + '/public'
      const files = [
        'content-claims.json',
        'content-memes.json',
        'content-quotes.json',
      ]
      for (const f of files) {
        try {
          const data = JSON.parse(await fs.readFile(join(pub, f), 'utf8'))
          if (Array.isArray(data)) {
            for (const doc of data) {
              if (doc && typeof doc._path === 'string') {
                const n = normalize(doc._path)
                if (n) contentPaths.push(n)
              }
            }
          }
        } catch {}
      }
    }

    const idSet = new Set<string>()
    for (const p of contentPaths) idSet.add(normalize(p))
    for (const k of Object.keys(counts)) idSet.add(normalize(k))

    let entries: [string, number][] = []
    for (const id of idSet) {
      const c = counts[id] || 0
      entries.push([id, c])
    }

    if (searchRaw) {
      entries = entries.filter(([id]) => id.toLowerCase().includes(searchRaw))
    }

    entries.sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
    })

    const total = entries.length
    const slice = entries
      .slice(offsetNum, offsetNum + limit)
      .map(([id, count]) => ({ id, count }))
    return { total, items: slice }
  } catch (e: any) {
    return { total: 0, items: [], error: e?.message || 'failed' }
  }
})
