<!-- components/ModalMeme.vue (reverted to pre-scrollbar version) -->
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
              :alt="modalData.title || 'Meme image'"
              class="w-full sm:w-auto max-w-full h-auto max-h-[60vh] object-contain"
              loading="lazy"
              decoding="async"
            />
            <!-- Scrollable text (only this area scrolls) -->
            <div
              v-if="modalData?.bodyText"
              class="flex-1 text-shadow-xs mt-2 px-4 sm:px-0 w-full min-h-0 overflow-y-auto font-[100] text-gray-300 text-base sm:text-lg text-center leading-normal"
            >
              <div class="overflow-scroll whitespace-pre-line">
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
</script>

<!-- No extra styles needed in reverted version -->
