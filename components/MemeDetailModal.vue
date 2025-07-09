<!-- components/MemeDetailModal.vue -->
<template>
  <ModalFrame :show="show" @close="close" :modalStyle="modalFrameStyle">
    <div
      v-if="loading"
      class="flex flex-1 justify-center items-center py-8 text-white text-center"
    >
      <Icon name="svg-spinners:90-ring-with-bg" size="2rem" />
    </div>
    <div
      v-else-if="error"
      class="flex flex-1 justify-center items-center py-8 text-red-500 text-center"
    >
      {{ error }}
    </div>
    <div v-else-if="meme" class="meme-modal-content" :style="containerStyle">
      <!-- Image container with padding on top, left, right -->
      <div class="image-container" :style="imageContainerStyle">
        <img
          v-if="meme.image"
          :src="meme.image"
          :alt="meme.title || 'Meme'"
          class="meme-image"
          :style="imageStyle"
          @load="onImageLoad"
        />
        <div v-else class="py-4 text-red-400">
          🚨 Meme image not found!<br />
          <span class="text-xs">{{
            logMissingImage(slug || 'unknown-file')
          }}</span>
        </div>
      </div>

      <!-- Text content with padding only on left, right, bottom -->
      <div v-if="hasAnyText" class="text-container" :style="textContainerStyle">
        <!-- Main text (above HR) -->
        <div
          v-if="mainText"
          class="prose-invert max-w-none text-center prose prose-sm"
          :class="{ 'mb-4': extraText }"
          :style="mainTextStyle"
        >
          <div v-html="mainText"></div>
        </div>

        <!-- Extra text (below HR) - scrollable if needed -->
        <div
          v-if="extraText"
          class="prose-invert max-w-none overflow-y-auto prose prose-sm"
          :style="extraTextStyle"
        >
          <div v-html="extraText"></div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex flex-col justify-center items-center p-8 min-w-[10vw] min-h-[10vh]"
    >
      <slot />
    </div>
  </ModalFrame>
</template>

