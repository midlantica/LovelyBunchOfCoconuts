<template>
  <div class="relative z-10" ref="buttonRef">
    <button
      @click="handleClick"
      class="relative z-10 flex items-center justify-center rounded-lg text-theme-icon transition-all duration-200 hover:cursor-pointer! hover:text-theme-body hover:brightness-110"
      :aria-label="ariaLabel"
      :style="[{ backgroundColor: 'var(--color-share-btn-bg)' }, buttonStyle]"
    >
      <slot name="icon">
        <Icon v-if="iconName" :name="iconName" :size="iconSize" />
      </slot>
    </button>

    <!-- Toast notification -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="showToast"
        class="border-theme-border bg-theme-elevated text-theme-body pointer-events-none absolute bottom-full left-1/2 z-9999 mb-2 -translate-x-1/2 transform rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap shadow-lg"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
  const props = defineProps({
    iconName: { type: String, required: true },
    ariaLabel: { type: String, required: true },
    toastMessage: { type: String, required: true },
    toastDuration: { type: Number, default: 2000 },
    iconSize: { type: String, default: '1.3rem' },
    buttonStyle: { type: [String, Object], default: null },
  })

  const emit = defineEmits(['click', 'toast-show', 'toast-hide'])

  const showToast = ref(false)
  const toastTimeout = ref(null)

  // Handle button click - show toast and emit click event
  const handleClick = () => {
    emit('click')

    // Clear any existing timeout
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value)
    }

    // Show toast
    showToast.value = true
    emit('toast-show')

    // Hide toast after duration
    toastTimeout.value = setTimeout(() => {
      showToast.value = false
      emit('toast-hide')
    }, props.toastDuration)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value)
    }
  })
</script>
