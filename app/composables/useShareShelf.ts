// useShareShelf.ts - simple utility to control share shelf timing
export function useShareShelf(delay = 500) {
  const showShareShelf = ref(false)
  const onToggle = (isVisible: boolean) => {
    if (isVisible) {
      showShareShelf.value = false
      setTimeout(() => {
        showShareShelf.value = true
      }, delay)
    } else {
      showShareShelf.value = false
    }
  }
  return { showShareShelf, onToggle }
}
