import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(loadMoreCallback, options = {}) {
  const {
    threshold = 300, // Distance from the bottom to trigger load
    isLoading = ref(false),
    hasMore = ref(true),
  } = options

  const scrollHandler = async () => {
    if (isLoading.value || !hasMore.value) {
      return
    }

    // Find the scrollable container (the one with overflow-y-auto)
    const scrollContainer =
      document.querySelector('.overflow-y-auto') || document.documentElement
    const scrollTop = scrollContainer.scrollTop
    const scrollHeight = scrollContainer.scrollHeight
    const clientHeight = scrollContainer.clientHeight
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom <= threshold) {
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

  onMounted(() => {
    // Listen to scroll events on the scrollable container
    const scrollContainer = document.querySelector('.overflow-y-auto')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', scrollHandler)
    } else {
      window.addEventListener('scroll', scrollHandler)
    }
  })

  onUnmounted(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto')
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', scrollHandler)
    } else {
      window.removeEventListener('scroll', scrollHandler)
    }
  })

  return {
    isLoading,
    hasMore,
  }
}
