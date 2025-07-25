<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80 modal-overlay"
      @mousedown.self="onClose"
    >
      <div
        class="relative flex flex-col shadow-lg mx-0 sm:mx-6 rounded-none sm:rounded-lg modal-frame"
        :style="modalStyle ? modalStyle : { maxHeight: '90vh' }"
        :class="[modalStyle ? '' : 'w-full sm:min-w-[60vw] sm:max-w-[500px]']"
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
  import { onMounted, onBeforeUnmount } from 'vue'
  import CloseButton from '../ui/CloseButton.vue'

  const props = defineProps({
    show: { type: Boolean, default: false },
    modalStyle: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])
  const onClose = () => emit('close')

  function handleEscape(e) {
    if (props.show && (e.key === 'Escape' || e.key === ' ')) {
      e.stopPropagation()
      onClose()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscape, true)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape, true)
  })
</script>
