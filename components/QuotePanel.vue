<!-- components/QuotePanel.vue -->
<template>
  <router-link
    v-if="quote && extractQuoteText && slug"
    :to="slug"
    class="quotePanel shadow-[inset_0_0_12px_0_#0f1e24] flex flex-col gap-2 px-5 py-4 text-white bg-gray-800 rounded-lg hover:bg-gray-700"
  >
    <div class="my-auto">
      <h2 class="inline-block align-baseline">
        {{ extractQuoteText }}
      </h2>
      <p
        class="inline-block text-lg font-light text-slate-300 align-baseline"
        v-if="extractQuoteAttribution"
      >
        — {{ extractQuoteAttribution }}
      </p>
    </div>
  </router-link>
  <div 
    v-else 
    class="quotePanel shadow-[inset_0_0_12px_0_#0f1e24] flex flex-col gap-2 px-5 py-4 text-white bg-gray-800 rounded-lg"
  >
    <div class="my-auto">
      <h2 class="inline-block align-baseline">
        {{ extractQuoteText }}
      </h2>
      <p
        class="inline-block text-lg font-light text-slate-300 align-baseline"
        v-if="extractQuoteAttribution"
      >
        — {{ extractQuoteAttribution }}
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

  const extractQuoteText = computed(() => {
    if (!props.quote?.body?.content) return "🚨 No content found!"
    
    // Nuxt Content v3 uses a different structure for parsed content
    if (props.quote.body?.content) {
      const headings = props.quote.body.content.children?.filter(node => 
        node.tag === 'h2' || node.tag === 'h1'
      )
      return headings && headings.length > 0 ? headings[0].children[0].value : "No quote text found!"
    }
    
    // Fallback to v2 structure if needed
    if (props.quote.body?.value) {
      const quoteNode = props.quote.body.value.find((node) => Array.isArray(node) && node[0] === "h2")
      return quoteNode ? quoteNode[2] : "No quote text found!"
    }
    
    return "No quote text found!"
  })

  const extractQuoteAttribution = computed(() => {
    // Nuxt Content v3 structure
    if (props.quote?.body?.content) {
      const children = props.quote.body.content.children || []
      const headingIndex = children.findIndex(node => node.tag === 'h2' || node.tag === 'h1')
      
      if (headingIndex !== -1 && children[headingIndex + 1] && children[headingIndex + 1].tag === 'p') {
        return children[headingIndex + 1].children[0].value.trim()
      }
      return ""
    }
    
    // Fallback to v2 structure
    if (props.quote?.body?.value) {
      const contentNodes = props.quote.body.value
      const quoteIndex = contentNodes.findIndex((node) => Array.isArray(node) && node[0] === "h2")
      if (
        quoteIndex !== -1 &&
        contentNodes[quoteIndex + 1] &&
        Array.isArray(contentNodes[quoteIndex + 1]) &&
        contentNodes[quoteIndex + 1][0] === "p"
      ) {
        return contentNodes[quoteIndex + 1][2].trim()
      }
    }
    
    return ""
  })
</script>
