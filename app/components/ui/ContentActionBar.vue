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
      class="absolute -top-2 w-full rounded-b-lg border-b-[0.05em] border-[#7c7c7c4a] bg-[#1b1b1b] px-3 pt-4 pb-2 sm:px-3.5"
    >
      <div class="flex items-center gap-4">
        <!-- Share cluster flush left -->
        <div class="flex flex-1 items-center gap-3">
          <!-- Copy and Download buttons -->
          <div class="flex items-center gap-2">
            <!-- Copy image icon button -->
            <button
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
              <svg
                viewBox="0 0 24 24"
                class="h-[1.5rem] w-[1.5rem] transition-all duration-200"
                :class="
                  disableCopyImage
                    ? 'opacity-40'
                    : isCopying
                      ? 'brightness-150'
                      : 'group-hover:brightness-150'
                "
                :style="
                  disableCopyImage
                    ? 'color: #6b7280'
                    : isCopying
                      ? 'color: #33c3fd'
                      : 'color: #b3b3b3'
                "
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 22H4a2 2 0 0 1-2-2V6" />
                <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
                <circle cx="12" cy="8" r="2" />
                <rect width="16" height="16" x="6" y="2" rx="2" />
              </svg>
            </button>

            <!-- Download image icon button -->
            <button
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
              <svg
                viewBox="0 0 24 24"
                class="h-[1.5rem] w-[1.5rem] transition-all duration-200"
                :class="
                  disableCopyImage
                    ? 'opacity-40'
                    : isDownloading
                      ? 'brightness-150'
                      : 'group-hover:brightness-150'
                "
                :style="
                  disableCopyImage
                    ? 'color: #6b7280'
                    : isDownloading
                      ? 'color: #33c3fd'
                      : 'color: #b3b3b3'
                "
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"
                />
                <path d="m14 19l3 3v-5.5m0 5.5l3-3" />
                <circle cx="9" cy="9" r="2" />
              </svg>
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
    try {
      // Simply copy the URL to clipboard
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(props.url)
        // Show toast notification
        const toast = document.createElement('div')
        toast.className = 'share-toast'
        toast.textContent = 'Link copied!'
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1e293b;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          border: 1px solid #475569;
          z-index: 9999;
          font-family: Arial, sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: toastSlideIn 0.3s ease-out;
        `
        document.body.appendChild(toast)
        setTimeout(() => {
          toast.style.animation = 'toastSlideOut 0.3s ease-in'
          setTimeout(() => {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast)
            }
          }, 300)
        }, 3000)
      } else {
        // Enhanced fallback for Windows compatibility
        const textArea = document.createElement('textarea')
        textArea.value = props.url
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
          // Show success toast
          const toast = document.createElement('div')
          toast.className = 'share-toast'
          toast.textContent = 'Link copied!'
          toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e293b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #475569;
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: toastSlideIn 0.3s ease-out;
          `
          document.body.appendChild(toast)
          setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-in'
            setTimeout(() => {
              if (toast.parentNode) {
                toast.parentNode.removeChild(toast)
              }
            }, 300)
          }, 3000)
        } else {
          throw new Error('execCommand copy failed')
        }
      }
    } catch (error) {
      console.error('Error copying text:', error)
      // Show error toast
      const toast = document.createElement('div')
      toast.className = 'share-toast'
      toast.textContent = 'Copy failed - please try Ctrl+C'
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 3000)
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
