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
          class="modal-frame relative -top-8 mx-0 flex flex-col rounded-none sm:mx-6 sm:rounded-lg"
          :style="computedModalStyle"
          @click.stop
        >
          <!-- Close button now always visible (works on all screens) -->
          <UiCloseButton
            v-if="!hideCloseButton"
            class="close-button-modal"
            :button-class="closeButtonClass"
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

  // Custom button classes to ensure button is always visible
  const closeButtonClass =
    'close-button group border-seagull-600/30 absolute z-9999 flex h-10 w-10 items-center justify-center rounded-full border-none sm:border-t bg-transparent sm:bg-theme-surface hover:cursor-pointer! focus:outline-none'

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

  /* Default (Desktop) close button positioning - perched on top-right corner */
  .close-button-modal {
    top: 0.5rem;
    right: 0.5rem;
  }

  /* Default (Desktop) close button styling - with background, border, and transform */
  .close-button-modal :deep(.close-button) {
    background: var(--color-bg-surface) !important;
    border-style: solid !important;
    border-width: 1px !important;
    border-color: transparent !important;
    border-top-color: rgb(
      0 137 204 / 0.3
    ) !important; /* seagull-600/30 to match card */
    transform: translate(50%, -50%) !important; /* Position outside corner */
  }

  /* Mobile ONLY - override to tuck inside with no background/border */
  @media (max-width: 639px) {
    .close-button-modal {
      top: 0rem;
      right: 0rem;
    }

    .close-button-modal :deep(.close-button) {
      background: none !important;
      border: 0 !important;
      transform: none !important; /* Remove transform to keep button inside */
    }
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