<script setup>
  import { ref, watch, computed, onMounted, onUnmounted, inject } from 'vue'
  import MarkdownIt from 'markdown-it'
  import ModalFrame from './ModalFrame.vue'
  import { useModalLogic } from '~/composables/useModalLogic'

  const props = defineProps({
    slug: { type: String, required: true },
    show: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const meme = ref(null)
  const error = ref(null)
  const loading = ref(true)
  const markdownContent = ref('')

  // Responsive state
  const viewportWidth = ref(window.innerWidth)
  const viewportHeight = ref(window.innerHeight)
  const imageAspectRatio = ref(1)
  const imageNaturalWidth = ref(0)
  const imageNaturalHeight = ref(0)

  // Get the content from the global context
  const displayedItems = inject('displayedItems', ref([]))

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

  const close = () => emit('close')

  // Use modal logic composable
  useModalLogic({ show: props.show, onClose: close })

  // Update viewport dimensions on resize
  const updateViewportDimensions = () => {
    viewportWidth.value = window.innerWidth
    viewportHeight.value = window.innerHeight
  }

  onMounted(() => {
    updateViewportDimensions()
    window.addEventListener('resize', updateViewportDimensions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateViewportDimensions)
  })

  // Handle image load to get natural dimensions
  const onImageLoad = (event) => {
    const img = event.target
    imageNaturalWidth.value = img.naturalWidth
    imageNaturalHeight.value = img.naturalHeight
    imageAspectRatio.value = img.naturalWidth / img.naturalHeight
  }

  // Log missing image and return filename for display
  const logMissingImage = (slug) => {
    const filename = `${slug}.md`
    console.error('🚨 Broken meme image:', filename)
    return filename
  }

  // Load meme content
  const loadMeme = async () => {
    loading.value = true
    error.value = null
    meme.value = null
    markdownContent.value = ''

    try {
      // Find the meme in the already-loaded displayed items
      let found = null

      // Search through all displayed items for memes
      for (const item of displayedItems.value) {
        if (item.type === 'memeRow') {
          for (const memeItem of item.data) {
            const memePath = memeItem?.path || memeItem?._path || ''
            const memeId = memeItem?.id || ''
            const memeTitle = memeItem?.title || ''

            console.log(`Checking meme: "${memeTitle}" (path: ${memePath})`)

            // Try multiple matching strategies
            if (
              memePath === props.slug ||
              memePath.includes(props.slug) ||
              props.slug.includes(memePath) ||
              memeId === props.slug ||
              memeId.includes(props.slug.split('/').pop()) ||
              memePath.endsWith(props.slug)
            ) {
              found = memeItem
              console.log('✅ Found meme match!')
              break
            }
          }
          if (found) break
        }
      }

      if (found) {
        meme.value = found

        if (found.body) {
          // Handle both string body (markdown) and AST body (Nuxt Content v3)
          let content = ''
          let extractedImage = null

          if (typeof found.body === 'string') {
            content = found.body.replace(/^---[\s\S]*?---/, '').trim()
            // Extract image from markdown string
            const imgMatch = content.match(/!\[.*?\]\((.*?)\)/)
            if (imgMatch && imgMatch[1]) {
              extractedImage = imgMatch[1]
            }
          } else if (found.body.value && Array.isArray(found.body.value)) {
            // Extract image from AST using the same logic as useContentFeed
            for (const element of found.body.value) {
              if (Array.isArray(element)) {
                // Check if this is an image element
                if (element[0] === 'img' && element[1]?.src) {
                  extractedImage = element[1].src
                  break
                }
                // Check if it's a paragraph containing an image
                if (element[0] === 'p' && Array.isArray(element[2])) {
                  // The element[2] IS the img element directly: ["img", {src: "..."}]
                  if (element[2][0] === 'img' && element[2][1]?.src) {
                    extractedImage = element[2][1].src
                    break
                  }

                  // OR look through the paragraph content for images (if it's an array of elements)
                  if (Array.isArray(element[2])) {
                    for (const child of element[2]) {
                      if (
                        Array.isArray(child) &&
                        child[0] === 'img' &&
                        child[1]?.src
                      ) {
                        extractedImage = child[1].src
                        break
                      }
                    }
                    if (extractedImage) break
                  }
                }
                // Check if it's a paragraph with an image markdown string
                if (
                  element[0] === 'p' &&
                  typeof element[2] === 'string' &&
                  element[2].includes('![')
                ) {
                  // Extract image from markdown syntax like ![alt](/path/to/image.png)
                  const imageMatch = element[2].match(/!\[.*?\]\(([^)]+)\)/)
                  if (imageMatch) {
                    extractedImage = imageMatch[1]
                    break
                  }
                }
              }
            }

            // Convert AST back to markdown-like text for rendering
            content = found.body.value
              .map((element) => {
                if (Array.isArray(element)) {
                  if (element[0] === 'p' && typeof element[2] === 'string') {
                    return element[2]
                  }
                  if (element[0] === 'img' && element[1]?.src) {
                    return `![${element[1].alt || ''}](${element[1].src})`
                  }
                }
                return ''
              })
              .filter(Boolean)
              .join('\n\n')
          }

          markdownContent.value = md.render(content)

          // Set the image if we found one, or use the image already extracted in the feed
          if (extractedImage) {
            meme.value.image = extractedImage
          } else if (found.image) {
            // Use the image that was already extracted in useContentFeed
            meme.value.image = found.image
          }
        }
      } else {
        const filename = `${props.slug || 'unknown-file'}.md`
        console.error('🚨 Broken meme modal:', filename)
        error.value = `🚨 Meme not found!\n${filename}`
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Extract image-free markdown content
  const imageFreeMd = computed(() => {
    if (!markdownContent.value) return ''
    return markdownContent.value.replace(/<p><img[^>]*><\/p>/g, '').trim()
  })

  // Split content around HR tags
  const mainText = computed(() => {
    if (!imageFreeMd.value) return ''
    const idx = imageFreeMd.value.indexOf('<hr')
    if (idx === -1) return imageFreeMd.value
    return imageFreeMd.value.slice(0, idx).trim()
  })

  const extraText = computed(() => {
    if (!imageFreeMd.value) return ''
    const idx = imageFreeMd.value.indexOf('<hr')
    if (idx === -1) return ''
    const closeIdx = imageFreeMd.value.indexOf('>', idx)
    if (closeIdx === -1) return ''
    return imageFreeMd.value.slice(closeIdx + 1).trim()
  })

  const hasAnyText = computed(() => {
    return !!(mainText.value || extraText.value)
  })

  // Modal frame style - hugs content with viewport constraints
  const modalFrameStyle = computed(() => {
    return {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto', // Let content determine width
      height: 'auto', // Let content determine height
      padding: '0',
      // Frame should fit content like a glove
    }
  })

  // Container style - natural sizing based on content
  const containerStyle = computed(() => {
    return {
      width: '100%', // Fill modal frame width
      maxWidth: '100%', // Respect modal frame boundaries
      height: 'auto', // Natural height based on content
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgb(30 41 59)', // slate-800
      borderRadius: '0.5rem', // Match the modal frame border radius
      boxSizing: 'border-box', // Include any borders/padding in width
      overflow: 'hidden', // Ensure content respects the border radius
      // No max constraints - let content determine size
    }
  })

  // Image container style - natural sizing with padding, ensures image stays inside frame
  const imageContainerStyle = computed(() => {
    const padding = 16 // 1rem in pixels
    return {
      paddingLeft: padding + 'px',
      paddingRight: padding + 'px',
      paddingTop: padding + 'px',
      paddingBottom: hasAnyText.value ? '0px' : padding + 'px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      boxSizing: 'border-box',
    }
  })

  // Image style - natural sizing constrained by viewport and container padding
  const imageStyle = computed(() => {
    return {
      maxWidth: '100%', // Fill container minus padding
      maxHeight: '80vh', // Reserve space for text (roughly 10vh)
      width: 'auto',
      height: 'auto',
      objectFit: 'contain',
      display: 'block',
      margin: '0',
      boxSizing: 'border-box',
    }
  })

  // Text container style - always show overflow scroller if content overflows
  const textContainerStyle = computed(() => {
    if (!hasAnyText.value) return { display: 'none' }

    // Calculate if we have substantial text content
    const totalTextLength =
      (mainText.value || '').length + (extraText.value || '').length
    const isLongText = totalTextLength > 200 // Roughly 3-4 lines worth of characters

    return {
      width: '100%',
      maxWidth: '100%',
      minHeight: isLongText ? 'calc(5 * 1.5em)' : 'auto',
      maxHeight: 'calc(15 * 1.5em)',
      padding: '0 16px 16px 16px',
      color: 'rgb(226 232 240)',
      overflowY: 'auto', // Always show vertical scrollbar if overflow
      backgroundColor: 'rgb(30 41 59)',
      fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
      lineHeight: '1.5',
      boxSizing: 'border-box',
      // Always show scrollbar if overflow
      scrollbarGutter: 'stable',
    }
  })

  const mainTextStyle = computed(() => {
    return {
      fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
      lineHeight: '1.5',
      margin: '0', // Remove any default margins
    }
  })

  const extraTextStyle = computed(() => {
    return {
      fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
      lineHeight: '1.5',
      maxHeight: '120px', // Scrollable height within the text container
      overflowY: 'auto',
      marginTop: '8px',
    }
  })

  watch(() => props.slug, loadMeme, { immediate: true })
</script>

<style scoped>
  /* Meme modal specific styles */
  .meme-modal-content {
    position: relative;
  }

  .image-container {
    position: relative;
    /* Natural sizing - no forced flex behavior */
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .meme-image {
    display: block !important;
    margin: 0 !important;
    /* Let image determine its own size within viewport constraints */
    object-fit: contain !important;
    object-position: center !important;
  }

  .text-container {
    position: relative;
    /* Ensure text container doesn't have unwanted margins */
    margin: 0 !important;
    /* Ensure proper width constraints and text wrapping */
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }

  /* Remove all default prose margins for tight layout */
  .text-container .prose,
  .text-container .prose-invert,
  .text-container .prose-sm {
    margin: 0 !important;
    margin-top: 0 !important;
  }

  .text-container .prose > *,
  .text-container .prose-invert > *,
  .text-container .prose-sm > * {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }

  /* Target the specific prose paragraph styles that are causing issues */
  .text-container .prose p,
  .text-container .prose-invert p,
  .text-container .prose-sm p {
    margin-top: 0.5rem !important;
    margin-bottom: 0 !important;
  }

  /* Even more specific targeting for stubborn prose styles */
  .text-container
    .prose
    :where(p):not(:where([class~='not-prose'], [class~='not-prose'] *)),
  .text-container
    .prose-sm
    :where(p):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
    margin-top: 0.5rem !important;
    margin-bottom: 0 !important;
  }

  .text-container .prose > *:last-child,
  .text-container .prose-invert > *:last-child,
  .text-container .prose-sm > *:last-child {
    margin-bottom: 0 !important;
  }

  /* Custom scrollbar for text areas */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
</style>
