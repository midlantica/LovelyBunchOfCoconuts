<!-- components/ClaimDetailModal.vue -->
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
          <div>
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
  import { ref, watch, inject } from 'vue'
  import MarkdownIt from 'markdown-it'
  import ModalFrame from './ModalFrame.vue'

  const props = defineProps({
    slug: { type: String, required: true },
    show: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const claim = ref(null)
  const error = ref(null)
  const loading = ref(true)
  const markdownContent = ref('')

  // Get the content collections from the layout/global context
  const displayedItems = inject('displayedItems', ref([]))

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

  const close = () => emit('close')

  const loadClaim = async () => {
    loading.value = true
    error.value = null
    claim.value = null
    markdownContent.value = ''

    try {
      console.log('=== LOADING CLAIM MODAL ===')
      console.log('Slug:', props.slug)

      // Find the claim in the already-loaded displayed items
      let found = null

      // Search through all displayed items for claims
      for (const item of displayedItems.value) {
        if (item.type === 'claimPair') {
          for (const claimItem of item.data) {
            const claimPath = claimItem?.path || claimItem?._path || ''
            const claimId = claimItem?.id || ''
            const claimTitle = claimItem?.title || ''

            console.log(`Checking claim: "${claimTitle}" (path: ${claimPath})`)

            // Try multiple matching strategies
            if (
              claimPath === props.slug ||
              claimPath.includes(props.slug) ||
              props.slug.includes(claimPath) ||
              claimId === props.slug ||
              claimId.includes(props.slug.split('/').pop()) ||
              claimPath.endsWith(props.slug)
            ) {
              found = claimItem
              console.log('✅ Found claim match!')
              break
            }
          }
          if (found) break
        }
      }

      console.log('Found claim:', found ? 'YES' : 'NO')

      if (found) {
        claim.value = found

        // The claim and translation should already be in the transformed data
        if (found.body) {
          // Handle both string body (markdown) and AST body (Nuxt Content v3)
          let content = ''
          if (typeof found.body === 'string') {
            content = found.body.replace(/^---[\s\S]*?---/, '').trim()
          } else if (found.body.value && Array.isArray(found.body.value)) {
            // Convert AST back to markdown-like text for rendering
            const elements = found.body.value
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

            // Add HR between consecutive H2 elements and style the second H2
            const contentWithHR = []
            for (let i = 0; i < elements.length; i++) {
              let currentElement = elements[i]

              // If this is the second H2 in a sequence, add the seagull color class
              if (
                currentElement.startsWith('## ') &&
                i > 0 &&
                elements[i - 1].startsWith('## ')
              ) {
                // Convert markdown H2 to HTML with color class
                const h2Text = currentElement.replace('## ', '')
                currentElement = `<h2 class="text-seagull-200">${h2Text}</h2>`
              }

              contentWithHR.push(currentElement)

              // If current element is H2 and next element is also H2, add HR
              if (
                elements[i].startsWith('## ') &&
                elements[i + 1]?.startsWith('## ')
              ) {
                contentWithHR.push('<hr class="my-2">')
              }
            }

            content = contentWithHR.join('\n\n')
          }

          markdownContent.value = md.render(content)
        }
      } else {
        const filename = `${props.slug || 'unknown-file'}.md`
        console.error('🚨 Broken claim:', filename)
        error.value = `🚨 Claim not found!\n${filename}`
      }
    } catch (err) {
      error.value = err.message
      console.log('Claim loading error:', err)
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
