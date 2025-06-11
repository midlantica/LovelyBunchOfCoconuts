<template>
  <ModalFrame :show="show" @close="close">
    <div
      v-if="loading"
      class="flex flex-1 justify-center items-center py-8 text-center wqatext-white"
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
        <div class="prose-invert max-w-none prose prose-sm">
          <div v-html="markdownContent.split('<hr>')[0]"></div>
        </div>
      </div>
      <template v-if="markdownContent.split('<hr>')[1] && markdownContent.split('<hr>')[1].trim()">
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
import { ref, watch } from "vue"
import { useContentCache } from "~/composables/useContentCache"
import MarkdownIt from "markdown-it"
import ModalFrame from "./ModalFrame.vue"
import CloseButton from "./CloseButton.vue"

const props = defineProps({
  slug: { type: String, required: true },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(["close"])

const quote = ref(null)
const error = ref(null)
const loading = ref(true)
const markdownContent = ref("")

const { getContentItem } = useContentCache()
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

const close = () => emit("close")

const loadQuote = async () => {
  loading.value = true
  error.value = null
  quote.value = null
  markdownContent.value = ""
  try {
    // Robustly ensure slug is just the filename, not a path
    const cleanSlug = props.slug.replace(/^\/*quotes\//, "").replace(/^\/*/, "")
    const found = await getContentItem("quotes", cleanSlug)
    if (found && !found.error) {
      quote.value = found
      if (found.body) {
        let content = found.body.replace(/^---[\s\S]*?---/, "").trim()
        markdownContent.value = md.render(content)
      }
    } else {
      error.value = found?.message || "Quote not found"
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => props.slug, loadQuote, { immediate: true })
</script>
