<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="handleClose">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="z-10 relative flex flex-col bg-slate-800 shadow-modal rounded-none sm:rounded-lg w-full max-w-full sm:max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
        >
          <!-- Image + Text container -->
          <div
            class="flex flex-col justify-center items-center p-0 sm:p-6 pb-2 h-full min-h-0"
          >
            <img
              v-if="modalData?.image"
              :src="modalData.image"
              alt=""
              class="w-full sm:w-auto max-w-full h-auto max-h-[60vh] object-contain"
              loading="lazy"
              decoding="async"
            />
            <div
              v-if="modalData?.bodyText"
              ref="bodyRef"
              class="relative flex-1 text-shadow-xs mt-2 px-4 sm:px-0 pr-2 w-full min-h-0 overflow-y-auto font-[100] text-gray-300 text-base sm:text-lg text-center leading-normal scroll-area"
            >
              <div class="whitespace-pre-line">{{ modalData.bodyText }}</div>
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
        </div>
      </template>
      <template #sharePanel>
        <!-- Share Buttons Shelf (separate slot) -->
        <UiShareButton
          v-if="modalData"
          :title="shareTitle"
          :text="shareText"
          :url="shareUrl"
          :generated-image-blob="shareImageBlob"
          :show="showShareShelf"
          content-type="meme"
          :like-id="modalData?._path || modalData?.path || ''"
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

  // Reactive state
  const shareImageBlob = ref(null)
  const { showShareShelf, onToggle } = useShareShelf(500)
  // Custom ScrollArea handles scrollbar visuals, no overlay detection needed here

  // Computed share props
  const shareTitle = computed(
    () => props.modalData?.title || props.modalData?.description || 'Meme'
  )
  const shareText = computed(() => `Check out this meme: ${shareTitle.value}`)
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'meme')
  })

  // Close
  const handleClose = () => emit('close')

  // Watch show to toggle shelf animation
  watch(
    () => props.show,
    (visible) => onToggle(!!visible),
    { immediate: true }
  )

  // Generate share image when meme changes
  watch(
    () => props.modalData,
    async (data) => {
      if (import.meta.server || !data?.image) return
      const run = async () => {
        try {
          const { useShareImageGenerator } = await import(
            '~/composables/useShareImageGenerator'
          )
          const { generateMemeShareImage } = useShareImageGenerator()
          const blob = await generateMemeShareImage(
            data.image,
            shareTitle.value
          )
          if (props.modalData === data) {
            shareImageBlob.value = blob
          }
        } catch (error) {
          if (import.meta.dev)
            console.warn('Failed to generate share image:', error)
        }
      }
      const idle = (cb) =>
        window.requestIdleCallback
          ? window.requestIdleCallback(cb, { timeout: 2500 })
          : setTimeout(cb, 200)
      idle(run)
    },
    { immediate: true }
  )

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    watch(
      () => props.modalData,
      (data) => {
        if (data && import.meta.dev) {
          console.log('Meme modal data received:', data)
          console.log('Keys:', Object.keys(data))
        }
      },
      { immediate: true }
    )
  }

  // Native scrollbar styling handled via CSS

  // Scroll cue (double-blink chevron)
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
