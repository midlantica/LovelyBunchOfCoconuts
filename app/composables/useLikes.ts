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

  const storageKeyLiked = 'lboc.likes.v1'
  const storageKeyCounts = 'lboc.likeCounts.v1'

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
        } catch (e) {
          if (import.meta.dev)
            console.warn('[likes] Failed to load from storage in microtask:', e)
        }
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

  // Small in-memory event for admin-forced updates (no external bus needed)
  if (import.meta.client) {
    ;(window as any).__lbocSetLike = (id: string, value: number) => {
      setCount(id, value)
    }
  }

  // Integrity sync: by default, do a lightweight reconciliation of currently present buttons only.
  // Set NUXT_PUBLIC_LIKES_INTEGRITY=full to run a full map sync (dev/admin only recommended).
  async function integritySync() {
    if (import.meta.server) return
    const mode = import.meta.env?.NUXT_PUBLIC_LIKES_INTEGRITY || 'light'
    if (mode !== 'full') {
      try {
        // Collect current like ids in DOM and hydrate only those
        const els = document.querySelectorAll?.(
          '[data-like-button][data-like-id]'
        )
        const ids: string[] = []
        els?.forEach?.((el: any) => {
          const id = el.getAttribute?.('data-like-id') || ''
          if (id) ids.push(id)
        })
        if (ids.length) await hydrateServer(ids)
      } catch (e) {
        if (
          import.meta.dev &&
          import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
        ) {
          console.warn('[likes] light integrity sync failed', e)
        }
      }
      return
    }
    // Full sync path (heavy): fetch entire server map and reconcile
    try {
      const isProd =
        typeof window !== 'undefined' &&
        (location.hostname.endsWith('lovelybunchofcoconuts.com') ||
          location.hostname.includes('netlify.app'))
      const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
      const res = await fetch(url).catch(() => null as any)
      if (!res || !res.ok) return
      const data = await res.json().catch(() => ({}))
      const serverCounts: Record<string, number> = data?.counts || {}
      const serverMap: Record<string, number> = {}
      for (const [k, v] of Object.entries(serverCounts)) {
        const cid = canonicalizeId(k)
        if (!cid) continue
        serverMap[cid] = typeof v === 'number' && v >= 0 ? v : 0
      }
      let changed = false
      for (const k of Object.keys(countMap.value)) {
        if (serverMap[k] === undefined) {
          delete countMap.value[k]
          changed = true
        }
      }
      for (const [k, v] of Object.entries(serverMap)) {
        if (countMap.value[k] !== v) {
          countMap.value[k] = v
          changed = true
        }
      }
      if (changed) persistToStorage()
    } catch (e) {
      if (
        import.meta.dev &&
        import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
      ) {
        console.warn('[likes] integrity sync failed', e)
      }
    }
  }

  // Toggle like - users can only like once per item
  const _inFlight = new Set<string>()
  const toggleLike = (id: LikeId | undefined | null) => {
    const cid = canonicalizeId(id)
    if (!cid) return false
    if (_inFlight.has(cid)) return likedMap.value[cid]

    // Check if already liked - if so, don't allow another like
    if (likedMap.value[cid]) {
      // User has already liked this item
      return false
    }

    // Mark as liked and increment count by 1
    likedMap.value[cid] = true
    const current = getCount(cid)
    countMap.value[cid] = Math.max(0, current + 1)
    persistToStorage()

    if (import.meta.client) {
      _inFlight.add(cid)
      fetch(`/api/likes/${encodeURIComponent(cid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: 1 }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json().catch(() => ({}))
            if (typeof data.count === 'number') {
              // Update with server's authoritative count
              countMap.value[cid] = data.count
              persistToStorage()
            }
          } else if (res.status === 429) {
            // Rate limit exceeded - revert optimistic update
            likedMap.value[cid] = false
            countMap.value[cid] = Math.max(0, current)
            persistToStorage()

            // Log rate limit in dev mode
            if (import.meta.dev) {
              console.warn('[likes] Rate limit exceeded for', cid)
            }

            // Show user-friendly message (could be enhanced with a toast notification)
            if (typeof window !== 'undefined' && !import.meta.dev) {
              console.info('Please wait before liking more items')
            }
          } else {
            // Other error - keep optimistic update but log
            if (import.meta.dev) {
              console.warn(
                '[likes] Server returned error',
                res.status,
                'for',
                cid
              )
            }
          }
        })
        .catch((e) => {
          if (import.meta.dev)
            console.warn('[likes] server sync failed', cid, e?.message || e)
        })
        .finally(() => _inFlight.delete(cid))
    }
    return true
  }

  const _hydrating = new Set<string>()
  const _retryCount = new Map<string, number>()
  const MAX_RETRIES = 2

  async function hydrateServer(ids: string[]) {
    if (!ids || ids.length === 0) return
    if (import.meta.server) return
    // Filter out ids already hydrating
    const pending = ids
      .map((i) => canonicalizeId(i))
      .filter((i) => i && !_hydrating.has(i))
    if (!pending.length) return
    pending.forEach((i) => _hydrating.add(i))
    // Keep a reference for potential retry on hard network failure
    let batch: string[] = []
    let shouldRetry = false
    try {
      // Reduce mega requests: cap batch size
      batch = pending.slice(0, 100)
      const qs = batch.map((i) => encodeURIComponent(i)).join(',')
      let res = await fetch(`/api/likes?ids=${qs}`).catch((e) => {
        if (import.meta.dev) console.warn('[likes] Batch fetch failed:', e)
        return null as any
      })
      if (!res || !res.ok) {
        // Fallback to debug route that returns all counts; append ?dev=1 in prod
        const isProd =
          typeof window !== 'undefined' &&
          (location.hostname.endsWith('lovelybunchofcoconuts.com') ||
            location.hostname.includes('netlify.app'))
        const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
        res = await fetch(url).catch((e) => {
          if (import.meta.dev)
            console.warn('[likes] Debug fetch fallback failed:', e)
          return null as any
        })
        if (!res || !res.ok) {
          // Hard network failure; allow a silent retry later
          shouldRetry = true
          return
        }
      }
      const data = (await res.json().catch((e: unknown) => {
        if (import.meta.dev)
          console.warn('[likes] Failed to parse response JSON:', e)
        return {}
      })) as any
      let counts = data?.counts || {}
      // If the batch endpoint returns no counts (mismatch or cold store), try debug map
      if (Object.keys(counts).length === 0) {
        try {
          const isProd =
            typeof window !== 'undefined' &&
            (location.hostname.endsWith('lovelybunchofcoconuts.com') ||
              location.hostname.includes('netlify.app'))
          const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
          const res2 = await fetch(url).catch((e) => {
            if (import.meta.dev)
              console.warn('[likes] Debug map fetch failed:', e)
            return null as any
          })
          if (res2 && res2.ok) {
            const data2 = await res2.json().catch((e: unknown) => {
              if (import.meta.dev)
                console.warn('[likes] Failed to parse debug map JSON:', e)
              return {}
            })
            const all = data2?.counts || {}
            // Filter to only requested ids
            const set = new Set(batch.map((i) => canonicalizeId(i)))
            counts = Object.fromEntries(
              Object.entries(all).filter(([k]) => set.has(canonicalizeId(k)))
            )
          }
        } catch (e) {
          if (import.meta.dev)
            console.warn('[likes] Debug map fallback failed:', e)
        }
      }
      let changed = false
      for (const [k, v] of Object.entries(counts)) {
        const cid = canonicalizeId(k)
        if (!cid) continue
        if (typeof v === 'number' && v >= 0) {
          // Always accept server value; if it matches local optimistic value changed stays false
          if (countMap.value[cid] !== v) {
            countMap.value[cid] = v
            changed = true
          }
        }
      }
      // Optional rename-automerge: if an id returns 0, check debug map for a very similar id
      if (
        !changed &&
        ids.length === 1 &&
        countMap.value[canonicalizeId(ids[0])] === 0
      ) {
        try {
          const isProd =
            typeof window !== 'undefined' &&
            (location.hostname.endsWith('lovelybunchofcoconuts.com') ||
              location.hostname.includes('netlify.app'))
          const url = `/api/likes/debug${isProd ? '?dev=1' : ''}`
          const res3 = await fetch(url).catch((e) => {
            if (import.meta.dev)
              console.warn('[likes] Rename-automerge fetch failed:', e)
            return null as any
          })
          if (res3 && res3.ok) {
            const data3 = await res3.json().catch((e: unknown) => {
              if (import.meta.dev)
                console.warn(
                  '[likes] Failed to parse rename-automerge JSON:',
                  e
                )
              return {}
            })
            const all: Record<string, number> = data3?.counts || {}
            const target = canonicalizeId(ids[0])
            // Find a close match by ignoring small slug edits (levenshtein-lite for dashes only)
            const slug = target.split('/').pop() || ''
            const candidates = Object.entries(all)
              .map(([k, v]) => ({ k: canonicalizeId(k), v }))
              .filter(
                ({ k, v }) =>
                  v > 0 && k.startsWith(target.replace(/\/[^/]+$/, '/'))
              )
            if (candidates.length === 1) {
              // Hydrate from candidate for now (server merge API available for later)
              const cand = candidates[0] as { k: string; v: number }
              const v = cand?.v
              if (typeof v === 'number') {
                countMap.value[target] = v
                changed = true
              }
            }
          }
        } catch (e) {
          if (import.meta.dev)
            console.warn('[likes] Rename-automerge failed:', e)
        }
      }
      if (changed) {
        persistToStorage()
      }
    } catch (e) {
      if (
        import.meta.dev &&
        import.meta.env?.NUXT_PUBLIC_LIKES_VERBOSE === '1'
      ) {
        console.warn('[likes] hydrate failed', e)
      }
    } finally {
      pending.forEach((i) => _hydrating.delete(i))
      if (shouldRetry && batch.length) {
        // Check retry count to prevent infinite retries
        const batchKey = batch.join(',')
        const retryCount = _retryCount.get(batchKey) || 0

        if (retryCount < MAX_RETRIES) {
          _retryCount.set(batchKey, retryCount + 1)
          const retryDelay = 1500 * Math.pow(2, retryCount) // Exponential backoff

          setTimeout(() => {
            // Re-run for the same batch
            hydrateServer(batch)
          }, retryDelay)
        } else {
          // Max retries reached, clear retry count and give up
          _retryCount.delete(batchKey)
          if (!import.meta.dev) {
            console.warn('[likes] Max retries reached, giving up on batch')
          }
        }
      } else {
        // Success or no retry needed, clear retry count
        const batchKey = batch.join(',')
        _retryCount.delete(batchKey)
      }
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
      } catch (e) {
        if (import.meta.dev)
          console.warn(
            '[likes] Failed to parse URL for canonicalization:',
            raw,
            e
          )
      }
    }
    // Remove trailing slashes (except root)
    raw = raw.replace(/\/$/, '')
    // Collapse accidental double content-type segments (e.g. /grifts/grifts/foo)
    raw = raw.replace(/\/(grifts|memes|quotes)\/(?:\1\/)+/g, '/$1/')
    // Convert underscores to hyphens to match actual _path values
    raw = raw.replace(/_/g, '-')
    // Collapse duplicate slashes
    raw = raw.replace(/\/+/g, '/')
    // Normalize singular route variants to plural content folder form
    raw = raw
      .replace(/^\/claim\//, '/grifts/')
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
    }
  }

  return {
    isLiked,
    getCount,
    setCount,
    toggleLike,
    integritySync,
    // expose for potential debugging
    _likedMap: likedMap,
    _countMap: countMap,
    _preMigrateAll: preMigrateAll,
    _canonicalizeId: canonicalizeId,
    hydrateServer,
  }
}
