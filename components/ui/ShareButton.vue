<template>
  <div class="flex justify-center gap-2 mt-4">
    <div class="flex items-center gap-2">
      <button
        @click="shareToTwitter"
        class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
        aria-label="Share on Twitter"
      >
        <Icon name="mdi:twitter" size="1.2rem" />
      </button>

      <!-- Twitter share feedback -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <span
          v-if="shared === 'twitter'"
          class="font-medium text-blue-400 text-sm whitespace-nowrap"
        >
          Opening X...
        </span>
      </transition>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="shareToFacebook"
        class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
        aria-label="Share on Facebook"
      >
        <Icon name="mdi:facebook" size="1.2rem" />
      </button>

      <!-- Facebook share feedback -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <span
          v-if="shared === 'facebook'"
          class="font-medium text-blue-600 text-sm whitespace-nowrap"
        >
          Opening Facebook...
        </span>
      </transition>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="copyLink"
        class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
        aria-label="Copy link"
      >
        <Icon name="mdi:link" size="1.2rem" />
      </button>

      <!-- Toast message that appears next to the copy button -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <span
          v-if="copied"
          class="font-medium text-green-400 text-sm whitespace-nowrap"
        >
          Link copied!
        </span>
      </transition>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String, default: null },
    imageFile: { type: File, default: null },
    generatedImageBlob: { type: Blob, default: null },
    contentType: { type: String, default: 'general' }, // 'claim', 'quote', 'meme', 'general'
  })

  const copied = ref(false)
  const shared = ref('')

  // Format text based on content type
  const formattedText = computed(() => {
    if (props.contentType === 'claim') {
      // Claims: NPC icon + Title, Player icon + Translation
      const parts = props.text.split(' - ')
      if (parts.length >= 2) {
        return `🤡 ${parts[0]}\n😎 ${parts[1]}`
      }
      return `🤡 ${props.text}`
    } else if (props.contentType === 'quote') {
      // Quotes: Remove double quotes and HTML entities, keep single quotes and attribution
      return props.text
        .replace(/&quot;/g, '"')
        .replace(/^"|"$/g, '')
        .replace(/^"/, '"')
        .replace(/"$/, '"')
    } else if (props.contentType === 'meme') {
      // Memes: Just the title/description, clean and simple
      return props.title
    }
    return props.text
  })

  const shareToTwitter = async () => {
    // Show feedback
    shared.value = 'twitter'
    setTimeout(() => {
      shared.value = ''
    }, 2000)

    let imageFile = props.imageFile
    let shareUrl = props.url

    // If we have a generated image blob, use it
    if (props.generatedImageBlob) {
      imageFile = new File([props.generatedImageBlob], 'share-image.png', {
        type: 'image/png',
      })
    }

    // For development, convert localhost to production domain but keep the path
    if (shareUrl.includes('localhost')) {
      shareUrl = shareUrl.replace(
        'http://localhost:3000',
        'https://wakeupnpc.com'
      )
    }

    // For memes, prioritize image sharing over text
    if (props.contentType === 'meme' && imageFile) {
      // Try native share first (mobile/modern browsers) - this will show the image
      if (navigator.share) {
        try {
          await navigator.share({
            title: props.title,
            text: formattedText.value,
            url: shareUrl,
            files: [imageFile],
          })
          return
        } catch (err) {
          console.log('Native share failed, falling back to URL share')
        }
      }
    }

    // Try native share for other content types
    if (navigator.share && imageFile && props.contentType !== 'meme') {
      try {
        await navigator.share({
          title: props.title,
          text: formattedText.value,
          url: shareUrl,
          files: [imageFile],
        })
        return
      } catch (err) {
        console.log('Native share failed, falling back to URL share')
      }
    }

    // Fallback to URL sharing
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(formattedText.value)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = () => {
    // Show feedback
    shared.value = 'facebook'
    setTimeout(() => {
      shared.value = ''
    }, 2000)

    let shareUrl = props.url

    // For development, convert localhost to production domain but keep the path
    if (shareUrl.includes('localhost')) {
      shareUrl = shareUrl.replace(
        'http://localhost:3000',
        'https://wakeupnpc.com'
      )
    }

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(formattedText.value)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(props.url)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = props.url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }
</script>
