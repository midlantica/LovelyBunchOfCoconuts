<!-- components/ModalClaim.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <div class="flex flex-col">
        <div class="mb-2">
          <h1 class="mb-4 font-bold text-white text-2xl">
            {{ modalData?.claim || modalData?.title }}
          </h1>
          <hr class="my-2 border-white/10 border-t" />
          <h1 class="mb-2 font-bold text-white text-2xl">
            {{ modalData?.translation }}
          </h1>
        </div>
        <!-- Only show body content if it exists and has actual content -->
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
        console.log('Claim modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
