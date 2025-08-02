// composables/useScrollToTop.js
import { ref, onMounted, nextTick } from 'vue'

export function useScrollToTop() {
  const scrollContainer = ref(null)

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Add scroll event for is-scrolling class
  onMounted(async () => {
    await nextTick()
    const el = scrollContainer.value
    if (el) {
      let scrollTimeout
      el.addEventListener('scroll', () => {
        el.classList.add('is-scrolling')
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          el.classList.remove('is-scrolling')
        }, 2000)
      })
    }
  })

  return {
    scrollContainer,
    scrollToTop,
  }
}
