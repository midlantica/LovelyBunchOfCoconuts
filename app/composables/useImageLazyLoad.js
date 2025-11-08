/**
 * Composable for optimized image lazy loading with Intersection Observer
 * Reduces LCP and improves performance by deferring offscreen images
 */
export function useImageLazyLoad() {
  const observerRef = ref(null)
  const loadedImages = new Set()

  const initObserver = () => {
    if (typeof window === 'undefined') return
    if (observerRef.value) return

    // Create intersection observer with optimized settings
    observerRef.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
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
              observerRef.value.unobserve(img)

              // Add loaded class for fade-in effect
              img.classList.add('lazy-loaded')
            }
          }
        })
      },
      {
        // Load images slightly before they enter viewport
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    )
  }

  const observeImage = (el) => {
    if (!el || !observerRef.value) return
    observerRef.value.observe(el)
  }

  const unobserveImage = (el) => {
    if (!el || !observerRef.value) return
    observerRef.value.unobserve(el)
  }

  const cleanup = () => {
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
