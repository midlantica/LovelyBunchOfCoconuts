// useShareShelf.ts - utility to control share shelf visibility
import { ref } from 'vue'

export function useShareShelf() {
  const showShareShelf = ref(false)
  const onToggle = (isVisible: boolean) => {
    showShareShelf.value = isVisible
  }
  return { showShareShelf, onToggle }
}
