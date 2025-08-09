// composables/useInfiniteScroll.js
// Infinite scroll implementation: detects when user approaches bottom and triggers content loading
// Configurable threshold distance with loading state management and cleanup

import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(loadMoreCallback, options = {}) {
  const {
    threshold = 300, // Distance from the bottom to trigger load
    isLoading = ref(false),
    hasMore = ref(true),
  } = options

  let ticking = false

  const checkPosition = async () => {
    ticking = false
    if (isLoading.value || !hasMore.value) return
    const scrollContainer =
      document.querySelector('.scroll-container-stable') ||
      document.querySelector('.overflow-y-auto') ||
      document.documentElement
    const scrollTop = scrollContainer.scrollTop
    const scrollHeight = scrollContainer.scrollHeight
    const clientHeight = scrollContainer.clientHeight
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      isLoading.value = true
      try {
        await loadMoreCallback()
      } catch (error) {
        console.error('❌ loadMoreCallback failed:', error)
      } finally {
        isLoading.value = false
      }
    }
  }

  const scrollHandler = () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(checkPosition)
    }
  }

  let activeTarget = null

  onMounted(() => {
    activeTarget =
      document.querySelector('.scroll-container-stable') ||
      document.querySelector('.overflow-y-auto') ||
      window
    activeTarget.addEventListener('scroll', scrollHandler, { passive: true })
  })

  onUnmounted(() => {
    if (activeTarget) {
      activeTarget.removeEventListener('scroll', scrollHandler)
    }
  })

  return {
    isLoading,
    hasMore,
  }
}
