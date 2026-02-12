// composables/useToast.ts
// Lightweight reactive toast system — replaces hand-rolled DOM manipulation
// in useSocialShare.js with a proper Vue-reactive approach.

import { ref, readonly, type Ref, type DeepReadonly } from 'vue'

interface Toast {
  id: number
  message: string
  duration: number
}

// Shared state (singleton across all consumers)
const toasts = ref<Toast[]>([])
let nextId = 0

/**
 * Composable for showing toast notifications.
 *
 * Usage:
 *   const { showToast } = useToast()
 *   showToast('Image copied!')
 *   showToast('Error occurred', 5000)
 */
export function useToast() {
  const showToast = (message: string, duration = 3000): void => {
    const id = nextId++
    const toast: Toast = { id, message, duration }

    toasts.value.push(toast)

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  const dismissToast = (id: number): void => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const clearAll = (): void => {
    toasts.value = []
  }

  return {
    /** Reactive array of active toasts */
    toasts: readonly(toasts),
    /** Show a toast message for `duration` ms (default 3 000) */
    showToast,
    /** Dismiss a specific toast by id */
    dismissToast,
    /** Clear all active toasts */
    clearAll,
  }
}
