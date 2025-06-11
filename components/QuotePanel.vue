<!-- components/QuotePanel.vue -->
<template>
  <div
    v-if="quote && quote.headings && quote.headings.length > 0 && slug"
    class="flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] px-6 py-4 rounded-lg text-white cursor-pointer quotePanel"
    @click="openModal"
  >
    <div class="flex flex-col flex-wrap gap-0.5 my-auto">
      <h1 class="inline-block font-light text-xl align-baseline tracking-wide">
        &ldquo;{{ quote.headings[0] }}&rdquo;
      </h1>
      <p
        class="inline-block font-light text-slate-300 text-lg align-baseline tracking-wide"
        v-if="quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
    <QuoteDetailModal v-if="showModal" :slug="slug" :show="showModal" @close="closeModal" />
  </div>
  <div
    v-else
    class="flex flex-col gap-2 bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] px-5 py-4 rounded-lg text-white quotePanel"
  >
    <div class="my-auto">
      <h2 class="inline-block align-baseline">
        {{
          quote && quote.headings && quote.headings.length > 0
            ? `&ldquo;${quote.headings[0]}&rdquo;`
            : "🚨 No content found!"
        }}
      </h2>
      <p
        class="inline-block font-light text-slate-300 text-lg align-baseline"
        v-if="quote && quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import QuoteDetailModal from "./QuoteDetailModal.vue"

const props = defineProps({
  quote: Object,
  slug: String,
})

const showModal = ref(false)
const openModal = () => (showModal.value = true)
const closeModal = () => (showModal.value = false)
</script>
