<!-- components/QuotePanel.vue -->
<template>
  <router-link
    v-if="quote && quote.headings && quote.headings.length > 0 && slug"
    :to="slug"
    class="quotePanel shadow-[inset_0_0_12px_0_#0f1e24] flex flex-col gap-2 px-6 py-4 text-white bg-gray-800 rounded-lg hover:bg-gray-700"
  >
    <div class="my-auto flex flex-col flex-wrap gap-0.5">
      <h1 class="inline-block text-xl font-light tracking-wide align-baseline">
        {{ quote.headings[0] }}
      </h1>
      <p
        class="inline-block text-lg font-light tracking-wide text-slate-300 align-baseline"
        v-if="quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
  </router-link>
  <div
    v-else
    class="quotePanel shadow-[inset_0_0_12px_0_#0f1e24] flex flex-col gap-2 px-5 py-4 text-white bg-gray-800 rounded-lg"
  >
    <div class="my-auto">
      <h2 class="inline-block align-baseline">
        {{
          quote && quote.headings && quote.headings.length > 0
            ? quote.headings[0]
            : "🚨 No content found!"
        }}
      </h2>
      <p
        class="inline-block text-lg font-light text-slate-300 align-baseline"
        v-if="quote && quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  quote: Object,
  slug: String,
})
</script>
