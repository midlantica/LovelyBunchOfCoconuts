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

      // Try modern clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // Enhanced fallback for Windows compatibility
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
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

        if (!successful) {
          throw new Error('execCommand copy failed')
        }
      }
    } catch (err) {
      console.warn('Copy failed:', err)
      // Show user-friendly error message
      if (typeof window !== 'undefined') {
        const toast = document.createElement('div')
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
  }

  const onToastShow = () => {
    emit('toast-show', 'copy')
  }

  // Expose method to clear toast
  defineExpose({
    clearToast: () => buttonBase.value?.clearToast(),
  })
</script>
