<!-- Claim de component. -->
<template>
  <ModalFrame :show="show" @close="close">
    <div class="flex flex-col w-full overflow-y-auto">
      <div class="flex-1 min-h-0 overflow-y-auto">
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
        <div v-else-if="claim" class="flex flex-col flex-1 min-h-0">
          <!-- Claim translation section -->
          <div class="pb-2">
            <div class="prose-invert max-w-none prose prose-lg">
              <div v-html="markdownContent"></div>
            </div>
          </div>
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
      error.value = found?.message || "🚨 Claim not found!"
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
.prose img,
.prose-invert img {
  max-width: 500px;
  max-height: 500px;
  height: auto;
  width: auto;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.prose p {
  margin-bottom: 1rem;
  margin-right: 0.5rem;
}
@media (max-width: 640px) {
  .modal-frame > div {
    /* width: 100% !important; */
    min-width: 0 !important;
    max-width: 90vw !important;
  }
}
</style>
