<template>
  <transition
    enter-active-class="0.64, 1) 1.56, cubic-bezier(0.34, transition-all duration-100"
    enter-from-class="transform translate-y-[-12px] opacity-0 scale-x-95 scale-y-0 origin-top"
    enter-to-class="transform opacity-100 scale-x-100 scale-y-100 translate-y-0 origin-top"
    leave-active-class="duration-50 transition-all ease-in"
    leave-from-class="transform opacity-100 scale-x-100 scale-y-100 translate-y-0 origin-top"
    leave-to-class="scale-x-98 transform translate-y-[-6px] opacity-0 scale-y-0 origin-top"
  >
    <div
      v-if="show"
      class="shadow-share-shelf border-theme-border-subtle absolute -top-2 w-full rounded-b-lg border-b-[0.05em] px-3 pt-4 pb-2 sm:px-3.5"
      :style="{ backgroundColor: 'var(--color-share-shelf-bg)' }"
    >
      <div class="flex items-center gap-4">
        <!-- Share cluster flush left -->
        <div class="flex flex-1 items-center gap-3">
          <!-- Copy and Download buttons (or Copy Text for posts) -->
          <div class="flex items-center gap-2">
            <!-- Copy Text button for posts -->
            <button
              v-if="contentType === 'post'"
              type="button"
              :disabled="isLoading"
              @click="copyTextOnly"
              title="Copy Text"
              class="group inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
              :class="[
                isLoading
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer! hover:scale-105',
              ]"
              aria-label="Copy text to clipboard"
            >
              <IconsCopyText
                :size="24"
                class="transition-all duration-200"
                :class="
                  isCopyingText
                    ? 'brightness-150'
                    : 'group-hover:brightness-150'
                "
                :style="
                  isCopyingText
                    ? 'color: var(--color-accent-hover)'
                    : 'color: var(--color-text-icon)'
                "
              />
            </button>

            <!-- Copy image icon button (for non-post content) -->
            <button
              v-if="contentType !== 'post'"
              type="button"
              :disabled="isLoading || disableCopyImage"
              @click="copyImageOnly"
              :title="
                disableCopyImage
                  ? 'Quote too long to copy as image'
                  : 'Copy Image'
              "
              class="group inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
              :class="[
                disableCopyImage || isLoading
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer! hover:scale-105',
                (disableCopyImage || (!isCopying && isLoading)) && 'opacity-50',
              ]"
              :aria-label="
                disableCopyImage
                  ? 'Quote too long to copy as image'
                  : 'Copy image to clipboard'
              "
            >
              <IconsCopyImage
                :size="24"
                class="transition-all duration-200"
                :class="
                  disableCopyImage
                    ? 'opacity-40'
                    : isCopying
                      ? 'brightness-150'
                      : 'group-hover:brightness-150'
                "
                :style="
                  disableCopyImage
                    ? 'color: var(--color-text-disabled)'
                    : isCopying
                      ? 'color: var(--color-accent-hover)'
                      : 'color: var(--color-text-icon)'
                "
              />
            </button>

            <!-- Download image icon button (for non-post content) -->
            <button
              v-if="contentType !== 'post'"
              type="button"
              :disabled="isLoading || disableCopyImage"
              @click="downloadImage"
              title="Download Image"
              class="group inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
              :class="[
                disableCopyImage || isLoading
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer! hover:scale-105',
                (disableCopyImage || (!isDownloading && isLoading)) &&
                  'opacity-50',
              ]"
              aria-label="Download image"
            >
              <IconsDownloadImage
                :size="24"
                class="transition-all duration-200"
                :class="
                  disableCopyImage
                    ? 'opacity-40'
                    : isDownloading
                      ? 'brightness-150'
                      : 'group-hover:brightness-150'
                "
                :style="
                  disableCopyImage
                    ? 'color: var(--color-text-disabled)'
                    : isDownloading
                      ? 'color: var(--color-accent-hover)'
                      : 'color: var(--color-text-icon)'
                "
              />
            </button>

            <!-- Spinner positioned to the right of icon -->
            <div v-if="isLoading" class="ml-1 flex items-center">
              <Icon
                name="svg-spinners:ring-resize"
                size="1.25rem"
                class="text-slate-300"
              />
            </div>

            <!-- Inline feedback message with blinking animation -->
            <div
              v-if="feedbackMessage"
              class="font-300 mb-1 ml-1 text-base tracking-wider text-slate-200"
              :class="
                feedbackMessage === 'Image copied 😀'
                  ? 'animate-blink-success'
                  : 'animate-pulse'
              "
            >
              {{ feedbackMessage }}
            </div>
          </div>
        </div>
        <!-- Like button flush right -->
        <UiLikeButton
          v-if="contentType && url"
          :id="likeId || url"
          :title="title"
          :count-inside="true"
          :hide-zero="true"
          icon-size="1.8rem"
          @click.stop
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String, default: null },
    imageFile: { type: File, default: null },
    generatedImageBlob: { type: Blob, default: null },
    contentType: { type: String, default: 'general' },
    show: { type: Boolean, default: true },
    likeId: { type: String, default: null },
    disableCopyImage: { type: Boolean, default: false },
    profileData: { type: Object, default: null },
  })

  // Loading and feedback state
  const isLoading = ref(false)
  const feedbackMessage = ref('')
  const isCopying = ref(false) // Track entire copy process
  const isDownloading = ref(false) // Track download process
  const isCopyingText = ref(false) // Track text copy process

  // Button refs for coordination
  const copyButton = ref(null)

  // Handle toast coordination - clear others when one shows
  const onToastShow = (buttonType) => {
    if (buttonType !== 'copy') copyButton.value?.clearToast()
  }

  // Copy image only - must complete synchronously to preserve user gesture
  const copyImageOnly = async () => {
    if (isLoading.value || props.disableCopyImage) return // Prevent multiple clicks or disabled action

    // Start copying process
    isCopying.value = true
    isLoading.value = true
    feedbackMessage.value = ''

    // Set timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
        feedbackMessage.value = 'Request timed out'
        setTimeout(() => {
          feedbackMessage.value = ''
        }, 3000)
      }
    }, 15000) // 15 second timeout

    try {
      // Import composable
      const { useSocialShare } = await import('~/composables/useSocialShare')
      const { shareToPlatform } = useSocialShare()

      // Create content object based on type
      let content
      if (props.contentType === 'profile' && props.profileData) {
        // Use the profile data directly
        content = props.profileData
      } else {
        content = {
          _path: props.likeId, // Include the path for filename generation
          claim: props.contentType === 'grift' ? props.title : null,
          translation: props.contentType === 'grift' ? props.text : null,
          headings: props.contentType === 'quote' ? [props.title] : null,
          attribution: props.contentType === 'quote' ? props.text : null,
          title: props.contentType === 'meme' ? props.title : null,
          description: props.contentType === 'meme' ? props.text : null,
        }
      }

      // Copy just the image - pass feedback callback
      await shareToPlatform(
        content,
        props.contentType,
        'image',
        null,
        (message) => {
          feedbackMessage.value = message
          setTimeout(() => {
            feedbackMessage.value = ''
            isCopying.value = false
          }, 3000)
        }
      )
    } catch (error) {
      console.error('Error copying image:', error)
      feedbackMessage.value = error.message || 'Error copying image'
      setTimeout(() => {
        feedbackMessage.value = ''
        isCopying.value = false
      }, 3000)
    } finally {
      clearTimeout(loadingTimeout)
      isLoading.value = false
    }
  }

  // Download image - saves image with markdown filename
  const downloadImage = async () => {
    if (isLoading.value || props.disableCopyImage) return // Prevent multiple clicks or disabled action

    // Start download process
    isDownloading.value = true
    isLoading.value = true
    feedbackMessage.value = ''

    // Set timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
        feedbackMessage.value = 'Request timed out'
        setTimeout(() => {
          feedbackMessage.value = ''
        }, 3000)
      }
    }, 15000) // 15 second timeout

    try {
      // Import composable
      const { useSocialShare } = await import('~/composables/useSocialShare')
      const { shareToPlatform } = useSocialShare()

      // Create content object based on type
      let content
      if (props.contentType === 'profile' && props.profileData) {
        // Use the profile data directly
        content = props.profileData
      } else {
        content = {
          _path: props.likeId, // Include the path for filename generation
          claim: props.contentType === 'grift' ? props.title : null,
          translation: props.contentType === 'grift' ? props.text : null,
          headings: props.contentType === 'quote' ? [props.title] : null,
          attribution: props.contentType === 'quote' ? props.text : null,
          title: props.contentType === 'meme' ? props.title : null,
          description: props.contentType === 'meme' ? props.text : null,
        }
      }

      // Download the image with proper filename
      await shareToPlatform(
        content,
        props.contentType,
        'download',
        null,
        (message) => {
          feedbackMessage.value = message || 'Image downloaded!'
          setTimeout(() => {
            feedbackMessage.value = ''
            isDownloading.value = false
          }, 3000)
        }
      )

      // Show success feedback
      feedbackMessage.value = 'Image downloaded!'
      setTimeout(() => {
        feedbackMessage.value = ''
        isDownloading.value = false
      }, 3000)
    } catch (error) {
      console.error('Error downloading image:', error)
      feedbackMessage.value = error.message || 'Error downloading image'
      setTimeout(() => {
        feedbackMessage.value = ''
        isDownloading.value = false
      }, 3000)
    } finally {
      clearTimeout(loadingTimeout)
      isLoading.value = false
    }
  }

  // Copy text/URL only
  const copyTextOnly = async () => {
    if (isLoading.value) return // Prevent multiple clicks

    isCopyingText.value = true
    isLoading.value = true
    feedbackMessage.value = ''

    try {
      // Copy the text content to clipboard (for posts, this is the post text)
      const textToCopy = props.contentType === 'post' ? props.text : props.url

      if (!textToCopy || textToCopy.trim() === '') {
        throw new Error('No text to copy')
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy)
        // Show inline feedback
        feedbackMessage.value =
          props.contentType === 'post' ? 'Text copied 😀' : 'Link copied!'
        setTimeout(() => {
          feedbackMessage.value = ''
          isCopyingText.value = false
        }, 3000)
      } else {
        // Enhanced fallback for Windows compatibility
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        textArea.style.opacity = '0'
        textArea.setAttribute('readonly', '')
        textArea.setAttribute('aria-hidden', 'true')

        document.body.appendChild(textArea)

        // Focus and select - important for Windows
        textArea.focus()
        textArea.select()
        textArea.setSelectionRange(0, textArea.value.length)

        // Try execCommand with better error handling
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (successful) {
          // Show inline feedback
          feedbackMessage.value =
            props.contentType === 'post' ? 'Text copied 😀' : 'Link copied!'
          setTimeout(() => {
            feedbackMessage.value = ''
            isCopyingText.value = false
          }, 3000)
        } else {
          throw new Error('execCommand copy failed')
        }
      }
    } catch (error) {
      console.error('Error copying text:', error)
      feedbackMessage.value = error.message || 'Copy failed'
      setTimeout(() => {
        feedbackMessage.value = ''
        isCopyingText.value = false
      }, 3000)
    } finally {
      isLoading.value = false
    }
  }
</script>

<style scoped>
  @keyframes toastSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes toastSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes blink-success {
    0%,
    50%,
    100% {
      opacity: 1;
    }
    25%,
    75% {
      opacity: 0.3;
    }
  }

  .animate-blink-success {
    animation: blink-success 1.2s ease-in-out 2;
  }
</style>
