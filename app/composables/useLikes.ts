// Client-side like tracking with localStorage persistence.
// Provides per-item liked state and a local count placeholder.
// Swap the storage backend later for a server API to get global counts.

import { onMounted, getCurrentInstance, nextTick } from 'vue'
import { useState } from 'nuxt/app'

export type LikeId = string

export function useLikes() {
  const likedMap = useState<Record<string, boolean>>(
    'likes.likedMap',
    () => ({})
  )
  const countMap = useState<Record<string, number>>(
    'likes.countMap',
    () => ({})
  )

  const storageKeyLiked = 'wakeupnpc.likes.v1'
  const storageKeyCounts = 'wakeupnpc.likeCounts.v1'

  const loadFromStorage = () => {
    if (import.meta.server) return
    try {
      const l = localStorage.getItem(storageKeyLiked)
      const c = localStorage.getItem(storageKeyCounts)
      if (l) Object.assign(likedMap.value, JSON.parse(l))
      if (c) Object.assign(countMap.value, JSON.parse(c))
      preMigrateAll()
    } catch (e) {
      console.warn('Like storage load failed', e)
    }
  }

  const persistToStorage = () => {
    if (import.meta.server) return
    try {
      localStorage.setItem(storageKeyLiked, JSON.stringify(likedMap.value))
      localStorage.setItem(storageKeyCounts, JSON.stringify(countMap.value))
    } catch (e) {
      console.warn('Like storage save failed', e)
    }
  }

  if (import.meta.client) {
    // Register within component context if available; otherwise fallback to microtask
    const instance = getCurrentInstance()
    if (instance) {
      onMounted(loadFromStorage)
    } else {
      queueMicrotask(() => {
        try {
          loadFromStorage()
        } catch {}
      })
    }
  }

  const isLiked = (id: LikeId | undefined | null) => {
    const cid = canonicalizeId(id)
    if (!cid) return false
    // If legacy (full URL) key exists but canonical not yet migrated, migrate lazily
    if (!likedMap.value[cid] && id && id !== cid && likedMap.value[id]) {
      likedMap.value[cid] = likedMap.value[id]
      if (countMap.value[id] && !countMap.value[cid]) {
        countMap.value[cid] = countMap.value[id]
      }
      delete likedMap.value[id]
      delete countMap.value[id]
      persistToStorage()
    }
    return !!likedMap.value[cid]
  }

  const getCount = (id: LikeId | undefined | null) => {
    const cid = canonicalizeId(id)
    if (!cid) return 0
    // Lazy migrate if needed
    if (!countMap.value[cid] && id && id !== cid && countMap.value[id]) {
      countMap.value[cid] = countMap.value[id]
      if (likedMap.value[id] && !likedMap.value[cid]) {
        likedMap.value[cid] = likedMap.value[id]
      }
      delete likedMap.value[id]
      delete countMap.value[id]
      persistToStorage()
    }
    return Math.max(0, Number(countMap.value[cid] || 0))
  }

  const setCount = (id: LikeId, count: number) => {
    const cid = canonicalizeId(id)
    if (!cid) return
    countMap.value[cid] = Math.max(0, Math.floor(count))
    persistToStorage()
  }

  const toggleLike = (id: LikeId | undefined | null) => {
    const cid = canonicalizeId(id)
    if (!cid) return false
    const next = !isLiked(cid)
    likedMap.value[cid] = next
    // Local-only count adjustment; replace with server call later
    const current = getCount(cid)
    countMap.value[cid] = Math.max(0, current + (next ? 1 : -1))
    persistToStorage()
    // Fire-and-forget server sync
    if (import.meta.client) {
      const delta = next ? 1 : -1
      // Use catch-all route that supports slashes
      fetch(`/api/likes/${encodeURIComponent(cid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      }).catch((e) => {
        if (import.meta.dev)
          console.warn('[likes] server sync failed', cid, e?.message || e)
      })
    }
    return next
  }

  const _hydrating = new Set<string>()
  async function hydrateServer(ids: string[]) {
    if (!ids || ids.length === 0) return
    if (import.meta.server) return
    // Filter out ids already hydrating
    const pending = ids
      .map((i) => canonicalizeId(i))
      .filter((i) => i && !_hydrating.has(i))
    if (!pending.length) return
    pending.forEach((i) => _hydrating.add(i))
    try {
      // Reduce mega requests: cap batch size
      const batch = pending.slice(0, 100)
      const qs = batch.map((i) => encodeURIComponent(i)).join(',')
      let res = await fetch(`/api/likes?ids=${qs}`)
      if (!res.ok) {
        // Fallback to debug route that returns all counts; append ?dev=1 in prod
        const isProd =
          typeof window !== 'undefined' &&
          location.hostname.endsWith('wakeupnpc.com')
        const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
        res = await fetch(url).catch(() => null as any)
        if (!res || !res.ok) return
      }
      const data = await res.json()
      let counts = data?.counts || {}
      // If the batch endpoint returns no counts (mismatch or cold store), try debug map
      if (Object.keys(counts).length === 0) {
        try {
          const isProd =
            typeof window !== 'undefined' &&
            location.hostname.endsWith('wakeupnpc.com')
          const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
          const res2 = await fetch(url)
          if (res2.ok) {
            const data2 = await res2.json()
            const all = data2?.counts || {}
            // Filter to only requested ids
            const set = new Set(batch.map((i) => canonicalizeId(i)))
            counts = Object.fromEntries(
              Object.entries(all).filter(([k]) => set.has(canonicalizeId(k)))
            )
          }
        } catch {}
      }
      let changed = false
      for (const [k, v] of Object.entries(counts)) {
        const cid = canonicalizeId(k)
        if (!cid) continue
        if (typeof v === 'number' && v >= 0 && countMap.value[cid] !== v) {
          countMap.value[cid] = v
          changed = true
        }
      }
      if (changed) persistToStorage()
      // Dev: minimal log once per call (comment out to silence completely)
      // if (import.meta.dev) console.info('[likes] hydrated batch', Object.keys(counts).length)
    } catch (e) {
      if (import.meta.dev) console.warn('[likes] hydrate failed', e)
    } finally {
      pending.forEach((i) => _hydrating.delete(i))
    }
  }

  function canonicalizeId(id: LikeId | undefined | null): string {
    if (!id) return ''
    let raw = String(id).trim()
    // Strip protocol + domain if present
    if (/^https?:\/\//i.test(raw)) {
      try {
        const u = new URL(raw)
        raw = u.pathname || ''
      } catch {
        // ignore parse errors
      }
    }
    // Remove trailing slashes (except root)
    raw = raw.replace(/\/$/, '')
    // Collapse accidental double content-type segments (e.g. /claims/claims/foo)
    raw = raw.replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/')
    // Convert underscores to hyphens to match actual _path values
    raw = raw.replace(/_/g, '-')
    // Collapse duplicate slashes
    raw = raw.replace(/\/+/g, '/')
    // Normalize singular route variants to plural content folder form
    raw = raw
      .replace(/^\/claim\//, '/claims/')
      .replace(/^\/meme\//, '/memes/')
      .replace(/^\/quote\//, '/quotes/')
    // Ensure leading slash for consistency with server keys
    if (raw && !raw.startsWith('/')) raw = '/' + raw
    return raw
  }

  function migrateKey(oldKey: string, newKey: string) {
    if (!oldKey || !newKey || oldKey === newKey) return
    let migrated = false
    if (
      likedMap.value[oldKey] !== undefined &&
      likedMap.value[newKey] === undefined
    ) {
      likedMap.value[newKey] = likedMap.value[oldKey]
      migrated = true
    }
    if (
      countMap.value[oldKey] !== undefined &&
      countMap.value[newKey] === undefined
    ) {
      countMap.value[newKey] = countMap.value[oldKey]
      migrated = true
    }
    if (migrated) {
      delete likedMap.value[oldKey]
      delete countMap.value[oldKey]
      console.info('[likes] migrated key', { from: oldKey, to: newKey })
    }
    return migrated
  }

  function preMigrateAll() {
    const keys = Object.keys({ ...likedMap.value, ...countMap.value })
    let changed = false
    for (const k of keys) {
      const canon = canonicalizeId(k)
      if (canon && canon !== k) {
        if (migrateKey(k, canon)) changed = true
      }
    }
    if (changed) {
      persistToStorage()
      console.info('[likes] pre-migration complete')
    }
  }

  return {
    isLiked,
    getCount,
    setCount,
    toggleLike,
    // expose for potential debugging
    _likedMap: likedMap,
    _countMap: countMap,
    _preMigrateAll: preMigrateAll,
    _canonicalizeId: canonicalizeId,
    hydrateServer,
  }
}
