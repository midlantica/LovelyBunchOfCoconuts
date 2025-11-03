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
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center overscroll-contain"
        @click.self="handleBackdropClick"
      >
        <div
          ref="modalEl"
          class="modal-frame relative -top-8 mx-0 flex flex-col rounded-none shadow-lg sm:mx-6 sm:rounded-lg"
          :style="computedModalStyle"
          @click.stop
        >
          <!-- Close button now always visible (works on all screens) -->
          <UiCloseButton
            v-if="!hideCloseButton"
            class="absolute top-2 right-2 z-10 block"
            @click="onCloseClick"
          />
          <div
            class="relative flex w-full flex-col overflow-x-visible overflow-y-visible sm:w-auto"
          >
            <div class="min-h-0 flex-1">
              <slot name="mainPanel" />
            </div>
            <div class="relative shrink-0">
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

<style>
  /* Modal frame sizing - wraps to content width */
  /* Meme modals can be wider (up to 1000px) to accommodate large images */
  .modal-frame {
    max-width: min(1000px, calc(100vw - 4rem)) !important;
    width: auto !important;
  }

  /* For smaller screens, use full width */
  @media (max-width: 640px) {
    .modal-frame {
      width: 100% !important;
      max-width: 100% !important;
    }
  }
</style>
