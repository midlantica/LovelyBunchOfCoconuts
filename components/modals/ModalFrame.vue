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
        class="relative flex flex-col shadow-lg mx-0 sm:mx-6 rounded-none sm:rounded-lg modal-frame"
        :style="
          modalStyle
            ? { ...modalStyle, isolation: 'isolate' }
            : { maxHeight: '90vh', isolation: 'isolate' }
        "
        :class="[modalStyle ? '' : 'w-full sm:min-w-[60vw] sm:max-w-[500px]']"
        @click.stop
      >
        <UiCloseButton @click="onCloseClick" />
        <div class="relative w-full overflow-x-visible overflow-y-visible">
          <slot name="mainPanel" />
          <slot name="sharePanel" />
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

  // Shared guard to prevent click-through reopening
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  const handleBackdropClick = (e) => {
    e.stopPropagation()
    modalGuardUntil.value = Date.now() + 450
    emit('close')
  }

  const onCloseClick = (e) => {
    e?.stopPropagation?.()
    modalGuardUntil.value = Date.now() + 450
    emit('close')
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
