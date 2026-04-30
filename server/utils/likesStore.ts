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
const NAMESPACE = 'lboc_likes'
import { applyBanPurge } from './likesBanned'

interface LikeCounts {
  [id: string]: number
}

function normalizeId(id: string): string {
  if (!id) return ''
  let normalized = id

  // Decode URL encoding if present
  try {
    if (normalized.includes('%')) {
      normalized = decodeURIComponent(normalized)
    }
  } catch (e) {
    // If decoding fails, use original
  }

  // Apply standard normalization
  normalized = normalized
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/') // Collapse duplicated segments
    .replace(/_/g, '-') // Convert underscores to hyphens
    .replace(/\/+/g, '/') // Collapse multiple slashes

  // Ensure leading slash
  if (normalized && !normalized.startsWith('/')) {
    normalized = '/' + normalized
  }

  return normalized
}

async function readAll(storage: any): Promise<LikeCounts> {
  const raw = ((await storage.getItem(STORAGE_KEY)) as LikeCounts) || {}
  // One-time normalization / migration: normalize all keys including URL-encoded ones
  let changed = false
  const normalized: LikeCounts = {}

  for (const [key, value] of Object.entries(raw)) {
    const nk = normalizeId(key)
    if (nk) {
      // Merge counts if multiple keys normalize to the same canonical form
      normalized[nk] = Math.max(0, (normalized[nk] || 0) + (value || 0))
      if (nk !== key) {
        changed = true
      }
    }
  }

  if (applyBanPurge(normalized)) changed = true
  if (changed) await storage.setItem(STORAGE_KEY, normalized)
  return normalized
}

export async function getCounts(ids: string[]): Promise<LikeCounts> {
  const storage = useStorage(NAMESPACE)
  const all = await readAll(storage)
  if (!ids || ids.length === 0) return all
  const out: LikeCounts = {}
  for (const id of ids) {
    const normalizedId = normalizeId(id)
    out[normalizedId] = Math.max(0, all[normalizedId] || 0)
  }
  return out
}

export async function increment(id: string, delta = 1): Promise<number> {
  if (!id) return 0
  const normalizedId = normalizeId(id)
  if (!normalizedId) return 0

  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    const next = Math.max(0, (all[normalizedId] || 0) + delta)
    all[normalizedId] = next
    await storage.setItem(STORAGE_KEY, all)
    return next
  })
}

export async function setCount(id: string, value: number): Promise<number> {
  const normalizedId = normalizeId(id)
  if (!normalizedId) return 0

  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    const next = Math.max(0, Math.floor(value))
    all[normalizedId] = next
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
      const normalizedId = normalizeId(id)
      if (normalizedId && all[normalizedId] === undefined) {
        all[normalizedId] = 0
        changed = true
      }
    }
    if (changed) await storage.setItem(STORAGE_KEY, all)
    const out: LikeCounts = {}
    for (const id of ids) {
      const normalizedId = normalizeId(id)
      if (normalizedId) {
        out[normalizedId] = all[normalizedId]
      }
    }
    return out
  })
}

export async function mergeLikes(fromId: string, toId: string) {
  if (!fromId || !toId) return { from: 0, to: 0 }
  const normalizedFromId = normalizeId(fromId)
  const normalizedToId = normalizeId(toId)
  if (!normalizedFromId || !normalizedToId) return { from: 0, to: 0 }

  const storage = useStorage(NAMESPACE)
  return await withLock(async () => {
    const all = await readAll(storage)
    const from = Math.max(0, all[normalizedFromId] || 0)
    const to = Math.max(0, all[normalizedToId] || 0)
    const nextTo = from + to
    all[normalizedToId] = nextTo
    // zero out source to avoid double counting, but keep key present intentionally minimal
    all[normalizedFromId] = 0
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
      const normalizedId = normalizeId(id)
      if (normalizedId && all[normalizedId] !== undefined) {
        delete all[normalizedId]
        removed++
      }
    }
    if (removed) await storage.setItem(STORAGE_KEY, all)
    return { removed }
  })
}
