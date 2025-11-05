<!-- components/modals/ModalProfile.vue -->
<template>
  <client-only>
    <ModalsModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <template #mainPanel>
        <!-- Main Content Panel -->
        <div
          class="card shadow-modal relative z-10 w-full max-w-[800px] min-w-1/2 rounded-none p-4 sm:rounded-lg sm:px-7 sm:py-6"
        >
          <!-- Main content: image left, text right (stacks on mobile) -->
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <!-- Profile image (left on desktop, top on mobile) -->
            <div class="flex-shrink-0">
              <img
                v-if="imagePath"
                :src="imagePath"
                :alt="modalData.profile"
                class="h-24 w-24 rounded-lg object-cover sm:h-40 sm:w-40"
              />
            </div>

            <!-- Text content (right on desktop, bottom on mobile) -->
            <div
              class="flex min-w-0 flex-1 flex-col justify-center gap-2 sm:gap-3"
            >
              <!-- Name with hero/zero icon -->
              <div class="flex items-center gap-2">
                <!-- Hero icon -->
                <div
                  v-if="modalData?.meta?.status === 'hero'"
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20"
                  title="Hero"
                >
                  <svg
                    class="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"
                    />
                  </svg>
                </div>
                <!-- Zero icon -->
                <div
                  v-else-if="modalData?.meta?.status === 'zero'"
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20"
                  title="Zero"
                >
                  <svg
                    class="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"
                    />
                  </svg>
                </div>
                <h1
                  class="text-seagull-200 uppercase"
                  style="
                    font-family: 'Barlow Condensed';
                    font-size: 20.35px;
                    font-weight: 400;
                    line-height: 23px;
                    letter-spacing: 0.407px;
                  "
                >
                  {{ modalData?.meta?.profile }}
                </h1>
              </div>

              <!-- Bio text with scroll -->
              <div
                v-if="bioText"
                ref="bodyRef"
                class="scroll-area relative max-h-[25vh] overflow-y-auto pr-3 sm:max-h-[40vh]"
              >
                <p
                  class="text-base text-white/90 sm:text-xl"
                  style="line-height: 1.4"
                >
                  {{ bioText }}
                </p>
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
          :disable-copy-image="true"
          content-type="profile"
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

  // Extract image path from body.value array (minimark format)
  const imagePath = computed(() => {
    if (!props.modalData?.body?.value) return ''

    // body.value is an array of elements [[tag, attrs, content], ...]
    for (const element of props.modalData.body.value) {
      if (Array.isArray(element) && element[0] === 'p') {
        // Check if this paragraph contains an image
        const content = element[2]
        if (Array.isArray(content) && content[0] === 'img') {
          return content[1]?.src || ''
        }
      }
    }

    return ''
  })

  // Extract bio text from body.value array (skip image paragraph, get text from other paragraphs)
  const bioText = computed(() => {
    if (!props.modalData?.body?.value) return ''

    const textParts = []
    for (const element of props.modalData.body.value) {
      if (!Array.isArray(element)) continue

      const [tag, attrs, content] = element

      // Skip h2 (heading), get paragraph text (but skip image paragraphs)
      if (tag === 'p' && typeof content === 'string') {
        textParts.push(content)
      }
    }

    return textParts.join(' ').trim()
  })

  // Create shareable URL
  const shareUrl = computed(() => {
    if (!props.modalData) return window.location.href
    return generateContentUrl(props.modalData, 'profile')
  })

  // Handle share shelf animation timing
  watch(
    () => props.show,
    (isVisible) => onToggle(!!isVisible),
    { immediate: true }
  )
</script>

<style scoped>
  .scroll-area {
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: #0089cc rgba(255, 255, 255, 0.08);
  }
  .scroll-area::-webkit-scrollbar {
    width: 5px;
  }
  .scroll-area::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
  }
  .scroll-area::-webkit-scrollbar-thumb {
    background: #0089cc;
    border-radius: 6px;
  }
  .scroll-area::-webkit-scrollbar-thumb:hover {
    background: #09acee;
  }
</style>
