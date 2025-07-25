<template>
  <div class="relative" ref="buttonRef">
    <button
      @click="handleClick"
      class="flex justify-center items-center bg-transparent hover:bg-gray-500 p-2.5 rounded-lg text-gray-400 hover:text-white transition-colors"
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
        }"
        class="bg-seagull-950 shadow-lg px-5 py-2 rounded-lg text-white text-lg whitespace-nowrap"
      >
        {{ toastMessage }}
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
  import { ref, onMounted } from 'vue'

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

  // Expose method to clear toast (for parent coordination)
  defineExpose({
    clearToast,
  })
</script>
