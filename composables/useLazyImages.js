// composables/useLazyImages.js

export function useLazyImages() {
  const observer = ref(null)
  const lazyImages = ref(new Map())

  // Create intersection observer for lazy loading
  const createObserver = () => {
    if (typeof window === 'undefined') return

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.dataset.src

            if (src) {
              // Start loading the image
              const imageLoader = new Image()
              imageLoader.onload = () => {
                img.src = src
                img.classList.remove('lazy-loading')
                img.classList.add('lazy-loaded')
                observer.value?.unobserve(img)
              }
              imageLoader.onerror = () => {
                img.classList.remove('lazy-loading')
                img.classList.add('lazy-error')
                observer.value?.unobserve(img)
              }
              imageLoader.src = src
            }
          }
        })
      },
      {
        // Start loading when image is 200px away from viewport
        rootMargin: '200px',
        threshold: 0.01,
      }
    )
  }

  // Register an image for lazy loading
  const registerLazyImage = (element) => {
    if (!observer.value || !element) return

    element.classList.add('lazy-loading')
    observer.value.observe(element)
  }

  // Preload next batch of images (for search scenarios)
  const preloadImages = (imageSrcs, priority = 'low') => {
    imageSrcs.forEach((src) => {
      if (!lazyImages.value.has(src)) {
        const img = new Image()
        // Use fetch priority for modern browsers
        if ('loading' in img) {
          img.loading = 'lazy'
        }
        img.src = src
        lazyImages.value.set(src, img)
      }
    })
  }

  onMounted(() => {
    createObserver()
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    registerLazyImage,
    preloadImages,
  }
}

// CSS classes for styling lazy loading states
export const lazyImageStyles = `
  .lazy-loading {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
    animation: loading-shimmer 1.5s infinite;
  }

  .lazy-loaded {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }

  .lazy-error {
    background-color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lazy-error::after {
    content: "Image failed to load";
    color: #9ca3af;
    font-size: 0.875rem;
    text-align: center;
  }

  @keyframes loading-shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`
