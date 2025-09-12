// useShareShelf.ts - ultra-fast optimized utility to control share shelf timing
import { ref } from 'vue'

export function useShareShelf(delay = 50) {
  const showShareShelf = ref(false)
  const onToggle = (isVisible: boolean) => {
    if (isVisible) {
      // Show immediately without animation
      showShareShelf.value = true
    } else {
      showShareShelf.value = false
    }
  }
  return { showShareShelf, onToggle }
}
