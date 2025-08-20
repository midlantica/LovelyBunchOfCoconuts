<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="handleClose">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="relative flex flex-col bg-slate-800 shadow-modal rounded-none sm:rounded-lg w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
        >
          <!-- Image (fixed region above scrollable text) -->
          <div class="px-0 sm:px-6 pt-0 sm:pt-6 pb-2">
            <img
              v-if="modalData?.image"
              ref="memeImg"
              :src="modalData.image"
              :alt="modalData.title || 'Meme image'"
              class="block w-full h-auto object-contain"
              :style="{ maxHeight: imageMaxHeightPx + 'px' }"
              loading="lazy"
              decoding="async"
              @load="onImageLoad"
            />
          </div>
          <!-- Scrollable text only -->
          <div
            v-if="modalData?.bodyText"
            ref="scrollArea"
            class="flex-1 -mt-1 px-4 sm:px-6 pb-3 max-h-[30vh] sm:max-h-[36vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
          >
            <div
              ref="textContent"
              class="text-shadow-xs w-full font-[100] text-gray-300 text-base sm:text-lg text-center leading-normal whitespace-pre-line"
            >
              {{ modalData.bodyText }}
            </div>
          </div>
          <!-- Share shelf overlaps slightly under content to catch shadow -->
          <div ref="shareShelfRef" class="-z-10 relative mt-0">
            <UiShareButton
              v-if="modalData"
              :title="shareTitle"
              :text="shareText"
              :url="shareUrl"
              :generated-image-blob="shareImageBlob"
              :show="showShareShelf"
              content-type="meme"
            />
          </div>
        </div>
      </template>
    </ModalsModalFrame>
  </client-only>
</template>

<script setup>
  // Vue composables are auto-imported in Nuxt 3

  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    modalData: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['close'])
  const { generateContentUrl } = useContentUrls()

  // Reactive state
  const shareImageBlob = ref(null)
  const { showShareShelf, onToggle } = useShareShelf(500)

  // Computed properties for share functionality
  const shareTitle = computed(
    () => props.modalData?.title || props.modalData?.description || 'Meme'
  )

  const shareText = computed(() => `Check out this meme: ${shareTitle.value}`)

  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'meme')
  })

  /* ---------------- Adaptive Image Sizing Logic ---------------- */
  const memeImg = ref(null)
  const scrollArea = ref(null)
  const textContent = ref(null)
  const shareShelfRef = ref(null)

  const imageMaxHeightPx = ref(0)
  const aspectCategory = ref('square')
  const textVisibleMaxPx = ref(0)
  const shareShelfHeight = ref(0)

  // Track viewport width reactively to avoid direct window refs in SSR
  const viewportWidth = ref(import.meta.client ? window.innerWidth : 1024)
  const mobile = computed(() => viewportWidth.value < 640)

  // Lightweight debounce utility (avoids extra dependency)
  function debounce(fn, wait = 120) {
    let t
    return (...args) => {
      clearTimeout(t)
      t = setTimeout(() => fn(...args), wait)
    }
  }

  // Aspect ratio categorization (reintroduced after refactor)
  function categorizeAspect(w, h) {
    if (!w || !h) return 'square'
    const r = w / h
    if (r < 0.9) return 'portrait'
    if (r > 1.6) return 'wide'
    return 'square'
  }

  function computeHeights() {
    if (!import.meta.client) return
    const vh = window.innerHeight
    if (!vh) return
    const hasText = !!props.modalData?.bodyText
    const img = memeImg.value
    const shareHeight = 72 // approximate shelf+padding reserve
    shareShelfHeight.value = shareHeight
    // Since shelf is inside panel we just reserve space from total 90vh cap
    const usable = vh * 0.9 - shareHeight
    const gapPx = hasText ? 8 : 0
    // Text scrolls independently now; reserve only minimal preview (~1 line) so image can maximize
    const lineHeight = 20
    const previewLines = hasText ? 1 : 0
    const visibleText = previewLines * lineHeight
    textVisibleMaxPx.value = visibleText

    let baseVh
    if (img && img.naturalWidth && img.naturalHeight) {
      const r = img.naturalWidth / img.naturalHeight
      if (r < 0.9) baseVh = 78
      else if (r > 1.6) baseVh = 66
      else baseVh = 72
    } else baseVh = 70
    if (mobile.value) baseVh += 4

    let target = (baseVh / 100) * vh
    target = Math.min(target, usable - visibleText - gapPx - 32)
    if (!hasText) target = Math.min(target + 0.05 * vh, usable - 40)
    if (img && img.naturalWidth / img.naturalHeight > 1.8)
      target = Math.min(target + 0.02 * vh, usable - visibleText - 32)
    if (target > usable * 0.94) target = usable * 0.94
    if (target < 140) target = Math.min(usable * 0.85, 140)
    imageMaxHeightPx.value = Math.round(target)
  }

  function onImageLoad(e) {
    const img = e.target
    aspectCategory.value = categorizeAspect(img.naturalWidth, img.naturalHeight)
    computeHeights()
  }

  const recomputeDebounced = debounce(() => {
    if (!import.meta.client) return
    viewportWidth.value = window.innerWidth
    if (memeImg.value && memeImg.value.complete) {
      aspectCategory.value = categorizeAspect(
        memeImg.value.naturalWidth,
        memeImg.value.naturalHeight
      )
    }
    computeHeights()
  }, 120)

  onMounted(() => {
    if (!import.meta.client) return
    window.addEventListener('resize', recomputeDebounced)
    nextTick(() => {
      if (memeImg.value && memeImg.value.complete) {
        aspectCategory.value = categorizeAspect(
          memeImg.value.naturalWidth,
          memeImg.value.naturalHeight
        )
        computeHeights()
      }
    })
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return
    window.removeEventListener('resize', recomputeDebounced)
  })

  // Event handlers
  const handleClose = () => {
    emit('close')
  }

  // Watchers
  // Handle share shelf animation timing
  watch(
    () => props.show,
    (isVisible) => {
      onToggle(!!isVisible)
      if (isVisible) {
        nextTick(() => {
          // Share shelf fixed height; measurement no longer critical
          recomputeDebounced()
          computeHeights()
        })
      }
    },
    { immediate: true }
  )

  // Generate share image when modal data changes
  watch(
    () => props.modalData,
    async (data) => {
      // Only generate images on client-side
      if (import.meta.server || !data?.image) return

      try {
        const { useShareImageGenerator } = await import(
          '~/composables/useShareImageGenerator'
        )
        const { generateMemeShareImage } = useShareImageGenerator()
        shareImageBlob.value = await generateMemeShareImage(
          data.image,
          shareTitle.value
        )
      } catch (error) {
        console.warn('Failed to generate share image:', error)
      }
    },
    { immediate: true }
  )

  // Debug logging (consider removing in production)
  if (process.env.NODE_ENV === 'development') {
    watch(
      () => props.modalData,
      (data) => {
        if (data && import.meta.dev) {
          console.log('Meme modal data received:', data)
          console.log('Available properties:', Object.keys(data))
        }
      },
      { immediate: true }
    )
  }
</script>

<style scoped>
  .modal-meme-scroll {
    scrollbar-width: thin;
    scrollbar-color: #475569 #1e293b;
  }
  /* Webkit (Chrome/Safari/Edge) */
  .modal-meme-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .modal-meme-scroll::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 6px;
  }
  .modal-meme-scroll::-webkit-scrollbar-track {
    background: #1e293b;
    border-radius: 6px;
  }
</style>
