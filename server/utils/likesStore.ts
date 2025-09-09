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
  return ((await storage.getItem(STORAGE_KEY)) as LikeCounts) || {}
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
