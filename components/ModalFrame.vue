<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80 modal-overlay"
      @mousedown.self="onClose"
    >
      <div
        class="relative flex flex-col bg-slate-800 shadow-lg mx-6 rounded-lg min-w-[60vw] max-w-[500px] modal-frame"
        :style="modalStyle ? modalStyle : { maxHeight: '90vh', padding: '1rem 1.75rem' }"
        @mousedown.stop
      >
        <CloseButton @click="onClose" />
        <div class="w-full overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue"
const props = defineProps({
  show: { type: Boolean, default: false },
  modalStyle: { type: Object, default: null },
})
const emit = defineEmits(["close"])
const onClose = () => emit("close")

function handleEscape(e) {
  if (props.show && (e.key === "Escape" || e.key === " ")) {
    e.stopPropagation()
    onClose()
  }
}
onMounted(() => {
  window.addEventListener("keydown", handleEscape, true)
})
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape, true)
})
</script>
