<!-- components/ContentModal.vue -->
<template>
  <client-only>
    <!-- Use ModalFrame properly with content in the slot -->
    <ModalFrame
      v-if="modalType && modalData"
      :show="show"
      @close="emit('close')"
    >
      <!-- Claim Content -->
      <div v-if="modalType === 'claim'" class="flex flex-col">
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

      <!-- Quote Content -->
      <div v-else-if="modalType === 'quote'" class="flex flex-col">
        <div class="mb-2">
          <h1 class="mb-2 font-bold text-white text-2xl">
            "{{
              modalData?.quoteText ||
              (modalData?.headings && modalData.headings[0]) ||
              modalData?.title
            }}"
          </h1>
          <p class="mb-2 text-slate-400 text-lg">
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

      <!-- Meme Content -->
      <div v-else-if="modalType === 'meme'" class="flex flex-col">
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
      </div>
    </ModalFrame>
  </client-only>
</template>

<script setup>
  import { watch } from 'vue'
  import ModalFrame from './ModalFrame.vue'

  const props = defineProps({
    show: { type: Boolean, default: false },
    modalType: { type: String, default: null }, // 'claim', 'quote', 'meme'
    modalData: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])

  // Debug the modal data
  watch(
    () => props.modalData,
    (data) => {
      if (data) {
        console.log('Modal data received:', { type: props.modalType, data })
        console.log('Available properties:', Object.keys(data))
      }
    },
    { immediate: true }
  )
</script>
