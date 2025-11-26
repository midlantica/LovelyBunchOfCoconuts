<!-- components/modals/ModalPost.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="card shadow-modal xs:max-w-[1400px] relative z-10 w-full min-w-1/2 rounded-none p-4 sm:max-w-[95vw] sm:rounded-lg sm:px-6 sm:py-6"
        >
          <div
            v-if="modalData?.body && hasBodyContent"
            ref="bodyRef"
            class="modal-scroll-area relative max-h-[60vh] max-w-none overflow-y-auto"
          >
            <div
              class="prose-invert prose post-modal-content max-w-none pr-0 sm:pr-3"
            >
              <ContentRenderer :value="modalData" />
            </div>
          </div>
        </div>
      </template>

      <template #sharePanel>
        <!-- Content Action Bar -->
        <UiContentActionBar
          v-if="modalData"
          :title="modalData?.title"
          :text="postText"
          :url="shareUrl"
          :like-id="modalData?._path || modalData?.path || ''"
          :show="showShareShelf"
          content-type="post"
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

  const { showShareShelf, onToggle } = useShareShelf(500)

  // Check if body has actual content
  const hasBodyContent = computed(() => {
    if (!props.modalData?.body) return false

    // Check if body.value exists and has content
    if (Array.isArray(props.modalData.body.value)) {
      return props.modalData.body.value.length > 0
    }

    return false
  })

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'post')
  })

  // Extract plain text from post body for copying
  const postText = computed(() => {
    if (!props.modalData?.body) {
      return props.modalData?.title || ''
    }

    // Handle minimark format: body.value is an array of [tag, attrs, ...content]
    const extractFromMinimark = (element) => {
      // Handle string content
      if (typeof element === 'string') {
        return element
      }

      // Handle array format: [tag, attrs, ...content]
      if (Array.isArray(element)) {
        const [tag, attrs, ...content] = element

        // Handle links - show link text on one line, URL on next line
        if (tag === 'a' && attrs?.href) {
          const linkText = content.map(extractFromMinimark).join('')
          return linkText + '\n' + attrs.href
        }

        // Extract text from content (skip attrs object)
        const text = content.map(extractFromMinimark).join('')

        // Add formatting based on tag
        if (
          tag === 'h1' ||
          tag === 'h2' ||
          tag === 'h3' ||
          tag === 'h4' ||
          tag === 'h5' ||
          tag === 'h6'
        ) {
          return '\n\n' + text + '\n\n'
        }
        if (tag === 'p') {
          return text + '\n\n'
        }
        if (tag === 'li') {
          return '• ' + text + '\n'
        }
        if (tag === 'ul' || tag === 'ol') {
          return '\n' + text
        }
        if (tag === 'br') {
          return '\n'
        }

        return text
      }

      return ''
    }

    // Check if body is minimark format
    if (
      props.modalData.body.type === 'minimark' &&
      Array.isArray(props.modalData.body.value)
    ) {
      const bodyText = props.modalData.body.value
        .map(extractFromMinimark)
        .join('')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      // Add URL at the top, then two line breaks, then the content
      const url = shareUrl.value || ''
      const fullText = url + '\n\n' + bodyText

      if (fullText.trim()) return fullText
    }

    // Final fallback: use title
    return props.modalData?.title || ''
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

  // Native scrollbar styling handled via CSS
</script>

<style scoped>
  /* Post modal content styling - ensure all headers are seagull-200 */
  .post-modal-content :deep(h1),
  .post-modal-content :deep(h2),
  .post-modal-content :deep(h3),
  .post-modal-content :deep(h4),
  .post-modal-content :deep(h5),
  .post-modal-content :deep(h6) {
    color: #b8e8ff; /* seagull-200 */
    font-weight: 300;
  }

  .post-modal-content :deep(h2) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    margin-top: 0;
  }

  .post-modal-content :deep(p) {
    margin: 0.75rem 0;
    line-height: 1.6;
    color: white;
  }

  .post-modal-content :deep(p:first-of-type) {
    margin-top: 0;
  }

  .post-modal-content :deep(p:last-of-type) {
    margin-bottom: 0;
  }

  /* Bullet list styling - brighter bullets */
  .post-modal-content :deep(ul) {
    list-style-type: disc;
    padding-left: 0;
    margin-left: 0;
    margin-bottom: 0.5rem;
  }

  .post-modal-content :deep(ul li) {
    margin-left: 1.25rem;
    margin-bottom: 0.25rem;
    padding-left: 0;
    color: white;
  }

  .post-modal-content :deep(ul li::marker) {
    color: #b8e8ff; /* seagull-200 */
  }

  .post-modal-content :deep(ol) {
    padding-left: 0;
    margin-left: 0;
    margin-bottom: 0.5rem;
  }

  .post-modal-content :deep(ol li) {
    margin-left: 1.25rem;
    margin-bottom: 0.25rem;
    padding-left: 0;
    color: white;
  }

  /* Strong tags should use font-weight 400 */
  .post-modal-content :deep(strong) {
    font-weight: 400;
  }
</style>
