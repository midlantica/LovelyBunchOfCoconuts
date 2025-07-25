<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <!-- Share Panel Container -->
      <div class="bg-slate-900 rounded-lg">
        <!-- Main Content Panel (nested inside) -->
        <div
          class="flex flex-col bg-slate-800 shadow-lg rounded-lg sm:rounded-lg w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
        >
          <!-- Image container -->
          <div
            class="flex flex-1 justify-center items-center p-4 sm:p-6 min-h-0"
          >
            <img
              v-if="modalData?.image"
              :src="modalData?.image"
              :alt="modalData?.title"
              class="w-full sm:w-auto max-w-full h-auto max-h-[calc(100vh-20rem)] object-contain"
            />
          </div>
          <!-- Text line -->
          <p class="px-4 sm:px-6 pb-2 font-bold text-white text-lg text-center">
            {{ modalData?.title || modalData?.description }}
          </p>
        </div>

        <!-- Share Buttons Shelf -->
        <div class="px-2 sm:px-6 py-2 rounded-b-lg sm:rounded-b-lg">
          <ShareButton
            v-if="modalData"
            :title="modalData?.title || modalData?.description"
            :text="`Check out this meme: ${modalData?.title || modalData?.description}`"
            :url="shareUrl"
            :generated-image-blob="shareImageBlob"
            content-type="meme"
          />
        </div>
      </div>
    </ModalFrame>
  </client-only>
</template>

<script setup>
  import { watch, computed, ref } from 'vue'
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

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'meme')
  })

  // Generate share image when modal data changes
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
