<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <!-- Container with no padding -->
      <div
        class="flex flex-col w-full max-w-[min(1000px,calc(100vw-4rem))] h-full max-h-[calc(100vh-8rem)]"
      >
        <!-- Image container -->
        <div class="flex flex-1 justify-center items-center min-h-0">
          <img
            v-if="modalData?.image"
            :src="modalData?.image"
            :alt="modalData?.title"
            class="w-auto max-w-full h-auto max-h-[calc(100vh-16rem)] object-scale-down"
          />
        </div>
        <!-- Text line with consistent bottom spacing -->
        <p class="mt-2 font-bold text-white text-lg text-center">
          {{ modalData?.title || modalData?.description }}
        </p>
      </div>
    </ModalFrame>
  </client-only>
</template>

<script setup>
  import { watch } from 'vue'
  import ModalFrame from './ModalFrame.vue'

  const props = defineProps({
    show: { type: Boolean, default: false },
    modalData: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])

  // Debug the modal data
  watch(
    () => props.modalData,
    (data) => {
      if (data) {
        console.log('Meme modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
