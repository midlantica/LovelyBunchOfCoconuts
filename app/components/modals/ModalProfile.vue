<!-- components/modals/ModalProfile.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="card shadow-modal relative z-10 w-full max-w-[800px] min-w-1/2 rounded-none bg-slate-900 p-4 text-white sm:rounded-lg sm:px-7 sm:py-6"
        >
          <!-- Main content: image left, text right (stacks on mobile) -->
          <div
            class="flex flex-col gap-3 text-center text-white sm:flex-row sm:gap-4 sm:text-left"
          >
            <!-- Profile image (left on desktop, top on mobile) -->
            <div class="flex shrink-0 justify-center sm:justify-start">
              <ProfileImage
                v-if="imagePath"
                :image-path="imagePath"
                :profile-name="modalData?.meta?.profile || 'Profile'"
                :status="modalData?.meta?.status || modalData?.status"
                size="modal"
                badge-size="small"
              />
            </div>

            <!-- Text content (right on desktop, bottom on mobile) -->
            <div
              class="flex min-w-0 flex-1 flex-col justify-center gap-2 text-white sm:gap-3"
            >
              <!-- Profile Name -->
              <h1
                class="text-[1.3rem] leading-[1.3rem] font-light tracking-[0.1rem] text-white uppercase"
                style="font-family: 'Barlow Condensed'"
              >
                {{ modalData?.meta?.profile }}
              </h1>

              <!-- Bio text -->
              <div v-if="modalData?.body" class="prose-bio text-white">
                <ContentRenderer :value="modalData.body" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #sharePanel>
        <!-- Content Action Bar -->
        <UiContentActionBar
          v-if="modalData"
          :title="modalData?.meta?.profile"
          :text="`${modalData?.meta?.profile} - ${modalData?.meta?.status === 'hero' ? 'Hero' : 'Zero'}`"
          :url="shareUrl"
          :like-id="modalData?.path || ''"
          :generated-image-blob="null"
          :show="showShareShelf"
          :disable-copy-image="false"
          content-type="profile"
          :profile-data="profileData"
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

  const { showShareShelf, onToggle } = useShareShelf()

  // Create bio content object for ContentRenderer (excluding h2 and images)
  const bioContent = computed(() => {
    if (!props.modalData?.body?.value) return null

    const bioElements = props.modalData.body.value.filter((element) => {
      if (!Array.isArray(element)) return false
      const [tag, attrs, content] = element

      // Skip h2 headings
      if (tag === 'h2') return false

      // Skip image paragraphs
      if (tag === 'p' && Array.isArray(content)) {
        const isImageParagraph =
          content.length > 0 &&
          Array.isArray(content[0]) &&
          content[0][0] === 'img'
        if (isImageParagraph) return false
      }

      return tag === 'p'
    })

    return bioElements.length > 0 ? { type: 'root', value: bioElements } : null
  })

  // Extract image path - try multiple approaches
  const imagePath = computed(() => {
    // First, check if there's a direct imagePath in the data
    if (props.modalData?.imagePath) {
      return props.modalData.imagePath
    }

    // Try to extract from body.value array
    if (props.modalData?.body?.value) {
      // body.value is an array of elements [[tag, attrs, content], ...]
      for (const element of props.modalData.body.value) {
        if (!Array.isArray(element)) continue

        const [tag, attrs, content] = element

        // Check for direct img tag
        if (tag === 'img' && attrs?.src) {
          return attrs.src
        }

        // Check for paragraph containing an image
        if (tag === 'p' && Array.isArray(content)) {
          for (const child of content) {
            if (Array.isArray(child) && child[0] === 'img' && child[1]?.src) {
              return child[1].src
            }
          }
        }
      }
    }

    // Fallback: construct path based on profile name and status
    if (props.modalData?.meta?.profile && props.modalData?.meta?.status) {
      // Normalize profile name: remove accents, periods, and replace spaces
      const profileName = props.modalData.meta.profile
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/\./g, '') // Remove periods
        .replace(/ /g, '-')
      const folder = props.modalData.meta.status === 'hero' ? 'heroes' : 'zeros'
      return `/profiles/${folder}/${profileName}.webp`
    }

    return ''
  })

  // Extract bio text from body.value array (skip image paragraph, get text from other paragraphs)
  const bioText = computed(() => {
    if (!props.modalData?.body?.value) return ''

    // Recursive function to extract HTML from nested content
    const extractHTML = (content) => {
      if (typeof content === 'string') {
        return content
      }
      if (Array.isArray(content)) {
        // Skip image tags completely
        if (content[0] === 'img') {
          return ''
        }
        if (content[0] === 'em') {
          // Italic text
          return `<em>${extractHTML(content[2])}</em>`
        }
        if (content[0] === 'strong') {
          // Bold text
          return `<strong>${extractHTML(content[2])}</strong>`
        }
        // Array of mixed content
        return content.map(extractHTML).join('')
      }
      return ''
    }

    const htmlParts = []
    for (const element of props.modalData.body.value) {
      if (!Array.isArray(element)) continue

      const [tag, attrs, content] = element

      // Skip h2 (heading) and image paragraphs
      if (tag === 'h2') continue

      if (tag === 'p') {
        // Check if this is an image paragraph
        const isImageParagraph =
          Array.isArray(content) &&
          content.length > 0 &&
          Array.isArray(content[0]) &&
          content[0][0] === 'img'

        if (!isImageParagraph) {
          // Regular text paragraph
          if (typeof content === 'string') {
            htmlParts.push(content)
          } else if (Array.isArray(content)) {
            htmlParts.push(extractHTML(content))
          }
        }
      }
    }

    return htmlParts.join(' ').trim()
  })

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'profile')
  })

  // Prepare profile data for image generation
  const profileData = computed(() => ({
    meta: {
      profile: props.modalData?.meta?.profile || '',
      status: props.modalData?.meta?.status || '',
    },
    bio: bioText.value,
    imagePath: imagePath.value,
    _path: props.modalData?.path || '',
  }))

  // Handle share shelf animation timing
  watch(
    () => props.show,
    (isVisible) => onToggle(!!isVisible),
    { immediate: true }
  )
</script>

<style scoped>
  /* Style for bio content with proper markdown rendering */
  .prose-bio :deep(h2) {
    display: none; /* Hide h2 headings */
  }

  .prose-bio :deep(img) {
    display: none; /* Hide images */
  }

  .prose-bio :deep(p) {
    font-size: 1.25rem;
    line-height: 1.4;
    color: white;
    margin: 0; /* Remove default paragraph margins */
    text-wrap: pretty;
  }

  .prose-bio :deep(em) {
    font-style: italic;
  }

  .prose-bio :deep(strong) {
    font-weight: bold;
  }

  @media (min-width: 640px) {
    .prose-bio :deep(p) {
      font-size: 1.25rem;
    }
  }
</style>
