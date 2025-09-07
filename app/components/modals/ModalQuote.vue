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
            ref="bodyRef"
            class="relative max-w-none max-h-[50vh] overflow-y-auto scroll-area"
          >
            <div class="prose-invert pr-3 prose">
              <div v-html="modalData?.bodyHtml"></div>
            </div>
            <div
              v-show="showCue"
              :key="'cue-' + cueKey"
              :class="['scroll-cue', isBottom ? 'bottom-deep' : '']"
              aria-hidden="true"
            >
              <Icon
                name="tabler:chevron-compact-down"
                :class="[
                  'text-[2.5rem] text-seagull-200 chevron chevron-wide',
                  isBottom ? 'rotate-180' : '',
                ]"
              />
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
          :like-id="modalData?._path || modalData?.path || ''"
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

  // Scroll cue (double-blink chevron) state
  const bodyRef = ref(null)
  const showCue = ref(false)
  const cueKey = ref(0)
  const isBottom = ref(false)
  const lastCuePos = ref(null) // 'top' | 'bottom'
  let ro

  const recalcCue = () => {
    const el = bodyRef.value
    if (!el) return
    const hasOverflow = el.scrollHeight - el.clientHeight > 1
    const atTop = el.scrollTop <= 4
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    const shouldShow = hasOverflow && (atTop || nearBottom)
    const nextPos = nearBottom ? 'bottom' : 'top'
    if (shouldShow) {
      if (!showCue.value || lastCuePos.value !== nextPos) cueKey.value++
      lastCuePos.value = nextPos
    }
    showCue.value = shouldShow
    isBottom.value = shouldShow && nearBottom
  }
  const onScroll = () => {
    const el = bodyRef.value
    if (!el) return
    const hasOverflow = el.scrollHeight - el.clientHeight > 1
    const atTop = el.scrollTop <= 4
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    const nextShow = hasOverflow && (atTop || nearBottom)
    const nextPos = nearBottom ? 'bottom' : 'top'
    if (nextShow) {
      if (!showCue.value || lastCuePos.value !== nextPos) cueKey.value++
      lastCuePos.value = nextPos
    }
    showCue.value = nextShow
    isBottom.value = nextShow && nearBottom
  }

  onMounted(() => {
    nextTick(() => {
      recalcCue()
      bodyRef.value?.addEventListener('scroll', onScroll, { passive: true })
      ro = new ResizeObserver(recalcCue)
      bodyRef.value && ro.observe(bodyRef.value)
    })
  })
  onBeforeUnmount(() => {
    bodyRef.value?.removeEventListener('scroll', onScroll)
    ro?.disconnect()
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
  )

  // Native scrollbar styling handled via CSS
</script>

<style scoped>
  @keyframes cueBlink {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
  .scroll-cue {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -0.95rem; /* requested offset */
    text-align: center; /* stable centering */
    color: rgba(255, 255, 255, 0.7);
    animation: cueBlink 900ms ease-in-out 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100; /* show above fade */
    pointer-events: none;
  }
  .bottom-deep {
    bottom: -9.65rem;
  }
  .scroll-cue .chevron {
    filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.35));
    opacity: 0.5;
    display: inline-block;
  }
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
