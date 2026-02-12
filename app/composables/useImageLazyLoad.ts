// composables/useImageLazyLoad.ts
// Composable for optimized image lazy loading with Intersection Observer
// Reduces LCP and improves performance by deferring offscreen images

import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useImageLazyLoad() {
  const observerRef = ref<IntersectionObserver | null>(null)
  const loadedImages = new Set<string>()

  const initObserver = (): void => {
    if (typeof window === 'undefined') return
    if (observerRef.value) return

    // Create intersection observer with optimized settings
    observerRef.value = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            const srcset = img.dataset.srcset

            if (src && !loadedImages.has(src)) {
              // Load the image
              img.src = src
              if (srcset) {
                img.srcset = srcset
              }
              loadedImages.add(src)

              // Stop observing once loaded
              observerRef.value?.unobserve(img)

              // Add loaded class for fade-in effect
              img.classList.add('lazy-loaded')
            }
          }
        }
      },
      {
        // Load images slightly before they enter viewport
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    )
  }

  const observeImage = (el: Element | null): void => {
    if (!el || !observerRef.value) return
    observerRef.value.observe(el)
  }

  const unobserveImage = (el: Element | null): void => {
    if (!el || !observerRef.value) return
    observerRef.value.unobserve(el)
  }

  const cleanup = (): void => {
    if (observerRef.value) {
      observerRef.value.disconnect()
      observerRef.value = null
    }
    loadedImages.clear()
  }

  onMounted(() => {
    initObserver()
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    observeImage,
    unobserveImage,
    cleanup,
  }
}
