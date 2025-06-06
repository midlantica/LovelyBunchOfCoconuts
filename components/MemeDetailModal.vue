<template>
  <ModalFrame :show="show" @close="close" :modalStyle="modalFrameStyle">
    <div v-if="loading" class="flex flex-1 justify-center items-center py-8 text-white text-center">
      <Icon name="svg-spinners:90-ring-with-bg" size="2rem" />
    </div>
    <div
      v-else-if="error"
      class="flex flex-1 justify-center items-center py-8 text-red-500 text-center"
    >
      {{ error }}
    </div>
    <div v-else-if="meme">
      <div class="flex flex-col flex-1 justify-center items-center w-full h-full">
        <div
          class="relative flex flex-col bg-slate-800 rounded-lg w-full h-full modal-frame"
          style="
            max-width: 90vw;
            max-height: 90vh;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
            margin: auto;
          "
        >
          <div
            style="
              width: 100%;
              flex-shrink: 0;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              padding: 0;
              margin: 0;
            "
          >
            <img
              v-if="meme.image"
              :src="meme.image"
              :alt="meme.title || 'Meme'"
              class="rounded object-contain"
              :class="!isLandscape ? 'meme-modal-img-column' : ''"
              :style="
                isLandscape
                  ? 'max-width: 100%; max-height: 45vh; width: 100%; height: auto; display: block; margin: 0; padding: 0; object-fit: contain; object-position: top;'
                  : 'max-width: 100%; width: auto; height: auto; display: block; margin: 0; padding: 0; object-fit: contain; object-position: top;'
              "
            />
          </div>
          <div
            v-if="hasExtraText"
            :class="[
              'flex flex-1 items-stretch w-full text-slate-200',
              isLandscape ? 'flex-row gap-4' : 'flex-col',
            ]"
            :style="`
              flex: 0 1 50%;
              min-height: 0;
              overflow: hidden;
              width: 100%;
              display: flex;
              flex-direction: ${isLandscape ? 'row' : 'column'};
              align-items: flex-start;
              justify-content: flex-start;
              padding: 0;
              margin: 0;
              ${isLandscape ? 'gap: 1rem;' : ''}
            `"
          >
            <div
              class="prose-invert mx-auto pt-2 w-full shrink prose prose-base"
              style="font-size: clamp(1rem, 2vw, 1.5rem); width: 100%"
            >
              <div v-html="getAboveHr(markdownContent)"></div>
            </div>
            <div
              class="bg-slate-800 w-full min-h-0 text-slate-200 shrink modal-scrollable-text"
              style="overflow-y: auto; max-height: 100%; width: 100%"
            >
              <div v-html="getBelowHr(markdownContent)"></div>
            </div>
          </div>
          <div
            v-else
            class="prose-invert mx-auto pt-2 w-full shrink prose prose-base"
            style="font-size: clamp(1rem, 2vw, 1.5rem); width: 100%"
          >
            <div v-html="markdownContent"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col justify-center items-center p-8 min-w-[10vw] min-h-[10vh]">
      <slot />
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from "vue"
import { useContentCache } from "~/composables/useContentCache"
import MarkdownIt from "markdown-it"
import ModalFrame from "./ModalFrame.vue"
import { useModalLogic } from "~/composables/useModalLogic"
import { useModalSizing } from "~/composables/useModalSizing"

const props = defineProps({
  slug: { type: String, required: true },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(["close"])

const meme = ref(null)
const error = ref(null)
const loading = ref(true)
const markdownContent = ref("")
const isLandscape = ref(false)

const { getContentItem } = useContentCache()
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

const close = () => emit("close")

// --- Use composable for modal logic (escape, scroll lock, etc.) ---
useModalLogic({ show: props.show, onClose: close })

// --- Use composable for modal sizing (image, viewport, layout) ---
const imageUrl = computed(() => (meme.value && meme.value.image ? meme.value.image : ""))
const { imageNatural, aspect, modalLayout, viewport } = useModalSizing(imageUrl)

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

// --- Use modalLayout for frame style ---
const modalFrameStyle = computed(() => {
  const { width, height } = modalLayout.value
  return {
    width: width + "px",
    height: height + "px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
    boxSizing: "border-box",
  }
})

const imageContainerStyle = computed(() => {
  return {
    width: modalLayout.value.flexDirection === "row" ? "50%" : "100%",
    height: modalLayout.value.flexDirection === "row" ? "100%" : "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
})

const imageStyle = computed(() => {
  const w = imageNatural.value.width
  const h = imageNatural.value.height
  if (!w || !h)
    return {
      maxWidth: "clamp(200px, 90vw, 1200px)",
      maxHeight: "clamp(200px, 90vh, 900px)",
      width: "auto",
      height: "auto",
      display: "block",
      margin: "0 auto",
      padding: "2rem",
    }
  const aspect = w / h
  if (aspect > 1.2) {
    // Landscape
    return {
      maxWidth: "clamp(200px, 90vw, 1200px)",
      maxHeight: "clamp(200px, 90vh, 900px)",
      width: "100%",
      height: "auto",
      display: "block",
      margin: "0 auto",
      padding: "2rem",
    }
  } else if (aspect < 0.8) {
    // Portrait
    return {
      maxWidth: "clamp(200px, 90vw, 700px)",
      maxHeight: "clamp(200px, 90vh, 900px)",
      width: "auto",
      height: "100%",
      display: "block",
      margin: "0 auto",
      padding: "2rem",
    }
  } else {
    // Square-ish
    return {
      maxWidth: "clamp(200px, 90vw, 900px)",
      maxHeight: "clamp(200px, 90vh, 900px)",
      width: "auto",
      height: "auto",
      display: "block",
      margin: "0 auto",
      padding: "2rem",
    }
  }
})

const textContainerStyle = computed(() => {
  // Text should take up remaining space, scroll if needed, but never push image out
  return {
    minHeight: 0,
    overflowY: "auto",
    maxHeight: "100%",
    width: modalLayout.value.flexDirection === "row" ? "50%" : "100%",
    height: modalLayout.value.flexDirection === "row" ? "100%" : "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
})

function updateOrientation() {
  isLandscape.value = window.innerWidth > 762
}
onMounted(() => {
  updateOrientation()
  window.addEventListener("resize", updateOrientation)
})
onUnmounted(() => {
  window.removeEventListener("resize", updateOrientation)
})

watch(() => props.slug, loadMeme, { immediate: true })

const hasExtraText = computed(() => {
  if (!markdownContent.value) return false
  const idx = markdownContent.value.indexOf("<hr")
  if (idx === -1) return false
  // Find the closing > of the first <hr ...>
  const closeIdx = markdownContent.value.indexOf(">", idx)
  if (closeIdx === -1) return false
  // If there is any non-whitespace after the <hr>, consider it extra text
  return (
    markdownContent.value
      .slice(closeIdx + 1)
      .replace(/<[^>]+>/g, "")
      .trim().length > 0
  )
})
</script>
