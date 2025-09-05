// Client-side like tracking with localStorage persistence.
// Provides per-item liked state and a local count placeholder.
// Swap the storage backend later for a server API to get global counts.

import { onMounted } from 'vue'
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
    onMounted(loadFromStorage)
  }

  const isLiked = (id: LikeId | undefined | null) => {
    if (!id) return false
    return !!likedMap.value[id]
  }

  const getCount = (id: LikeId | undefined | null) => {
    if (!id) return 0
    return Math.max(0, Number(countMap.value[id] || 0))
  }

  const setCount = (id: LikeId, count: number) => {
    countMap.value[id] = Math.max(0, Math.floor(count))
    persistToStorage()
  }

  const toggleLike = (id: LikeId | undefined | null) => {
    if (!id) return false
    const next = !isLiked(id)
    likedMap.value[id] = next
    // Local-only count adjustment; replace with server call later
    const current = getCount(id)
    countMap.value[id] = Math.max(0, current + (next ? 1 : -1))
    persistToStorage()
    return next
  }

  return {
    isLiked,
    getCount,
    setCount,
    toggleLike,
  }
}
