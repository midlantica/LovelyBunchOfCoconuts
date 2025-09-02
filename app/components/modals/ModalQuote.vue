<!-- components/ModalQuote.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="z-10 relative bg-slate-800 shadow-modal p-0 sm:px-7 sm:py-6 rounded-none sm:rounded-lg"
        >
          <div class="p-4 sm:p-0">
            <h1
              class="text-shadow-xs mb-2 font-[100] text-white text-2xl leading-9"
            >
              {{
                modalData?.quoteText ||
                (modalData?.headings && modalData.headings[0]) ||
                modalData?.title
              }}
            </h1>
            <p class="text-shadow-xs mb-2 font-[100] text-seagull-300 text-xl">
              — {{ modalData?.attribution }}
            </p>
          </div>
          <div
            v-if="
              modalData?.body &&
              modalData.body.value &&
              modalData.body.value.length > 0
            "
            class="relative max-w-none max-h-[50vh] overflow-y-auto scroll-area"
          >
            <div class="prose-invert pr-3 prose">
              <div v-html="modalData?.bodyHtml"></div>
            </div>
            <div
              class="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-slate-800 to-transparent h-2 pointer-events-none"
            ></div>
          </div>
        </div>
      </template>

      <template #sharePanel>
        <!-- Share Buttons Shelf -->
        <UiShareButton
          v-if="modalData"
          :title="modalData?.quoteText || modalData?.title"
          :text="`${modalData?.quoteText || modalData?.title} — ${
            modalData?.attribution
          }`"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
          :show="showShareShelf"
          content-type="quote"
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

  const shareImageBlob = ref(null)
  const { showShareShelf, onToggle } = useShareShelf(500)

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'quote')
  })

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
  )

  // Native scrollbar styling handled via CSS
</script>

<style scoped>
  .scroll-area {
    scrollbar-gutter: stable;
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #0089cc rgba(255, 255, 255, 0.08); /* thumb, track */
  }
  .scroll-area::-webkit-scrollbar {
    width: 5px;
  }
  .scroll-area::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
  }
  .scroll-area::-webkit-scrollbar-thumb {
    background: #0089cc; /* seagull-600 */
    border-radius: 6px;
  }
  .scroll-area::-webkit-scrollbar-thumb:hover {
    background: #09acee; /* seagull-500 */
  }
</style>
