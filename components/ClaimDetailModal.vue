<template>
  <teleport to="#modal-root">
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black/80"
      @mousedown.self="close"
    >
      <div
        class="relative flex flex-col bg-slate-800 shadow-lg px-8 py-6 rounded-lg w-full max-w-2xl max-h-[90vh]"
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
        <div v-else-if="claim" class="flex flex-col flex-1 gap-2 min-h-0">
          <div
            class="flex-1 prose-invert px-2 py-2 max-w-none min-h-0 overflow-y-auto prose prose-sm"
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
import { ref, watch } from "vue"
import { useContentCache } from "~/composables/useContentCache"
import MarkdownIt from "markdown-it"

const props = defineProps({
  slug: { type: String, required: true },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(["close"])

const claim = ref(null)
const error = ref(null)
const loading = ref(true)
const markdownContent = ref("")

const { getContentItem } = useContentCache()
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

const close = () => emit("close")

const loadClaim = async () => {
  loading.value = true
  error.value = null
  claim.value = null
  markdownContent.value = ""
  try {
    // Robustly ensure slug is just the filename, not a path
    const cleanSlug = props.slug.replace(/^\/*claims\//, "").replace(/^\/*/, "")
    const found = await getContentItem("claims", cleanSlug)
    if (found && !found.error) {
      claim.value = found
      if (found.body) {
        let content = found.body.replace(/^---[\s\S]*?---/, "").trim()
        markdownContent.value = md.render(content)
      }
    } else {
      error.value = found?.message || "Claim not found"
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(() => props.slug, loadClaim, { immediate: true })
</script>

<style scoped>
:deep(.prose h2) {
  margin-top: 0.5em !important;
  margin-bottom: 0.5em !important;
  font-size: 2em !important;
  font-weight: 400 !important;
}
</style>
