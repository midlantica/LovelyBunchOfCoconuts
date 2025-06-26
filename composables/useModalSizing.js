// composables/useModalSizing.js
import { ref, computed, onMounted, onUnmounted } from "vue"

export function useModalSizing(imageUrlRef) {
  const imageNatural = ref({ width: 1, height: 1 })
  const viewport = ref({ width: 0, height: 0 })

  function updateViewport() {
    viewport.value = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  onMounted(() => {
    updateViewport()
    window.addEventListener("resize", updateViewport)
    if (imageUrlRef && imageUrlRef.value) {
      const img = new window.Image()
      img.onload = () => {
        imageNatural.value = { width: img.naturalWidth, height: img.naturalHeight }
      }
      img.src = imageUrlRef.value
    }
  })
  onUnmounted(() => {
    window.removeEventListener("resize", updateViewport)
  })

  const aspect = computed(() => {
    const w = imageNatural.value.width
    const h = imageNatural.value.height
    return w / h
  })

  // Returns { width, height, flexDirection } for modal layout
  const modalLayout = computed(() => {
    // Always use 90vw/90vh and column flex for max size and simplicity
    return {
      width: "90vw",
      height: "90vh",
      flexDirection: "column",
    }
  })

  return {
    imageNatural,
    aspect,
    modalLayout,
    viewport,
  }
}
