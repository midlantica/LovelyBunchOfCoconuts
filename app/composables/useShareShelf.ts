// useShareShelf.ts - utility to control share shelf visibility
// Uses shallowRef (Vue 3.5) for a boolean toggle — avoids deep reactivity overhead
import { shallowRef } from 'vue'

export function useShareShelf() {
  // shallowRef is preferred over ref for primitive values (Vue 3.5 best practice):
  // it skips deep reactivity tracking, which is unnecessary for a simple boolean.
  const showShareShelf = shallowRef(false)
  const onToggle = (isVisible: boolean) => {
    showShareShelf.value = isVisible
  }
  return { showShareShelf, onToggle }
}
