<!-- components/ModalClaim.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <!-- Share Panel Container -->
      <div class="bg-slate-900 rounded-lg">
        <!-- Main Content Panel (nested inside) -->
        <div
          class="flex flex-col bg-slate-800 shadow-lg p-4 sm:p-6 rounded-lg sm:rounded-lg"
        >
          <div class="mb-2">
            <h1 class="mb-4 font-bold text-white text-2xl">
              {{ modalData?.claim || modalData?.title }}
            </h1>
            <hr class="my-2 border-white/10 border-t" />
            <h1 class="mb-2 font-bold text-white text-2xl">
              {{ modalData?.translation }}
            </h1>
          </div>
          <!-- Only show body content if it exists and has actual content -->
          <div
            v-if="
              modalData?.body &&
              modalData.body.value &&
              modalData.body.value.length > 0
            "
            class="prose-invert max-w-none prose"
          >
            <div v-html="modalData?.bodyHtml"></div>
          </div>
        </div>

        <!-- Share Buttons Shelf -->
        <div class="px-2 sm:px-6 py-2 rounded-b-lg sm:rounded-b-lg">
          <ShareButton
            v-if="modalData"
            :title="modalData?.claim || modalData?.title"
            :text="`${modalData?.claim || modalData?.title} - ${modalData?.translation}`"
            :url="shareUrl"
            :generated-image-blob="shareImageBlob"
            content-type="claim"
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
    return generateContentUrl(props.modalData, 'claim')
  })

  // Generate share image when modal data changes
  watch(
    () => props.modalData,
    async (data) => {
      // Only generate images on client-side
      if (import.meta.server) return

      if (data && data.claim && data.translation) {
        const { generateClaimImage } = await import(
          '~/composables/useShareImageGenerator'
        )
        shareImageBlob.value = await generateClaimImage(
          data.claim,
          data.translation
        )
      }
    },
    { immediate: true }
  ) // Debug the modal data
  watch(
    () => props.modalData,
    (data) => {
      if (data) {
        console.log('Claim modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
