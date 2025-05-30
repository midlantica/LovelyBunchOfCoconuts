<template>
  <ModalFrame :show="show" @close="close">
    <div v-if="loading" class="flex flex-1 justify-center items-center py-8 text-white text-center">
      <Icon name="svg-spinners:90-ring-with-bg" size="2rem" />
    </div>
    <div
      v-else-if="error"
      class="flex flex-1 justify-center items-center py-8 text-red-500 text-center"
    >
      {{ error }}
    </div>
    <div v-else-if="meme" class="flex flex-col flex-1 min-h-0">
      <div class="prose-invert mx-auto max-w-none prose prose-base">
        <div v-html="getAboveHr(markdownContent)"></div>
      </div>
      <div class="flex-1 w-full overflow-y-auto" style="max-height: 90vh">
        <div class="prose-invert mx-auto max-w-none prose prose-base">
          <div v-html="getBelowHr(markdownContent)"></div>
        </div>
      </div>
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
    // Robustly ensure slug is just the filename, not a path
    const cleanSlug = props.slug.replace(/^\/*memes\//, "").replace(/^\/*/, "")
    const found = await getContentItem("memes", cleanSlug)
    if (found && !found.error) {
      meme.value = found
      if (found.body) {
        let content = found.body.replace(/^---[\s\S]*?---/, "").trim()
        markdownContent.value = md.render(content)
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

function getAboveHr(html) {
  if (!html) return ""
  const idx = html.indexOf("<hr")
  if (idx === -1) return html
  return html.slice(0, idx)
}
function getBelowHr(html) {
  if (!html) return ""
  const idx = html.indexOf("<hr")
  if (idx === -1) return ""
  // Find the closing > of the first <hr ...>
  const closeIdx = html.indexOf(">", idx)
  if (closeIdx === -1) return ""
  return html.slice(closeIdx + 1)
}

watch(() => props.slug, loadMeme, { immediate: true })
</script>
