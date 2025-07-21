<!-- components/ModalQuote.vue -->
<template>
  <client-only>
    <ModalFrame v-if="modalData" :show="show" @close="emit('close')">
      <div class="flex flex-col">
        <div class="mb-2">
          <h1 class="mb-2 font-bold text-white text-2xl">
            {{
              modalData?.quoteText ||
              (modalData?.headings && modalData.headings[0]) ||
              modalData?.title
            }}
          </h1>
          <p class="mb-2 text-seagull-300 text-xl">
            — {{ modalData?.attribution }}
          </p>
        </div>
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
        console.log('Quote modal data received:', data)
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
