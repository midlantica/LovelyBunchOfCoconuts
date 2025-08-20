<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80 overscroll-contain modal-overlay"
      @click.self="handleBackdropClick"
      @wheel.prevent
      @touchmove.prevent
    >
      <div
        class="-top-8 relative flex flex-col shadow-lg mx-0 sm:mx-6 rounded-none sm:rounded-lg modal-frame"
        :style="
          modalStyle
            ? { ...modalStyle, isolation: 'isolate' }
            : { maxHeight: '90vh', isolation: 'isolate' }
        "
        :class="[modalStyle ? '' : 'w-full sm:min-w-[60vw] sm:max-w-[500px]']"
        @click.stop
      >
        <!-- Close button now always visible (previously hidden on small screens) -->
        <UiCloseButton
          class="hidden md:block top-2 right-2 z-10 absolute"
          @click="onCloseClick"
        />
        <div
          class="relative flex flex-col w-full overflow-x-visible overflow-y-visible"
        >
          <div class="flex-1 min-h-0">
            <slot name="mainPanel" />
          </div>
          <div class="relative flex-shrink-0">
            <slot name="sharePanel" />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
  const props = defineProps({
    show: { type: Boolean, default: false },
    modalStyle: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])
  const injectedClose = inject('closeModal', null)

  // Shared guard to prevent click-through reopening
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  const handleBackdropClick = (e) => {
    e.stopPropagation()
    modalGuardUntil.value = Date.now() + 450
    emit('close')
    // Fallback if parent listener missing or state not updated
    if (injectedClose) {
      requestAnimationFrame(() => {
        if (props.show) injectedClose()
      })
    }
  }

  const onCloseClick = (e) => {
    e?.stopPropagation?.()
    modalGuardUntil.value = Date.now() + 450
    emit('close')
    if (injectedClose) {
      requestAnimationFrame(() => {
        if (props.show) injectedClose()
      })
    }
  }

  function handleEscape(e) {
    if (props.show && (e.key === 'Escape' || e.key === ' ')) {
      e.stopPropagation()
      modalGuardUntil.value = Date.now() + 450
      emit('close')
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscape, true)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape, true)
  })
</script>
