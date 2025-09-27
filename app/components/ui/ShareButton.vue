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
      class="-top-2 absolute bg-slate-900 px-3 sm:px-3.5 pt-4 pb-2 rounded-b-lg w-full"
    >
      <div class="flex items-center gap-4">
        <!-- Share cluster flush left -->
        <div class="flex flex-1 items-center gap-3">
          <!-- Copy image button using Button.vue -->
          <div class="flex items-center gap-2">
            <UiButton
              text="Copy Image"
              :disabled="isLoading"
              @click="copyImageOnly"
            />

            <!-- Spinner positioned 0.5rem to the right of button -->
            <div v-if="isLoading" class="ml-2">
              <Icon
                name="svg-spinners:ring-resize"
                size="1.25rem"
                class="text-slate-300"
              />
            </div>

            <!-- Inline feedback message with blinking animation -->
            <div
              v-if="feedbackMessage"
              class="mb-1 ml-1 text-slate-200 text-base"
              :class="
                feedbackMessage === 'Image copied'
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
  })

  // Loading and feedback state
  const isLoading = ref(false)
  const feedbackMessage = ref('')

  // Button refs for coordination
  const copyButton = ref(null)

  // Handle toast coordination - clear others when one shows
  const onToastShow = (buttonType) => {
    if (buttonType !== 'copy') copyButton.value?.clearToast()
  }

  // Copy image only
  const copyImageOnly = async () => {
    if (isLoading.value) return // Prevent multiple clicks

    try {
      isLoading.value = true
      feedbackMessage.value = ''

      const { useSocialShare } = await import('~/composables/useSocialShare')

      // Create content object based on type
      const content = {
        claim: props.contentType === 'claim' ? props.title : null,
        translation: props.contentType === 'claim' ? props.text : null,
        headings: props.contentType === 'quote' ? [props.title] : null,
        attribution: props.contentType === 'quote' ? props.text : null,
        title: props.contentType === 'meme' ? props.title : null,
        description: props.contentType === 'meme' ? props.text : null,
      }

      const { shareToPlatform } = useSocialShare()

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
          }, 3000)
        }
      )
    } catch (error) {
      console.error('Error copying image:', error)
      feedbackMessage.value = 'Error copying image'
      setTimeout(() => {
        feedbackMessage.value = ''
      }, 3000)
    } finally {
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
