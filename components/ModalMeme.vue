<!-- components/ModalMeme.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <div class="flex flex-col items-center">
        <img
          v-if="modalData?.image"
          :src="modalData?.image"
          :alt="modalData?.title"
          class="mb-2 rounded-md max-w-full h-auto"
        />
        <p class="font-bold text-white text-lg">
          {{ modalData?.title || modalData?.description }}
        </p>
        <div
          v-if="
            modalData?.body &&
            modalData.body.value &&
            modalData.body.value.length > 0
          "
          class="prose-invert max-w-none prose"
        >
          <div v-html="modalData?.bodyHtml"></div>
        </div>
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
