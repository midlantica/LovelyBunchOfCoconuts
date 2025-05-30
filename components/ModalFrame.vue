<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80 modal-overlay"
      @mousedown.self="onClose"
    >
      <div
        class="relative flex flex-col bg-slate-800 shadow-lg px-8 py-6 rounded-lg w-full max-w-2xl modal-frame"
        style="max-height: 90vh"
        @mousedown.stop
      >
        <CloseButton @click="onClose" />
        <slot />
      </div>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
})
const emit = defineEmits(["close"])
const onClose = () => emit("close")
</script>
