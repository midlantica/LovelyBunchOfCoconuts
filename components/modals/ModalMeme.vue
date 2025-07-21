<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <!-- Container with no padding -->
      <div
        class="flex flex-col w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
      >
        <!-- Image container -->
        <div class="flex flex-1 justify-center items-center min-h-0">
          <img
            v-if="modalData?.image"
            :src="modalData?.image"
            :alt="modalData?.title"
            class="w-full sm:w-auto max-w-full h-auto max-h-[calc(100vh-16rem)] object-contain"
          />
        </div>
        <!-- Text line with consistent bottom spacing -->
        <p class="mt-2 font-bold text-white text-lg text-center">
          {{ modalData?.title || modalData?.description }}
        </p>

        <!-- Share buttons -->
        <ShareButton
          v-if="modalData"
          :title="modalData?.title || modalData?.description"
          :text="`Check out this meme: ${modalData?.title || modalData?.description}`"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
        />
      </div>
    </ModalFrame>
  </client-only>
</template>

<script setup>
  import { watch, computed, ref } from 'vue'
  import ModalFrame from './ModalFrame.vue'
  import ShareButton from '../ui/ShareButton.vue'

  const props = defineProps({
    show: { type: Boolean, default: false },
    modalData: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])

  const shareImageBlob = ref(null)

  // Create shareable URL
  const shareUrl = computed(() => {
    if (props.modalData?._path) {
      return `${window.location.origin}${props.modalData._path}`
    }

    // Fallback: create a meaningful URL based on content
    if (props.modalData?.title || props.modalData?.description) {
      const text = props.modalData.title || props.modalData.description
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      return `${window.location.origin}/memes/${slug}`
    }

    return window.location.href
  })

  // Generate share image when modal data changes
  watch(
    () => props.modalData,
    async (data) => {
      if (data && data.image) {
        const { generateMemeShareImage } = await import(
          '~/composables/useShareImageGenerator'
        )
        shareImageBlob.value = await generateMemeShareImage(
          data.image,
          data.title || data.description
        )
      }
    },
    { immediate: true }
  )

  // Debug the modal data
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
