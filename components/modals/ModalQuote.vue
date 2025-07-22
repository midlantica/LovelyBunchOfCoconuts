<!-- components/ModalQuote.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <div class="flex flex-col p-4 sm:p-0">
        <div class="mb-2">
          <h1 class="mb-2 font-bold text-white text-2xl leading-9">
            {{
              modalData?.quoteText ||
              (modalData?.headings && modalData.headings[0]) ||
              modalData?.title
            }}
          </h1>
          <p class="mb-2 text-seagull-300 text-xl">
            — {{ modalData?.attribution }}
          </p>
        </div>
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

        <!-- Share buttons -->
        <ShareButton
          v-if="modalData"
          :title="modalData?.quoteText || modalData?.title"
          :text="`&quot;${modalData?.quoteText || modalData?.title}&quot; — ${modalData?.attribution}`"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
          content-type="quote"
        />
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
    return generateContentUrl(props.modalData, 'quote')
  })

  // Generate share image when modal data changes
  watch(
    () => props.modalData,
    async (data) => {
      // Only generate images on client-side
      if (import.meta.server) return

      if (data && (data.quoteText || data.title) && data.attribution) {
        const { useShareImageGenerator } = await import(
          '~/composables/useShareImageGenerator'
        )
        const { generateQuoteImage } = useShareImageGenerator()
        shareImageBlob.value = await generateQuoteImage(
          data.quoteText || data.title,
          data.attribution
        )
      }
    },
    { immediate: true }
  ) // Debug the modal data
  watch(
    () => props.modalData,
    (data) => {
      if (data) {
        console.log('Quote modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
