<!-- components/ModalQuote.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="card shadow-modal bg-theme-elevated relative z-10 w-full max-w-[800px] min-w-1/2 rounded-none p-0 sm:rounded-lg sm:px-7 sm:py-6"
        >
          <div class="p-4 sm:p-0">
            <h1
              class="font-100 mb-0 text-xl leading-normal whitespace-pre-line text-shadow-xs sm:mb-2 sm:text-xl sm:leading-normal md:text-2xl"
              style="color: white"
            >
              {{
                modalData?.quoteText ||
                (modalData?.headings && modalData.headings.join('\n\n')) ||
                modalData?.title
              }}
            </h1>
            <p
              class="font-100 text-seagull-200 mb-2 text-xl text-shadow-xs sm:text-2xl"
            >
              — {{ modalData?.attribution }}
            </p>
          </div>
          <div
            v-if="
              modalData?.bodyHtml &&
              modalData.bodyHtml.trim() !== '' &&
              modalData.bodyHtml.trim() !== '<div></div>'
            "
            ref="bodyRef"
            class="modal-scroll-area relative max-h-[50vh] max-w-none overflow-y-auto"
          >
            <div class="prose-invert prose pr-0 sm:pr-3">
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
                  'text-seagull-200 chevron chevron-wide text-[2.5rem]',
                  isBottom ? 'rotate-180' : '',
                ]"
              />
            </div>
            <div
              class="pointer-events-none absolute right-0 bottom-0 left-0 h-2 bg-linear-to-t from-slate-800 to-transparent"
            ></div>
          </div>
        </div>
      </template>

      <template #sharePanel>
        <!-- Content Action Bar -->
        <UiContentActionBar
          v-if="modalData"
          :title="modalData?.quoteText || modalData?.title"
          :text="`${modalData?.quoteText || modalData?.title} — ${
            modalData?.attribution
          }`"
          :url="shareUrl"
          :like-id="modalData?._path || modalData?.path || ''"
          :generated-image-blob="shareImageBlob"
          :show="showShareShelf"
          :disable-copy-image="isQuoteTooLong"
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
  const isQuoteTooLong = ref(false)
  const { showShareShelf, onToggle } = useShareShelf()

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
  const onScroll = () => recalcCue()

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
        const run = async () => {
          try {
            const { useShareImageGenerator } =
              await import('~/composables/useShareImageGenerator')
            const { generateQuoteImage } = useShareImageGenerator()
            const blob = await generateQuoteImage(
              data.quoteText || data.title,
              data.attribution
            )
            if (props.modalData === data) {
              shareImageBlob.value = blob
              isQuoteTooLong.value = blob === null
            }
          } catch (e) {
            if (import.meta.dev)
              console.warn('quote share image generation failed', e)
          }
        }
        const idle = (cb) =>
          window.requestIdleCallback
            ? window.requestIdleCallback(cb, { timeout: 2500 })
            : setTimeout(cb, 200)
        idle(run)
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

  /* --- Prose vertical rhythm for quote body content --- */
  .prose :deep(h1),
  .prose :deep(h2),
  .prose :deep(h3),
  .prose :deep(h4),
  .prose :deep(h5),
  .prose :deep(h6) {
    color: #a5f3fc; /* seagull-200 */
    line-height: 1.3;
    margin-top: 1.75em;
    margin-bottom: 0.15em;
  }

  .prose :deep(:first-child) {
    margin-top: 0;
  }

  .prose :deep(p) {
    color: white;
    margin-top: 0;
    margin-bottom: 0.75em;
    line-height: 1.5;
  }

  .prose :deep(ul),
  .prose :deep(ol) {
    margin-top: 0;
    margin-bottom: 0.75em;
  }

  .prose :deep(ul li),
  .prose :deep(ol li) {
    color: white;
    margin-bottom: 0.2em;
    line-height: 1.5;
  }

  .prose :deep(li:last-child) {
    margin-bottom: 0;
  }

  .prose :deep(:last-child) {
    margin-bottom: 0;
  }
</style>
