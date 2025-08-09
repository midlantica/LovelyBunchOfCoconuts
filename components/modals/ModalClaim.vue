<!-- components/ModalClaim.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel - completely independent -->
        <div
          class="z-10 relative bg-slate-800 shadow-[0_4px_20px_-10px_black] p-0 sm:p-6 rounded-none sm:rounded-lg"
        >
          <div class="mb-0 p-4 sm:p-0">
            <div class="flex gap-3">
              <img
                src="~/assets/icons/npc_icon.svg"
                alt="NPC"
                class="self-start w-8"
              />
              <h1 class="mb-4 font-bold text-white text-2xl">
                {{ modalData?.claim || modalData?.title }}
              </h1>
            </div>
            <hr class="my-4 border-white/10 border-t" />
            <div class="flex gap-3">
              <img
                src="~/assets/icons/player_icon.svg"
                alt="Player"
                class="self-start w-8"
              />
              <h1 class="mb-2 font-bold text-white text-2xl">
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
          :text="`${modalData?.claim || modalData?.title} - ${modalData?.translation}`"
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
  const showShareShelf = ref(false)

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'claim')
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
      if (data) {
        console.log('Claim modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
