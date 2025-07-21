<template>
  <div class="flex justify-center gap-2 mt-4">
    <button
      @click="shareToTwitter"
      class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
      aria-label="Share on Twitter"
    >
      <Icon name="mdi:twitter" size="1.2rem" />
    </button>

    <button
      @click="shareToFacebook"
      class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
      aria-label="Share on Facebook"
    >
      <Icon name="mdi:facebook" size="1.2rem" />
    </button>

    <button
      @click="downloadImage"
      class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
      aria-label="Download image"
    >
      <Icon name="mdi:download" size="1.2rem" />
    </button>

    <button
      @click="copyLink"
      class="flex justify-center items-center bg-gray-600 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
      aria-label="Copy link"
    >
      <Icon name="mdi:link" size="1.2rem" />
    </button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String, default: null },
    imageFile: { type: File, default: null },
    generatedImageBlob: { type: Blob, default: null },
  })

  const copied = ref(false)

  const shareToTwitter = async () => {
    let imageFile = props.imageFile
    let shareUrl = props.url

    // If we have a generated image blob, use it
    if (props.generatedImageBlob) {
      imageFile = new File([props.generatedImageBlob], 'share-image.png', {
        type: 'image/png',
      })
    }

    // For development, use a more user-friendly URL
    if (shareUrl.includes('localhost')) {
      shareUrl = 'https://wakeupnpc.com' // Replace with your actual domain
    }

    // Try native share first (mobile/modern browsers)
    if (navigator.share && imageFile) {
      try {
        await navigator.share({
          title: props.title,
          text: props.text,
          url: shareUrl,
          files: [imageFile],
        })
        return
      } catch (err) {
        console.log('Native share failed, falling back to URL share')
      }
    }

    // Fallback to URL sharing
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = () => {
    let shareUrl = props.url

    // For development, use a more user-friendly URL
    if (shareUrl.includes('localhost')) {
      shareUrl = 'https://wakeupnpc.com' // Replace with your actual domain
    }

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(props.text)}`
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

  const downloadImage = () => {
    if (props.generatedImageBlob) {
      const url = URL.createObjectURL(props.generatedImageBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${props.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
</script>
