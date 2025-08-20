<!-- components/ModalClaim.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel - completely independent -->
        <div
          class="z-10 relative bg-slate-800 shadow-modal p-0 sm:px-7 sm:py-6 rounded-none sm:rounded-lg"
        >
          <div class="mb-0 p-4 sm:p-0">
            <div class="flex gap-3">
              <img
                src="~/assets/icons/npc_icon.svg"
                alt="NPC"
                class="self-start w-8"
              />
              <h1
                class="text-shadow-xs mb-0 font-[100] text-white text-2xl leading-tight"
              >
                {{ modalData?.claim || modalData?.title }}
              </h1>
            </div>
            <UiDividerArrow wrapper-class="my-4" />
            <div class="flex gap-3">
              <img
                src="~/assets/icons/player_icon.svg"
                alt="Player"
                class="self-start w-8"
              />
              <h1
                class="text-shadow-xs mb-0 font-[100] text-white text-2xl leading-tight"
              >
                {{ modalData?.translation }}
              </h1>
            </div>
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
      </template>

      <template #sharePanel>
        <!-- Share Buttons Shelf - positioned relative to this panel -->
        <UiShareButton
          v-if="modalData"
          :title="modalData?.claim || modalData?.title"
          :text="`${modalData?.claim || modalData?.title} - ${
            modalData?.translation
          }`"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
          :show="showShareShelf"
          content-type="claim"
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
    return generateContentUrl(props.modalData, 'claim')
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

      if (data && data.claim && data.translation) {
        const { useShareImageGenerator } = await import(
          '~/composables/useShareImageGenerator'
        )
        const { generateClaimImage } = useShareImageGenerator()
        shareImageBlob.value = await generateClaimImage(
          data.claim,
          data.translation
        )
      }
    },
    { immediate: true }
  )

  // Debug the modal data
  watch(
    () => props.modalData,
    (data) => {
      if (data && import.meta.dev) {
        console.log('Claim modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
