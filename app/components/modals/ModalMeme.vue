<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="handleClose">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="z-10 relative flex flex-col bg-slate-800 shadow-modal rounded-none sm:rounded-lg w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
        >
          <!-- Image container (fixed, no scroll) -->
          <div
            class="flex flex-col justify-center items-center p-0 sm:p-6 pb-2 h-full min-h-0"
          >
            <img
              v-if="modalData?.image"
              :src="modalData.image"
              :alt="modalData.title || 'Meme image'"
              class="w-full sm:w-auto max-w-full h-auto max-h-[calc(50vh)] object-contain"
              loading="lazy"
              decoding="async"
            />

            <!-- Text container (scrollable only) -->
            <div
              v-if="modalData?.bodyText"
              class="flex-1 mt-2 px-4 sm:px-0 w-full min-h-0 overflow-y-auto text-gray-300 text-base sm:text-lg text-center leading-normal"
            >
              <div class="whitespace-pre-line">
                {{ modalData.bodyText }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #sharePanel>
        <!-- Share Buttons Shelf -->
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

  // Event handlers
  const handleClose = () => {
    emit('close')
  }

  // Watchers
  // Handle share shelf animation timing
  watch(
    () => props.show,
    (isVisible) => onToggle(!!isVisible),
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
