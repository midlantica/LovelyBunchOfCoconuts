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
  import { ref, watch } from 'vue'
  import { useContentCache } from '~/composables/useContentCache'
  import MarkdownIt from 'markdown-it'
  import ModalFrame from './ModalFrame.vue'
  import CloseButton from './CloseButton.vue'

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

  const { getContentItem } = useContentCache()
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
      // Robustly ensure slug is just the filename, not a path
      const cleanSlug = props.slug
        .replace(/^\/*quotes\//, '')
        .replace(/^\/*/, '')
      const found = await getContentItem('quotes', cleanSlug)
      if (found && !found.error) {
        quote.value = found
        if (found.body) {
          let content = found.body.replace(/^---[\s\S]*?---/, '').trim()
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
          // Render the full markdown for the rest of the modal (if needed)
          markdownContent.value = md.render(content)
        }
      } else {
        error.value = found?.message || '🚨 Quote not found!'
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  watch(() => props.slug, loadQuote, { immediate: true })
</script>
