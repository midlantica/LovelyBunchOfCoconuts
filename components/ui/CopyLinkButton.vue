<template>
  <ShareButtonBase
    ref="buttonBase"
    icon-name="mdi:link"
    aria-label="Copy link"
    toast-message="Link copied"
    @click="copyLink"
    @toast-show="onToastShow"
  />
</template>

<script setup>
  import { ref } from 'vue'
  import ShareButtonBase from './ShareButtonBase.vue'

  const props = defineProps({
    url: { type: String, required: true },
  })

  const emit = defineEmits(['toast-show'])

  const buttonBase = ref(null)

  const copyLink = async () => {
    console.log('🔗 Copy link clicked')

    try {
      await navigator.clipboard.writeText(props.url.trim())
      console.log('✅ Link copied')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = props.url.trim()
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('✅ Link copied (fallback)')
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
