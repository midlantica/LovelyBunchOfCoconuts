<template>
  <teleport to="#modal-root">
    <transition
      enter-active-class="modal-enter-active"
      enter-from-class="modal-enter-from"
      enter-to-class="modal-enter-to"
      leave-active-class="modal-leave-active"
      leave-from-class="modal-leave-from"
      leave-to-class="modal-leave-to"
    >
      <div
        v-if="show"
        class="z-50 fixed inset-0 flex justify-center items-center overscroll-contain modal-overlay"
        @click.self="handleBackdropClick"
      >
        <div
          ref="modalEl"
          class="-top-8 relative flex flex-col shadow-lg mx-0 sm:mx-6 rounded-none sm:rounded-lg modal-frame"
          :style="computedModalStyle"
          :class="[modalStyle ? '' : 'w-full sm:min-w-[60vw] sm:max-w-[500px]']"
          @click.stop
        >
          <!-- Close button now always visible (works on all screens) -->
          <UiCloseButton
            v-if="!hideCloseButton"
            class="block top-2 right-2 z-10 absolute"
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
    </transition>
  </teleport>
</template>

<script setup>
  const props = defineProps({
    show: { type: Boolean, default: false },
    modalStyle: { type: Object, default: null },
    hideCloseButton: { type: Boolean, default: false },
  })

  const emit = defineEmits(['close'])
  const injectedClose = inject('closeModal', null)
  const modalEl = ref(null)

  // Shared guard to prevent click-through reopening
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  const computedModalStyle = computed(() => {
    const baseStyle = props.modalStyle || {
      maxHeight: '90vh',
      isolation: 'isolate',
    }
    return baseStyle
  })

  const handleBackdropClick = (e) => {
    e.stopPropagation()
    modalGuardUntil.value = Date.now() + 150
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
    modalGuardUntil.value = Date.now() + 150
    emit('close')
    if (injectedClose) {
      requestAnimationFrame(() => {
        if (props.show) injectedClose()
      })
    }
  }

  function handleEscape(e) {
    if (props.show && e.key === 'Escape') {
      e.stopPropagation()
      modalGuardUntil.value = Date.now() + 150
      emit('close')
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscape, true)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape, true)
  })

  // Prevent background page scroll while modal is open (does not block inner scroll areas)
  watch(
    () => props.show,
    (open) => {
      if (import.meta.client) {
        const root = document.documentElement
        if (open) {
          root.style.overflow = 'hidden'
        } else {
          root.style.overflow = ''
        }
      }
    },
    { immediate: true }
  )
</script>

<style scoped>
  /* Fix close button X centering */
  :deep(.absolute.top-2.right-2) {
    padding-top: 0 !important;
  }

  .modal-overlay {
    background-color: rgba(0, 0, 0, 0.8);
    transition: background-color 300ms ease-out;
  }

  .modal-enter-active {
    transition: all 300ms ease-out;
  }

  .modal-leave-active {
    transition: all 200ms ease-in;
  }

  .modal-enter-from {
    opacity: 0;
    transform: scale(0.95);
  }

  .modal-enter-to {
    opacity: 1;
    transform: scale(1);
  }

  .modal-leave-from {
    opacity: 1;
    transform: scale(1);
  }

  .modal-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
</style>
