<!-- Quote detail component -->
<template>
  <ModalFrame :show="show" @close="close">
    <div
      v-if="loading"
      class="flex flex-1 justify-center items-center py-8 text-white text-center"
    >
      <Icon name="svg-spinners:90-ring-with-bg" size="2rem" />
    </div>
    <div
      v-else-if="error"
      class="flex flex-1 justify-center items-center py-8 text-red-500 text-center"
    >
      {{ error }}
    </div>
    <div v-else-if="quote" class="flex flex-col flex-1 min-h-0">
      <!-- Top quote & attribution section -->
      <div class="pb-2">
        <div class="prose-invert max-w-none text-left prose prose-sm">
          <div v-html="quoteBodyHtml"></div>
        </div>
        <p
          v-if="quote.attribution"
          class="mt-2 font-light text-seagull-200 text-lg"
        >
          — {{ quote.attribution }}
        </p>
      </div>
      <template
        v-if="
          markdownContent.split('<hr>')[1] &&
          markdownContent.split('<hr>')[1].trim()
        "
      >
        <hr class="my-2 border-white/10 border-t" />
        <!-- Scrollable content below -->
        <div
          class="flex-1 bg-slate-800 py-2 rounded-b-lg min-h-0 overflow-y-auto"
          style="max-height: 40vh"
        >
          <div class="prose-invert max-w-none text-seagull-200 prose prose-sm">
            <div
              v-html="markdownContent.split('<hr>')[1]"
              class="text-seagull-200 quote-explanation-text"
            ></div>
          </div>
        </div>
      </template>
    </div>
  </ModalFrame>
</template>

<script setup>
  import { ref, watch, inject } from 'vue'
  import MarkdownIt from 'markdown-it'
  import ModalFrame from './ModalFrame.vue'

  const props = defineProps({
    slug: { type: String, required: true },
    show: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const quote = ref(null)
  const error = ref(null)
  const loading = ref(true)
  const markdownContent = ref('')
  const quoteBodyHtml = ref('')

  // Get the content from the global context
  const displayedItems = inject('displayedItems', ref([]))

  // Configure MarkdownIt to allow HTML tags (like <wbr>)
  const md = new MarkdownIt({
    html: true, // Allow HTML tags in source
    linkify: true,
    typographer: true,
  })

  const close = () => emit('close')

  const loadQuote = async () => {
    loading.value = true
    error.value = null
    quote.value = null
    markdownContent.value = ''
    quoteBodyHtml.value = ''

    try {
      console.log('=== LOADING QUOTE MODAL ===')
      console.log('Slug:', props.slug)

      // Find the quote in the already-loaded displayed items
      let found = null

      // Search through all displayed items for quotes
      for (const item of displayedItems.value) {
        if (item.type === 'quote') {
          const quotePath = item.data?.path || item.data?._path || ''
          const quoteId = item.data?.id || ''
          const quoteTitle = item.data?.title || ''

          console.log(`Checking quote: "${quoteTitle}" (path: ${quotePath})`)

          // Try multiple matching strategies
          if (
            quotePath === props.slug ||
            quotePath.includes(props.slug) ||
            props.slug.includes(quotePath) ||
            quoteId === props.slug ||
            quoteId.includes(props.slug.split('/').pop()) ||
            quotePath.endsWith(props.slug)
          ) {
            found = item.data
            console.log('✅ Found quote match!')
            break
          }
        }
      }

      console.log('Found quote:', found ? 'YES' : 'NO')

      if (found) {
        quote.value = found

        if (found.body) {
          // Handle both string body (markdown) and AST body (Nuxt Content v3)
          let content = ''
          let extractedQuote = ''
          let extractedAttribution = ''

          if (typeof found.body === 'string') {
            content = found.body.replace(/^---[\s\S]*?---/, '').trim()
            // Extract attribution: last non-heading, non-empty line
            const lines = content
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
            let attribution = ''
            let lastHeadingIdx = -1
            for (let i = lines.length - 1; i >= 0; i--) {
              if (!lines[i].startsWith('##')) {
                attribution = lines[i]
                lastHeadingIdx = i - 1
                break
              }
            }
            // Only use lines up to lastHeadingIdx for the quote body
            const quoteLines = lines.slice(0, lastHeadingIdx + 1)
            const quoteBody = quoteLines.join('\n')
            quoteBodyHtml.value = md.render(quoteBody)
            quote.value.attribution = attribution
            extractedQuote = quoteBody
            extractedAttribution = attribution
          } else if (found.body.value && Array.isArray(found.body.value)) {
            // Extract quote and attribution from AST
            const headings = found.body.value
              .filter((element) => element[0] === 'h2' || element[0] === 'h1')
              .map((element) => element[2] || '')
              .filter(Boolean)

            const paragraphs = found.body.value
              .filter((element) => element[0] === 'p')
              .map((element) => element[2] || '')
              .filter(Boolean)

            extractedQuote = headings[0] || ''
            extractedAttribution = paragraphs[0] || ''

            // Set the quote data
            quote.value.headings = headings
            quote.value.attribution = extractedAttribution
            quoteBodyHtml.value = md.render(`## ${extractedQuote}`)

            // Convert AST back to markdown-like text for rendering
            content = found.body.value
              .map((element) => {
                if (Array.isArray(element)) {
                  if (element[0] === 'p' && typeof element[2] === 'string') {
                    return element[2]
                  }
                  if (element[0] === 'h1' || element[0] === 'h2') {
                    return `${element[0] === 'h1' ? '#' : '##'} ${
                      element[2] || ''
                    }`
                  }
                }
                return ''
              })
              .filter(Boolean)
              .join('\n\n')
          }

          // Render the full markdown for the rest of the modal (if needed)
          markdownContent.value = md.render(content)
        }
      } else {
        const filename = `${props.slug || 'unknown-file'}.md`
        console.error('🚨 Broken quote:', filename)
        error.value = `🚨 Quote not found!\n${filename}`
      }
    } catch (err) {
      error.value = err.message
      console.log('Quote loading error:', err)
    } finally {
      loading.value = false
    }
  }

  watch(() => props.slug, loadQuote, { immediate: true })
</script>
