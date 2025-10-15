<template>
  <UiShareButtonBase
    ref="buttonBase"
    icon-name="simple-icons:x"
    aria-label="Share on Twitter"
    toast-message="Opening X..."
    @click="shareToTwitter"
    @toast-show="onToastShow"
  />
</template>

<script setup>
  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    contentType: { type: String, default: 'general' },
  })

  const emit = defineEmits(['toast-show'])

  const buttonBase = ref(null)

  // Format text based on content type
  const formattedText = computed(() => {
    if (props.contentType === 'grift') {
      const parts = props.text.split(' - ')
      if (parts.length >= 2) {
        return `🤡 ${parts[0]}\n😎 ${parts[1]}`
      }
      return `🤡 ${props.text}`
    } else if (props.contentType === 'quote') {
      let cleanText = props.text
        .replace(/&quot;/g, '"')
        .replace(/^[""]|[""]$/g, '')
        .replace(/^"|"$/g, '')
        .replace(/"+\s*—/g, '" —')
        .replace(/"+\s*-\s*/g, '" - ')
        .replace(/"+$/g, '')
        .trim()

      const dashMatch = cleanText.match(/^(.+?)\s+(—\s*.+)$/)
      if (dashMatch) {
        const [, quoteText, attribution] = dashMatch
        return `"${quoteText.replace(/^"|"$/g, '').trim()}" ${attribution}`
      }
      return `"${cleanText}` + '"'
    } else if (props.contentType === 'meme') {
      return props.title
    }
    return props.text
  })

  const shareToTwitter = async () => {
    console.log('🐦 Twitter share clicked')

    let shareUrl = props.url.trim()
    // In development, keep localhost URLs as-is
    // In production, they should already be production URLs

    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      formattedText.value
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const onToastShow = () => {
    emit('toast-show', 'twitter')
  }

  // Expose method to clear toast
  defineExpose({
    clearToast: () => buttonBase.value?.clearToast(),
  })
</script>
