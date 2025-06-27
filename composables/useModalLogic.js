// composables/useModalLogic.js
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useModalLogic({ show, onClose }) {
  // Trap focus, handle escape, scroll lock, etc.
  const isOpen = ref(show)

  function handleEscape(e) {
    if (isOpen.value && (e.key === 'Escape' || e.key === ' ')) {
      e.stopPropagation()
      onClose && onClose()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscape, true)
    document.body.style.overflow = isOpen.value ? 'hidden' : ''
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape, true)
    document.body.style.overflow = ''
  })

  return {
    isOpen,
    close: onClose,
  }
}
