<template>
  <UiShareButtonBase
    ref="buttonBase"
    icon-name="line-md:external-link"
    :icon-size="iconSize"
    aria-label="Copy link"
    toast-message="Link copied"
    :button-style="buttonStyle"
    @click="copyLink"
    @toast-show="onToastShow"
  />
</template>

<script setup>
  const props = defineProps({
    url: { type: String, required: true },
    iconSize: { type: String, default: '1.3rem' },
    buttonStyle: { type: [String, Object], default: null },
  })

  const emit = defineEmits(['toast-show'])

  const buttonBase = ref(null)

  const canonicalUrl = computed(() => {
    let raw = (props.url || '').trim()
    if (!raw) return ''
    // If it's a relative path, prefix with current origin (client only)
    if (!/^https?:\/\//i.test(raw)) {
      if (import.meta.client && typeof window !== 'undefined') {
        const origin = window.location.origin
        if (raw.startsWith('/')) raw = origin + raw
        else raw = origin + '/' + raw
      }
    }
    // In development, keep localhost URLs as-is
    // In production, they should already be production URLs
    return raw
  })

  const copyLink = async () => {
    try {
      const shareUrl = canonicalUrl.value
      if (!shareUrl) return
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.warn('Copy failed, user interaction or permission?', err)
    }
  }

  const onToastShow = () => {
    emit('toast-show', 'copy')
  }

  // Expose method to clear toast
  defineExpose({
    clearToast: () => buttonBase.value?.clearToast(),
  })
</script>
