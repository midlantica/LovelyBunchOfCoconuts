<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="handleClose">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="card shadow-modal relative z-10 flex h-full max-h-[calc(100vh-8rem)] w-full max-w-full flex-col rounded-none sm:max-w-[min(1000px,calc(100vw-4rem))] sm:rounded-lg"
        >
          <!-- Image + Text container -->
          <div
            class="flex h-full min-h-0 flex-col items-center justify-center p-0 pb-2 sm:p-6"
          >
            <img
              v-if="modalData?.image"
              :src="modalData.image"
              alt=""
              class="h-auto max-h-[60vh] w-full max-w-full object-contain sm:w-auto"
              loading="lazy"
              decoding="async"
            />
            <div
              v-if="modalData?.bodyText && modalData.bodyText.trim() !== ''"
              class="font-100 modal-scroll-area mt-2 min-h-0 w-full flex-1 overflow-y-auto px-2 text-center text-base leading-normal text-gray-300 sm:px-0 sm:text-lg"
            >
              <div class="whitespace-pre-line">
                {{ modalData.bodyText }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #sharePanel>
        <!-- Content Action Bar (separate slot) -->
        <UiContentActionBar
          v-if="modalData"
          :title="shareTitle"
          :text="shareText"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
          :show="showShareShelf"
          content-type="meme"
          :like-id="modalData?._path || modalData?.path || ''"
        />
      </template>
    </ModalsModalFrame>
  </client-only>
</template>

<script setup>
  const props = defineProps({
    show: { type: Boolean, default: false },
    modalData: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])
  const { generateContentUrl } = useContentUrls()

  // Reactive state
  const shareImageBlob = ref(null)
  const shareImageCache = useState('memeShareImageCache', () => new Map())
  const { showShareShelf, onToggle } = useShareShelf(500)
  // Custom ScrollArea handles scrollbar visuals, no overlay detection needed here

  // Computed share props
  const shareTitle = computed(
    () => props.modalData?.title || props.modalData?.description || 'Meme'
  )
  const shareText = computed(() => `Check out this meme: ${shareTitle.value}`)
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'meme')
  })

  // Close
  const handleClose = () => emit('close')

  // Watch show to toggle shelf animation
  watch(
    () => props.show,
    (visible) => onToggle(!!visible),
    { immediate: true }
  )

  // Generate share image when meme changes
  watch(
    () => props.modalData,
    async (data) => {
      if (import.meta.server) return
      if (!data?.image) {
        shareImageBlob.value = null
        return
      }

      const cacheKey =
        data?._path || data?.path || `${data.image}|${shareTitle.value}`
      const cached = shareImageCache.value.get(cacheKey)
      if (cached) {
        shareImageBlob.value = cached
        return
      }

      shareImageBlob.value = null
      const run = async () => {
        try {
          const { useShareImageGenerator } =
            await import('~/composables/useShareImageGenerator')
          const { generateMemeShareImage } = useShareImageGenerator()
          const blob = await generateMemeShareImage(
            data.image,
            shareTitle.value
          )
          if (props.modalData === data) {
            shareImageBlob.value = blob
            shareImageCache.value.set(cacheKey, blob)
          }
        } catch (error) {
          if (import.meta.dev)
            console.warn('Failed to generate share image:', error)
        }
      }
      const idle = (cb) =>
        window.requestIdleCallback
          ? window.requestIdleCallback(cb, { timeout: 2500 })
          : setTimeout(cb, 200)
      idle(run)
    },
    { immediate: true }
  )

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    watch(
      () => props.modalData,
      (data) => {
        if (data && import.meta.dev) {
        }
      },
      { immediate: true }
    )
  }

  // Native scrollbar styling handled via CSS
</script>
