<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="handleClose">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="z-10 relative flex flex-col bg-slate-800 shadow-modal rounded-none sm:rounded-lg w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
        >
          <!-- Image + Text container -->
          <div
            class="flex flex-col justify-center items-center p-0 sm:p-6 pb-2 h-full min-h-0"
          >
            <img
              v-if="modalData?.image"
              :src="modalData.image"
              alt=""
              class="w-full sm:w-auto max-w-full h-auto max-h-[60vh] object-contain"
              loading="lazy"
              decoding="async"
            />
            <div
              v-if="modalData?.bodyText"
              class="flex-1 mt-2 px-2 sm:px-0 w-full min-h-0 overflow-y-scroll font-[100] text-gray-300 text-base sm:text-lg text-center leading-normal scroll-area"
            >
              <div class="whitespace-pre-line">
                {{ modalData.bodyText }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #sharePanel>
        <!-- Share Buttons Shelf (separate slot) -->
        <UiShareButton
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
      if (import.meta.server || !data?.image) return
      const run = async () => {
        try {
          const { useShareImageGenerator } = await import(
            '~/composables/useShareImageGenerator'
          )
          const { generateMemeShareImage } = useShareImageGenerator()
          const blob = await generateMemeShareImage(
            data.image,
            shareTitle.value
          )
          if (props.modalData === data) {
            shareImageBlob.value = blob
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
          console.log('Meme modal data received:', data)
          console.log('Keys:', Object.keys(data))
        }
      },
      { immediate: true }
    )
  }

  // Native scrollbar styling handled via CSS
</script>

<style scoped>
  .scroll-area {
    scrollbar-gutter: stable;
    scrollbar-width: auto; /* Firefox - always visible */
    scrollbar-color: #0089cc rgba(255, 255, 255, 0.15); /* thumb, track */
    /* Add padding to show full scrollbar track */
    padding-right: 2px;
  }
  .scroll-area::-webkit-scrollbar {
    width: 12px; /* Wider, more visible scrollbar */
  }
  .scroll-area::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    /* Inset the track slightly to show rounded ends */
    margin: 4px 0;
  }
  .scroll-area::-webkit-scrollbar-thumb {
    background: #0089cc; /* seagull-600 */
    border-radius: 999px;
  }
  .scroll-area::-webkit-scrollbar-thumb:hover {
    background: #09acee; /* seagull-500 */
  }
  .scroll-area::-webkit-scrollbar-corner {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
