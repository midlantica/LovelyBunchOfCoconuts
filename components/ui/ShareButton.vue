<template>
  <div class="flex justify-center gap-2 mt-4">
    <div class="flex items-center gap-2">
      <button
        @click="shareToTwitter"
        class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
        aria-label="Share on Twitter"
      >
        <Icon name="simple-icons:x" size="1.2rem" />
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
        aria-label="Copy text for Facebook"
      >
        <Icon name="mdi:content-copy" size="1.2rem" />
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
          Copying text...
        </span>
        <span
          v-else-if="shared === 'facebook-copied'"
          class="font-medium text-green-400 text-sm whitespace-nowrap"
        >
          Text + link copied! Paste anywhere.
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
      // Quotes: Clean up quotes and HTML entities, prevent double quotes
      let cleanText = props.text
        .replace(/&quot;/g, '"')
        .replace(/^[""]|[""]$/g, '') // Remove opening/closing quotes from entire string
        .replace(/^"|"$/g, '') // Remove any remaining straight quotes from entire string
        .replace(/"+\s*—/g, '" —') // Fix double quotes before attribution dash
        .replace(/"+\s*-\s*/g, '" - ') // Fix double quotes before attribution dash (with spaces)
        .replace(/"+$/g, '') // Remove any quotes at the very end of the string
        .trim()

      // Split the text into quote and attribution
      const dashMatch = cleanText.match(/^(.+?)\s+(—\s*.+)$/)
      if (dashMatch) {
        const [, quoteText, attribution] = dashMatch
        return `"${quoteText.replace(/^"|"$/g, '').trim()}" ${attribution}`
      }

      // Fallback: if no attribution found, just add quotes around the whole thing
      return `"${cleanText}"`
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

    let shareUrl = props.url.trim()

    // For development, convert localhost to production domain but keep the path
    if (shareUrl.includes('localhost')) {
      shareUrl = shareUrl.replace(
        'http://localhost:3000',
        'https://wakeupnpc.com'
      )
    }

    // Always use URL sharing for X/Twitter (don't use navigator.share)
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(formattedText.value)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = async () => {
    // Show feedback
    shared.value = 'facebook'

    try {
      let shareUrl = props.url.trim()

      // For development, convert localhost to production domain but keep the path
      if (shareUrl.includes('localhost')) {
        shareUrl = shareUrl.replace(
          'http://localhost:3000',
          'https://wakeupnpc.com'
        )
      }

      // Simple text + URL copy for Facebook
      const shareText = `${formattedText.value}\n\n${shareUrl}`
      await navigator.clipboard.writeText(shareText)

      shared.value = 'facebook-copied'
      setTimeout(() => {
        shared.value = ''
      }, 3000)
    } catch (err) {
      console.log('❌ Facebook sharing error:', err)
      shared.value = 'facebook'
      setTimeout(() => {
        shared.value = ''
      }, 2000)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(props.url.trim())
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = props.url.trim()
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
