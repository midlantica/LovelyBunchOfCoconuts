<template>
  <div class="relative" ref="buttonRef">
    <button
      @click="handleClick"
      class="flex justify-center items-center bg-transparent hover:bg-gray-500 p-2.5 rounded-lg text-gray-400 hover:text-white transition-colors"
      aria-label="Copy text for Facebook"
    >
      <Icon name="mdi:content-copy" size="1.3rem" />
    </button>
  </div>

  <!-- Teleported toast -->
  <teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-1 opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="-translate-y-1 opacity-0 scale-95"
    >
      <div
        v-if="showToast && buttonRect"
        :style="{
          position: 'fixed',
          left: buttonRect.left + buttonRect.width / 2 + 'px',
          top: buttonRect.bottom + 8 + 'px',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }"
        class="bg-seagull-950 shadow-lg px-5 py-2 rounded-lg text-white text-lg whitespace-nowrap"
      >
        {{ currentToastMessage }}
        <!-- Arrow pointing up -->
        <div
          class="absolute border-transparent border-r-8 border-b-8 border-b-seagull-950 border-l-8 w-0 h-0"
          :style="{
            top: '-7px',
            left: '50%',
            transform: 'translateX(-50%)',
          }"
        ></div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    contentType: { type: String, default: 'general' },
  })

  const emit = defineEmits(['toast-show'])

  const buttonRef = ref(null)
  const buttonRect = ref(null)
  const showToast = ref(false)
  const isLoading = ref(false)
  const isCopied = ref(false)

  // Current toast message based on state
  const currentToastMessage = computed(() => {
    if (isLoading.value) return 'Copying text...'
    if (isCopied.value) return 'Text + link copied! Paste anywhere.'
    return 'Copying text...'
  })

  // Format text based on content type
  const formattedText = computed(() => {
    if (props.contentType === 'claim') {
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
      return `"${cleanText}"`
    } else if (props.contentType === 'meme') {
      return props.title
    }
    return props.text
  })

  // Function to get button position
  const getButtonPosition = () => {
    if (!buttonRef.value) return null
    return buttonRef.value.getBoundingClientRect()
  }

  // Clear toast
  const clearToast = () => {
    showToast.value = false
    buttonRect.value = null
    isLoading.value = false
    isCopied.value = false
  }

  const handleClick = async () => {
    console.log('📘 Facebook share clicked')

    // Capture button position before showing toast
    buttonRect.value = getButtonPosition()

    // Show loading toast
    isLoading.value = true
    isCopied.value = false
    showToast.value = true
    emit('toast-show', 'facebook')

    try {
      let shareUrl = props.url.trim()
      if (shareUrl.includes('localhost')) {
        shareUrl = shareUrl.replace(
          'http://localhost:3000',
          'https://wakeupnpc.com'
        )
      }

      const shareText = `${formattedText.value}\n\n${shareUrl}`
      await navigator.clipboard.writeText(shareText)

      // Switch to success state
      isLoading.value = false
      isCopied.value = true
      console.log('✅ Facebook text copied')

      // Hide after 3 seconds
      setTimeout(() => {
        clearToast()
      }, 3000)
    } catch (err) {
      console.log('❌ Facebook sharing error:', err)
      clearToast()
    }
  }

  // Expose method to clear toast
  defineExpose({
    clearToast,
  })
</script>
