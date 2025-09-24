<template>
  <transition
    enter-active-class="transition-all duration-100 cubic-bezier(0.34, 1.56, 0.64, 1)"
    enter-from-class="transform opacity-0 scale-y-0 scale-x-95 translate-y-[-12px] origin-top"
    enter-to-class="transform opacity-100 scale-y-100 scale-x-100 translate-y-0 origin-top"
    leave-active-class="transition-all duration-50 ease-in"
    leave-from-class="transform opacity-100 scale-y-100 scale-x-100 translate-y-0 origin-top"
    leave-to-class="transform opacity-0 scale-y-0 scale-x-98 translate-y-[-6px] origin-top"
  >
    <div
      v-if="show"
      class="-top-2 absolute bg-slate-900 px-3 sm:px-3.5 pt-4 pb-2 rounded-b-lg w-full"
    >
      <div class="flex items-center gap-4">
        <!-- Share cluster flush left -->
        <div class="flex flex-1 items-center gap-3">
          <!-- Copy image button -->
          <UiShareButtonBase
            icon-name="stash:image-plus-light"
            aria-label="Copy meme image"
            toast-message="Image copied!"
            icon-size="1.7rem"
            :button-style="{ position: 'relative', top: '0.5px' }"
            @click="copyImageOnly"
            @toast-show="onToastShow"
          />
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

  // Button refs for coordination
  const copyButton = ref(null)

  // Handle toast coordination - clear others when one shows
  const onToastShow = (buttonType) => {
    if (buttonType !== 'copy') copyButton.value?.clearToast()
  }

  // Copy image only
  const copyImageOnly = async () => {
    try {
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

      // Copy just the image
      await shareToPlatform(content, props.contentType, 'image')
    } catch (error) {
      console.error('Error copying image:', error)
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
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = props.url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error copying text:', error)
    }
  }
</script>
