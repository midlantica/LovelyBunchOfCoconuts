<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="z-10 relative bg-slate-800 shadow-[0_4px_20px_-10px_black] rounded-lg w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
        >
          <!-- Image container -->
          <div
            class="flex flex-col flex-1 justify-center items-center p-4 sm:p-6 min-h-0"
          >
            <img
              v-if="modalData?.image"
              :src="modalData?.image"
              :alt="modalData?.title"
              class="mb-2 w-full sm:w-auto max-w-full h-auto max-h-[calc(100vh-20rem)] object-contain"
            />
            <p
              class="px-4 sm:px-6 pb-0 font-bold text-white text-lg text-center"
            >
              {{ modalData?.title || modalData?.description }}
            </p>
          </div>
          <!-- Text line -->
        </div>
      </template>

      <template #sharePanel>
        <!-- Share Buttons Shelf -->
        <ShareButton
          v-if="modalData"
          :title="modalData?.title || modalData?.description"
          :text="`Check out this meme: ${modalData?.title || modalData?.description}`"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
          :show="showShareShelf"
          content-type="meme"
        />
      </template>
    </ModalFrame>
  </client-only>
</template>

<script setup>
  import { watch, computed, ref, nextTick } from 'vue'
  import ModalFrame from './ModalFrame.vue'
  import ShareButton from '../ui/ShareButton.vue'
  import { useContentUrls } from '~/composables/useContentUrls'

  const props = defineProps({
    show: { type: Boolean, default: false },
    modalData: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])
  const { generateContentUrl } = useContentUrls()

  const shareImageBlob = ref(null)
  const showShareShelf = ref(false)

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'meme')
  })

  // Handle share shelf animation timing
  watch(
    () => props.show,
    (isVisible) => {
      if (isVisible) {
        // Reset shelf state first
        showShareShelf.value = false
        // Wait 0.5 seconds before showing the share panel
        setTimeout(() => {
          showShareShelf.value = true
        }, 500)
      } else {
        showShareShelf.value = false
      }
    },
    { immediate: true }
  ) // Generate share image when modal data changes
  watch(
    () => props.modalData,
    async (data) => {
      // Only generate images on client-side
      if (import.meta.server) return

      if (data && data.image) {
        const { useShareImageGenerator } = await import(
          '~/composables/useShareImageGenerator'
        )
        const { generateMemeShareImage } = useShareImageGenerator()
        shareImageBlob.value = await generateMemeShareImage(
          data.image,
          data.title || data.description
        )
      }
    },
    { immediate: true }
  ) // Debug the modal data
  watch(
    () => props.modalData,
    (data) => {
      if (data) {
        console.log('Meme modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
