<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80"
      @mousedown.self="close"
    >
      <div
        class="relative flex flex-col bg-slate-800 shadow-lg px-8 py-6 rounded-lg w-full max-w-2xl"
        style="max-height: calc(100vh - 6rem)"
        @mousedown.stop
      >
        <CloseButton @click="close" />
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
            <div class="prose-invert max-w-none prose prose-sm">
              <div v-html="markdownContent.split('<hr>')[0]"></div>
            </div>
          </div>
          <template
            v-if="markdownContent.split('<hr>')[1] && markdownContent.split('<hr>')[1].trim()"
          >
            <hr class="my-2 border-white/10 border-t" />
            <!-- Scrollable content below -->
            <div
              class="flex-1 bg-slate-800 py-2 rounded-b-lg min-h-0 overflow-y-auto"
              style="max-height: 40vh"
            >
              <div class="prose-invert max-w-none prose prose-sm">
                <div v-html="markdownContent.split('<hr>')[1]" class="quote-explanation-text"></div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch } from "vue"
import { useContentCache } from "~/composables/useContentCache"
import MarkdownIt from "markdown-it"

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

<style scoped>
:deep(.prose img) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  margin-block-start: 0 !important;
  margin-block-end: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
:deep(.prose h2) {
  margin-top: 0.5em !important;
  margin-bottom: 0.5em !important;
  font-size: 2em !important;
  font-weight: 300 !important;
}
.quote-explanation-text p {
  font-size: 85% !important;
  line-height: 1.25 !important;
}
</style>
<style>
/* Global override for this modal only: forcibly remove all margin/padding from images in .prose */
#modal-root .prose img {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  margin-block-start: 0 !important;
  margin-block-end: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
