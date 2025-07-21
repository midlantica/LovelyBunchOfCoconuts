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
    if (props.modalData?.quoteText || props.modalData?.title) {
      const text = props.modalData.quoteText || props.modalData.title
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      return `${window.location.origin}/quotes/${slug}`
    }

    return window.location.href
  })

  // Generate share image when modal data changes
  watch(
    () => props.modalData,
    async (data) => {
      if (data && (data.quoteText || data.title) && data.attribution) {
        const { generateQuoteImage } = await import(
          '~/composables/useShareImageGenerator'
        )
        shareImageBlob.value = await generateQuoteImage(
          data.quoteText || data.title,
          data.attribution
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
        console.log('Quote modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
