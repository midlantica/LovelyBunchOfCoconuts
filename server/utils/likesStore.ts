// Persistent like counts using Nitro storage.
// Storage driver defaults to filesystem (server/.data) in dev/prod single instance.
// Swap driver via NITRO storage config later if needed.

// Simple promise-based lock (avoids external dependency)
let __likesLock: Promise<any> = Promise.resolve()
function withLock(fn: () => Promise<any>) {
  const run = __likesLock.then(fn, fn)
  __likesLock = run.catch(() => {})
  return run
}
const STORAGE_KEY = 'counts'
// Use a unique mount key to avoid duplicate mounts during Nitro prerender/build
const NAMESPACE = 'wakeupnpc_likes'

interface LikeCounts {
  [id: string]: number
}

async function readAll(storage: any): Promise<LikeCounts> {
  const raw = ((await storage.getItem(STORAGE_KEY)) as LikeCounts) || {}
  // One-time normalization / migration: collapse duplicated segment keys
  // e.g. /claims/claims/foo -> /claims/foo (same for memes, quotes)
  let changed = false
  const normKey = (k: string) =>
    k
      .replace(/\/$/, '')
      .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
      .replace(/_/g, '-')
  for (const key of Object.keys(raw)) {
    const nk = normKey(key)
    if (nk !== key) {
      raw[nk] = Math.max(0, (raw[nk] || 0) + (raw[key] || 0))
      delete raw[key]
      changed = true
    }
  }
  // Hard purge of explicitly banned legacy keys (user request)
  // If we want to preserve their counts, merge into a preferred target first.
  const banned: Record<string, string | null> = {
    '/claims/rehabilitation-and-restorative-justice': '/claims/restorative-justice',
  }
  for (const from in banned) {
    if (raw[from] !== undefined) {
      const target = banned[from]
      if (target) {
        raw[target] = Math.max(0, (raw[target] || 0) + (raw[from] || 0))
      }
      delete raw[from]
      changed = true
    }
  }
  if (changed) await storage.setItem(STORAGE_KEY, raw)
  return raw
}

export async function getCounts(ids: string[]): Promise<LikeCounts> {
  const storage = useStorage(NAMESPACE)
  const all = await readAll(storage)
  if (!ids || ids.length === 0) return all
  const out: LikeCounts = {}
  for (const id of ids) out[id] = Math.max(0, all[id] || 0)
  return out
}

export async function increment(id: string, delta = 1): Promise<number> {
  if (!id) return 0
  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    const next = Math.max(0, (all[id] || 0) + delta)
    all[id] = next
    await storage.setItem(STORAGE_KEY, all)
    return next
  })
}

export async function setCount(id: string, value: number): Promise<number> {
  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    const next = Math.max(0, Math.floor(value))
    all[id] = next
    await storage.setItem(STORAGE_KEY, all)
    return next
  })
}

export async function bulkEnsure(ids: string[]): Promise<LikeCounts> {
  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    let changed = false
    for (const id of ids) {
      if (all[id] === undefined) {
        all[id] = 0
        changed = true
      }
    }
    if (changed) await storage.setItem(STORAGE_KEY, all)
    const out: LikeCounts = {}
    for (const id of ids) out[id] = all[id]
    return out
  })
}

export async function mergeLikes(fromId: string, toId: string) {
  if (!fromId || !toId) return { from: 0, to: 0 }
  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    const from = Math.max(0, all[fromId] || 0)
    const to = Math.max(0, all[toId] || 0)
    const nextTo = from + to
    all[toId] = nextTo
    // zero out source to avoid double counting, but keep key present intentionally minimal
    all[fromId] = 0
    await storage.setItem(STORAGE_KEY, all)
    return { from, to: nextTo }
  })
}

export async function removeKeys(ids: string[]) {
  if (!ids?.length) return { removed: 0 }
  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    let removed = 0
    for (const id of ids) {
      if (all[id] !== undefined) {
        delete all[id]
        removed++
      }
    }
    if (removed) await storage.setItem(STORAGE_KEY, all)
    return { removed }
  })
}
