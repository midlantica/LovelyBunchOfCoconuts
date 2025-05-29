<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80"
      @mousedown.self="close"
    >
      <div
        class="relative flex flex-col bg-slate-900 shadow-lg p-4 rounded-lg w-full max-w-2xl max-h-[90vh]"
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
        <div v-else-if="meme" class="flex flex-col flex-1 min-h-0">
          <div
            class="flex-1 prose-invert max-w-none min-h-0 overflow-y-auto prose prose-sm"
            style="max-height: 60vh"
          >
            <div v-html="markdownContent"></div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted } from "vue"
import { useContentCache } from "~/composables/useContentCache"
import MarkdownIt from "markdown-it"

const props = defineProps({
  slug: { type: String, required: true },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(["close"])

const meme = ref(null)
const error = ref(null)
const loading = ref(true)
const markdownContent = ref("")

const { getContentItem } = useContentCache()
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

const close = () => emit("close")

const loadMeme = async () => {
  loading.value = true
  error.value = null
  meme.value = null
  markdownContent.value = ""
  try {
    const found = await getContentItem("memes", props.slug)
    if (found && !found.error) {
      meme.value = found
      if (found.body) {
        // Remove frontmatter and render markdown
        let content = found.body.replace(/^---[\s\S]*?---/, "").trim()
        // Remove <p> tags wrapping a single image at the top
        content = content.replace(/^<p>(<img [^>]+>)<\/p>\n<p>(.*?)<\/p>/, "$1") // Remove both image and duplicate title
        content = content.replace(/^<p>(<img [^>]+>)<\/p>/, "$1")
        content = content.replace(/^<p>\s*<img([^>]+)>\s*<\/p>/, "<img$1>")
        markdownContent.value = md.render(content)
        // Remove <p> wrapping image if markdown-it still adds it
        markdownContent.value = markdownContent.value.replace(/^<p>(<img [^>]+>)<\/p>/, "$1")
      }
    } else {
      error.value = found?.message || "Meme not found"
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => props.slug, loadMeme, { immediate: true })
</script>

<style scoped>
.prose > :first-child {
  margin-top: 0 !important;
}
</style>
