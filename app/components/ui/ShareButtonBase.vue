<template>
  <div class="z-10 relative" ref="buttonRef">
    <button
      @click="handleClick"
      class="z-10 relative flex justify-center items-center bg-transparent hover:brightness-150 rounded-lg text-gray-400 hover:text-white transition-all duration-200 hover:cursor-pointer"
      :aria-label="ariaLabel"
    >
      <Icon :name="iconName" size="1.3rem" />
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
          pointerEvents: 'none',
        }"
        class="bg-black shadow-md px-2.5 py-1 border border-white/30 rounded-md text-white text-sm uppercase tracking-wider whitespace-nowrap"
        role="status"
        aria-live="polite"
      >
        {{ toastMessage }}
        <!-- Arrow pointing up with white border -->
        <!-- White border arrow (slightly larger, positioned behind) -->
        <div
          class="absolute border-transparent border-r-[6px] border-b-[6px] border-b-white/30 border-l-[6px] w-0 h-0"
          :style="{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }"
        ></div>
        <!-- Black arrow (on top) -->
        <div
          class="absolute border-transparent border-r-[5px] border-b-[5px] border-b-black border-l-[5px] w-0 h-0"
          :style="{ top: '-5px', left: '50%', transform: 'translateX(-50%)' }"
        ></div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  const props = defineProps({
    iconName: { type: String, required: true },
    ariaLabel: { type: String, required: true },
    toastMessage: { type: String, required: true },
    toastDuration: { type: Number, default: 2000 },
  })

  const emit = defineEmits(['click', 'toast-show', 'toast-hide'])

  const buttonRef = ref(null)
  const buttonRect = ref(null)
  const showToast = ref(false)

  // Function to get button position
  const getButtonPosition = () => {
    if (!buttonRef.value) return null
    return buttonRef.value.getBoundingClientRect()
  }

  // Clear toast
  const clearToast = () => {
    showToast.value = false
    buttonRect.value = null
    emit('toast-hide')
  }

  // Handle button click
  const handleClick = async () => {
    // Capture button position before showing toast
    buttonRect.value = getButtonPosition()

    // Show toast
    showToast.value = true
    emit('toast-show')

    // Emit click event for parent to handle
    emit('click')

    // Auto-hide toast after duration
    setTimeout(() => {
      clearToast()
    }, props.toastDuration)
  }

  // Reposition toast on scroll/resize
  if (import.meta.client) {
    const updatePosition = () => {
      if (!showToast.value) return
      buttonRect.value = getButtonPosition()
    }
    onMounted(() => {
      window.addEventListener('scroll', updatePosition, { passive: true })
      window.addEventListener('resize', updatePosition)
    })
    onUnmounted(() => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    })
  }

  // Expose method to clear toast (for parent coordination)
  defineExpose({
    clearToast,
  })
</script>
