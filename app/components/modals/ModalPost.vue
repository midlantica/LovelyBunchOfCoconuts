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
  /* =====================================================================
     POST MODAL VERTICAL RHYTHM

     Typographic hierarchy:
     - Line-height (leading) is tighter than paragraph spacing
     - Paragraphs have clear bottom spacing to separate blocks
     - Headings have generous top margin (visual section break)
     - Headings have smaller bottom margin (they belong to what follows)
     - Lists have spacing consistent with paragraphs
     ===================================================================== */

  /* --- Headings --- */
  .post-modal-content :deep(h1),
  .post-modal-content :deep(h2),
  .post-modal-content :deep(h3),
  .post-modal-content :deep(h4),
  .post-modal-content :deep(h5),
  .post-modal-content :deep(h6) {
    color: #b8e8ff; /* seagull-200 */
    font-weight: 300;
    line-height: 1.3;
    margin-top: 1.75em; /* generous space BEFORE headings */
    margin-bottom: 0.15em; /* tight — heading belongs to next block */
  }

  .post-modal-content :deep(h1) {
    font-size: 1.75rem;
  }

  .post-modal-content :deep(h2) {
    font-size: 1.5rem;
  }

  .post-modal-content :deep(h3) {
    font-size: 1.25rem;
  }

  /* First heading in content should not have top space */
  .post-modal-content :deep(:first-child) {
    margin-top: 0;
  }

  /* --- Paragraphs --- */
  .post-modal-content :deep(p) {
    margin-top: 0;
    margin-bottom: 0.75em; /* clear space between paragraphs */
    line-height: 1.5; /* tighter than the paragraph gap */
    color: white;
  }

  .post-modal-content :deep(p:last-of-type) {
    margin-bottom: 0;
  }

  /* --- Unordered Lists --- */
  .post-modal-content :deep(ul) {
    list-style-type: disc;
    padding-left: 0;
    margin-left: 0;
    margin-top: 0;
    margin-bottom: 0.75em; /* same rhythm as paragraphs */
  }

  .post-modal-content :deep(ul li) {
    margin-left: 1.25rem;
    margin-bottom: 0.2em; /* tight spacing between list items */
    padding-left: 0;
    line-height: 1.5;
    color: white;
  }

  .post-modal-content :deep(ul li:last-child) {
    margin-bottom: 0;
  }

  .post-modal-content :deep(ul li::marker) {
    color: #b8e8ff; /* seagull-200 */
  }

  /* --- Ordered Lists --- */
  .post-modal-content :deep(ol) {
    padding-left: 0;
    margin-left: 0;
    margin-top: 0;
    margin-bottom: 0.75em; /* same rhythm as paragraphs */
  }

  .post-modal-content :deep(ol li) {
    margin-left: 1.25rem;
    margin-bottom: 0.2em;
    padding-left: 0;
    line-height: 1.5;
    color: white;
  }

  .post-modal-content :deep(ol li:last-child) {
    margin-bottom: 0;
  }

  .post-modal-content :deep(ol li::marker) {
    color: #b8e8ff; /* seagull-200 */
  }

  /* --- Blockquotes --- */
  .post-modal-content :deep(blockquote) {
    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 1em;
    border-left: 3px solid #b8e8ff;
    color: #d1d5db;
    line-height: 1.5;
  }

  /* --- Horizontal Rules --- */
  .post-modal-content :deep(hr) {
    margin-top: 1.5em;
    margin-bottom: 1.5em;
    border-color: rgba(184, 232, 255, 0.2);
  }

  /* --- Strong / Bold --- */
  .post-modal-content :deep(strong) {
    font-weight: 400;
  }

  /* --- Last child of any type should not add trailing space --- */
  .post-modal-content :deep(:last-child) {
    margin-bottom: 0;
  }
</style>
